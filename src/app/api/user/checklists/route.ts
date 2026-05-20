import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Redis } from '@upstash/redis';
import { maintenanceChecklists } from '@/data/maintenanceChecklists';
import { User, UserChecklists } from '@/types';

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

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

function normalizeChecklists(checklists?: UserChecklists): UserChecklists {
  const completedItemIdsByChecklist: Record<string, string[]> = {};

  for (const checklist of maintenanceChecklists) {
    const savedItemIds = checklists?.completedItemIdsByChecklist?.[checklist.id];
    const validItemIds = new Set(checklist.items.map((item) => item.id));
    completedItemIdsByChecklist[checklist.id] = Array.isArray(savedItemIds)
      ? [...new Set(savedItemIds.filter((itemId) => validItemIds.has(itemId)))]
      : [];
  }

  return {
    completedItemIdsByChecklist,
    updatedAt: checklists?.updatedAt,
  };
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
  const progress = normalizeChecklists(user.checklists);

  return NextResponse.json({
    checklists: maintenanceChecklists,
    progress,
  });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json() as {
    checklistId?: string;
    itemId?: string;
    completed?: boolean;
  };

  const checklist = maintenanceChecklists.find((item) => item.id === body.checklistId);
  const checklistItem = checklist?.items.find((item) => item.id === body.itemId);

  if (!checklist || !checklistItem) {
    return NextResponse.json({ error: 'Valid checklistId and itemId are required' }, { status: 400 });
  }

  const progress = normalizeChecklists(auth.users[auth.userIndex].checklists);
  const completedItemIds = progress.completedItemIdsByChecklist[checklist.id] || [];
  const exists = completedItemIds.includes(checklistItem.id);
  const shouldComplete = body.completed ?? !exists;

  progress.completedItemIdsByChecklist[checklist.id] = shouldComplete
    ? [...new Set([...completedItemIds, checklistItem.id])]
    : completedItemIds.filter((itemId) => itemId !== checklistItem.id);
  progress.updatedAt = new Date().toISOString();

  auth.users[auth.userIndex].checklists = progress;
  await saveUsers(auth.users);

  return NextResponse.json({
    success: true,
    checklists: maintenanceChecklists,
    progress,
  });
}
