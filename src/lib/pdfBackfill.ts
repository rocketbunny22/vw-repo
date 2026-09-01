import { getAllPdfs, getPdfFile, mutatePdfs } from '@/data/pdfs';
import { PdfDocument } from '@/types';
import { extractPdfText } from './pdfText';
import { mergePdfSearchTextPatches, type PdfSearchTextPatch } from './pdfSearchMerge';

export { mergePdfSearchTextPatches } from './pdfSearchMerge';

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

  const patches = new Map<string, PdfSearchTextPatch>();

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

      const extraction = await extractPdfText(buffer);

      if ('error' in extraction) {
        result.skipped += 1;
        result.failures.push({
          id: pdf.id,
          title: pdf.title,
          reason: extraction.error,
        });
        continue;
      }

      patches.set(pdf.id, {
        searchText: extraction.text,
        searchTextExtractedAt: new Date().toISOString(),
      });
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

  if (patches.size > 0) await applyPdfSearchTextPatches(patches);

  return result;
}

export async function ensurePdfSearchText(pdfs: PdfDocument[]): Promise<PdfDocument[]> {
  const missingText = pdfs.filter((pdf) => shouldBackfillPdf(pdf));
  if (missingText.length === 0) return pdfs;

  const patches = new Map<string, PdfSearchTextPatch>();

  for (const pdf of missingText) {
    const buffer = await getPdfFile(pdf.filename);
    if (!buffer) continue;

    const extraction = await extractPdfText(buffer);
    if ('error' in extraction) continue;

    patches.set(pdf.id, {
      searchText: extraction.text,
      searchTextExtractedAt: new Date().toISOString(),
    });
  }

  if (patches.size > 0) await applyPdfSearchTextPatches(patches);

  return mergePdfSearchTextPatches(pdfs, patches);
}

async function applyPdfSearchTextPatches(
  patches: ReadonlyMap<string, PdfSearchTextPatch>,
): Promise<void> {
  await mutatePdfs((currentPdfs) => mergePdfSearchTextPatches(currentPdfs, patches));
}

function shouldBackfillPdf(pdf: PdfDocument, force = false): boolean {
  return Boolean(pdf.filename && (force || !pdf.searchText));
}
