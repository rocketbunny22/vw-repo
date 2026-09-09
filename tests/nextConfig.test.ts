import { describe, expect, it } from 'vitest';
import nextConfig from '../next.config';
import { pdfManualPath, pdfManualSlug, pdfViewUrl } from '@/lib/pdfUrls';

describe('PDF preview response headers', () => {
  it('allows only same-origin framing for PDF file responses', async () => {
    const rules = await nextConfig.headers?.();
    expect(rules).toBeTruthy();

    const pdfRule = rules?.find((rule) => rule.source === '/api/pdfs/:filename');
    const headerMap = new Map(pdfRule?.headers.map((header) => [header.key, header.value]));

    expect(headerMap.get('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(headerMap.get('Content-Security-Policy')).toContain("frame-ancestors 'self'");
    expect(headerMap.get('Content-Security-Policy')).not.toContain("frame-ancestors 'none'");
  });
});

describe('PDF preview URLs', () => {
  it('uses a stable document version to bypass stale preview responses', () => {
    expect(pdfViewUrl({ id: 'pdf id', url: '/api/pdfs/manual.pdf' }))
      .toBe('/api/pdfs/manual.pdf?view=true&v=pdf%20id');
  });

  it('builds stable, readable manual landing-page URLs', () => {
    expect(pdfManualSlug('Mk4 Golf 1.8T – Engine Manual (PDF)')).toBe('mk4-golf-1-8t-engine-manual-pdf');
    expect(pdfManualPath({ id: 'pdf id', title: 'Mk4 Golf Manual' }))
      .toBe('/manuals/pdf%20id/mk4-golf-manual');
  });

  it('uses a safe fallback for titles without URL-safe characters', () => {
    expect(pdfManualSlug('日本語')).toBe('volkswagen-document');
  });
});
