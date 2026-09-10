'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PublicPdfSummary } from '@/types';
import BookmarkButton from './BookmarkButton';
import { useLanguage } from '@/components/LanguageProvider';
import { localizedPath, systemNamesEs } from '@/lib/localization';
import { translateMexicanSpanish } from '@/lib/translations';
import { pdfManualPath, pdfViewUrl } from '@/lib/pdfUrls';

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

interface PdfCardProps {
  pdf: PublicPdfSummary;
}

export function PdfCard({ pdf }: PdfCardProps) {
  const { locale } = useLanguage();
  const t = (value: string) => locale === 'es-MX' ? translateMexicanSpanish(value) : value;
  const [viewingPdf, setViewingPdf] = useState<PublicPdfSummary | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previewButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!viewingPdf) return;
    const previewButton = previewButtonRef.current;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setViewingPdf(null);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      previewButton?.focus();
    };
  }, [viewingPdf]);

  return (
    <>
      <article className="group overflow-hidden rounded-xl border border-vw-line bg-vw-paper shadow-[0_10px_28px_rgba(55,42,28,0.06)] transition-all hover:-translate-y-0.5 hover:border-vw-gold/55 hover:shadow-[0_16px_38px_rgba(55,42,28,0.1)]">
        <div className="p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-vw-red/20 bg-vw-red/10 text-vw-red">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </span>
            <BookmarkButton itemType="pdf" itemId={pdf.id} />
          </div>
          <h3 className="mb-2 line-clamp-2 font-bold text-vw-dark">
            <Link href={pdfManualPath(pdf)} className="hover:text-vw-link-blue hover:underline">
              {pdf.title}
            </Link>
          </h3>
          {pdf.description && (
            <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-vw-muted">{pdf.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="badge badge-blue">{pdf.generation}</span>
            <span className="badge badge-gold">{locale === 'es-MX' ? systemNamesEs[pdf.system] || pdf.system : pdf.system}</span>
            {pdf.model && <span className="badge badge-green">{pdf.model}</span>}
          </div>
          <div className="flex items-center justify-between border-t border-vw-line/70 pt-3 text-sm text-vw-muted">
            <span>{formatFileSize(pdf.fileSize)}</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {pdf.downloads || 0}
            </span>
          </div>
          {pdf.uploadedBy && (
            <div className="mt-2 text-sm text-vw-muted">
              {t('Uploaded by')}{' '}
              <Link href={localizedPath(`/users/${encodeURIComponent(pdf.uploadedBy)}`, locale)} className="text-vw-blue hover:underline">
                {pdf.uploadedBy}
              </Link>
            </div>
          )}
          <div className="grid grid-cols-1 gap-2 mt-4 sm:grid-cols-3">
            <button
              ref={previewButtonRef}
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
      </article>

      {viewingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-vw-dark/85 p-4 backdrop-blur-sm" role="presentation">
          <div
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-vw-line bg-vw-paper shadow-[0_28px_80px_rgba(0,0,0,0.35)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`pdf-preview-${viewingPdf.id}`}
          >
            <div className="flex items-center justify-between border-b border-vw-line p-4">
              <h3 id={`pdf-preview-${viewingPdf.id}`} className="font-bold text-vw-blue">{viewingPdf.title}</h3>
              <button
                ref={closeButtonRef}
                onClick={() => setViewingPdf(null)}
                className="text-2xl text-vw-muted hover:text-vw-red"
                aria-label={t('Close PDF preview')}
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
    </>
  );
}
