import { NextRequest, NextResponse } from 'next/server';
import { maintenanceChecklists } from '@/data/maintenanceChecklists';
import { saveUsers } from '@/data/users';
import { UserChecklists } from '@/types';
import { authenticateRequest } from '@/lib/auth';

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
  const auth = await authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const user = auth.users[auth.userIndex];
  const progress = normalizeChecklists(user.checklists);

  return NextResponse.json({
    checklists: maintenanceChecklists,
    progress,
  });
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

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
