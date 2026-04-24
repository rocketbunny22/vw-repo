import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Redis } from '@upstash/redis';

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

const redis = process.env.UPSTASH_REDIS_REST_URL 
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;

interface Feedback {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  createdAt: string;
}

async function getFeedback(): Promise<Feedback[]> {
  if (!redis) return [];
  const feedback = await redis.get<Feedback[]>('feedback');
  return feedback || [];
}

async function saveFeedback(feedback: Feedback[]): Promise<void> {
  if (!redis) return;
  await redis.set('feedback', feedback);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, category, message } = body;

    if (!category || !message) {
      return NextResponse.json({ error: 'Category and message are required' }, { status: 400 });
    }

    const feedback: Feedback = {
      id: crypto.randomUUID(),
      name: name || 'Anonymous',
      email: email || '',
      category,
      message,
      createdAt: new Date().toISOString(),
    };

    const allFeedback = await getFeedback();
    allFeedback.push(feedback);
    await saveFeedback(allFeedback);

    console.log(`New feedback (${category}) from ${name || 'Anonymous'}: ${message.substring(0, 50)}...`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('vw_auth');
  
  if (!authCookie || !SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [payload, signature] = authCookie.value.split('.');
    const data = JSON.parse(Buffer.from(payload, 'base64').toString());
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(JSON.stringify(data)).digest('hex');
    
    if (signature !== expectedSig || data.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const feedback = await getFeedback();
    return NextResponse.json({ feedback: feedback.reverse() });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}