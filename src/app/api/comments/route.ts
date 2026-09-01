import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Comment } from '@/types';
import { getComments, mutateComments } from '@/data/moderation';
import { authenticateRequest } from '@/lib/auth';
import { consumeRateLimits, isRedisUnavailableError, redisUnavailableResponse } from '@/lib/redis';
import { boundedString, INPUT_LIMITS, readJsonObject, requestClientIdentifier } from '@/lib/validation';
import { rejectUntrustedMutation } from '@/lib/requestSecurity';
import { toPublicComment } from '@/lib/publicSummaries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guideId = searchParams.get('guideId');

    if (!guideId) {
      return NextResponse.json({ error: 'guideId is required' }, { status: 400 });
    }

    const allComments = await getComments();
    const auth = await authenticateRequest(request);
    const guideComments = allComments
      .filter((c) => c.guideId === guideId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return NextResponse.json({
      comments: guideComments.map((comment) => ({
        ...toPublicComment(comment),
        canReport: Boolean(auth && auth.user.id !== comment.authorId),
      })),
    });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Comment load error:', error);
    return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const originError = rejectUntrustedMutation(request);
    if (originError) return originError;

    const auth = await authenticateRequest(request);

    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    const { action, guideId, commentId, content } = body;
    const rateLimit = await consumeRateLimits([
      { key: `comments:user:${auth.user.id}`, limit: 30, windowSeconds: 60 * 60 },
      { key: `comments:client:${requestClientIdentifier(request)}`, limit: 100, windowSeconds: 60 * 60 },
    ]);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many comment actions' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } });
    }

    if (action === 'report') {
      const validCommentId = boundedString(commentId, 100);
      if (!validCommentId) {
        return NextResponse.json({ error: 'commentId is required' }, { status: 400 });
      }

      let found = false;
      let ownComment = false;
      await mutateComments((comments) => comments.map((comment) => {
        if (comment.id !== validCommentId) return comment;
        found = true;
        if (comment.authorId === auth.user.id) {
          ownComment = true;
          return comment;
        }
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
      if (ownComment) {
        return NextResponse.json({ error: 'You cannot report your own comment' }, { status: 400 });
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

    return NextResponse.json({
      success: true,
      comment: { ...toPublicComment(comment), canReport: false },
    });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Comment error:', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
