import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    
    if (!filename || !filename.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
    }

    const pdfDir = path.resolve(process.cwd(), 'public', 'pdfs');
    const filePath = path.join(pdfDir, filename);

    const fileBuffer = await readFile(filePath);

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