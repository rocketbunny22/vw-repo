import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getAllPdfs, saveAllPdfs } from '@/data/pdfs';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export async function GET(request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');
    
    if (!filename || !filename.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
    }

    if (!redis) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
    }

    const pdfData = await redis.get<string>(`pdf:${filename}`);

    if (!pdfData) {
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    if (view !== 'true') {
      try {
        const pdfs = await getAllPdfs();
        const pdf = pdfs.find((p) => p.filename === filename);
        if (pdf) {
          pdf.downloads = (pdf.downloads || 0) + 1;
          await saveAllPdfs(pdfs);
        }
      } catch (err) {
        console.error('Failed to track download:', err);
      }
    }

    const fileBuffer = Buffer.from(pdfData, 'base64');
    const disposition = view === 'true' ? 'inline' : 'attachment';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('PDF not found:', error);
    return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
  }
}