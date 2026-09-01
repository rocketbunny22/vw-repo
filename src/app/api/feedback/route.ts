import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getFeedback, mutateFeedback } from '@/data/moderation';
import { authenticateAdminRequest } from '@/lib/auth';
import { consumeRateLimit, isRedisUnavailableError, redisUnavailableResponse } from '@/lib/redis';
import { boundedString, INPUT_LIMITS, normalizedEmail, readJsonObject, requestClientIdentifier } from '@/lib/validation';
import type { Feedback } from '@/types';
import { rejectUntrustedMutation } from '@/lib/requestSecurity';

const FEEDBACK_CATEGORIES = new Set(['general', 'bug', 'suggestion', 'content', 'other']);

export async function POST(request: NextRequest) {
  try {
    const originError = rejectUntrustedMutation(request);
    if (originError) return originError;

    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    const { name, email, category, message } = body;
    const rateLimit = await consumeRateLimit(`feedback:${requestClientIdentifier(request)}`, 5, 60 * 60);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many feedback submissions' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } });
    }

    const validName = boundedString(name, INPUT_LIMITS.name, false);
    const validCategory = boundedString(category, INPUT_LIMITS.name);
    const validMessage = boundedString(message, INPUT_LIMITS.feedback);
    const validEmail = email ? normalizedEmail(email) : '';

    if (validName === null || !validCategory || !FEEDBACK_CATEGORIES.has(validCategory) || !validMessage || validEmail === null) {
      return NextResponse.json({ error: 'Category and message are required' }, { status: 400 });
    }

    const feedback: Feedback = {
      id: crypto.randomUUID(),
      name: validName || 'Anonymous',
      email: validEmail,
      category: validCategory,
      message: validMessage,
      createdAt: new Date().toISOString(),
      moderationStatus: 'pending',
    };

    await mutateFeedback((items) => [...items, feedback]);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Feedback error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateAdminRequest(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const feedback = await getFeedback();
    return NextResponse.json({ feedback: feedback.reverse() });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Feedback load error:', error);
    return NextResponse.json({ error: 'Failed to load feedback' }, { status: 500 });
  }
}
