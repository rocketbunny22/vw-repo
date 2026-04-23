import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const usersDbFile = path.resolve(process.cwd(), 'users.json');
const pdfsDbFile = path.resolve(process.cwd(), 'pdfs.json');
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

async function getUsers() {
  try {
    const data = await readFile(usersDbFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveUsers(users: any[]) {
  await writeFile(usersDbFile, JSON.stringify(users, null, 2));
}

async function getPdfs() {
  try {
    const data = await readFile(pdfsDbFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function verifySessionToken(token: string): { valid: boolean; user?: { id: string; username: string; role: string } } {
  try {
    const [payload, signature] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    if (signature !== expectedSig) return { valid: false };
    const data = JSON.parse(Buffer.from(payload, 'base64').toString());
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
  const pdfs = await getPdfs();

  const usersWithoutPassword = users.map((u: any) => ({
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
    const body = await request.json();
    const { action, userId, pdfId, role } = body;

    if (action === 'deleteUser') {
      const users = await getUsers();
      const userIndex = users.findIndex((u: any) => u.id === userId);
      
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
      const userIndex = users.findIndex((u: any) => u.id === userId);
      
      if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      users[userIndex].role = role;
      await saveUsers(users);
      return NextResponse.json({ success: true });
    }

    if (action === 'deletePdf') {
      const pdfs = await getPdfs();
      const pdfIndex = pdfs.findIndex((p: any) => p.id === pdfId);
      
      if (pdfIndex === -1) {
        return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
      }

      const pdf = pdfs[pdfIndex];
      
      // Delete file
      const fs = await import('fs');
      const filepath = path.resolve(process.cwd(), 'public', 'pdfs', pdf.filename);
      try {
        fs.unlinkSync(filepath);
      } catch (e) {
        // File may not exist
      }

      pdfs.splice(pdfIndex, 1);
      const pdfsData = await import('fs/promises');
      await pdfsData.writeFile(pdfsDbFile, JSON.stringify(pdfs, null, 2));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}