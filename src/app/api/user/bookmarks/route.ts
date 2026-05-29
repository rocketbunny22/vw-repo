import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import { Redis } from '@upstash/redis';
import { diyGuides } from '@/data/diyGuides';
import { getAllPdfs } from '@/data/pdfs';
import { DiyGuide, User, UserBookmarks } from '@/types';

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const guidesFile = path.resolve(process.cwd(), 'user-guides.json');

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

function verifySessionToken(token: string): { valid: boolean; userId?: string } {
  try {
    const [payload, signature] = token.split('.');
    const data = JSON.parse(Buffer.from(payload, 'base64').toString());
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(JSON.stringify(data)).digest('hex');
    if (signature !== expectedSig) return { valid: false };
    if (data.exp < Date.now()) return { valid: false };
    return { valid: true, userId: data.id };
  } catch {
    return { valid: false };
  }
}

async function getUsers(): Promise<User[]> {
  if (!redis) return [];
  const users = await redis.get<User[]>('users');
  return Array.isArray(users) ? users : [];
}

async function saveUsers(users: User[]): Promise<void> {
  if (!redis) throw new Error('Redis not configured');
  await redis.set('users', users);
}

function normalizeBookmarks(bookmarks?: UserBookmarks): UserBookmarks {
  return {
    pdfIds: Array.isArray(bookmarks?.pdfIds) ? [...new Set(bookmarks.pdfIds)] : [],
    guideIds: Array.isArray(bookmarks?.guideIds) ? [...new Set(bookmarks.guideIds)] : [],
  };
}

async function getApprovedGuides(): Promise<DiyGuide[]> {
  let userGuides: DiyGuide[] = [];

  try {
    if (existsSync(guidesFile)) {
      const data = await readFile(guidesFile, 'utf-8');
      const parsed = JSON.parse(data) as DiyGuide[];
      userGuides = Array.isArray(parsed) ? parsed.filter((guide) => guide.approved) : [];
    }
  } catch {
    userGuides = [];
  }

  return [...diyGuides, ...userGuides];
}

async function getAuthenticatedUser(request: NextRequest): Promise<{ users: User[]; userIndex: number } | NextResponse> {
  const authCookie = request.cookies.get('vw_auth');
  if (!authCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const session = verifySessionToken(authCookie.value);
  if (!session.valid || !session.userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const users = await getUsers();
  const userIndex = users.findIndex((user) => user.id === session.userId);
  if (userIndex === -1) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return { users, userIndex };
}

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);
  if (auth instanceof NextResponse) return auth;

  const user = auth.users[auth.userIndex];
  const bookmarks = normalizeBookmarks(user.bookmarks);
  const [pdfs, guides] = await Promise.all([getAllPdfs(), getApprovedGuides()]);

  return NextResponse.json({
    bookmarks,
    pdfs: pdfs.filter((pdf) => pdf.approved !== false && bookmarks.pdfIds.includes(pdf.id)),
    guides: guides.filter((guide) => bookmarks.guideIds.includes(guide.id)),
  });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);
  if (auth instanceof NextResponse) return auth;

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
