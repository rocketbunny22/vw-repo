'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generations } from '@/data/generations';
import { PdfDocument } from '@/types';
import { useLanguage } from '@/components/LanguageProvider';
import { localizedPath } from '@/lib/localization';

const systemsList = [
  { id: 'engine', name: 'Engine' },
  { id: 'suspension', name: 'Suspension' },
  { id: 'brakes', name: 'Brakes' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'transmission', name: 'Transmission' },
  { id: 'body', name: 'Body & Interior' },
  { id: 'cooling', name: 'Cooling System' },
];

const MAX_PDF_SIZE_MB = 10;
const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

export default function UploadPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [generationsSelected, setGenerationsSelected] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [system, setSystem] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [existingPdfs, setExistingPdfs] = useState<PdfDocument[]>([]);

  const availableModels = generationsSelected.length === 1
    ? generations.find((gen) => gen.id === generationsSelected[0])?.models || []
    : [];

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth');
      const data = await response.json();
      
      if (!data.authenticated) {
        router.push(localizedPath('/login', locale));
        return;
      }

      try {
        const pdfResponse = await fetch('/api/pdfs');
        const pdfData = await pdfResponse.json();
        setExistingPdfs(pdfData.pdfs || []);
      } catch {
        setExistingPdfs([]);
      }
    } catch {
      router.push(localizedPath('/login', locale));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void checkAuth();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const duplicateWarnings = existingPdfs.filter((pdf) => {
    const sameFile = file && pdf.originalName.toLowerCase() === file.name.toLowerCase();
    const sameTitle = title.trim() && pdf.title.toLowerCase() === title.trim().toLowerCase();
    const sameSystem = !system || pdf.system === system;
    const sameGeneration = generationsSelected.length === 0 || generationsSelected.includes(pdf.generation);
    return (sameFile || sameTitle) && sameSystem && sameGeneration;
  });

  const fileTooLarge = file ? file.size > MAX_PDF_SIZE_BYTES : false;

  if (loading) {
    return (
      <div className="flex flex-col">
        <section className="bg-vw-blue py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-white">Upload PDF</h1>
          </div>
        </section>
        <section className="py-12 bg-gray-50 flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p>Checking authentication...</p>
          </div>
        </section>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || generationsSelected.length === 0 || !system || !title) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    if (fileTooLarge) {
      setMessage({ type: 'error', text: `PDF is too large. Maximum file size is ${MAX_PDF_SIZE_MB} MB.` });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      generationsSelected.forEach((g) => formData.append('generation', g));
      models.forEach((m) => formData.append('models', m));
      formData.append('system', system);
      formData.append('title', title);
      formData.append('description', description);

      const response = await fetch('/api/pdfs', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'PDF uploaded successfully. It will appear in the library after admin approval.' });
        setFile(null);
        setGenerationsSelected([]);
        setModels([]);
        setSystem('');
        setTitle('');
        setDescription('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to upload PDF' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <section className="bg-vw-blue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-4">Upload PDF</h1>
          <p className="text-xl text-gray-300">
            Upload technical documents and categorize them by generation and system.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50 flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6 rounded-lg border border-vw-gold/50 bg-vw-gold/10 p-4">
              <h2 className="font-bold text-vw-blue">Before uploading</h2>
              <div className="mt-3 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
                <div>
                  <div className="font-medium text-gray-900">Accepted file</div>
                  <p>PDF only, up to {MAX_PDF_SIZE_MB} MB.</p>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Required metadata</div>
                  <p>Generation, system, and clear title are required so people can find it.</p>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Duplicate check</div>
                  <p>The form warns if a matching title or original filename already exists.</p>
                </div>
                <div>
                  <div className="font-medium text-gray-900">After submission</div>
                  <p>Uploads enter the admin moderation queue before appearing publicly.</p>
                </div>
              </div>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-md ${
                message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF File *
                </label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue focus:border-transparent"
                />
                {file && (
                  <div className="mt-1 text-sm">
                    <p className={fileTooLarge ? 'text-red-700' : 'text-gray-500'}>
                      Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                    {fileTooLarge && (
                      <p className="mt-1 text-red-700">
                        This file is over the {MAX_PDF_SIZE_MB} MB limit.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generation *
                  </label>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {generationsSelected.length} selected
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (generationsSelected.length === generations.length) {
                          setGenerationsSelected([]);
                        } else {
                          setGenerationsSelected(generations.map((g) => g.id));
                        }
                        setModels([]);
                      }}
                      className="text-sm text-vw-blue hover:underline"
                    >
                      {generationsSelected.length === generations.length ? 'Clear All' : 'Select All'}
                    </button>
                  </div>

                  <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                    {generations.map((gen) => (
                      <label key={gen.id} className="flex items-center space-x-2 mb-1">
                        <input
                          type="checkbox"
                          checked={generationsSelected.includes(gen.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setGenerationsSelected([...generationsSelected, gen.id]);
                            } else {
                              setGenerationsSelected(generationsSelected.filter((g) => g !== gen.id));
                            }
                            setModels([]);
                          }}
                        />
                        <span className="text-sm text-gray-700">
                          {gen.name} ({gen.years})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Models (optional)
                  </label>
                  <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                    {generationsSelected.length !== 1 && (
                      <p className="text-sm text-gray-500">Select exactly one generation to choose models</p>
                    )}
                    {availableModels.map((m) => (
                      <label key={m} className="flex items-center space-x-2 mb-1">
                        <input
                          type="checkbox"
                          checked={models.includes(m)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setModels([...models, m]);
                            } else {
                              setModels(models.filter((x) => x !== m));
                            }
                          }}
                        />
                        <span className="text-sm text-gray-700">{m}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System *
                  </label>
                  <select
                    value={system}
                    onChange={(e) => setSystem(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue focus:border-transparent"
                    required
                  >
                    <option value="">Select System</option>
                    {systemsList.map((sys) => (
                      <option key={sys.id} value={sys.id}>
                        {sys.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Mk1 GTI Engine Rebuild Guide"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the document contents..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Include what the document covers, source if known, and any model-year limits.
                </p>
              </div>

              {duplicateWarnings.length > 0 && (
                <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4">
                  <h3 className="font-semibold text-yellow-900">Possible duplicate</h3>
                  <p className="mt-1 text-sm text-yellow-800">
                    A similar PDF already exists. Review it before uploading another copy.
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-yellow-900">
                    {duplicateWarnings.slice(0, 3).map((pdf) => (
                      <li key={pdf.id}>
                        {pdf.title} ({pdf.generation} / {pdf.system})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || fileTooLarge}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload PDF'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
