'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { localizedPath } from '@/lib/localization';

export default function SignupPage() {
  const { locale } = useLanguage();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 10 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      setError('Password must be at least 10 characters and include a letter and number');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', email, username, password }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.assign(localizedPath('/my-vw?welcome=1', locale));
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <header className="border-b border-vw-gold/25 bg-[linear-gradient(135deg,var(--vw-blue),var(--vw-dark))] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-vw-gold-light">Join the community</p>
          <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl">Create Account</h1>
          <p className="max-w-xl text-lg leading-relaxed text-vw-steel">
            Join the VW Repo community.
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
                  Email *
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
                  Username *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark shadow-inner shadow-vw-dark/5 focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-vw-dark">
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark shadow-inner shadow-vw-dark/5 focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                  required
                  minLength={10}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-vw-dark">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark shadow-inner shadow-vw-dark/5 focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <p className="mt-6 border-t border-vw-line pt-5 text-center text-sm text-vw-muted">
              Already have an account?{' '}
              <Link href={localizedPath('/login', locale)} className="font-semibold text-vw-link-blue underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
