'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PublicPdfSummary } from '@/types';
import BookmarkButton from './BookmarkButton';
import { useLanguage } from '@/components/LanguageProvider';
import { localizedPath, systemNamesEs } from '@/lib/localization';
import { translateMexicanSpanish } from '@/lib/translations';
import { pdfViewUrl } from '@/lib/pdfUrls';

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
      <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all hover:shadow-xl">
        <div className="p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-vw-red text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </span>
            <BookmarkButton itemType="pdf" itemId={pdf.id} />
          </div>
          <h3 className="mb-2 line-clamp-2 font-bold text-vw-dark">{pdf.title}</h3>
          {pdf.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pdf.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="badge badge-blue">{pdf.generation}</span>
            <span className="badge badge-gold">{locale === 'es-MX' ? systemNamesEs[pdf.system] || pdf.system : pdf.system}</span>
            {pdf.model && <span className="badge badge-green">{pdf.model}</span>}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{formatFileSize(pdf.fileSize)}</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {pdf.downloads || 0}
            </span>
          </div>
          {pdf.uploadedBy && (
            <div className="mt-2 text-sm text-gray-500">
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="presentation">
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`pdf-preview-${viewingPdf.id}`}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 id={`pdf-preview-${viewingPdf.id}`} className="font-bold">{viewingPdf.title}</h3>
              <button
                ref={closeButtonRef}
                onClick={() => setViewingPdf(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                aria-label={t('Close PDF preview')}
              >
                &times;
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              <iframe
                src={pdfViewUrl(viewingPdf)}
                className="w-full h-[70vh] border-0"
                title={viewingPdf.title}
              />
            </div>
            <div className="p-4 border-t flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <span className="text-sm text-gray-500">{formatFileSize(viewingPdf.fileSize)}</span>
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
