import { NextRequest, NextResponse } from 'next/server';
import { getAllPdfs, getPdfFile, saveAllPdfs } from '@/data/pdfs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');
    
    if (!filename || !filename.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
    }

    const pdfs = await getAllPdfs();
    const pdf = pdfs.find((p) => p.filename === filename);

    if (pdf?.approved === false) {
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    const fileBuffer = await getPdfFile(filename);

    if (!fileBuffer) {
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    if (view !== 'true') {
      try {
        if (pdf) {
          pdf.downloads = (pdf.downloads || 0) + 1;
          await saveAllPdfs(pdfs);
        }
      } catch (err) {
        console.error('Failed to track download:', err);
      }
    }

    const disposition = view === 'true' ? 'inline' : 'attachment';

    const body = Uint8Array.from(fileBuffer).buffer;

    return new NextResponse(body, {
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
