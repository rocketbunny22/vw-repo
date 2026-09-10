'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BookmarkButton from '@/components/BookmarkButton';
import { PublicGuideSummary, PublicPdfSummary } from '@/types';
import { useLanguage } from '@/components/LanguageProvider';
import { localizedPath } from '@/lib/localization';
import { pdfManualPath, pdfViewUrl } from '@/lib/pdfUrls';

export default function BookmarksPage() {
  const { locale } = useLanguage();
  const [pdfs, setPdfs] = useState<PublicPdfSummary[]>([]);
  const [guides, setGuides] = useState<PublicGuideSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);

  useEffect(() => {
    async function loadBookmarks() {
      try {
        const response = await fetch('/api/user/bookmarks');
        if (response.status === 401) {
          setAuthenticated(false);
          return;
        }

        if (response.status === 503) {
          setServiceUnavailable(true);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load bookmarks');
        }

        const data = await response.json();
        setPdfs(data.pdfs || []);
        setGuides(data.guides || []);
      } catch {
        setPdfs([]);
        setGuides([]);
      } finally {
        setLoading(false);
      }
    }

    void loadBookmarks();
  }, []);

  function removePdf(pdfId: string) {
    setPdfs((items) => items.filter((pdf) => pdf.id !== pdfId));
  }

  function removeGuide(guideId: string) {
    setGuides((items) => items.filter((guide) => guide.id !== guideId));
  }

  return (
    <div className="flex flex-col">
      <header className="border-b border-vw-gold/25 bg-[linear-gradient(135deg,var(--vw-blue),var(--vw-dark))] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-vw-gold-light">Your workbench</p>
          <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl">Saved Items</h1>
          <p className="text-lg text-vw-steel">Your bookmarked PDFs and DIY guides.</p>
        </div>
      </header>

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {loading ? (
            <p className="rounded-xl border border-vw-line bg-vw-paper p-6 text-vw-muted shadow-sm" role="status">Loading saved items...</p>
          ) : serviceUnavailable ? (
            <p className="rounded-xl border border-vw-gold/40 bg-vw-gold/10 p-6 text-vw-dark" role="status">
              Saved items are temporarily unavailable. Please retry shortly.
            </p>
          ) : !authenticated ? (
            <div className="rounded-xl border border-vw-line bg-vw-paper p-8 shadow-[0_18px_45px_rgba(55,42,28,0.08)]">
              <h2 className="text-2xl font-bold text-vw-blue">Keep your references close</h2>
              <p className="mb-5 mt-2 text-vw-muted">Sign in to save PDFs and guides.</p>
              <Link href={localizedPath('/login', locale)} className="btn-primary inline-block">Sign In</Link>
            </div>
          ) : (
            <>
              <section aria-labelledby="saved-pdfs-heading">
                <div className="flex items-center justify-between mb-4">
                  <h2 id="saved-pdfs-heading" className="text-2xl font-bold text-vw-blue">PDFs</h2>
                  <Link href={localizedPath('/library', locale)} className="text-sm font-semibold text-vw-link-blue underline-offset-4 hover:underline">Browse PDFs</Link>
                </div>
                {pdfs.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-vw-line bg-vw-paper/70 p-6 text-vw-muted">No saved PDFs yet.</p>
                ) : (
                  <div className="space-y-4">
                    {pdfs.map((pdf) => (
                      <article key={pdf.id} className="rounded-xl border border-vw-line bg-vw-paper p-5 shadow-[0_10px_28px_rgba(55,42,28,0.05)] transition-colors hover:border-vw-gold/50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="font-bold text-vw-dark">
                              <Link href={pdfManualPath(pdf)} className="hover:text-vw-link-blue hover:underline">
                                {pdf.title}
                              </Link>
                            </h3>
                            {pdf.description && <p className="mt-2 text-sm leading-relaxed text-vw-muted">{pdf.description}</p>}
                            <div className="mt-4 flex flex-wrap gap-2">
                              <a
                                href={pdfViewUrl(pdf)}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-secondary px-4 py-2"
                              >
                                Open
                              </a>
                              <a href={pdf.url} download className="btn-primary px-4 py-2">Download</a>
                            </div>
                          </div>
                          <BookmarkButton
                            itemType="pdf"
                            itemId={pdf.id}
                            initialBookmarked
                            onChange={(bookmarked) => {
                              if (!bookmarked) removePdf(pdf.id);
                            }}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section aria-labelledby="saved-guides-heading">
                <div className="flex items-center justify-between mb-4">
                  <h2 id="saved-guides-heading" className="text-2xl font-bold text-vw-blue">DIY Guides</h2>
                  <Link href={localizedPath('/guides', locale)} className="text-sm font-semibold text-vw-link-blue underline-offset-4 hover:underline">Browse Guides</Link>
                </div>
                {guides.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-vw-line bg-vw-paper/70 p-6 text-vw-muted">No saved guides yet.</p>
                ) : (
                  <div className="space-y-4">
                    {guides.map((guide) => (
                      <article key={guide.id} className="rounded-xl border border-vw-line bg-vw-paper p-5 shadow-[0_10px_28px_rgba(55,42,28,0.05)] transition-colors hover:border-vw-gold/50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <Link href={`/guides/${guide.slug}`} className="font-bold text-vw-dark hover:text-vw-blue">
                              {guide.title}
                            </Link>
                            <p className="mt-2 text-sm text-vw-muted">
                              By {guide.author} • {guide.timeEstimate}
                            </p>
                          </div>
                          <BookmarkButton
                            itemType="guide"
                            itemId={guide.id}
                            initialBookmarked
                            onChange={(bookmarked) => {
                              if (!bookmarked) removeGuide(guide.id);
                            }}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
