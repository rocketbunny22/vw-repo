'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PdfDocument } from '@/types';
import { generations } from '@/data/generations';

const systemsList = [
  { id: 'engine', name: 'Engine' },
  { id: 'suspension', name: 'Suspension' },
  { id: 'brakes', name: 'Brakes' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'transmission', name: 'Transmission' },
  { id: 'body', name: 'Body & Interior' },
  { id: 'cooling', name: 'Cooling System' },
];

export default function LibraryPage({ searchParams }: { searchParams: Promise<{ generation?: string; system?: string; model?: string }> }) {
  const [selectedGeneration, setSelectedGeneration] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const params = await searchParams;
      setSelectedGeneration(params.generation || 'all');
      setSelectedModel(params.model || 'all');
      setSelectedSystem(params.system || 'all');
      fetchPdfs();
    }
    init();
  }, []);

  const fetchPdfs = async () => {
    try {
      const response = await fetch('/api/pdfs');
      const data = await response.json();
      setPdfs(data.pdfs || []);
    } catch (error) {
      console.error('Failed to fetch PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentModels = selectedGeneration !== 'all' 
    ? generations.find(g => g.id === selectedGeneration)?.models || []
    : [];

  const filteredPdfs = pdfs.filter((pdf) => {
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
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col">
      <section className="bg-vw-blue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-4">PDF Library</h1>
          <p className="text-xl text-gray-300">
            Download technical documents organized by generation and system.
          </p>
        </div>
      </section>

      <section className="bg-vw-gold py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={selectedGeneration}
              onChange={(e) => { setSelectedGeneration(e.target.value); setSelectedModel('all'); }}
              className="px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-vw-blue"
            >
              <option value="all">All Generations</option>
              {generations.map((gen) => (
                <option key={gen.id} value={gen.id}>
                  {gen.name}
                </option>
              ))}
            </select>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-vw-blue"
              disabled={!currentModels.length}
            >
              <option value="all">All Models</option>
              {currentModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-vw-blue"
            >
              <option value="all">All Systems</option>
              {systemsList.map((sys) => (
                <option key={sys.id} value={sys.id}>
                  {sys.name}
                </option>
              ))}
            </select>
            <Link
              href="/upload"
              className="ml-auto btn-secondary py-2 px-4 text-center"
            >
              Upload PDF
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading PDFs...</p>
            </div>
          ) : filteredPdfs.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">No PDFs found</p>
              <Link href="/upload" className="mt-4 inline-block text-vw-blue hover:underline">
                Upload your first PDF
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-vw-red rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="font-bold text-vw-dark mb-2 line-clamp-2">{pdf.title}</h3>
                    {pdf.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pdf.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="badge badge-blue">{getGenerationName(pdf.generation)}</span>
                      {pdf.model && <span className="badge badge-green">{pdf.model}</span>}
                      <span className="badge badge-gold">{getSystemName(pdf.system)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatFileSize(pdf.fileSize)}</span>
                      <span>{formatDate(pdf.uploadedAt)}</span>
                    </div>
                    <a
                      href={pdf.url}
                      download
                      className="mt-4 block w-full text-center btn-primary py-2"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}