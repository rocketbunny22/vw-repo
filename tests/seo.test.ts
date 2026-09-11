import { beforeEach, describe, expect, it, vi } from 'vitest';

const dataMocks = vi.hoisted(() => ({
  getUserGuides: vi.fn(),
  getAllPdfs: vi.fn(),
  getUsers: vi.fn(),
}));

vi.mock('@/data/guides', () => ({ getUserGuides: dataMocks.getUserGuides }));
vi.mock('@/data/pdfs', () => ({ getAllPdfs: dataMocks.getAllPdfs }));
vi.mock('@/data/users', () => ({ getUsers: dataMocks.getUsers }));

import sitemap from '@/app/sitemap';

describe('SEO discovery routes', () => {
  beforeEach(() => {
    dataMocks.getUserGuides.mockResolvedValue([]);
    dataMocks.getAllPdfs.mockResolvedValue([]);
    dataMocks.getUsers.mockResolvedValue([]);
  });

  it('publishes reciprocal language alternates for translated landing pages', async () => {
    const routes = await sitemap();
    const english = routes.find((route) => route.url.endsWith('/generation/mk4'));
    const spanish = routes.find((route) => route.url.endsWith('/es-mx/generaciones/mk4'));

    expect(english?.alternates?.languages?.['en-US']).toBe(english?.url);
    expect(english?.alternates?.languages?.['es-MX']).toBe(spanish?.url);
    expect(spanish?.alternates?.languages?.['en-US']).toBe(english?.url);
    expect(spanish?.alternates?.languages?.['es-MX']).toBe(spanish?.url);
  });

  it('keeps successful mutable collections when another data source fails', async () => {
    dataMocks.getUserGuides.mockRejectedValue(new Error('guides unavailable'));
    dataMocks.getAllPdfs.mockResolvedValue([{
      id: 'manual-1',
      title: 'Mk4 Engine Manual',
      uploadedAt: '2026-09-01T00:00:00.000Z',
      approved: true,
    }]);

    const routes = await sitemap();

    expect(routes.some((route) => route.url.includes('/manuals/manual-1/mk4-engine-manual'))).toBe(true);
  });

  it('does not publish untranslated Spanish system pages or hreflang claims', async () => {
    const routes = await sitemap();
    const systemRoute = routes.find((route) => route.url.endsWith('/systems/engine?gen=mk4'));

    expect(systemRoute).toBeDefined();
    expect(systemRoute?.alternates).toBeUndefined();
    expect(routes.some((route) => route.url.includes('/es-mx/sistemas/'))).toBe(false);
  });
});
