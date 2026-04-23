import { NextRequest, NextResponse } from 'next/server';
import { PdfDocument } from '@/types';
import { existsSync, mkdirSync } from 'fs';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const pdfsDbFile = path.resolve(process.cwd(), 'pdfs.json');
const PDFs_DIR = path.resolve(process.cwd(), 'public', 'pdfs');
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

async function getPdfsDb(): Promise<PdfDocument[]> {
  try {
    const data = await readFile(pdfsDbFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function savePdfsDb(pdfs: PdfDocument[]): Promise<void> {
  await writeFile(pdfsDbFile, JSON.stringify(pdfs, null, 2));
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

function checkAuth(request: NextRequest): { authenticated: boolean; user?: { id: string; username: string } } {
  const authCookie = request.cookies.get('vw_auth');
  
  if (!authCookie) {
    return { authenticated: false };
  }

  const session = verifySessionToken(authCookie.value);
  if (!session.valid || !session.user) {
    return { authenticated: false };
  }
  
  return { authenticated: true, user: session.user };
}

export async function GET() {
  const pdfs = await getPdfsDb();
  return NextResponse.json({ pdfs });
}

export async function POST(request: NextRequest) {
  const auth = checkAuth(request);
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const generation = formData.get('generation') as string;
    const system = formData.get('system') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file || !generation || !system || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    if (!existsSync(PDFs_DIR)) {
      mkdirSync(PDFs_DIR, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const id = `${generation}-${system}-${Date.now()}`;
    const filename = `${id}.pdf`;
    const filepath = path.join(PDFs_DIR, filename);

    await writeFile(filepath, buffer);

    const pdfData: PdfDocument = {
      id,
      filename,
      originalName: file.name,
      generation,
      system,
      title,
      description: description || '',
      uploadedAt: new Date().toISOString(),
      fileSize: buffer.length,
      url: `/pdfs/${filename}`,
      uploadedBy: auth.user?.username,
    };

    const pdfs = await getPdfsDb();
    pdfs.push(pdfData);
    await savePdfsDb(pdfs);

    return NextResponse.json({ success: true, pdf: pdfData });
  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 });
  }
}