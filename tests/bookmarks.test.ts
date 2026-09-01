import { describe, expect, it } from 'vitest';
import {
  applyBookmarkMutation,
  BookmarkCatalog,
  isBookmarkTargetAllowed,
  MAX_BOOKMARKS_PER_TYPE,
  normalizeBookmarks,
} from '@/lib/bookmarks';
import { optimisticMutation } from '@/lib/optimisticMutation';
import type { UserBookmarks } from '@/types';

function catalog(pdfIds: string[], guideIds: string[] = []): BookmarkCatalog {
  return { pdfIds: new Set(pdfIds), guideIds: new Set(guideIds) };
}

describe('bookmark hardening', () => {
  it('removes arbitrary, pending, malformed, and duplicate legacy IDs', () => {
    const approvedCatalog = catalog(['approved-pdf'], ['approved-guide']);
    const normalized = normalizeBookmarks({
      pdfIds: ['approved-pdf', 'pending-pdf', 'missing-pdf', 'approved-pdf', ''],
      guideIds: ['approved-guide', 'missing-guide', 'approved-guide'],
    }, approvedCatalog);

    expect(normalized).toEqual({
      pdfIds: ['approved-pdf'],
      guideIds: ['approved-guide'],
    });
    expect(isBookmarkTargetAllowed('pdf', 'pending-pdf', approvedCatalog)).toBe(false);
    expect(isBookmarkTargetAllowed('guide', 'missing-guide', approvedCatalog)).toBe(false);
  });

  it('caps normalized legacy arrays and does not duplicate existing bookmarks', () => {
    const validIds = Array.from({ length: 120 }, (_, index) => `pdf-${index}`);
    const approvedCatalog = catalog(validIds);
    const normalized = normalizeBookmarks({ pdfIds: validIds, guideIds: [] }, approvedCatalog);

    expect(normalized.pdfIds).toHaveLength(MAX_BOOKMARKS_PER_TYPE);

    const duplicate = applyBookmarkMutation(
      normalized,
      approvedCatalog,
      'pdf',
      normalized.pdfIds[0],
      true,
    );
    expect(duplicate.bookmarks.pdfIds).toHaveLength(MAX_BOOKMARKS_PER_TYPE);
    expect(duplicate.limitReached).toBe(false);
    expect(duplicate.bookmarked).toBe(true);
  });

  it('rejects additions at the maximum while still allowing removals', () => {
    const validIds = Array.from({ length: 101 }, (_, index) => `pdf-${index}`);
    const approvedCatalog = catalog(validIds);
    const current = { pdfIds: validIds.slice(0, 100), guideIds: [] };

    const addition = applyBookmarkMutation(current, approvedCatalog, 'pdf', validIds[100], true);
    expect(addition.limitReached).toBe(true);
    expect(addition.bookmarks.pdfIds).toHaveLength(MAX_BOOKMARKS_PER_TYPE);

    const removal = applyBookmarkMutation(current, approvedCatalog, 'pdf', validIds[0], false);
    expect(removal.limitReached).toBe(false);
    expect(removal.bookmarks.pdfIds).toHaveLength(MAX_BOOKMARKS_PER_TYPE - 1);
  });

  it('stays capped and duplicate-free during concurrent additions', async () => {
    const validIds = Array.from({ length: 120 }, (_, index) => `pdf-${index}`);
    const approvedCatalog = catalog(validIds);
    let state: UserBookmarks = { pdfIds: validIds.slice(0, 95), guideIds: [] };
    let version = 0;

    const add = (id: string) => optimisticMutation({
      maxAttempts: 100,
      read: async () => ({
        value: { pdfIds: [...state.pdfIds], guideIds: [...state.guideIds] },
        version,
      }),
      compareAndSet: async (expectedVersion, updated) => {
        await Promise.resolve();
        if (version !== expectedVersion) return false;
        state = updated;
        version += 1;
        return true;
      },
      update: (current) => applyBookmarkMutation(
        current,
        approvedCatalog,
        'pdf',
        id,
        true,
      ).bookmarks,
    });

    await Promise.all(validIds.slice(95, 115).map(add));

    expect(state.pdfIds).toHaveLength(MAX_BOOKMARKS_PER_TYPE);
    expect(new Set(state.pdfIds).size).toBe(MAX_BOOKMARKS_PER_TYPE);
    expect(state.pdfIds.every((id) => approvedCatalog.pdfIds.has(id))).toBe(true);
  });
});
