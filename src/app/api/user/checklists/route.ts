import { NextRequest, NextResponse } from 'next/server';
import { maintenanceChecklists } from '@/data/maintenanceChecklists';
import { mutateUsers } from '@/data/users';
import { UserChecklists } from '@/types';
import { authenticateRequest } from '@/lib/auth';
import { isRedisUnavailableError, redisUnavailableResponse } from '@/lib/redis';
import { boundedString, readJsonObject } from '@/lib/validation';

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

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const user = auth.users[auth.userIndex];
    const progress = normalizeChecklists(user.checklists);

    return NextResponse.json({
      checklists: maintenanceChecklists,
      progress,
    });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Checklist load error:', error);
    return NextResponse.json({ error: 'Failed to load checklists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    const checklistId = boundedString(body.checklistId, 100);
    const itemId = boundedString(body.itemId, 100);
    if (body.completed !== undefined && typeof body.completed !== 'boolean') {
      return NextResponse.json({ error: 'completed must be a boolean' }, { status: 400 });
    }

    const checklist = maintenanceChecklists.find((item) => item.id === checklistId);
    const checklistItem = checklist?.items.find((item) => item.id === itemId);

    if (!checklist || !checklistItem) {
      return NextResponse.json({ error: 'Valid checklistId and itemId are required' }, { status: 400 });
    }

    let progress: UserChecklists = normalizeChecklists();
    await mutateUsers((users) => users.map((user) => {
      if (user.id !== auth.user.id) return user;
      progress = normalizeChecklists(user.checklists);
      const completedItemIds = progress.completedItemIdsByChecklist[checklist.id] || [];
      const exists = completedItemIds.includes(checklistItem.id);
      const shouldComplete = body.completed ?? !exists;
      progress.completedItemIdsByChecklist[checklist.id] = shouldComplete
        ? [...new Set([...completedItemIds, checklistItem.id])]
        : completedItemIds.filter((itemId) => itemId !== checklistItem.id);
      progress.updatedAt = new Date().toISOString();
      return { ...user, checklists: progress };
    }));

    return NextResponse.json({
      success: true,
      checklists: maintenanceChecklists,
      progress,
    });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Checklist update error:', error);
    return NextResponse.json({ error: 'Failed to update checklist' }, { status: 500 });
  }
}
