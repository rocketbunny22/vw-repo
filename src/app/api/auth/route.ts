import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { Redis } from '@upstash/redis';

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET || crypto.randomBytes(32).toString('hex');
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const redis = process.env.UPSTASH_REDIS_REST_URL 
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;

async function sendPasswordResetEmail(email: string, resetToken: string) {
  if (!resend) {
    console.log(`PASSWORD RESET TOKEN for ${email}: ${resetToken}`);
    return;
  }

  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  await resend.emails.send({
    from: 'VW Registry <noreply@yourdomain.com>',
    to: email,
    subject: 'Reset your VW Registry password',
    html: `
      <h1>Reset your password</h1>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 4px;">
        Reset Password
      </a>
      <p>Or copy this link: ${resetUrl}</p>
      <p>This link expires in 15 minutes.</p>
    `,
  });
  
  console.log(`Password reset email sent to ${email}`);
}

interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin: string;
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

function createPasswordResetToken(email: string): string {
  const payload = { email, exp: Date.now() + 15 * 60 * 1000 };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const sig = crypto.createHmac('sha256', RESET_TOKEN_SECRET).update(data).digest('hex');
  return data + '.' + sig;
}

function verifyPasswordResetToken(token: string): { valid: boolean; email?: string } {
  try {
    const [payload, sig] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', RESET_TOKEN_SECRET).update(payload).digest('hex');
    if (sig !== expectedSig) return { valid: false };
    const data = JSON.parse(Buffer.from(payload, 'base64').toString());
    if (data.exp < Date.now()) return { valid: false };
    return { valid: true, email: data.email };
  } catch {
    return { valid: false };
  }
}

async function getUsers(): Promise<User[]> {
  if (!redis) return [];
  const users = await redis.get<User[]>('users');
  return users || [];
}

async function saveUsers(users: User[]): Promise<void> {
  if (!redis) return;
  await redis.set('users', users);
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

function createSessionToken(user: User): string {
  const payload = { id: user.id, username: user.username, role: user.role, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
  const encrypted = crypto.createHmac('sha256', SESSION_SECRET).update(JSON.stringify(payload)).digest('hex');
  return Buffer.from(JSON.stringify(payload)).toString('base64') + '.' + encrypted;
}

function verifySessionToken(token: string): { valid: boolean; user?: { id: string; username: string; role: string } } {
  try {
    const [payload, signature] = token.split('.');
    const data = JSON.parse(Buffer.from(payload, 'base64').toString());
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(JSON.stringify(data)).digest('hex');
    if (signature !== expectedSig) return { valid: false };
    if (data.exp < Date.now()) return { valid: false };
    return { valid: true, user: { id: data.id, username: data.username, role: data.role } };
  } catch {
    return { valid: false };
  }
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

      const adminCode = body.adminCode;
      const isFirstUser = users.length === 0;
      const role: 'user' | 'admin' = (adminCode === 'VWADMIN2024' || isFirstUser) ? 'admin' : 'user';

      const passwordHash = await bcrypt.hash(password, 12);

      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        username,
        passwordHash,
        role,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      users.push(newUser);
      await saveUsers(users);
      clearRateLimit(`signup:${email}`);

      const sessionToken = createSessionToken(newUser);
      const response = NextResponse.json({ 
        success: true, 
        user: { id: newUser.id, email: newUser.email, username: newUser.username, role: newUser.role }
      });

      response.cookies.set('vw_auth', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

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

      const sessionToken = createSessionToken(user);
      const response = NextResponse.json({ 
        success: true, 
        user: { id: user.id, email: user.email, username: user.username, role: user.role }
      });

      response.cookies.set('vw_auth', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      response.cookies.set('vw_auth', '', { maxAge: 0, path: '/' });
      return response;
    }

    if (action === 'delete') {
      const authCookie = request.cookies.get('vw_auth');
      if (!authCookie) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }

      const sessionVerify = verifySessionToken(authCookie.value);
      if (!sessionVerify.valid || !sessionVerify.user) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      }

      const users = await getUsers();
      const userIndex = users.findIndex(u => u.id === sessionVerify.user!.id);

      if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      users.splice(userIndex, 1);
      await saveUsers(users);

      const response = NextResponse.json({ success: true });
      response.cookies.set('vw_auth', '', { maxAge: 0, path: '/' });
      return response;
    }

    if (action === 'updateProfile') {
      const authCookie = request.cookies.get('vw_auth');
      if (!authCookie) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }

      const sessionVerify = verifySessionToken(authCookie.value);
      if (!sessionVerify.valid || !sessionVerify.user) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      }

      const users = await getUsers();
      const userIndex = users.findIndex(u => u.id === sessionVerify.user!.id);

      if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const { newUsername, newEmail } = body;

      if (newUsername && newUsername !== users[userIndex].username) {
        if (users.find(u => u.username === newUsername && u.id !== sessionVerify.user!.id)) {
          return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }
        users[userIndex].username = newUsername;
      }

      if (newEmail && newEmail !== users[userIndex].email) {
        if (users.find(u => u.email === newEmail && u.id !== sessionVerify.user!.id)) {
          return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
        }
        users[userIndex].email = newEmail;
      }

      await saveUsers(users);

      const newSessionToken = createSessionToken(users[userIndex]);
      const response = NextResponse.json({ 
        success: true, 
        user: { 
          id: users[userIndex].id, 
          email: users[userIndex].email, 
          username: users[userIndex].username, 
          role: users[userIndex].role 
        }
      });

      response.cookies.set('vw_auth', newSessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    if (action === 'changePassword') {
      const authCookie = request.cookies.get('vw_auth');
      if (!authCookie) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }

      const sessionVerify = verifySessionToken(authCookie.value);
      if (!sessionVerify.valid || !sessionVerify.user) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      }

      const users = await getUsers();
      const userIndex = users.findIndex(u => u.id === sessionVerify.user!.id);

      if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const { currentPassword, newPassword } = body;

      if (!(await bcrypt.compare(currentPassword, users[userIndex].passwordHash))) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
      }

      users[userIndex].passwordHash = await bcrypt.hash(newPassword, 12);
      await saveUsers(users);

      return NextResponse.json({ success: true });
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
        await sendPasswordResetEmail(email, token);
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
  const authCookie = request.cookies.get('vw_auth');
  
  if (!authCookie) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const sessionVerify = verifySessionToken(authCookie.value);
    if (!sessionVerify.valid || !sessionVerify.user) {
      return NextResponse.json({ authenticated: false });
    }
    return NextResponse.json({ authenticated: true, user: sessionVerify.user });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}