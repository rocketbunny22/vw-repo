import { NextRequest, NextResponse } from 'next/server';
import { diyGuides } from '@/data/diyGuides';
import { getAllPdfs } from '@/data/pdfs';
import { getUserGuides } from '@/data/guides';
import { mutateUsers } from '@/data/users';
import { DiyGuide, UserBookmarks } from '@/types';
import { toPublicGuideSummary, toPublicPdfSummary } from '@/lib/publicSummaries';
import { authenticateRequest } from '@/lib/auth';
import { isRedisUnavailableError, redisUnavailableResponse } from '@/lib/redis';
import { boundedString, readJsonObject } from '@/lib/validation';
import { rejectUntrustedMutation } from '@/lib/requestSecurity';

function normalizeBookmarks(bookmarks?: UserBookmarks): UserBookmarks {
  return {
    pdfIds: Array.isArray(bookmarks?.pdfIds) ? [...new Set(bookmarks.pdfIds)] : [],
    guideIds: Array.isArray(bookmarks?.guideIds) ? [...new Set(bookmarks.guideIds)] : [],
  };
}

async function getApprovedGuides(): Promise<DiyGuide[]> {
  const userGuides = (await getUserGuides()).filter((guide) => guide.approved);
  return [...diyGuides, ...userGuides];
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const user = auth.users[auth.userIndex];
    const bookmarks = normalizeBookmarks(user.bookmarks);
    const [pdfs, guides] = await Promise.all([getAllPdfs(), getApprovedGuides()]);

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

    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    const bookmarkId = boundedString(body.id, 100);

    if ((body.type !== 'pdf' && body.type !== 'guide') || !bookmarkId || (body.bookmarked !== undefined && typeof body.bookmarked !== 'boolean')) {
      return NextResponse.json({ error: 'Bookmark type and id are required' }, { status: 400 });
    }
    const requestedBookmarkState = typeof body.bookmarked === 'boolean' ? body.bookmarked : undefined;

    const key = body.type === 'pdf' ? 'pdfIds' : 'guideIds';
    let bookmarks: UserBookmarks = normalizeBookmarks();
    let shouldBookmark = false;
    await mutateUsers((users) => users.map((user) => {
      if (user.id !== auth.user.id) return user;
      bookmarks = normalizeBookmarks(user.bookmarks);
      const exists = bookmarks[key].includes(bookmarkId);
      shouldBookmark = requestedBookmarkState ?? !exists;
      bookmarks[key] = shouldBookmark
        ? [...new Set([...bookmarks[key], bookmarkId])]
        : bookmarks[key].filter((id) => id !== bookmarkId);
      return { ...user, bookmarks };
    }));

    return NextResponse.json({ success: true, bookmarks, bookmarked: shouldBookmark });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Bookmark update error:', error);
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 });
  }
}
