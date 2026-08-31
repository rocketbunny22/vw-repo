import { NextRequest, NextResponse } from 'next/server';
import { diyGuides } from '@/data/diyGuides';
import { getAllPdfs } from '@/data/pdfs';
import { getUserGuides } from '@/data/guides';
import { saveUsers } from '@/data/users';
import { DiyGuide, UserBookmarks } from '@/types';
import { toPublicGuideSummary, toPublicPdfSummary } from '@/lib/publicSummaries';
import { authenticateRequest } from '@/lib/auth';

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
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json() as {
    type?: 'pdf' | 'guide';
    id?: string;
    bookmarked?: boolean;
  };

  if ((body.type !== 'pdf' && body.type !== 'guide') || !body.id) {
    return NextResponse.json({ error: 'Bookmark type and id are required' }, { status: 400 });
  }

  const user = auth.users[auth.userIndex];
  const bookmarks = normalizeBookmarks(user.bookmarks);
  const key = body.type === 'pdf' ? 'pdfIds' : 'guideIds';
  const exists = bookmarks[key].includes(body.id);
  const shouldBookmark = body.bookmarked ?? !exists;

  bookmarks[key] = shouldBookmark
    ? [...new Set([...bookmarks[key], body.id])]
    : bookmarks[key].filter((id) => id !== body.id);

  auth.users[auth.userIndex].bookmarks = bookmarks;
  await saveUsers(auth.users);

  return NextResponse.json({ success: true, bookmarks, bookmarked: shouldBookmark });
}
