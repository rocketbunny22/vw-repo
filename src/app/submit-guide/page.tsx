'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generations } from '@/data/generations';
import { DiyGuide } from '@/types';
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
  const [existingGuides, setExistingGuides] = useState<DiyGuide[]>([]);
  const [guideChecklist, setGuideChecklist] = useState<Record<string, boolean>>({});
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth');
      const data = await response.json();
      
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
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void checkAuth();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

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
        <section className="bg-vw-blue py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-white">Submit DIY Guide</h1>
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

  return (
    <div className="flex flex-col">
      <section className="bg-vw-blue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-4">Submit DIY Guide</h1>
          <p className="text-xl text-gray-300">
            Share your knowledge with the VW community.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50 flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6 rounded-lg border border-vw-gold/50 bg-vw-gold/10 p-4">
              <h2 className="font-bold text-vw-blue">Before submitting</h2>
              <div className="mt-3 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
                <div>
                  <div className="font-medium text-gray-900">Required metadata</div>
                  <p>Title, generation, system, difficulty, and guide content are required.</p>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Minimum detail</div>
                  <p>Write enough context for another owner to follow the repair safely.</p>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Duplicate check</div>
                  <p>The form warns when a guide with the same title and category already exists.</p>
                </div>
                <div>
                  <div className="font-medium text-gray-900">After submission</div>
                  <p>Guides enter the admin moderation queue before appearing publicly.</p>
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
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Mk1 GTI Carburetor Rebuild Guide"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Use a specific title with generation, model, system, and task when possible.
                </p>
              </div>

              {duplicateWarnings.length > 0 && (
                <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4">
                  <h3 className="font-semibold text-yellow-900">Possible duplicate</h3>
                  <p className="mt-1 text-sm text-yellow-800">
                    A similar approved guide already exists. Make sure your submission adds something useful.
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-yellow-900">
                    {duplicateWarnings.slice(0, 3).map((guide) => (
                      <li key={guide.id}>{guide.title}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generation *
                  </label>
                  <select
                    value={generation}
                    onChange={(e) => setGeneration(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System *
                  </label>
                  <select
                    value={system}
                    onChange={(e) => setSystem(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Estimate
                  </label>
                  <input
                    type="text"
                    value={timeEstimate}
                    onChange={(e) => setTimeEstimate(e.target.value)}
                    placeholder="e.g., 2-3 hours"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Include hands-on time, not shipping or parts-ordering time.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue font-mono text-sm"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Use Markdown formatting for headings, lists, and bold text. Include symptoms, prep, steps, checks, and final verification.
                </p>
                {contentTooShort && (
                  <p className="mt-1 text-sm text-red-700">
                    Add more detail before submitting. Current length: {content.trim().length}/200 characters.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tool List (one per line)
                </label>
                <textarea
                  value={tools}
                  onChange={(e) => setTools(e.target.value)}
                  placeholder="Socket set
Torque wrench
Jack and jack stands"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {toolsList.length} listed. Include specialty tools and safety equipment.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parts List (one per line)
                </label>
                <textarea
                  value={parts}
                  onChange={(e) => setParts(e.target.value)}
                  placeholder="Brake pads
Brake fluid
Brake lines"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {partsList.length} listed. Include fluids, seals, fasteners, and one-time-use hardware when relevant.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="font-bold text-vw-blue">Good guide checklist</h3>
                <div className="mt-3 space-y-3">
                  {guideChecklistItems.map((item) => (
                    <label key={item.id} className="flex items-start gap-3 text-sm text-gray-700">
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
              </div>

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
      </section>
    </div>
  );
}
