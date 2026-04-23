'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

const difficulties = [
  { id: 'easy', name: 'Easy', description: 'Basic tools, no experience needed' },
  { id: 'moderate', name: 'Moderate', description: 'Some experience helpful' },
  { id: 'hard', name: 'Hard', description: 'Professional experience recommended' },
];

export default function SubmitGuidePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [generation, setGeneration] = useState('');
  const [system, setSystem] = useState('');
  const [content, setContent] = useState('');
  const [difficulty, setDifficulty] = useState('moderate');
  const [timeEstimate, setTimeEstimate] = useState('');
  const [tools, setTools] = useState('');
  const [parts, setParts] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth');
      const data = await response.json();
      
      if (!data.authenticated) {
        router.push('/login');
        return;
      }
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const toolsList = tools.split('\n').filter(t => t.trim());
    const partsList = parts.split('\n').filter(p => p.trim());

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
              </div>

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
                  Use Markdown formatting for headings, lists, and bold text
                </p>
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
              </div>

              <button
                type="submit"
                disabled={submitting}
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