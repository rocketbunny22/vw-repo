import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import { Comment } from '@/types';
import { authenticateRequest } from '@/lib/auth';

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
  const auth = await authenticateRequest(request);

  if (!auth) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { action, guideId, commentId, content } = await request.json();

    if (action === 'report') {
      if (!commentId) {
        return NextResponse.json({ error: 'commentId is required' }, { status: 400 });
      }

      const allComments = await getComments();
      const commentIndex = allComments.findIndex((comment) => comment.id === commentId);

      if (commentIndex === -1) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }

      allComments[commentIndex].reported = true;
      allComments[commentIndex].reportedAt = new Date().toISOString();
      allComments[commentIndex].moderationStatus = 'pending';
      await saveComments(allComments);

      return NextResponse.json({ success: true });
    }

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
