'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { localizedPath } from '@/lib/localization';

interface Comment {
  id: string;
  guideId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  reported?: boolean;
}

interface Props {
  guideId: string;
}

export default function CommentsSection({ guideId }: Props) {
  const { locale } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [error, setError] = useState('');
  const [reportingId, setReportingId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
    checkAuth();
  }, [guideId]);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (data.authenticated) setUser(data.user);
    } catch {}
  }

  async function fetchComments() {
    try {
      const res = await fetch(`/api/comments?guideId=${encodeURIComponent(guideId)}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId, content: newComment.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewComment('');
        fetchComments();
      } else {
        setError(data.error || 'Failed to post comment');
      }
    } catch {
      setError('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  }

  async function reportComment(commentId: string) {
    if (!user || reportingId) return;
    setReportingId(commentId);
    setError('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'report', commentId }),
      });
      const data = await res.json();

      if (data.success) {
        setComments((items) => items.map((item) => (
          item.id === commentId ? { ...item, reported: true } : item
        )));
      } else {
        setError(data.error || 'Failed to report comment');
      }
    } catch {
      setError('Failed to report comment');
    } finally {
      setReportingId(null);
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(locale === 'es-MX' ? 'es-MX' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="mt-16 border-t border-gray-200 pt-10">
      <h2 className="text-2xl font-bold text-vw-dark mb-8 flex items-center gap-2">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Comments ({comments.length})
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">{error}</div>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-vw-blue flex items-center justify-center text-white text-sm font-bold shrink-0 mt-1">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience or ask a question..."
                rows={3}
                maxLength={2000}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vw-blue focus:border-transparent resize-none text-sm"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{newComment.length}/2000</span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="px-4 py-2 bg-vw-blue text-white rounded-md font-medium hover:bg-vw-blue-light transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
          <Link href={localizedPath('/login', locale)} className="text-vw-blue font-medium hover:underline">Sign in</Link> to leave a comment.
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-vw-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm mt-2">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-500 text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-vw-gold flex items-center justify-center text-vw-dark text-sm font-bold shrink-0 mt-1">
                {comment.authorName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <Link
                      href={`/users/${encodeURIComponent(comment.authorName)}`}
                      className="font-semibold text-vw-dark text-sm hover:text-vw-blue hover:underline"
                    >
                      {comment.authorName}
                    </Link>
                    <div className="flex items-center gap-3">
                      {user && user.id !== comment.authorId && (
                        <button
                          type="button"
                          onClick={() => reportComment(comment.id)}
                          disabled={reportingId === comment.id || comment.reported}
                          className="text-xs text-gray-400 hover:text-red-600 disabled:cursor-not-allowed disabled:text-gray-300"
                        >
                          {comment.reported ? 'Reported' : 'Report'}
                        </button>
                      )}
                      <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
