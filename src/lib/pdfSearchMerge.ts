import type { PdfDocument } from '@/types';

export type PdfSearchTextPatch = Pick<PdfDocument, 'searchText' | 'searchTextExtractedAt'>;

export function mergePdfSearchTextPatches(
  currentPdfs: PdfDocument[],
  patches: ReadonlyMap<string, PdfSearchTextPatch>,
): PdfDocument[] {
  return currentPdfs.map((pdf) => {
    const patch = patches.get(pdf.id);
    return patch ? { ...pdf, ...patch } : pdf;
  });
}
