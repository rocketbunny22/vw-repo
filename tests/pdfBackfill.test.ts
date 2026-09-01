import { describe, expect, it } from 'vitest';
import { mergePdfSearchTextPatches } from '@/lib/pdfSearchMerge';
import type { PdfDocument } from '@/types';

function pdf(id: string, approved: boolean): PdfDocument {
  return {
    id,
    filename: `${id}.pdf`,
    originalName: `${id}.pdf`,
    generation: 'mk4',
    system: 'engine',
    title: id,
    description: '',
    uploadedAt: '2026-01-01T00:00:00.000Z',
    fileSize: 100,
    url: `/api/pdfs/${id}.pdf`,
    downloads: 0,
    approved,
  };
}

describe('PDF search-text merge', () => {
  it('patches approved records without dropping pending records', () => {
    const records = [pdf('approved', true), pdf('pending', false)];
    const result = mergePdfSearchTextPatches(records, new Map([
      ['approved', { searchText: 'extracted', searchTextExtractedAt: '2026-02-01T00:00:00.000Z' }],
    ]));

    expect(result).toHaveLength(2);
    expect(result.find((item) => item.id === 'approved')?.searchText).toBe('extracted');
    expect(result.find((item) => item.id === 'pending')).toEqual(records[1]);
  });
});
