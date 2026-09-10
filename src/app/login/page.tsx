'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { localizedPath } from '@/lib/localization';

export default function LoginPage() {
  const { locale } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.assign(localizedPath('/profile', locale));
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resetRequest', email, locale }),
      });

      const data = await response.json();
      if (data.success) {
        setResetSent(true);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="flex flex-col">
        <header className="border-b border-vw-gold/25 bg-[linear-gradient(135deg,var(--vw-blue),var(--vw-dark))] py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-vw-gold-light">Account access</p>
            <h1 className="text-4xl font-bold text-white">Reset Password</h1>
          </div>
        </header>
        <main className="flex-1 py-12 sm:py-16">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-vw-line bg-vw-paper p-8 text-center shadow-[0_18px_45px_rgba(55,42,28,0.08)]">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-vw-gold/35 bg-vw-gold/10 text-xl text-vw-blue" aria-hidden="true">✓</div>
              <p className="mb-6 text-lg leading-relaxed text-vw-dark">
                If that email exists, a reset link has been sent.
              </p>
              <Link href={localizedPath('/login', locale)} className="font-semibold text-vw-link-blue underline-offset-4 hover:underline">
                Back to login
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="flex flex-col">
        <header className="border-b border-vw-gold/25 bg-[linear-gradient(135deg,var(--vw-blue),var(--vw-dark))] py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-vw-gold-light">Account access</p>
            <h1 className="text-4xl font-bold text-white">Reset Password</h1>
          </div>
        </header>
        <main className="flex-1 py-12 sm:py-16">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleForgotPassword} className="rounded-xl border border-vw-line bg-vw-paper p-6 shadow-[0_18px_45px_rgba(55,42,28,0.08)] sm:p-8">
              {error && (
                <div className="mb-6 rounded-md border border-vw-red/25 bg-vw-red/10 p-4 text-vw-red" role="alert">{error}</div>
              )}
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-vw-dark">
                    Enter your email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark shadow-inner shadow-vw-dark/5 focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-lg disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
              <p className="mt-6 text-center text-sm text-vw-muted">
                <button type="button" onClick={() => setShowForgotPassword(false)} className="font-semibold text-vw-link-blue underline-offset-4 hover:underline">
                  Back to login
                </button>
              </p>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <header className="border-b border-vw-gold/25 bg-[linear-gradient(135deg,var(--vw-blue),var(--vw-dark))] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-vw-gold-light">Your garage</p>
          <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl">Sign In</h1>
          <p className="max-w-xl text-lg leading-relaxed text-vw-steel">
            Welcome back to VW Repo.
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
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark shadow-inner shadow-vw-dark/5 focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-vw-dark">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark shadow-inner shadow-vw-dark/5 focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-vw-muted">
              <button type="button" onClick={() => setShowForgotPassword(true)} className="font-semibold text-vw-link-blue underline-offset-4 hover:underline">
                Forgot password?
              </button>
            </p>
            <p className="mt-4 border-t border-vw-line pt-5 text-center text-sm text-vw-muted">
              Don&apos;t have an account?{' '}
              <Link href={localizedPath('/signup', locale)} className="font-semibold text-vw-link-blue underline-offset-4 hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
