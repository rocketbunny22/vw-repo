import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { Redis } from '@upstash/redis';
import { getUsers, saveUsers } from '@/data/users';
import {
  authenticateRequest,
  clearSessionCookie,
  createPasswordResetToken,
  incrementSessionVersion,
  setSessionCookie,
  verifyPasswordResetToken,
} from '@/lib/auth';
import type { User } from '@/types';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const redis = process.env.UPSTASH_REDIS_REST_URL 
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;

async function sendPasswordResetEmail(email: string, resetToken: string, locale: 'en' | 'es-MX' = 'en') {
  if (!resend) {
    console.log(`PASSWORD RESET TOKEN for ${email}: ${resetToken}`);
    return;
  }

  const resetPath = locale === 'es-MX' ? '/es-mx/restablecer-contrasena' : '/reset-password';
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${resetPath}?token=${resetToken}`;
  const spanish = locale === 'es-MX';
  
  try {
    await resend.emails.send({
      from: 'VW Repo <vwrepo@groundedcyber.com>',
      to: email,
      subject: spanish ? 'Restablece tu contraseña de VW Repo' : 'Reset your VW Repo password',
      html: `
        <h1>${spanish ? 'Restablece tu contraseña' : 'Reset your password'}</h1>
        <p>${spanish ? 'Usa el siguiente botón para restablecer tu contraseña:' : 'Click the button below to reset your password:'}</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 4px;">
          ${spanish ? 'Restablecer contraseña' : 'Reset Password'}
        </a>
        <p>${spanish ? 'También puedes copiar este enlace:' : 'Or copy this link:'} ${resetUrl}</p>
        <p>${spanish ? 'Este enlace vence en 15 minutos.' : 'This link expires in 15 minutes.'}</p>
      `,
    });
    console.log(`Password reset email sent to ${email}`);
  } catch (err) {
    console.error('Resend error:', err);
  }
}

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const inMemoryRateLimit = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000;

function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = inMemoryRateLimit.get(key);
  
  if (!entry || now > (entry.lockedUntil || 0)) {
    inMemoryRateLimit.set(key, { attempts: 1, firstAttempt: now });
    return { allowed: true };
  }
  
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return { allowed: false, retryAfter: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  
  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW) {
    inMemoryRateLimit.set(key, { attempts: 1, firstAttempt: now });
    return { allowed: true };
  }
  
  entry.attempts++;
  
  if (entry.attempts > MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION;
    return { allowed: false, retryAfter: LOCKOUT_DURATION / 1000 };
  }
  
  return { allowed: true };
}

function clearRateLimit(key: string): void {
  inMemoryRateLimit.delete(key);
}

async function getResetTokens(): Promise<{ email: string; token: string; used: boolean }[]> {
  if (!redis) return [];
  const tokens = await redis.get<{ email: string; token: string; used: boolean }[]>('reset_tokens');
  return tokens || [];
}

async function saveResetTokens(tokens: { email: string; token: string; used: boolean }[]): Promise<void> {
  if (!redis) return;
  await redis.set('reset_tokens', tokens);
}

function sanitizeOptionalUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
    return url.toString();
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, username, password } = body;

    if (action === 'signup') {
      const rateLimit = checkRateLimit(`signup:${email}`);
      if (!rateLimit.allowed) {
        return NextResponse.json({ error: 'Too many signup attempts. Try again later.', retryAfter: rateLimit.retryAfter }, { status: 429 });
      }

      if (!email || !username || !password) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const users = await getUsers();
      
      if (users.find(u => u.email === email)) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }
      
      if (users.find(u => u.username === username)) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        username,
        passwordHash,
        role: 'user',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        sessionVersion: 0,
        onboarding: {
          hasSeenWelcome: false,
        },
      };

      users.push(newUser);
      await saveUsers(users);
      clearRateLimit(`signup:${email}`);

      const response = NextResponse.json({ 
        success: true, 
        user: userResponse(newUser)
      });

      setSessionCookie(response, newUser);

      return response;
    }

    if (action === 'login') {
      const rateLimit = checkRateLimit(`login:${email}`);
      if (!rateLimit.allowed) {
        return NextResponse.json({ error: 'Too many login attempts. Try again later.', retryAfter: rateLimit.retryAfter }, { status: 429 });
      }

      if (!email || !password) {
        return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
      }

      const users = await getUsers();
      const user = users.find(u => u.email === email);
      
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      user.lastLogin = new Date().toISOString();
      await saveUsers(users);
      clearRateLimit(`login:${email}`);

      const response = NextResponse.json({ 
        success: true, 
        user: userResponse(user)
      });

      setSessionCookie(response, user);

      return response;
    }

    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      clearSessionCookie(response);
      return response;
    }

    if (action === 'delete') {
      const auth = await authenticateRequest(request);
      if (!auth) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      }

      auth.users.splice(auth.userIndex, 1);
      await saveUsers(auth.users);

      const response = NextResponse.json({ success: true });
      clearSessionCookie(response);
      return response;
    }

    if (action === 'updateProfile') {
      const auth = await authenticateRequest(request);
      if (!auth) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      }

      const { users, userIndex } = auth;

      const { newUsername, newEmail } = body;

      if (newUsername && newUsername !== users[userIndex].username) {
        if (users.find(u => u.username === newUsername && u.id !== auth.user.id)) {
          return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }
        users[userIndex].username = newUsername;
      }

      if (newEmail && newEmail !== users[userIndex].email) {
        if (users.find(u => u.email === newEmail && u.id !== auth.user.id)) {
          return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
        }
        users[userIndex].email = newEmail;
      }

      const instagram = sanitizeOptionalUrl(body.instagram);
      const vwVortex = sanitizeOptionalUrl(body.vwVortex);

      users[userIndex].profileLinks = {
        ...(instagram ? { instagram } : {}),
        ...(vwVortex ? { vwVortex } : {}),
      };

      await saveUsers(users);

      const response = NextResponse.json({ 
        success: true, 
        user: userResponse(users[userIndex])
      });

      setSessionCookie(response, users[userIndex]);

      return response;
    }

    if (action === 'changePassword') {
      const auth = await authenticateRequest(request);
      if (!auth) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      }

      const { users, userIndex } = auth;

      const { currentPassword, newPassword } = body;

      if (!(await bcrypt.compare(currentPassword, users[userIndex].passwordHash))) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
      }

      users[userIndex].passwordHash = await bcrypt.hash(newPassword, 12);
      incrementSessionVersion(users[userIndex]);
      await saveUsers(users);

      const response = NextResponse.json({ success: true, sessionInvalidated: true });
      clearSessionCookie(response);
      return response;
    }

    if (action === 'resetRequest') {
      const rateLimit = checkRateLimit(`reset:${email}`);
      if (!rateLimit.allowed) {
        return NextResponse.json({ error: 'Too many reset requests. Try again later.', retryAfter: rateLimit.retryAfter }, { status: 429 });
      }

      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      const users = await getUsers();
      const user = users.find(u => u.email === email);

      if (user) {
        const token = createPasswordResetToken(email);
        const tokens = await getResetTokens();
        tokens.push({ email, token, used: false });
        await saveResetTokens(tokens);
        await sendPasswordResetEmail(email, token, body.locale === 'es-MX' ? 'es-MX' : 'en');
      }

      clearRateLimit(`reset:${email}`);
      return NextResponse.json({ success: true, message: 'If that email exists, a reset link has been sent' });
    }

    if (action === 'resetConfirm') {
      const { token, newPassword } = body;

      if (!token || !newPassword) {
        return NextResponse.json({ error: 'Token and new password required' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }

      const tokenVerify = verifyPasswordResetToken(token);
      if (!tokenVerify.valid || !tokenVerify.email) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
      }

      const tokens = await getResetTokens();
      const storedToken = tokens.find(t => t.token === token && !t.used);
      if (!storedToken) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
      }

      storedToken.used = true;
      await saveResetTokens(tokens);

      const users = await getUsers();
      const userIndex = users.findIndex(u => u.email === tokenVerify.email);
      if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      users[userIndex].passwordHash = await bcrypt.hash(newPassword, 12);
      incrementSessionVersion(users[userIndex]);
      await saveUsers(users);

      return NextResponse.json({ success: true, message: 'Password reset successful' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ authenticated: false });

    return NextResponse.json({ authenticated: true, user: userResponse(auth.user) });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
