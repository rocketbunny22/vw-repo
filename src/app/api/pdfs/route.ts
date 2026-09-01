import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PdfDocument } from '@/types';
import { deletePdfFile, getAllPdfs, mutatePdfs, savePdfFile } from '@/data/pdfs';
import { extractPdfText } from '@/lib/pdfText';
import { toPublicPdfSummary } from '@/lib/publicSummaries';
import { authenticateRequest } from '@/lib/auth';
import { consumeRateLimit, isRedisUnavailableError, redisUnavailableResponse } from '@/lib/redis';
import { boundedString, hasPdfMagicBytes, INPUT_LIMITS, isValidGeneration, isValidSystem, requestClientIdentifier } from '@/lib/validation';
import { generations as generationsData } from '@/data/generations';

const MAX_PDF_BYTES = 10 * 1024 * 1024;

export async function GET() {
  try {
    const pdfs = await getAllPdfs();
    return NextResponse.json({
      pdfs: pdfs
        .filter((pdf) => pdf.approved !== false)
        .map(toPublicPdfSummary),
    });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('PDF load error:', error);
    return NextResponse.json({ error: 'Failed to load PDFs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const rateLimit = await consumeRateLimit(
      `pdf-upload:${auth.user.id}:${requestClientIdentifier(request)}`,
      8,
      60 * 60,
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many uploads. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
      );
    }

    const declaredLength = Number(request.headers.get('content-length') || 0);
    if (declaredLength > MAX_PDF_BYTES + 1024 * 1024) {
      return NextResponse.json({ error: 'Request body is too large' }, { status: 413 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const generationValues = formData.getAll('generation');
    const generations = [...new Set(generationValues.filter((value): value is string => typeof value === 'string'))];
    const model = formData.get('model') as string | null;
    const modelValues = formData.getAll('models');
    const models = [...new Set(modelValues.filter((value): value is string => typeof value === 'string'))];
    const system = boundedString(formData.get('system'), INPUT_LIMITS.name);
    const title = boundedString(formData.get('title'), INPUT_LIMITS.title);
    const description = boundedString(formData.get('description'), INPUT_LIMITS.description, false);

    if (
      !(file instanceof File)
      || generationValues.some((value) => typeof value !== 'string')
      || modelValues.some((value) => typeof value !== 'string')
      || generations.length === 0 || generations.length > 12 || !system || !title || description === null
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!generations.every(isValidGeneration) || !isValidSystem(system)) {
      return NextResponse.json({ error: 'Invalid generation or system' }, { status: 400 });
    }

    const selectedModels = models.map((value) => value.trim()).filter(Boolean);
    const allowedModels = new Set(
      generations.flatMap((generationId) => generationsData.find((item) => item.id === generationId)?.models || []),
    );
    const selectedModel = typeof model === 'string' && model.trim() ? model.trim() : undefined;
    if (
      selectedModels.length > INPUT_LIMITS.arrayItems
      || selectedModels.some((value) => !allowedModels.has(value))
      || (selectedModel && !allowedModels.has(selectedModel))
    ) {
      return NextResponse.json({ error: 'Invalid vehicle model selection' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_PDF_BYTES) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    if (!hasPdfMagicBytes(buffer)) {
      return NextResponse.json({ error: 'The uploaded file is not a valid PDF' }, { status: 400 });
    }

    const extraction = await extractPdfText(buffer);
    const searchText = 'text' in extraction ? extraction.text : '';
    const filename = `${crypto.randomUUID()}.pdf`;
    const now = new Date().toISOString();
    const created: PdfDocument[] = generations.map((generation) => ({
        id: crypto.randomUUID(),
        filename,
        originalName: file.name.slice(0, 255),
        generation,
        model: selectedModel || selectedModels[0],
        models: selectedModels.length > 0 ? selectedModels : undefined,
        system,
        title,
        description,
        searchText: searchText || undefined,
        searchTextExtractedAt: searchText ? now : undefined,
        uploadedAt: now,
        fileSize: buffer.length,
        url: `/api/pdfs/${filename}`,
        uploadedBy: auth.user.username,
        uploadedById: auth.user.id,
        downloads: 0,
        approved: auth.user.role === 'admin',
        reviewedAt: auth.user.role === 'admin' ? now : undefined,
        reviewedBy: auth.user.role === 'admin' ? auth.user.username : undefined,
      }));

    let metadataCommitted = false;
    await savePdfFile(filename, buffer);
    try {
      const createdIds = new Set(created.map((pdf) => pdf.id));
      await mutatePdfs((pdfs) => [
        ...pdfs.filter((pdf) => !createdIds.has(pdf.id)),
        ...created,
      ]);
      metadataCommitted = true;
    } finally {
      if (!metadataCommitted) await deletePdfFile(filename);
    }

    return NextResponse.json({ success: true, pdfs: created.map(toPublicPdfSummary) });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('PDF upload error:', error);
    return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 });
  }
}
