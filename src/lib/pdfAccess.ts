import type { PdfDocument } from '@/types';

export function isSafePdfFilename(filename: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.pdf$/.test(filename)
    && !filename.includes('..');
}

export function findApprovedPdfMetadata(
  pdfs: PdfDocument[],
  filename: string,
): PdfDocument | undefined {
  if (!isSafePdfFilename(filename)) return undefined;
  return pdfs.find((pdf) => pdf.filename === filename && pdf.approved !== false);
}
