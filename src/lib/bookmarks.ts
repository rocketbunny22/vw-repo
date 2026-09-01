import type { UserBookmarks } from '@/types';

export const MAX_BOOKMARKS_PER_TYPE = 100;
const MAX_BOOKMARK_ID_LENGTH = 100;

export type BookmarkType = 'pdf' | 'guide';

export interface BookmarkCatalog {
  pdfIds: ReadonlySet<string>;
  guideIds: ReadonlySet<string>;
}

export interface BookmarkMutation {
  bookmarks: UserBookmarks;
  bookmarked: boolean;
  limitReached: boolean;
}

function normalizeIds(value: unknown, allowedIds: ReadonlySet<string>): string[] {
  if (!Array.isArray(value)) return [];

  const uniqueIds = new Set<string>();
  for (const item of value) {
    if (
      typeof item === 'string'
      && item.length > 0
      && item.length <= MAX_BOOKMARK_ID_LENGTH
      && allowedIds.has(item)
    ) {
      uniqueIds.add(item);
    }
    if (uniqueIds.size === MAX_BOOKMARKS_PER_TYPE) break;
  }

  return [...uniqueIds];
}

export function normalizeBookmarks(
  bookmarks: UserBookmarks | undefined,
  catalog: BookmarkCatalog,
): UserBookmarks {
  return {
    pdfIds: normalizeIds(bookmarks?.pdfIds, catalog.pdfIds),
    guideIds: normalizeIds(bookmarks?.guideIds, catalog.guideIds),
  };
}

export function isBookmarkTargetAllowed(
  type: BookmarkType,
  id: string,
  catalog: BookmarkCatalog,
): boolean {
  return (type === 'pdf' ? catalog.pdfIds : catalog.guideIds).has(id);
}

export function applyBookmarkMutation(
  current: UserBookmarks | undefined,
  catalog: BookmarkCatalog,
  type: BookmarkType,
  id: string,
  requestedState?: boolean,
): BookmarkMutation {
  const bookmarks = normalizeBookmarks(current, catalog);
  const key = type === 'pdf' ? 'pdfIds' : 'guideIds';
  const exists = bookmarks[key].includes(id);
  const bookmarked = requestedState ?? !exists;

  if (bookmarked && !exists && bookmarks[key].length >= MAX_BOOKMARKS_PER_TYPE) {
    return { bookmarks, bookmarked: false, limitReached: true };
  }

  bookmarks[key] = bookmarked
    ? [...new Set([...bookmarks[key], id])]
    : bookmarks[key].filter((bookmarkId) => bookmarkId !== id);

  return { bookmarks, bookmarked, limitReached: false };
}
