import { NextRequest, NextResponse } from 'next/server';
import { getAllPdfs, getPdfFile, getPublicPdfFile, incrementPdfDownloads } from '@/data/pdfs';
import { consumeRateLimit, isRedisUnavailableError, redisUnavailableResponse } from '@/lib/redis';
import { requestClientIdentifier } from '@/lib/validation';
import { findApprovedPdfMetadata, isSafePdfFilename } from '@/lib/pdfAccess';

export async function GET(request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const rateLimit = await consumeRateLimit(
      `pdf-download:client:${requestClientIdentifier(request)}`,
      120,
      60 * 60,
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many PDF requests' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
      );
    }

    const { filename } = await params;
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');
    
    if (!filename || !isSafePdfFilename(filename)) {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
    }

    const pdfs = await getAllPdfs();
    const pdf = findApprovedPdfMetadata(pdfs, filename);

    if (!pdf) {
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    const fileBuffer = await getPdfFile(filename);

    if (!fileBuffer) {
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    if (view !== 'true') {
      try {
        await incrementPdfDownloads(pdf.id);
      } catch (err) {
        console.error('Failed to track download:', err);
      }
    }

    const disposition = view === 'true' ? 'inline' : 'attachment';
    const downloadName = filename.replaceAll('"', '');

    const body = Uint8Array.from(fileBuffer).buffer;

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="${downloadName}"`,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    if (isRedisUnavailableError(error)) {
      const { filename } = await params;
      const legacyFile = await getPublicPdfFile(filename);
      if (!legacyFile) return redisUnavailableResponse();

      const body = Uint8Array.from(legacyFile).buffer;
      return new NextResponse(body, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${filename.replaceAll('"', '')}"`,
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }
    console.error('PDF not found:', error);
    return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
  }
}
