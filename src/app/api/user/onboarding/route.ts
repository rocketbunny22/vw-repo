import { NextRequest, NextResponse } from 'next/server';
import { mutateUsers } from '@/data/users';
import { UserOnboarding } from '@/types';
import { authenticateRequest } from '@/lib/auth';
import { isRedisUnavailableError, redisUnavailableResponse } from '@/lib/redis';
import { readJsonObject } from '@/lib/validation';

function normalizeOnboarding(onboarding?: UserOnboarding): UserOnboarding {
  return {
    hasSeenWelcome: onboarding?.hasSeenWelcome === false ? false : true,
    welcomeSeenAt: onboarding?.welcomeSeenAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const onboarding = normalizeOnboarding(auth.users[auth.userIndex].onboarding);
    return NextResponse.json({ onboarding });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Onboarding load error:', error);
    return NextResponse.json({ error: 'Failed to load onboarding state' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await readJsonObject(request);
    if (!body || (body.hasSeenWelcome !== undefined && typeof body.hasSeenWelcome !== 'boolean')) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const hasSeenWelcome = typeof body.hasSeenWelcome === 'boolean' ? body.hasSeenWelcome : true;

    let onboarding: UserOnboarding = { hasSeenWelcome: true };
    await mutateUsers((users) => users.map((user) => {
      if (user.id !== auth.user.id) return user;
      onboarding = {
        ...normalizeOnboarding(user.onboarding),
        hasSeenWelcome,
        welcomeSeenAt: hasSeenWelcome ? new Date().toISOString() : undefined,
      };
      return { ...user, onboarding };
    }));

    return NextResponse.json({ success: true, onboarding });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Onboarding update error:', error);
    return NextResponse.json({ error: 'Failed to update onboarding state' }, { status: 500 });
  }
}
