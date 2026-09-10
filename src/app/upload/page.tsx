'use client';

import { useCallback, useState, useEffect } from 'react';
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

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth');
      const data = await response.json();
      if (response.status === 503 || data.code === 'REDIS_UNAVAILABLE') {
        setMessage({ type: 'error', text: 'Account data is temporarily unavailable. Please retry shortly.' });
        return;
      }
      
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
  }, [locale, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void checkAuth();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [checkAuth]);

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
        <header className="border-b border-vw-gold/25 bg-[linear-gradient(135deg,var(--vw-blue),var(--vw-dark))] py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-vw-gold-light">Community archive</p>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">Upload PDF</h1>
          </div>
        </header>
        <main className="flex-1 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="rounded-xl border border-vw-line bg-vw-paper p-6 text-vw-muted shadow-sm" role="status">Checking authentication...</p>
          </div>
        </main>
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
      <header className="border-b border-vw-gold/25 bg-[linear-gradient(135deg,var(--vw-blue),var(--vw-dark))] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-vw-gold-light">Community archive</p>
          <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl">Upload PDF</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-vw-steel">
            Upload technical documents and categorize them by generation and system.
          </p>
        </div>
      </header>

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="rounded-xl border border-vw-line bg-vw-paper p-5 shadow-[0_18px_45px_rgba(55,42,28,0.08)] sm:p-8">
            <aside className="mb-8 rounded-lg border border-vw-gold/35 bg-vw-gold/10 p-5">
              <h2 className="font-bold text-vw-blue">Before uploading</h2>
              <div className="mt-4 grid gap-4 text-sm leading-relaxed text-vw-muted md:grid-cols-2">
                <div>
                  <div className="font-semibold text-vw-dark">Accepted file</div>
                  <p>PDF only, up to {MAX_PDF_SIZE_MB} MB.</p>
                </div>
                <div>
                  <div className="font-semibold text-vw-dark">Required metadata</div>
                  <p>Generation, system, and clear title are required so people can find it.</p>
                </div>
                <div>
                  <div className="font-semibold text-vw-dark">Duplicate check</div>
                  <p>The form warns if a matching title or original filename already exists.</p>
                </div>
                <div>
                  <div className="font-semibold text-vw-dark">After submission</div>
                  <p>Uploads enter the admin moderation queue before appearing publicly.</p>
                </div>
              </div>
            </aside>

            {message && (
              <div className={`mb-6 rounded-md border p-4 ${
                message.type === 'success' ? 'border-[#55745d]/30 bg-[#55745d]/10 text-[#3f6549]' : 'border-vw-red/25 bg-vw-red/10 text-vw-red'
              }`} role={message.type === 'error' ? 'alert' : 'status'}>
                {message.text}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-vw-dark">
                  PDF File *
                </label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-sm text-vw-dark file:mr-4 file:rounded-md file:border-0 file:bg-vw-blue file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-vw-blue-light focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                />
                {file && (
                  <div className="mt-1 text-sm">
                    <p className={fileTooLarge ? 'text-vw-red' : 'text-vw-muted'}>
                      Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                    {fileTooLarge && (
                      <p className="mt-1 text-vw-red">
                        This file is over the {MAX_PDF_SIZE_MB} MB limit.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-vw-dark">
                    Generation *
                  </label>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-vw-muted">
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
                      className="text-sm font-semibold text-vw-link-blue underline-offset-4 hover:underline"
                    >
                      {generationsSelected.length === generations.length ? 'Clear All' : 'Select All'}
                    </button>
                  </div>

                  <div className="max-h-40 overflow-y-auto rounded-md border border-vw-line bg-vw-cream p-3 shadow-inner shadow-vw-dark/5">
                    {generations.map((gen) => (
                      <label key={gen.id} className="mb-1 flex items-center gap-2 rounded px-1 py-1 text-vw-dark hover:bg-vw-gold/10">
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
                        <span className="text-sm text-vw-dark">
                          {gen.name} ({gen.years})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-vw-dark">
                    Models (optional)
                  </label>
                  <div className="max-h-40 min-h-12 overflow-y-auto rounded-md border border-vw-line bg-vw-cream p-3 shadow-inner shadow-vw-dark/5">
                    {generationsSelected.length !== 1 && (
                      <p className="text-sm text-vw-muted">Select exactly one generation to choose models</p>
                    )}
                    {availableModels.map((m) => (
                      <label key={m} className="mb-1 flex items-center gap-2 rounded px-1 py-1 text-vw-dark hover:bg-vw-gold/10">
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
                        <span className="text-sm text-vw-dark">{m}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-vw-dark">
                    System *
                  </label>
                  <select
                    value={system}
                    onChange={(e) => setSystem(e.target.value)}
                    className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
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
                  <label className="mb-2 block text-sm font-semibold text-vw-dark">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Mk1 GTI Engine Rebuild Guide"
                    className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark placeholder:text-vw-muted/70 focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-vw-dark">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the document contents..."
                  rows={3}
                  className="w-full resize-y rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark placeholder:text-vw-muted/70 focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                />
                <p className="mt-2 text-sm text-vw-muted">
                  Include what the document covers, source if known, and any model-year limits.
                </p>
              </div>

              {duplicateWarnings.length > 0 && (
                <div className="rounded-md border border-vw-gold/45 bg-vw-gold/10 p-4">
                  <h3 className="font-semibold text-vw-dark">Possible duplicate</h3>
                  <p className="mt-1 text-sm text-vw-muted">
                    A similar PDF already exists. Review it before uploading another copy.
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-vw-dark">
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
      </main>
    </div>
  );
}
