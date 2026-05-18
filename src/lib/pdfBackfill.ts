import { getAllPdfs, getPdfFile, saveAllPdfs } from '@/data/pdfs';
import { PdfDocument } from '@/types';
import { extractPdfText } from './pdfText';

export interface PdfSearchTextBackfillResult {
  total: number;
  candidates: number;
  processed: number;
  updated: number;
  skipped: number;
  failed: number;
  failures: Array<{
    id: string;
    title: string;
    reason: string;
  }>;
}

export async function backfillPdfSearchText(options: { force?: boolean } = {}): Promise<PdfSearchTextBackfillResult> {
  const pdfs = await getAllPdfs();
  const candidates = pdfs.filter((pdf) => shouldBackfillPdf(pdf, options.force));
  const result: PdfSearchTextBackfillResult = {
    total: pdfs.length,
    candidates: candidates.length,
    processed: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    failures: [],
  };

  let changed = false;

  for (const pdf of candidates) {
    result.processed += 1;

    try {
      const buffer = await getPdfFile(pdf.filename);

      if (!buffer) {
        result.skipped += 1;
        result.failures.push({
          id: pdf.id,
          title: pdf.title,
          reason: 'Stored PDF file was not found',
        });
        continue;
      }

      const searchText = await extractPdfText(buffer);

      if (!searchText) {
        result.skipped += 1;
        result.failures.push({
          id: pdf.id,
          title: pdf.title,
          reason: 'No searchable text could be extracted',
        });
        continue;
      }

      pdf.searchText = searchText;
      pdf.searchTextExtractedAt = new Date().toISOString();
      changed = true;
      result.updated += 1;
    } catch (error) {
      result.failed += 1;
      result.failures.push({
        id: pdf.id,
        title: pdf.title,
        reason: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (changed) {
    await saveAllPdfs(pdfs);
  }

  return result;
}

export async function ensurePdfSearchText(pdfs: PdfDocument[]): Promise<PdfDocument[]> {
  const missingText = pdfs.filter((pdf) => shouldBackfillPdf(pdf));
  if (missingText.length === 0) return pdfs;

  let changed = false;

  for (const pdf of missingText) {
    const buffer = await getPdfFile(pdf.filename);
    if (!buffer) continue;

    const searchText = await extractPdfText(buffer);
    if (!searchText) continue;

    pdf.searchText = searchText;
    pdf.searchTextExtractedAt = new Date().toISOString();
    changed = true;
  }

  if (changed) {
    await saveAllPdfs(pdfs);
  }

  return pdfs;
}

function shouldBackfillPdf(pdf: PdfDocument, force = false): boolean {
  return Boolean(pdf.filename && (force || !pdf.searchText));
}
