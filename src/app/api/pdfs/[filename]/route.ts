import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export async function GET(request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    
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

    const fileBuffer = Buffer.from(pdfData, 'base64');

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('PDF not found:', error);
    return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
  }
}