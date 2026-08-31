import { NextRequest, NextResponse } from 'next/server';
import { VehicleProfile } from '@/types';
import { saveUsers } from '@/data/users';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  return NextResponse.json({ vehicle: auth.user.vehicle || null });
}

export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

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

  auth.users[auth.userIndex].vehicle = vehicle;
  await saveUsers(auth.users);

  return NextResponse.json({ success: true, vehicle });
}

export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  delete auth.users[auth.userIndex].vehicle;
  await saveUsers(auth.users);

  return NextResponse.json({ success: true });
}
