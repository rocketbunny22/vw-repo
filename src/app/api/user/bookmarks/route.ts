import { NextRequest, NextResponse } from 'next/server';
import { diyGuides } from '@/data/diyGuides';
import { getAllPdfs } from '@/data/pdfs';
import { getUserGuides } from '@/data/guides';
import { mutateUsers } from '@/data/users';
import { DiyGuide, UserBookmarks } from '@/types';
import { toPublicGuideSummary, toPublicPdfSummary } from '@/lib/publicSummaries';
import { authenticateRequest } from '@/lib/auth';
import { consumeRateLimits, isRedisUnavailableError, redisUnavailableResponse } from '@/lib/redis';
import { boundedString, readJsonObject, requestClientIdentifier } from '@/lib/validation';
import { rejectUntrustedMutation } from '@/lib/requestSecurity';
import {
  applyBookmarkMutation,
  BookmarkCatalog,
  BookmarkType,
  isBookmarkTargetAllowed,
  MAX_BOOKMARKS_PER_TYPE,
  normalizeBookmarks,
} from '@/lib/bookmarks';

async function getApprovedGuides(): Promise<DiyGuide[]> {
  const userGuides = (await getUserGuides()).filter((guide) => guide.approved);
  return [...diyGuides, ...userGuides];
}

function createBookmarkCatalog(pdfs: Awaited<ReturnType<typeof getAllPdfs>>, guides: DiyGuide[]): BookmarkCatalog {
  return {
    pdfIds: new Set(pdfs.filter((pdf) => pdf.approved !== false).map((pdf) => pdf.id)),
    guideIds: new Set(guides.map((guide) => guide.id)),
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const [pdfs, guides] = await Promise.all([getAllPdfs(), getApprovedGuides()]);
    const user = auth.users[auth.userIndex];
    const bookmarks = normalizeBookmarks(user.bookmarks, createBookmarkCatalog(pdfs, guides));

    return NextResponse.json({
      bookmarks,
      pdfs: pdfs
        .filter((pdf) => pdf.approved !== false && bookmarks.pdfIds.includes(pdf.id))
        .map(toPublicPdfSummary),
      guides: guides
        .filter((guide) => bookmarks.guideIds.includes(guide.id))
        .map(toPublicGuideSummary),
    });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Bookmark load error:', error);
    return NextResponse.json({ error: 'Failed to load bookmarks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const originError = rejectUntrustedMutation(request);
    if (originError) return originError;

    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const rateLimit = await consumeRateLimits([
      { key: `bookmarks:user:${auth.user.id}`, limit: 120, windowSeconds: 60 * 60 },
      { key: `bookmarks:client:${requestClientIdentifier(request)}`, limit: 300, windowSeconds: 60 * 60 },
    ]);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many bookmark updates' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
      );
    }

    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    const bookmarkId = boundedString(body.id, 100);

    if ((body.type !== 'pdf' && body.type !== 'guide') || !bookmarkId || (body.bookmarked !== undefined && typeof body.bookmarked !== 'boolean')) {
      return NextResponse.json({ error: 'Bookmark type and id are required' }, { status: 400 });
    }
    const bookmarkType = body.type as BookmarkType;
    const requestedBookmarkState = typeof body.bookmarked === 'boolean' ? body.bookmarked : undefined;
    const [pdfs, guides] = await Promise.all([getAllPdfs(), getApprovedGuides()]);
    const catalog = createBookmarkCatalog(pdfs, guides);

    if (!isBookmarkTargetAllowed(bookmarkType, bookmarkId, catalog)) {
      return NextResponse.json({ error: 'Bookmark target not found' }, { status: 404 });
    }

    let bookmarks: UserBookmarks = { pdfIds: [], guideIds: [] };
    let shouldBookmark = false;
    let limitReached = false;
    let userFound = false;
    await mutateUsers((users) => {
      limitReached = false;
      userFound = false;
      return users.map((user) => {
        if (user.id !== auth.user.id) return user;
        userFound = true;
        const mutation = applyBookmarkMutation(
          user.bookmarks,
          catalog,
          bookmarkType,
          bookmarkId,
          requestedBookmarkState,
        );
        bookmarks = mutation.bookmarks;
        shouldBookmark = mutation.bookmarked;
        limitReached = mutation.limitReached;
        return { ...user, bookmarks };
      });
    });

    if (!userFound) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (limitReached) {
      return NextResponse.json(
        { error: `You can save up to ${MAX_BOOKMARKS_PER_TYPE} bookmarks of each type`, code: 'BOOKMARK_LIMIT_REACHED' },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: true, bookmarks, bookmarked: shouldBookmark });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Bookmark update error:', error);
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 });
  }
}
