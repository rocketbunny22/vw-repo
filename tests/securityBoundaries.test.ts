import { describe, expect, it, vi } from 'vitest';
import { findApprovedPdfMetadata, isSafePdfFilename } from '@/lib/pdfAccess';
import { toPublicComment } from '@/lib/publicSummaries';
import { isTrustedMutationRequest } from '@/lib/requestSecurity';
import { rateLimitIdentifier } from '@/lib/validation';
import type { Comment, PdfDocument } from '@/types';

function mutationRequest(origin?: string, fetchSite?: string) {
  const headers = new Headers();
  if (origin) headers.set('origin', origin);
  if (fetchSite) headers.set('sec-fetch-site', fetchSite);
  return new Request('https://www.vwrepo.com/api/auth', { method: 'POST', headers });
}

describe('request security boundaries', () => {
  it('accepts same-origin mutations and rejects missing or cross-site origins', () => {
    expect(isTrustedMutationRequest(mutationRequest('https://www.vwrepo.com', 'same-origin'))).toBe(true);
    expect(isTrustedMutationRequest(mutationRequest())).toBe(false);
    expect(isTrustedMutationRequest(mutationRequest('https://attacker.example', 'cross-site'))).toBe(false);
    expect(isTrustedMutationRequest(mutationRequest('https://attacker.example', 'same-site'))).toBe(false);
  });

  it('uses only the configured canonical origin in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.vwrepo.com');

    try {
      expect(isTrustedMutationRequest(new Request('https://attacker.example/api/auth', {
        method: 'POST',
        headers: { origin: 'https://attacker.example', 'sec-fetch-site': 'same-origin' },
      }))).toBe(false);
      expect(isTrustedMutationRequest(new Request('https://attacker.example/api/auth', {
        method: 'POST',
        headers: { origin: 'https://www.vwrepo.com', 'sec-fetch-site': 'same-origin' },
      }))).toBe(true);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('hashes case-normalized rate-limit identifiers instead of retaining raw values', () => {
    const identifier = rateLimitIdentifier(' User@Example.com ');
    expect(identifier).toBe(rateLimitIdentifier('user@example.COM'));
    expect(identifier).not.toContain('example.com');
    expect(identifier).toMatch(/^[a-f0-9]{32}$/);
  });
});

describe('public response minimization', () => {
  it('removes comment ownership and moderation fields', () => {
    const comment: Comment = {
      id: 'comment-1',
      guideId: 'guide-1',
      authorId: 'private-user-id',
      authorName: 'Owner',
      content: 'Useful note',
      createdAt: '2026-09-01T00:00:00.000Z',
      reported: true,
      reportedAt: '2026-09-01T01:00:00.000Z',
      moderationStatus: 'pending',
    };

    expect(toPublicComment(comment)).toEqual({
      id: 'comment-1',
      guideId: 'guide-1',
      authorName: 'Owner',
      content: 'Useful note',
      createdAt: '2026-09-01T00:00:00.000Z',
    });
  });
});

describe('PDF access control', () => {
  const approvedPdf = {
    id: 'approved',
    filename: 'approved.pdf',
    originalName: 'approved.pdf',
    generation: 'mk4',
    system: 'engine',
    title: 'Approved',
    description: '',
    uploadedAt: '2026-09-01T00:00:00.000Z',
    fileSize: 100,
    url: '/api/pdfs/approved.pdf',
    downloads: 0,
    approved: true,
  } satisfies PdfDocument;
  const pendingPdf = { ...approvedPdf, id: 'pending', filename: 'pending.pdf', approved: false };

  it('fails closed for missing and pending metadata', () => {
    expect(findApprovedPdfMetadata([approvedPdf, pendingPdf], 'missing.pdf')).toBeUndefined();
    expect(findApprovedPdfMetadata([approvedPdf, pendingPdf], 'pending.pdf')).toBeUndefined();
    expect(findApprovedPdfMetadata([approvedPdf, pendingPdf], 'approved.pdf')).toEqual(approvedPdf);
  });

  it('rejects traversal and malformed filenames', () => {
    expect(isSafePdfFilename('manual.pdf')).toBe(true);
    expect(isSafePdfFilename('../manual.pdf')).toBe(false);
    expect(isSafePdfFilename('manual.pdf/extra')).toBe(false);
    expect(isSafePdfFilename('.pdf')).toBe(false);
  });
});
