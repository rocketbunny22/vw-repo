'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BookmarkButton from '@/components/BookmarkButton';
import { PublicGuideSummary, PublicPdfSummary } from '@/types';
import { useLanguage } from '@/components/LanguageProvider';
import { localizedPath } from '@/lib/localization';
import { pdfViewUrl } from '@/lib/pdfUrls';

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
      <section className="bg-vw-blue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-4">Saved Items</h1>
          <p className="text-xl text-gray-300">Your bookmarked PDFs and DIY guides.</p>
        </div>
      </section>

      <section className="py-12 bg-gray-50 flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {loading ? (
            <p className="text-gray-500">Loading saved items...</p>
          ) : serviceUnavailable ? (
            <p className="rounded-lg border border-amber-300 bg-amber-50 p-6 text-amber-900" role="status">
              Saved items are temporarily unavailable. Please retry shortly.
            </p>
          ) : !authenticated ? (
            <div className="bg-white rounded-lg shadow-md p-8">
              <p className="text-gray-600 mb-4">Sign in to save PDFs and guides.</p>
              <Link href={localizedPath('/login', locale)} className="btn-primary inline-block">Sign In</Link>
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-vw-blue">PDFs</h2>
                  <Link href={localizedPath('/library', locale)} className="text-sm text-vw-blue hover:underline">Browse PDFs</Link>
                </div>
                {pdfs.length === 0 ? (
                  <p className="text-gray-500 bg-white rounded-lg p-6">No saved PDFs yet.</p>
                ) : (
                  <div className="space-y-4">
                    {pdfs.map((pdf) => (
                      <div key={pdf.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-vw-dark">{pdf.title}</h3>
                            {pdf.description && <p className="text-sm text-gray-600 mt-1">{pdf.description}</p>}
                            <div className="flex gap-2 mt-3">
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
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-vw-blue">DIY Guides</h2>
                  <Link href={localizedPath('/guides', locale)} className="text-sm text-vw-blue hover:underline">Browse Guides</Link>
                </div>
                {guides.length === 0 ? (
                  <p className="text-gray-500 bg-white rounded-lg p-6">No saved guides yet.</p>
                ) : (
                  <div className="space-y-4">
                    {guides.map((guide) => (
                      <div key={guide.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link href={`/guides/${guide.slug}`} className="font-bold text-vw-dark hover:text-vw-blue">
                              {guide.title}
                            </Link>
                            <p className="text-sm text-gray-600 mt-1">
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
