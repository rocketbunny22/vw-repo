import { describe, expect, it } from 'vitest';
import nextConfig from '../next.config';
import { pdfViewUrl } from '@/lib/pdfUrls';

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
});
