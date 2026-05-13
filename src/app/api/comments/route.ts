import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import { Comment } from '@/types';

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

async function getComments(): Promise<Comment[]> {
  if (!redis) return [];
  const comments = await redis.get<Comment[]>('comments');
  return comments || [];
}

async function saveComments(comments: Comment[]): Promise<void> {
  if (!redis) return;
  await redis.set('comments', comments);
}

function verifySessionToken(token: string): { valid: boolean; user?: { id: string; username: string } } {
  try {
    const [payload, signature] = token.split('.');
    const data = JSON.parse(Buffer.from(payload, 'base64').toString());
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(JSON.stringify(data)).digest('hex');
    if (signature !== expectedSig) return { valid: false };
    if (data.exp < Date.now()) return { valid: false };
    return { valid: true, user: { id: data.id, username: data.username } };
  } catch {
    return { valid: false };
  }
}

function checkAuth(request: NextRequest): { authenticated: boolean; user?: { id: string; username: string } } {
  const authCookie = request.cookies.get('vw_auth');
  if (!authCookie) return { authenticated: false };
  try {
    const sessionVerify = verifySessionToken(authCookie.value);
    if (!sessionVerify.valid || !sessionVerify.user) {
      return { authenticated: false };
    }
    return { authenticated: true, user: sessionVerify.user };
  } catch {
    return { authenticated: false };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const guideId = searchParams.get('guideId');

  if (!guideId) {
    return NextResponse.json({ error: 'guideId is required' }, { status: 400 });
  }

  const allComments = await getComments();
  const guideComments = allComments
    .filter((c) => c.guideId === guideId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return NextResponse.json({ comments: guideComments });
}

export async function POST(request: NextRequest) {
  const auth = checkAuth(request);

  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { guideId, content } = await request.json();

    if (!guideId || !content || !content.trim()) {
      return NextResponse.json({ error: 'guideId and content are required' }, { status: 400 });
    }

    if (content.trim().length > 2000) {
      return NextResponse.json({ error: 'Comment is too long (max 2000 characters)' }, { status: 400 });
    }

    const comment: Comment = {
      id: crypto.randomUUID(),
      guideId,
      authorId: auth.user.id,
      authorName: auth.user.username,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    const allComments = await getComments();
    allComments.push(comment);
    await saveComments(allComments);

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error('Comment error:', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
