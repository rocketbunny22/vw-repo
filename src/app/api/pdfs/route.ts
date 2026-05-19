import { NextRequest, NextResponse } from 'next/server';
import { PdfDocument } from '@/types';
import crypto from 'crypto';
import { getAllPdfs, saveAllPdfs, savePdfFile } from '@/data/pdfs';
import { extractPdfText } from '@/lib/pdfText';

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');


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
  const pdfs = await getAllPdfs();
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
    const generations = formData.getAll('generation') as string[];
    const model = formData.get('model') as string | null;
    const models = formData.getAll('models') as string[];
    const system = formData.get('system') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file || generations.length === 0 || !system || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extraction = await extractPdfText(buffer);
    const searchText = 'text' in extraction ? extraction.text : '';

    const pdfs = await getAllPdfs();
    const created: PdfDocument[] = [];

    for (const generation of generations) {
      const id = `${generation}-${system}-${Date.now()}`;
      const filename = `${id}.pdf`;

      const pdfData: PdfDocument = {
        id,
        filename,
        originalName: file.name,
        generation,
        model: model || models[0] || undefined,
        models: models.length > 0 ? models : undefined,
        system,
        title,
        description: description || '',
        searchText: searchText || undefined,
        searchTextExtractedAt: searchText ? new Date().toISOString() : undefined,
        uploadedAt: new Date().toISOString(),
        fileSize: buffer.length,
        url: `/api/pdfs/${filename}`,
        uploadedBy: auth.user?.username,
        downloads: 0,
      };

      await savePdfFile(filename, buffer);
      pdfs.push(pdfData);
      created.push(pdfData);
    }

    await saveAllPdfs(pdfs);

    return NextResponse.json({ success: true, pdfs: created });
  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 });
  }
}
