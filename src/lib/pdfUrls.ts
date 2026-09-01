import type { PublicPdfSummary } from '@/types';

export function pdfViewUrl(pdf: Pick<PublicPdfSummary, 'id' | 'url'>): string {
  const separator = pdf.url.includes('?') ? '&' : '?';
  return `${pdf.url}${separator}view=true&v=${encodeURIComponent(pdf.id)}`;
}
