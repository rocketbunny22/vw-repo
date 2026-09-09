import type { PublicPdfSummary } from '@/types';

const MAX_MANUAL_SLUG_LENGTH = 80;

export function pdfManualSlug(title: string): string {
  const slug = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_MANUAL_SLUG_LENGTH)
    .replace(/-+$/g, '');

  return slug || 'volkswagen-document';
}

export function pdfManualPath(pdf: Pick<PublicPdfSummary, 'id' | 'title'>): string {
  return `/manuals/${encodeURIComponent(pdf.id)}/${pdfManualSlug(pdf.title)}`;
}

export function pdfViewUrl(pdf: Pick<PublicPdfSummary, 'id' | 'url'>): string {
  const separator = pdf.url.includes('?') ? '&' : '?';
  return `${pdf.url}${separator}view=true&v=${encodeURIComponent(pdf.id)}`;
}
