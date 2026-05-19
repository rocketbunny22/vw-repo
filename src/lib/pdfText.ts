import path from 'path';
import { pathToFileURL } from 'url';

const MAX_INDEXED_TEXT_LENGTH = 200_000;
const PDF_WORKER_SRC = pathToFileURL(
  path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs')
).toString();
let pdfWorkerConfigured = false;

export type PdfTextExtractionResult =
  | { text: string }
  | { error: string };

export async function extractPdfText(buffer: Buffer): Promise<PdfTextExtractionResult> {
  let parser: { getText: () => Promise<{ text: string }>; destroy: () => Promise<void> } | null = null;

  try {
    await ensurePdfCanvasGlobals();
    const { PDFParse } = await import('pdf-parse');
    configurePdfWorker(PDFParse);
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = normalizePdfText(result.text).slice(0, MAX_INDEXED_TEXT_LENGTH);

    if (!text) {
      return { error: 'No searchable text could be extracted' };
    }

    return { text };
  } catch (error) {
    const message = formatExtractionError(error);
    console.error('PDF text extraction failed:', message);
    return { error: message };
  } finally {
    await parser?.destroy().catch(() => undefined);
  }
}

function configurePdfWorker(PDFParse: { setWorker: (workerSrc?: string) => string }): void {
  if (pdfWorkerConfigured) return;

  PDFParse.setWorker(PDF_WORKER_SRC);
  pdfWorkerConfigured = true;
}

async function ensurePdfCanvasGlobals(): Promise<void> {
  if (
    typeof globalThis.DOMMatrix !== 'undefined' &&
    typeof globalThis.ImageData !== 'undefined' &&
    typeof globalThis.Path2D !== 'undefined'
  ) {
    return;
  }

  const { DOMMatrix, ImageData, Path2D } = await import('@napi-rs/canvas');
  if (typeof globalThis.DOMMatrix === 'undefined') Reflect.set(globalThis, 'DOMMatrix', DOMMatrix);
  if (typeof globalThis.ImageData === 'undefined') Reflect.set(globalThis, 'ImageData', ImageData);
  if (typeof globalThis.Path2D === 'undefined') Reflect.set(globalThis, 'Path2D', Path2D);
}

function normalizePdfText(text: string): string {
  return text
    .replace(/\u0000/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatExtractionError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error || 'Unknown PDF text extraction error');
}
