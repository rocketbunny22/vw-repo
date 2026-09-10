'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { localizedPath } from '@/lib/localization';

function ResetPasswordForm() {
  const router = useRouter();
  const { locale } = useLanguage();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 10 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('Password must be at least 10 characters and include a letter and number');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resetConfirm', token, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push(localizedPath('/login', locale)), 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border border-[#55745d]/30 bg-vw-paper p-8 text-center shadow-[0_18px_45px_rgba(55,42,28,0.08)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#55745d]/10 text-xl text-[#3f6549]" aria-hidden="true">✓</div>
        <p className="mb-4 text-lg font-semibold text-[#3f6549]">Password reset successful!</p>
        <p className="text-vw-muted">Redirecting to login...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="rounded-xl border border-vw-red/25 bg-vw-paper p-8 text-center shadow-[0_18px_45px_rgba(55,42,28,0.08)]">
        <p className="text-lg font-semibold text-vw-red">Invalid reset link</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-vw-line bg-vw-paper p-6 shadow-[0_18px_45px_rgba(55,42,28,0.08)] sm:p-8">
      {error && (
        <div className="mb-6 rounded-md border border-vw-red/25 bg-vw-red/10 p-4 text-vw-red" role="alert">{error}</div>
      )}

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-vw-dark">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark shadow-inner shadow-vw-dark/5 focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
            required
            minLength={10}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-vw-dark">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-3 text-vw-dark shadow-inner shadow-vw-dark/5 focus:border-vw-gold focus:ring-2 focus:ring-vw-gold/20"
            required
            minLength={10}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 text-lg disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col">
      <header className="border-b border-vw-gold/25 bg-[linear-gradient(135deg,var(--vw-blue),var(--vw-dark))] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-vw-gold-light">Account security</p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Reset Password</h1>
        </div>
      </header>

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<div className="rounded-xl border border-vw-line bg-vw-paper p-8 text-vw-muted shadow-[0_18px_45px_rgba(55,42,28,0.08)]">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
