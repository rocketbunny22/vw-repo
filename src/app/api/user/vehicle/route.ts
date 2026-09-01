import { NextRequest, NextResponse } from 'next/server';
import { VehicleProfile } from '@/types';
import { mutateUsers } from '@/data/users';
import { authenticateRequest } from '@/lib/auth';
import { isRedisUnavailableError, redisUnavailableResponse } from '@/lib/redis';
import { boundedString, INPUT_LIMITS, isValidGeneration, readJsonObject } from '@/lib/validation';
import { generations } from '@/data/generations';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    return NextResponse.json({ vehicle: auth.user.vehicle || null });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Vehicle load error:', error);
    return NextResponse.json({ error: 'Failed to load vehicle' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    const { generation, model, year, engineCode, color, nickname } = body;
    const validGeneration = boundedString(generation, INPUT_LIMITS.name);
    const validModel = boundedString(model, INPUT_LIMITS.name);

    const generationData = validGeneration ? generations.find((item) => item.id === validGeneration) : undefined;
    if (!validGeneration || !validModel || !isValidGeneration(validGeneration) || !generationData?.models.includes(validModel)) {
      return NextResponse.json({ error: 'Generation and model are required' }, { status: 400 });
    }

    const parsedYear = typeof year === 'number' ? year : typeof year === 'string' ? Number.parseInt(year, 10) : undefined;
    if (parsedYear !== undefined && (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > new Date().getFullYear() + 1)) {
      return NextResponse.json({ error: 'Invalid model year' }, { status: 400 });
    }

    const validEngineCode = boundedString(engineCode, 40, false);
    const validColor = boundedString(color, 60, false);
    const validNickname = boundedString(nickname, 60, false);
    if (validEngineCode === null || validColor === null || validNickname === null) {
      return NextResponse.json({ error: 'Vehicle details are too long' }, { status: 400 });
    }

    const vehicle: VehicleProfile = {
      generation: validGeneration,
      model: validModel,
      year: parsedYear,
      engineCode: validEngineCode || undefined,
      color: validColor || undefined,
      nickname: validNickname || undefined,
    };

    await mutateUsers((users) => users.map((user) => (
      user.id === auth.user.id ? { ...user, vehicle } : user
    )));

    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Vehicle update error:', error);
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await mutateUsers((users) => users.map((user) => {
      if (user.id !== auth.user.id) return user;
      const updatedUser = { ...user };
      delete updatedUser.vehicle;
      return updatedUser;
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Vehicle delete error:', error);
    return NextResponse.json({ error: 'Failed to remove vehicle' }, { status: 500 });
  }
}
