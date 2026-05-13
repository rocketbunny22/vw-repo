'use client';

import { useState } from 'react';
import { PdfDocument } from '@/types';

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

interface PdfCardProps {
  pdf: PdfDocument;
}

export function PdfCard({ pdf }: PdfCardProps) {
  const [viewingPdf, setViewingPdf] = useState<PdfDocument | null>(null);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-4">
          <h3 className="font-bold text-vw-dark mb-2">{pdf.title}</h3>
          {pdf.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pdf.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="badge badge-blue">{pdf.generation}</span>
            <span className="badge badge-gold">{pdf.system}</span>
            {pdf.model && <span className="badge badge-green">{pdf.model}</span>}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{formatFileSize(pdf.fileSize)}</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {pdf.downloads || 0}
            </span>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setViewingPdf(pdf)}
              className="flex-1 text-center btn-secondary py-2"
            >
              View
            </button>
            <a
              href={pdf.url}
              download
              className="flex-1 text-center btn-primary py-2"
            >
              Download
            </a>
          </div>
        </div>
      </div>

      {viewingPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold">{viewingPdf.title}</h3>
              <button
                onClick={() => setViewingPdf(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              <iframe
                src={`${viewingPdf.url}?view=true`}
                className="w-full h-[70vh] border-0"
                title={viewingPdf.title}
              />
            </div>
            <div className="p-4 border-t flex justify-between items-center">
              <span className="text-sm text-gray-500">{formatFileSize(viewingPdf.fileSize)}</span>
              <a
                href={viewingPdf.url}
                download
                className="px-4 py-2 bg-vw-blue text-white rounded-md hover:bg-blue-700"
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

