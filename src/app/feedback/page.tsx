'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { localizedPath } from '@/lib/localization';

export default function FeedbackPage() {
  const { locale } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, category, message }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit feedback');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col">
        <header className="border-b border-vw-gold/25 bg-[linear-gradient(135deg,var(--vw-blue),var(--vw-dark))] py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-vw-gold-light">Message received</p>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">Thank You!</h1>
          </div>
        </header>
        <main className="flex-1 py-12 sm:py-16">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-vw-line bg-vw-paper p-8 text-center shadow-[0_18px_45px_rgba(55,42,28,0.08)]">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-vw-gold/35 bg-vw-gold/10 text-xl text-vw-blue" aria-hidden="true">✓</div>
              <p className="mb-6 text-lg leading-relaxed text-vw-dark">
                Your feedback has been submitted. We appreciate your input!
              </p>
              <Link href={localizedPath('/', locale)} className="font-semibold text-vw-link-blue underline-offset-4 hover:underline">
                Return to Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <header className="border-b border-vw-gold/25 bg-[linear-gradient(135deg,var(--vw-blue),var(--vw-dark))] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-vw-gold-light">Help shape the archive</p>
          <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl">Submit Feedback</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-vw-steel">
            Help us improve VW Repo. Share your thoughts, suggestions, or report issues.
          </p>
        </div>
      </header>

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="rounded-xl border border-vw-line bg-vw-paper p-6 shadow-[0_18px_45px_rgba(55,42,28,0.08)] sm:p-8">
            {error && (
              <div className="mb-6 rounded-md border border-vw-red/25 bg-vw-red/10 p-4 text-vw-red" role="alert">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-vw-dark">
                  Name (optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark placeholder:text-vw-muted/70 focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-vw-dark">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark placeholder:text-vw-muted/70 focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-vw-dark">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                  required
                >
                  <option value="general">General Feedback</option>
                  <option value="bug">Report a Bug</option>
                  <option value="suggestion">Feature Suggestion</option>
                  <option value="content">Content Correction</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-vw-dark">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full resize-y rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark placeholder:text-vw-muted/70 focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                  placeholder="Tell us what you think..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
