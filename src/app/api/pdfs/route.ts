import { NextRequest, NextResponse } from 'next/server';
import { PdfDocument } from '@/types';
import { getAllPdfs, saveAllPdfs, savePdfFile } from '@/data/pdfs';
import { extractPdfText } from '@/lib/pdfText';
import { toPublicPdfSummary } from '@/lib/publicSummaries';
import { authenticateRequest } from '@/lib/auth';

export async function GET() {
  const pdfs = await getAllPdfs();
  return NextResponse.json({
    pdfs: pdfs
      .filter((pdf) => pdf.approved !== false)
      .map(toPublicPdfSummary),
  });
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  
  if (!auth) {
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
        uploadedBy: auth.user.username,
        downloads: 0,
        approved: auth.user.role === 'admin',
        reviewedAt: auth.user.role === 'admin' ? new Date().toISOString() : undefined,
        reviewedBy: auth.user.role === 'admin' ? auth.user.username : undefined,
      };

      await savePdfFile(filename, buffer);
      pdfs.push(pdfData);
      created.push(pdfData);
    }

    await saveAllPdfs(pdfs);

    return NextResponse.json({ success: true, pdfs: created.map(toPublicPdfSummary) });
  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 });
  }
}
