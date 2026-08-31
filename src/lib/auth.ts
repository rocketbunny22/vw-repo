import 'server-only';

import crypto from 'crypto';
import type { NextRequest, NextResponse } from 'next/server';
import { getUsers } from '@/data/users';
import type { User } from '@/types';

export const SESSION_COOKIE_NAME = 'vw_auth';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function requiredSecret(name: 'SESSION_SECRET' | 'RESET_TOKEN_SECRET'): string {
  const value = process.env[name];

  if (!value || value.length < 32) {
    throw new Error(`${name} must be configured with at least 32 characters`);
  }

  return value;
}

const SESSION_SECRET = requiredSecret('SESSION_SECRET');
const RESET_TOKEN_SECRET = requiredSecret('RESET_TOKEN_SECRET');

interface SessionPayload {
  id: string;
  username: string;
  role: User['role'];
  exp: number;
  sessionVersion: number;
}

export interface AuthenticatedRequest {
  user: User;
  users: User[];
  userIndex: number;
}

function signaturesMatch(actual: string, expected: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(actual) || !/^[a-f0-9]{64}$/i.test(expected)) {
    return false;
  }

  const actualBuffer = Buffer.from(actual, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  return actualBuffer.length === expectedBuffer.length
    && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function isSessionPayload(value: unknown): value is SessionPayload {
  if (!value || typeof value !== 'object') return false;

  const payload = value as Partial<SessionPayload>;
  return typeof payload.id === 'string'
    && typeof payload.username === 'string'
    && (payload.role === 'user' || payload.role === 'admin')
    && typeof payload.exp === 'number'
    && Number.isFinite(payload.exp)
    && (payload.sessionVersion === undefined
      || (typeof payload.sessionVersion === 'number' && Number.isInteger(payload.sessionVersion)));
}

export function createSessionToken(user: User): string {
  const payload: SessionPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    sessionVersion: user.sessionVersion ?? 0,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [encodedPayload, signature, extra] = token.split('.');
    if (!encodedPayload || !signature || extra !== undefined) return null;

    const parsed = JSON.parse(Buffer.from(encodedPayload, 'base64').toString()) as unknown;
    if (!isSessionPayload(parsed) || parsed.exp < Date.now()) return null;

    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(JSON.stringify(parsed))
      .digest('hex');

    if (!signaturesMatch(signature, expectedSignature)) return null;

    return {
      ...parsed,
      sessionVersion: parsed.sessionVersion ?? 0,
    };
  } catch {
    return null;
  }
}

export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedRequest | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = verifySessionToken(token);
  if (!session) return null;

  const users = await getUsers();
  const userIndex = users.findIndex((user) => user.id === session.id);
  if (userIndex === -1) return null;

  const user = users[userIndex];
  if ((user.sessionVersion ?? 0) !== session.sessionVersion) return null;

  return { user, users, userIndex };
}

export async function authenticateAdminRequest(request: NextRequest): Promise<AuthenticatedRequest | null> {
  const auth = await authenticateRequest(request);
  return auth?.user.role === 'admin' ? auth : null;
}

export function setSessionCookie(response: NextResponse, user: User): void {
  response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export function createPasswordResetToken(email: string): string {
  const payload = Buffer.from(JSON.stringify({
    email,
    exp: Date.now() + 15 * 60 * 1000,
  })).toString('base64');
  const signature = crypto.createHmac('sha256', RESET_TOKEN_SECRET).update(payload).digest('hex');

  return `${payload}.${signature}`;
}

export function verifyPasswordResetToken(token: string): { valid: boolean; email?: string } {
  try {
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra !== undefined) return { valid: false };

    const expectedSignature = crypto.createHmac('sha256', RESET_TOKEN_SECRET).update(payload).digest('hex');
    if (!signaturesMatch(signature, expectedSignature)) return { valid: false };

    const data = JSON.parse(Buffer.from(payload, 'base64').toString()) as { email?: unknown; exp?: unknown };
    if (typeof data.email !== 'string' || typeof data.exp !== 'number' || data.exp < Date.now()) {
      return { valid: false };
    }

    return { valid: true, email: data.email };
  } catch {
    return { valid: false };
  }
}

export function incrementSessionVersion(user: User): void {
  user.sessionVersion = (user.sessionVersion ?? 0) + 1;
}
