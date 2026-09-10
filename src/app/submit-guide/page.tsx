'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generations } from '@/data/generations';
import { PublicGuideSummary } from '@/types';
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

const difficulties = [
  { id: 'easy', name: 'Easy', description: 'Basic tools, no experience needed' },
  { id: 'moderate', name: 'Moderate', description: 'Some experience helpful' },
  { id: 'hard', name: 'Hard', description: 'Professional experience recommended' },
];

const guideChecklistItems = [
  { id: 'tested', label: 'I have personally done this repair or verified the steps from a reliable source.' },
  { id: 'safety', label: 'I included safety notes, torque specs, or warnings where they matter.' },
  { id: 'steps', label: 'The guide has clear step-by-step instructions, not just a summary.' },
  { id: 'tools', label: 'The tool and parts lists are complete enough for someone to prepare.' },
];

export default function SubmitGuidePage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [generation, setGeneration] = useState('');
  const [system, setSystem] = useState('');
  const [content, setContent] = useState('');
  const [difficulty, setDifficulty] = useState('moderate');
  const [timeEstimate, setTimeEstimate] = useState('');
  const [tools, setTools] = useState('');
  const [parts, setParts] = useState('');
  const [existingGuides, setExistingGuides] = useState<PublicGuideSummary[]>([]);
  const [guideChecklist, setGuideChecklist] = useState<Record<string, boolean>>({});
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        const guidesResponse = await fetch('/api/guides');
        const guidesData = await guidesResponse.json();
        setExistingGuides(guidesData.guides || []);
      } catch {
        setExistingGuides([]);
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

  const toolsList = tools.split('\n').map((item) => item.trim()).filter(Boolean);
  const partsList = parts.split('\n').map((item) => item.trim()).filter(Boolean);
  const duplicateWarnings = existingGuides.filter((guide) => {
    const sameTitle = title.trim() && guide.title.toLowerCase() === title.trim().toLowerCase();
    const sameCategory = (!generation || guide.generation === generation) && (!system || guide.system === system);
    return sameTitle && sameCategory;
  });
  const checklistComplete = guideChecklistItems.every((item) => guideChecklist[item.id]);
  const contentTooShort = content.trim().length > 0 && content.trim().length < 200;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !generation || !system || !content) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    if (content.trim().length < 200) {
      setMessage({ type: 'error', text: 'Please add more detail. Guides should be at least 200 characters.' });
      return;
    }

    if (!checklistComplete) {
      setMessage({ type: 'error', text: 'Please complete the guide quality checklist before submitting.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          title,
          generation,
          system,
          content,
          difficulty,
          timeEstimate,
          tools: toolsList,
          parts: partsList,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Guide submitted! It will be visible once approved.' });
        setTitle('');
        setGeneration('');
        setSystem('');
        setContent('');
        setDifficulty('moderate');
        setTimeEstimate('');
        setTools('');
        setParts('');
        setGuideChecklist({});
      } else {
        setMessage({ type: 'error', text: data.error || 'Submission failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <header className="border-b border-vw-gold/25 bg-[linear-gradient(135deg,var(--vw-blue),var(--vw-dark))] py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-vw-gold-light">Community knowledge</p>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">Submit DIY Guide</h1>
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

  return (
    <div className="flex flex-col">
      <header className="border-b border-vw-gold/25 bg-[linear-gradient(135deg,var(--vw-blue),var(--vw-dark))] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-vw-gold-light">Community knowledge</p>
          <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl">Submit DIY Guide</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-vw-steel">
            Share your knowledge with the VW community.
          </p>
        </div>
      </header>

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="rounded-xl border border-vw-line bg-vw-paper p-5 shadow-[0_18px_45px_rgba(55,42,28,0.08)] sm:p-8">
            <aside className="mb-8 rounded-lg border border-vw-gold/35 bg-vw-gold/10 p-5">
              <h2 className="font-bold text-vw-blue">Before submitting</h2>
              <div className="mt-4 grid gap-4 text-sm leading-relaxed text-vw-muted md:grid-cols-2">
                <div>
                  <div className="font-semibold text-vw-dark">Required metadata</div>
                  <p>Title, generation, system, difficulty, and guide content are required.</p>
                </div>
                <div>
                  <div className="font-semibold text-vw-dark">Minimum detail</div>
                  <p>Write enough context for another owner to follow the repair safely.</p>
                </div>
                <div>
                  <div className="font-semibold text-vw-dark">Duplicate check</div>
                  <p>The form warns when a guide with the same title and category already exists.</p>
                </div>
                <div>
                  <div className="font-semibold text-vw-dark">After submission</div>
                  <p>Guides enter the admin moderation queue before appearing publicly.</p>
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
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Mk1 GTI Carburetor Rebuild Guide"
                  className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark placeholder:text-vw-muted/70 focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                  required
                />
                <p className="mt-2 text-sm text-vw-muted">
                  Use a specific title with generation, model, system, and task when possible.
                </p>
              </div>

              {duplicateWarnings.length > 0 && (
                <div className="rounded-md border border-vw-gold/45 bg-vw-gold/10 p-4">
                  <h3 className="font-semibold text-vw-dark">Possible duplicate</h3>
                  <p className="mt-1 text-sm text-vw-muted">
                    A similar approved guide already exists. Make sure your submission adds something useful.
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-vw-dark">
                    {duplicateWarnings.slice(0, 3).map((guide) => (
                      <li key={guide.id}>{guide.title}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-vw-dark">
                    Generation *
                  </label>
                  <select
                    value={generation}
                    onChange={(e) => setGeneration(e.target.value)}
                    className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                    required
                  >
                    <option value="">Select Generation</option>
                    {generations.map((gen) => (
                      <option key={gen.id} value={gen.id}>
                        {gen.name} ({gen.years})
                      </option>
                    ))}
                  </select>
                </div>

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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-vw-dark">
                    Difficulty *
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                    required
                  >
                    {difficulties.map((diff) => (
                      <option key={diff.id} value={diff.id}>
                        {diff.name} - {diff.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-vw-dark">
                    Time Estimate
                  </label>
                  <input
                    type="text"
                    value={timeEstimate}
                    onChange={(e) => setTimeEstimate(e.target.value)}
                    placeholder="e.g., 2-3 hours"
                    className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark placeholder:text-vw-muted/70 focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                  />
                  <p className="mt-2 text-sm text-vw-muted">
                    Include hands-on time, not shipping or parts-ordering time.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-vw-dark">
                  Content * (Markdown supported)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`# Introduction

Write your guide here...

## Tools Needed
- List tools needed

## Steps

### Step 1
1. First step
2. Second step

### Step 2
1. First step`}
                  rows={15}
                  className="w-full resize-y rounded-md border border-vw-line bg-vw-cream px-4 py-3 font-mono text-sm text-vw-dark placeholder:text-vw-muted/70 focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                  required
                />
                <p className="mt-2 text-sm text-vw-muted">
                  Use Markdown formatting for headings, lists, and bold text. Include symptoms, prep, steps, checks, and final verification.
                </p>
                {contentTooShort && (
                  <p className="mt-1 text-sm text-vw-red">
                    Add more detail before submitting. Current length: {content.trim().length}/200 characters.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-vw-dark">
                  Tool List (one per line)
                </label>
                <textarea
                  value={tools}
                  onChange={(e) => setTools(e.target.value)}
                  placeholder="Socket set
Torque wrench
Jack and jack stands"
                  rows={4}
                  className="w-full resize-y rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark placeholder:text-vw-muted/70 focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                />
                <p className="mt-2 text-sm text-vw-muted">
                  {toolsList.length} listed. Include specialty tools and safety equipment.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-vw-dark">
                  Parts List (one per line)
                </label>
                <textarea
                  value={parts}
                  onChange={(e) => setParts(e.target.value)}
                  placeholder="Brake pads
Brake fluid
Brake lines"
                  rows={4}
                  className="w-full resize-y rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark placeholder:text-vw-muted/70 focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                />
                <p className="mt-2 text-sm text-vw-muted">
                  {partsList.length} listed. Include fluids, seals, fasteners, and one-time-use hardware when relevant.
                </p>
              </div>

              <fieldset className="rounded-lg border border-vw-line bg-vw-cream p-5">
                <h3 className="font-bold text-vw-blue">Good guide checklist</h3>
                <div className="mt-3 space-y-3">
                  {guideChecklistItems.map((item) => (
                    <label key={item.id} className="flex items-start gap-3 rounded-md px-2 py-1 text-sm leading-relaxed text-vw-dark hover:bg-vw-gold/10">
                      <input
                        type="checkbox"
                        checked={Boolean(guideChecklist[item.id])}
                        onChange={(e) => setGuideChecklist({
                          ...guideChecklist,
                          [item.id]: e.target.checked,
                        })}
                        className="mt-1"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={submitting || !checklistComplete || contentTooShort}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Guide'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
