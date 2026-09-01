import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Comment } from '@/types';
import { getComments, mutateComments } from '@/data/moderation';
import { authenticateRequest } from '@/lib/auth';
import { consumeRateLimit, isRedisUnavailableError, redisUnavailableResponse } from '@/lib/redis';
import { boundedString, INPUT_LIMITS, readJsonObject, requestClientIdentifier } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
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
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Comment load error:', error);
    return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    const { action, guideId, commentId, content } = body;
    const rateLimit = await consumeRateLimit(
      `comments:${auth.user.id}:${requestClientIdentifier(request)}`,
      30,
      60 * 60,
    );
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many comment actions' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } });
    }

    if (action === 'report') {
      if (!commentId) {
        return NextResponse.json({ error: 'commentId is required' }, { status: 400 });
      }

      let found = false;
      await mutateComments((comments) => comments.map((comment) => {
        if (comment.id !== commentId) return comment;
        found = true;
        return {
          ...comment,
          reported: true,
          reportedAt: new Date().toISOString(),
          moderationStatus: 'pending',
        };
      }));

      if (!found) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    }

    const validGuideId = boundedString(guideId, 100);
    const validContent = boundedString(content, INPUT_LIMITS.comment);
    if (!validGuideId || !validContent) {
      return NextResponse.json({ error: 'guideId and content are required' }, { status: 400 });
    }

    const comment: Comment = {
      id: crypto.randomUUID(),
      guideId: validGuideId,
      authorId: auth.user.id,
      authorName: auth.user.username,
      content: validContent,
      createdAt: new Date().toISOString(),
    };

    await mutateComments((comments) => [...comments, comment]);

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Comment error:', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
