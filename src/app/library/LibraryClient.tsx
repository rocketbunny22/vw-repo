'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PublicPdfSummary, VehicleProfile } from '@/types';
import { generations } from '@/data/generations';
import BookmarkButton from '@/components/BookmarkButton';
import UiIcon from '@/components/UiIcon';
import { useLanguage } from '@/components/LanguageProvider';
import { localizedPath, systemNamesEs } from '@/lib/localization';
import { translateMexicanSpanish } from '@/lib/translations';
import { pdfManualPath, pdfViewUrl } from '@/lib/pdfUrls';

const systemsList = [
  { id: 'engine', name: 'Engine' },
  { id: 'suspension', name: 'Suspension' },
  { id: 'brakes', name: 'Brakes' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'transmission', name: 'Transmission' },
  { id: 'body', name: 'Body & Interior' },
  { id: 'cooling', name: 'Cooling System' },
];

export default function LibraryClient({
  initialPdfs,
  initialGeneration = 'all',
  initialSystem = 'all',
  initialModel = 'all',
}: {
  initialPdfs: PublicPdfSummary[];
  initialGeneration?: string;
  initialSystem?: string;
  initialModel?: string;
}) {
  const { locale } = useLanguage();
  const t = (value: string) => locale === 'es-MX' ? translateMexicanSpanish(value) : value;
  const [selectedGeneration, setSelectedGeneration] = useState<string>(initialGeneration);
  const [selectedModel, setSelectedModel] = useState<string>(initialModel);
  const [selectedSystem, setSelectedSystem] = useState<string>(initialSystem);
  const [viewingPdf, setViewingPdf] = useState<PublicPdfSummary | null>(null);
  const [vehicle, setVehicle] = useState<VehicleProfile | null>(null);
  const [bookmarkedPdfIds, setBookmarkedPdfIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadVehicle() {
      try {
        const res = await fetch('/api/user/vehicle');
        const data = await res.json();
        if (data.vehicle) setVehicle(data.vehicle);
      } catch { /* optional */ }
    }
    loadVehicle();
  }, []);

  useEffect(() => {
    async function loadBookmarks() {
      try {
        const response = await fetch('/api/user/bookmarks');
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data.bookmarks?.pdfIds)) {
          setBookmarkedPdfIds(data.bookmarks.pdfIds);
        }
      } catch {
        // Bookmarks are optional for anonymous users.
      }
    }

    void loadBookmarks();
  }, []);

  function updatePdfBookmark(pdfId: string, bookmarked: boolean) {
    setBookmarkedPdfIds((ids) => (
      bookmarked ? [...new Set([...ids, pdfId])] : ids.filter((id) => id !== pdfId)
    ));
  }

  const currentModels = selectedGeneration !== 'all' 
    ? generations.find(g => g.id === selectedGeneration)?.models || []
    : [];

  const filteredPdfs = initialPdfs.filter((pdf) => {
    if (selectedGeneration !== 'all' && pdf.generation !== selectedGeneration) return false;
    if (selectedModel !== 'all' && pdf.model !== selectedModel) return false;
    if (selectedSystem !== 'all' && pdf.system !== selectedSystem) return false;
    return true;
  });

  const getGenerationName = (id: string) => {
    const gen = generations.find((g) => g.id === id);
    return gen?.name || id;
  };

  const getSystemName = (id: string) => {
    const sys = systemsList.find((s) => s.id === id);
    return sys?.name || id;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'es-MX' ? 'es-MX' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col">
      <section className="border-b border-vw-gold/35 bg-[linear-gradient(135deg,var(--vw-dark),var(--vw-blue))] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-4">{t('PDF Library')}</h1>
          <p className="max-w-3xl text-xl leading-relaxed text-vw-steel">
            {t('Download technical documents organized by generation and system.')}
          </p>
        </div>
      </section>

      <section className="border-b border-vw-line bg-vw-paper py-6 shadow-[0_8px_24px_rgba(55,42,28,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={selectedGeneration}
              onChange={(e) => { setSelectedGeneration(e.target.value); setSelectedModel('all'); }}
              className="rounded-md border border-vw-line bg-vw-cream px-4 py-2 text-vw-dark focus:border-vw-gold focus:outline-none focus:ring-2 focus:ring-vw-gold/20"
            >
              <option value="all">{t('All Generations')}</option>
              {generations.map((gen) => (
                <option key={gen.id} value={gen.id}>
                  {gen.name}
                </option>
              ))}
            </select>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="rounded-md border border-vw-line bg-vw-cream px-4 py-2 text-vw-dark disabled:cursor-not-allowed disabled:opacity-55 focus:border-vw-gold focus:outline-none focus:ring-2 focus:ring-vw-gold/20"
              disabled={!currentModels.length}
            >
              <option value="all">{t('All Models')}</option>
              {currentModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="rounded-md border border-vw-line bg-vw-cream px-4 py-2 text-vw-dark focus:border-vw-gold focus:outline-none focus:ring-2 focus:ring-vw-gold/20"
            >
              <option value="all">{t('All Systems')}</option>
              {systemsList.map((sys) => (
                <option key={sys.id} value={sys.id}>
                  {locale === 'es-MX' ? systemNamesEs[sys.id] || sys.name : sys.name}
                </option>
              ))}
            </select>
            {vehicle && (
              <button
                onClick={() => setSelectedGeneration(selectedGeneration === vehicle.generation ? 'all' : vehicle.generation)}
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedGeneration === vehicle.generation
                    ? 'bg-vw-blue text-white'
                    : 'border border-vw-line bg-vw-cream text-vw-blue hover:border-vw-gold/60 hover:bg-vw-surface'
                }`}
              >
                <UiIcon name="vehicle" className="mr-1.5 h-4 w-4" />
                {t('My Car')}
              </button>
            )}
            <Link
              href={localizedPath('/upload', locale)}
              className="ml-auto btn-secondary py-2 px-4 text-center"
            >
              {t('Upload PDF')}
            </Link>
          </div>
        </div>
      </section>

      <section className="flex-1 bg-vw-surface py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPdfs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-vw-line bg-vw-paper py-16 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-vw-muted">{t('No PDFs found')}</p>
              <Link href={localizedPath('/upload', locale)} className="mt-4 inline-block text-vw-blue hover:underline">
                {t('Upload your first PDF')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className="group overflow-hidden rounded-xl border border-vw-line bg-vw-paper shadow-[0_10px_28px_rgba(55,42,28,0.06)] transition-all hover:-translate-y-0.5 hover:border-vw-gold/55 hover:shadow-[0_16px_38px_rgba(55,42,28,0.1)]"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-vw-red/20 bg-vw-red/10">
                        <svg className="w-6 h-6 text-vw-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <BookmarkButton
                        itemType="pdf"
                        itemId={pdf.id}
                        initialBookmarked={bookmarkedPdfIds.includes(pdf.id)}
                        onChange={(bookmarked) => updatePdfBookmark(pdf.id, bookmarked)}
                      />
                    </div>
                    <h3 className="mb-2 line-clamp-2 font-bold text-vw-dark">
                      <Link href={pdfManualPath(pdf)} className="hover:text-vw-link-blue hover:underline">
                        {pdf.title}
                      </Link>
                    </h3>
                    {pdf.description && (
                      <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-vw-muted">{pdf.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="badge badge-blue">{getGenerationName(pdf.generation)}</span>
                      {pdf.model && <span className="badge badge-green">{pdf.model}</span>}
                      <span className="badge badge-gold">{locale === 'es-MX' ? systemNamesEs[pdf.system] || getSystemName(pdf.system) : getSystemName(pdf.system)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-vw-line/70 pt-3 text-sm text-vw-muted">
                      <span>{formatFileSize(pdf.fileSize)}</span>
                      <span className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {pdf.downloads || 0}
                        </span>
                        <span>{formatDate(pdf.uploadedAt)}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 mt-4 sm:grid-cols-3">
                      <button
                        onClick={() => setViewingPdf(pdf)}
                        className="text-center btn-secondary py-2"
                      >
                        {t('Preview')}
                      </button>
                      <a
                        href={pdf.url}
                        download
                        className="text-center btn-primary py-2"
                      >
                        {t('Download')}
                      </a>
                      <a
                        href={pdfViewUrl(pdf)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-center btn-secondary py-2"
                      >
                        {t('Open')}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewingPdf && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-vw-dark/85 p-4 backdrop-blur-sm">
              <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-vw-line bg-vw-paper shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between border-b border-vw-line p-4">
                  <h3 className="font-bold text-vw-blue">{viewingPdf.title}</h3>
                  <button
                    onClick={() => setViewingPdf(null)}
                    className="text-2xl text-vw-muted hover:text-vw-red"
                  >
                    &times;
                  </button>
                </div>
                <div className="flex-1 overflow-auto bg-vw-surface p-4">
                  <iframe
                    src={pdfViewUrl(viewingPdf)}
                    className="w-full h-[70vh] border-0"
                    title={viewingPdf.title}
                  />
                </div>
                <div className="flex flex-col gap-3 border-t border-vw-line p-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-vw-muted">{formatFileSize(viewingPdf.fileSize)}</span>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={viewingPdf.url}
                      download
                      className="btn-primary px-4 py-2"
                    >
                      {t('Download')}
                    </a>
                    <a
                      href={pdfViewUrl(viewingPdf)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary px-4 py-2"
                    >
                      {t('Open')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
