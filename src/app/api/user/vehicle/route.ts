import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Redis } from '@upstash/redis';
import { VehicleProfile } from '@/types';

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;

interface StoredUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin: string;
  vehicle?: VehicleProfile;
}

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

async function getUsers(): Promise<StoredUser[]> {
  if (!redis) return [];
  const users = await redis.get<StoredUser[]>('users');
  return users || [];
}

async function saveUsers(users: StoredUser[]): Promise<void> {
  if (!redis) return;
  await redis.set('users', users);
}

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('vw_auth');
  if (!authCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const session = verifySessionToken(authCookie.value);
  if (!session.valid || !session.userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const users = await getUsers();
  const user = users.find(u => u.id === session.userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ vehicle: user.vehicle || null });
}

export async function PUT(request: NextRequest) {
  const authCookie = request.cookies.get('vw_auth');
  if (!authCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const session = verifySessionToken(authCookie.value);
  if (!session.valid || !session.userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const body = await request.json();
  const { generation, model, year, engineCode, color, nickname } = body;

  if (!generation || !model) {
    return NextResponse.json({ error: 'Generation and model are required' }, { status: 400 });
  }

  const vehicle: VehicleProfile = {
    generation,
    model,
    year: year ? parseInt(year) : undefined,
    engineCode: engineCode || undefined,
    color: color || undefined,
    nickname: nickname || undefined,
  };

  const users = await getUsers();
  const userIndex = users.findIndex(u => u.id === session.userId);

  if (userIndex === -1) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  users[userIndex].vehicle = vehicle;
  await saveUsers(users);

  return NextResponse.json({ success: true, vehicle });
}

export async function DELETE(request: NextRequest) {
  const authCookie = request.cookies.get('vw_auth');
  if (!authCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const session = verifySessionToken(authCookie.value);
  if (!session.valid || !session.userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const users = await getUsers();
  const userIndex = users.findIndex(u => u.id === session.userId);

  if (userIndex === -1) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  delete users[userIndex].vehicle;
  await saveUsers(users);

  return NextResponse.json({ success: true });
}
