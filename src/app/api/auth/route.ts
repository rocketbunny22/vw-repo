import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { getUsers, mutateUsers } from '@/data/users';
import {
  authenticateRequest,
  clearSessionCookie,
  createPasswordResetToken,
  incrementSessionVersion,
  passwordResetTokenDigest,
  setSessionCookie,
} from '@/lib/auth';
import {
  clearRateLimit,
  consumeRateLimits,
  isRedisUnavailableError,
  redisUnavailableResponse,
  runRedis,
} from '@/lib/redis';
import { deleteUserAccount } from '@/lib/accountDeletion';
import {
  boundedString,
  normalizedEmail,
  normalizedUsername,
  passwordError,
  rateLimitIdentifier,
  readJsonObject,
  requestClientIdentifier,
} from '@/lib/validation';
import { rejectUntrustedMutation } from '@/lib/requestSecurity';
import type { User } from '@/types';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
const RESET_TOKEN_TTL_SECONDS = 15 * 60;
const CONSUME_RESET_TOKEN_SCRIPT = `
local value = redis.call('GET', KEYS[1])
if not value then
  return nil
end
redis.call('DEL', KEYS[1])
return value
`;

async function sendPasswordResetEmail(email: string, resetToken: string, locale: 'en' | 'es-MX' = 'en') {
  if (!resend) {
    console.info('Password reset requested, but email delivery is not configured');
    return;
  }

  const resetPath = locale === 'es-MX' ? '/es-mx/restablecer-contrasena' : '/reset-password';
  const resetUrl = new URL(resetPath, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  resetUrl.searchParams.set('token', resetToken);
  const spanish = locale === 'es-MX';

  await resend.emails.send({
    from: 'VW Repo <vwrepo@groundedcyber.com>',
    to: email,
    subject: spanish ? 'Restablece tu contraseña de VW Repo' : 'Reset your VW Repo password',
    html: `
      <h1>${spanish ? 'Restablece tu contraseña' : 'Reset your password'}</h1>
      <p>${spanish ? 'Usa el siguiente botón para restablecer tu contraseña:' : 'Click the button below to reset your password:'}</p>
      <a href="${resetUrl.toString()}" style="display:inline-block;padding:12px 24px;background:#0066cc;color:white;text-decoration:none;border-radius:4px">
        ${spanish ? 'Restablecer contraseña' : 'Reset Password'}
      </a>
      <p>${spanish ? 'Este enlace vence en 15 minutos.' : 'This link expires in 15 minutes.'}</p>
    `,
  });
}

function emailHash(email: string): string {
  return crypto.createHash('sha256').update(email).digest('hex');
}

async function storePasswordResetToken(email: string, token: string): Promise<void> {
  const digest = passwordResetTokenDigest(token);
  const indexKey = `reset_tokens_by_email:${emailHash(email)}`;
  await runRedis(async (redis) => {
    await redis.set(`reset_token:${digest}`, email, { nx: true, ex: RESET_TOKEN_TTL_SECONDS });
    await redis.sadd(indexKey, digest);
    await redis.expire(indexKey, RESET_TOKEN_TTL_SECONDS);
  });
}

async function consumePasswordResetToken(token: string): Promise<string | null> {
  if (!/^[a-zA-Z0-9_-]{40,100}$/.test(token)) return null;
  const digest = passwordResetTokenDigest(token);
  const email = await runRedis((redis) => redis.eval<string[], string | null>(
    CONSUME_RESET_TOKEN_SCRIPT,
    [`reset_token:${digest}`],
    [],
  ));
  if (typeof email !== 'string') return null;
  await runRedis((redis) => redis.srem(`reset_tokens_by_email:${emailHash(email)}`, digest));
  return email;
}

function sanitizeOptionalUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function userResponse(user: User) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    profileLinks: user.profileLinks || {},
  };
}

function rateLimitResponse(message: string, retryAfter: number) {
  return NextResponse.json(
    { error: message, retryAfter },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  );
}

export async function POST(request: NextRequest) {
  try {
    const originError = rejectUntrustedMutation(request);
    if (originError) return originError;

    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    const action = boundedString(body.action, 40);
    if (!action) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    if (action === 'signup') {
      const email = normalizedEmail(body.email);
      const username = normalizedUsername(body.username);
      const validationError = passwordError(body.password);
      if (!email || !username || validationError) {
        return NextResponse.json({ error: validationError || 'A valid email and username are required' }, { status: 400 });
      }
      const clientId = requestClientIdentifier(request);
      const emailId = rateLimitIdentifier(email);
      const rateLimit = await consumeRateLimits([
        { key: `signup:client:${clientId}`, limit: 10, windowSeconds: 60 * 60 },
        { key: `signup:email:${emailId}`, limit: 3, windowSeconds: 60 * 60 },
      ]);
      if (!rateLimit.allowed) return rateLimitResponse('Too many signup attempts. Try again later.', rateLimit.retryAfter);
      const passwordHash = await bcrypt.hash(body.password as string, 12);
      const newUser: User = {
        id: crypto.randomUUID(), email, username, passwordHash, role: 'user',
        createdAt: new Date().toISOString(), lastLogin: new Date().toISOString(),
        sessionVersion: 0, onboarding: { hasSeenWelcome: false },
      };
      let conflict: 'email' | 'username' | null = null;
      await mutateUsers((users) => {
        if (users.some((user) => user.email.toLowerCase() === email)) conflict = 'email';
        else if (users.some((user) => user.username.toLowerCase() === username.toLowerCase())) conflict = 'username';
        return conflict ? users : [...users, newUser];
      });
      if (conflict) return NextResponse.json({ error: conflict === 'email' ? 'Email already registered' : 'Username already taken' }, { status: 400 });
      const response = NextResponse.json({ success: true, user: userResponse(newUser) });
      setSessionCookie(response, newUser);
      return response;
    }

    if (action === 'login') {
      const email = normalizedEmail(body.email);
      const password = typeof body.password === 'string' ? body.password : '';
      if (!email || !password) return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
      const accountRateKey = `login:account:${rateLimitIdentifier(email)}`;
      const rateLimit = await consumeRateLimits([
        { key: accountRateKey, limit: 5, windowSeconds: 15 * 60 },
        { key: `login:client:${requestClientIdentifier(request)}`, limit: 30, windowSeconds: 15 * 60 },
      ]);
      if (!rateLimit.allowed) return rateLimitResponse('Too many login attempts. Try again later.', rateLimit.retryAfter);
      const user = (await getUsers()).find((item) => item.email.toLowerCase() === email);
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }
      const lastLogin = new Date().toISOString();
      await mutateUsers((users) => users.map((item) => item.id === user.id ? { ...item, lastLogin } : item));
      await clearRateLimit(accountRateKey);
      const currentUser = { ...user, lastLogin };
      const response = NextResponse.json({ success: true, user: userResponse(currentUser) });
      setSessionCookie(response, currentUser);
      return response;
    }

    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      clearSessionCookie(response);
      return response;
    }

    if (action === 'delete') {
      if (body.confirm !== 'DELETE') return NextResponse.json({ error: 'Type DELETE to confirm account deletion' }, { status: 400 });
      const auth = await authenticateRequest(request);
      if (!auth) {
        const response = NextResponse.json({ success: true, alreadyDeleted: true });
        clearSessionCookie(response);
        return response;
      }
      const deletionLimit = await consumeRateLimits([
        { key: `account-delete:user:${auth.user.id}`, limit: 5, windowSeconds: 60 * 60 },
        { key: `account-delete:client:${requestClientIdentifier(request)}`, limit: 10, windowSeconds: 60 * 60 },
      ]);
      if (!deletionLimit.allowed) return rateLimitResponse('Too many deletion attempts. Try again later.', deletionLimit.retryAfter);
      const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
      if (!currentPassword || !(await bcrypt.compare(currentPassword, auth.user.passwordHash))) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
      const result = await deleteUserAccount(auth.user, auth.user.id);
      const response = NextResponse.json({ success: true, deletion: result });
      clearSessionCookie(response);
      return response;
    }

    if (action === 'updateProfile') {
      const auth = await authenticateRequest(request);
      if (!auth) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      const newUsername = normalizedUsername(body.newUsername);
      const newEmail = normalizedEmail(body.newEmail);
      if (!newUsername || !newEmail) return NextResponse.json({ error: 'Valid username and email are required' }, { status: 400 });
      const identityChanged = newUsername !== auth.user.username || newEmail !== auth.user.email;
      if (identityChanged) {
        const identityLimit = await consumeRateLimits([
          { key: `identity-change:user:${auth.user.id}`, limit: 5, windowSeconds: 60 * 60 },
          { key: `identity-change:client:${requestClientIdentifier(request)}`, limit: 10, windowSeconds: 60 * 60 },
        ]);
        if (!identityLimit.allowed) return rateLimitResponse('Too many identity update attempts. Try again later.', identityLimit.retryAfter);
        const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
        if (!currentPassword || !(await bcrypt.compare(currentPassword, auth.user.passwordHash))) {
          return NextResponse.json({ error: 'Current password is required to change username or email' }, { status: 400 });
        }
      }
      const instagram = sanitizeOptionalUrl(body.instagram);
      const vwVortex = sanitizeOptionalUrl(body.vwVortex);
      let conflict: 'email' | 'username' | null = null;
      let updatedUser: User | undefined;
      await mutateUsers((users) => {
        if (users.some((user) => user.id !== auth.user.id && user.email.toLowerCase() === newEmail)) conflict = 'email';
        else if (users.some((user) => user.id !== auth.user.id && user.username.toLowerCase() === newUsername.toLowerCase())) conflict = 'username';
        if (conflict) return users;
        return users.map((user) => {
          if (user.id !== auth.user.id) return user;
          updatedUser = {
            ...user, username: newUsername, email: newEmail,
            profileLinks: { ...(instagram ? { instagram } : {}), ...(vwVortex ? { vwVortex } : {}) },
          };
          return updatedUser;
        });
      });
      if (conflict) return NextResponse.json({ error: conflict === 'email' ? 'Email already in use' : 'Username already taken' }, { status: 400 });
      if (!updatedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      const response = NextResponse.json({ success: true, user: userResponse(updatedUser) });
      setSessionCookie(response, updatedUser);
      return response;
    }

    if (action === 'changePassword') {
      const auth = await authenticateRequest(request);
      if (!auth) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
      const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
      if (!(await bcrypt.compare(currentPassword, auth.user.passwordHash))) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      const validationError = passwordError(newPassword);
      if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
      const passwordHash = await bcrypt.hash(newPassword, 12);
      await mutateUsers((users) => users.map((user) => {
        if (user.id !== auth.user.id) return user;
        const updated = { ...user, passwordHash };
        incrementSessionVersion(updated);
        return updated;
      }));
      const response = NextResponse.json({ success: true, sessionInvalidated: true });
      clearSessionCookie(response);
      return response;
    }

    if (action === 'resetRequest') {
      const email = normalizedEmail(body.email);
      if (!email) return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
      const rateLimit = await consumeRateLimits([
        { key: `reset:account:${rateLimitIdentifier(email)}`, limit: 3, windowSeconds: 60 * 60 },
        { key: `reset:client:${requestClientIdentifier(request)}`, limit: 10, windowSeconds: 60 * 60 },
      ]);
      if (!rateLimit.allowed) return rateLimitResponse('Too many reset requests. Try again later.', rateLimit.retryAfter);
      const user = (await getUsers()).find((item) => item.email.toLowerCase() === email);
      if (user) {
        const token = createPasswordResetToken();
        await storePasswordResetToken(email, token);
        await sendPasswordResetEmail(email, token, body.locale === 'es-MX' ? 'es-MX' : 'en');
      }
      return NextResponse.json({ success: true, message: 'If that email exists, a reset link has been sent' });
    }

    if (action === 'resetConfirm') {
      const token = typeof body.token === 'string' ? body.token : '';
      const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
      const validationError = passwordError(newPassword);
      if (!token || validationError) return NextResponse.json({ error: validationError || 'Token and new password required' }, { status: 400 });
      const email = await consumePasswordResetToken(token);
      if (!email) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
      const passwordHash = await bcrypt.hash(newPassword, 12);
      let found = false;
      await mutateUsers((users) => users.map((user) => {
        if (user.email.toLowerCase() !== email.toLowerCase()) return user;
        found = true;
        const updated = { ...user, passwordHash };
        incrementSessionVersion(updated);
        return updated;
      }));
      if (!found) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
      return NextResponse.json({ success: true, message: 'Password reset successful' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ authenticated: false });
    return NextResponse.json({ authenticated: true, user: userResponse(auth.user) });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    return NextResponse.json({ authenticated: false });
  }
}
