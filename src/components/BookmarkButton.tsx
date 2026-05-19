'use client';

import { useEffect, useState } from 'react';

type BookmarkType = 'pdf' | 'guide';

interface BookmarkButtonProps {
  itemType: BookmarkType;
  itemId: string;
  initialBookmarked?: boolean;
  className?: string;
  onChange?: (bookmarked: boolean) => void;
}

export default function BookmarkButton({
  itemType,
  itemId,
  initialBookmarked,
  className = '',
  onChange,
}: BookmarkButtonProps) {
  const [optimisticBookmarked, setOptimisticBookmarked] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const bookmarked = optimisticBookmarked ?? Boolean(initialBookmarked);

  useEffect(() => {
    if (initialBookmarked !== undefined) return;

    let isActive = true;

    async function loadBookmarkState() {
      try {
        const response = await fetch('/api/user/bookmarks');
        if (!response.ok) return;
        const data = await response.json();
        const ids = itemType === 'pdf' ? data.bookmarks?.pdfIds : data.bookmarks?.guideIds;
        if (isActive && Array.isArray(ids)) {
          setOptimisticBookmarked(ids.includes(itemId));
        }
      } catch {
        // Bookmarks are optional for anonymous users.
      }
    }

    void loadBookmarkState();

    return () => {
      isActive = false;
    };
  }, [initialBookmarked, itemId, itemType]);

  async function toggleBookmark(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (loading) return;

    const nextBookmarked = !bookmarked;
    setOptimisticBookmarked(nextBookmarked);
    setLoading(true);

    try {
      const response = await fetch('/api/user/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: itemType, id: itemId, bookmarked: nextBookmarked }),
      });

      if (response.status === 401) {
        setOptimisticBookmarked(bookmarked);
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error('Bookmark update failed');
      }

      const data = await response.json();
      setOptimisticBookmarked(Boolean(data.bookmarked));
      onChange?.(Boolean(data.bookmarked));
    } catch {
      setOptimisticBookmarked(bookmarked);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleBookmark}
      disabled={loading}
      title={bookmarked ? 'Remove bookmark' : 'Save bookmark'}
      aria-label={bookmarked ? 'Remove bookmark' : 'Save bookmark'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
        bookmarked
          ? 'border-vw-gold bg-vw-gold text-vw-blue'
          : 'border-gray-300 bg-white text-gray-500 hover:border-vw-gold hover:text-vw-blue'
      } ${loading ? 'opacity-60' : ''} ${className}`}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z" />
      </svg>
    </button>
  );
}
