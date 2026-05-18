import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';
import { getAllPdfs, saveAllPdfs, deletePdfFile } from '@/data/pdfs';
import { backfillPdfSearchText } from '@/lib/pdfBackfill';
import { PdfDocument, User } from '@/types';

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

async function getUsers(): Promise<User[]> {
  if (!redis) return [];
  const users = await redis.get<User[]>('users');
  return users || [];
}

async function saveUsers(users: User[]): Promise<void> {
  if (!redis) return;
  await redis.set('users', users);
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

function checkAuth(request: NextRequest) {
  const authCookie = request.cookies.get('vw_auth');
  if (!authCookie) return { authenticated: false };
  try {
    const sessionVerify = verifySessionToken(authCookie.value);
    if (!sessionVerify.valid || !sessionVerify.user) {
      return { authenticated: false };
    }
    return { 
      authenticated: true, 
      id: sessionVerify.user.id, 
      username: sessionVerify.user.username, 
      role: sessionVerify.user.role || 'user' 
    };
  } catch {
    return { authenticated: false };
  }
}

export async function GET(request: NextRequest) {
  const auth = checkAuth(request);
  
  if (!auth.authenticated || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const users = await getUsers();
  const pdfs = await getAllPdfs();

  const usersWithoutPassword = users.map((u) => ({
    id: u.id,
    email: u.email,
    username: u.username,
    role: u.role,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
  }));

  return NextResponse.json({ users: usersWithoutPassword, pdfs });
}

export async function POST(request: NextRequest) {
  const auth = checkAuth(request);
  
  if (!auth.authenticated || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json() as {
      action?: string;
      userId?: string;
      pdfId?: string;
      role?: User['role'];
      title?: string;
      description?: string;
      generation?: string;
      system?: string;
      model?: string;
      force?: boolean;
    };
    const { action, userId, pdfId, role, force } = body;

    if (action === 'deleteUser') {
      const users = await getUsers();
      const userIndex = users.findIndex((u) => u.id === userId);
      
      if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (users[userIndex].role === 'admin') {
        return NextResponse.json({ error: 'Cannot delete admin' }, { status: 400 });
      }

      users.splice(userIndex, 1);
      await saveUsers(users);
      return NextResponse.json({ success: true });
    }

    if (action === 'changeRole') {
      const users = await getUsers();
      const userIndex = users.findIndex((u) => u.id === userId);
      
      if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (!role) {
        return NextResponse.json({ error: 'Role is required' }, { status: 400 });
      }

      users[userIndex].role = role;
      await saveUsers(users);
      return NextResponse.json({ success: true });
    }

    if (action === 'deletePdf') {
      const pdfs = await getAllPdfs();
      const pdfIndex = pdfs.findIndex((p: PdfDocument) => p.id === pdfId);
      
      if (pdfIndex === -1) {
        return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
      }

      const pdf = pdfs[pdfIndex];
      
      await deletePdfFile(pdf.filename);

      pdfs.splice(pdfIndex, 1);
      await saveAllPdfs(pdfs);
      return NextResponse.json({ success: true });
    }

    if (action === 'updatePdf') {
      const pdfs = await getAllPdfs();
      const pdfIndex = pdfs.findIndex((p: PdfDocument) => p.id === pdfId);
      
      if (pdfIndex === -1) {
        return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
      }

      const { title, description, generation, system, model } = body;

      if (title !== undefined) pdfs[pdfIndex].title = title;
      if (description !== undefined) pdfs[pdfIndex].description = description;
      if (generation !== undefined) pdfs[pdfIndex].generation = generation;
      if (system !== undefined) pdfs[pdfIndex].system = system;
      if (model !== undefined) pdfs[pdfIndex].model = model;

      await saveAllPdfs(pdfs);
      return NextResponse.json({ success: true, pdf: pdfs[pdfIndex] });
    }

    if (action === 'testEmail') {
      console.log('RESEND_API_KEY configured:', !!resend);
      console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
      console.log('RESEND_API_KEY:', RESEND_API_KEY ? RESEND_API_KEY.substring(0, 10) + '...' : 'not set');

      if (!resend) {
        return NextResponse.json({ error: 'Resend not configured. Please set RESEND_API_KEY env var.' }, { status: 400 });
      }

      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        return NextResponse.json({ error: 'ADMIN_EMAIL not set. Please set ADMIN_EMAIL env var.' }, { status: 400 });
      }

      try {
        const result = await resend.emails.send({
          from: 'VW Repo <vwrepo@groundedcyber.com>',
          to: adminEmail,
          subject: 'Test Email - VW Repo',
          html: '<h1>Test</h1><p>If you see this, Resend is working.</p>',
        });
        console.log('Resend result:', result);
        return NextResponse.json({ success: true, result });
      } catch (err) {
        console.error('Resend error:', err);
        return NextResponse.json({ error: 'Failed to send email', details: String(err) }, { status: 500 });
      }
    }

    if (action === 'backfillPdfText') {
      const result = await backfillPdfSearchText({ force: Boolean(force) });
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
