import { NextRequest, NextResponse } from 'next/server';
import { saveUsers } from '@/data/users';
import { UserOnboarding } from '@/types';
import { authenticateRequest } from '@/lib/auth';

function normalizeOnboarding(onboarding?: UserOnboarding): UserOnboarding {
  return {
    hasSeenWelcome: onboarding?.hasSeenWelcome === false ? false : true,
    welcomeSeenAt: onboarding?.welcomeSeenAt,
  };
}

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const onboarding = normalizeOnboarding(auth.users[auth.userIndex].onboarding);
  return NextResponse.json({ onboarding });
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json() as {
    hasSeenWelcome?: boolean;
  };

  const onboarding: UserOnboarding = {
    ...normalizeOnboarding(auth.users[auth.userIndex].onboarding),
    hasSeenWelcome: body.hasSeenWelcome ?? true,
    welcomeSeenAt: body.hasSeenWelcome === false ? undefined : new Date().toISOString(),
  };

  auth.users[auth.userIndex].onboarding = onboarding;
  await saveUsers(auth.users);

  return NextResponse.json({ success: true, onboarding });
}
