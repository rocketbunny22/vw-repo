'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error('Application error', error.digest || error.name);
  }, [error]);

  return (
    <section className="flex min-h-[60vh] items-center bg-vw-surface/70 px-4 py-16 sm:px-6">
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-vw-line bg-vw-paper text-center shadow-[0_18px_50px_rgba(55,42,28,0.08)]">
        <div className="h-1.5 bg-vw-gold" aria-hidden="true" />
        <div className="px-6 py-12 sm:px-12 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-vw-red">A hitch in the workshop</p>
          <h1 className="mt-3 text-3xl font-bold text-vw-blue sm:text-4xl">This page could not be loaded</h1>
          <p className="mx-auto mt-4 max-w-lg leading-7 text-vw-muted">
            A required service may be temporarily unavailable. Your submitted data has not been discarded.
          </p>
          <button type="button" onClick={retry} className="btn-primary mt-7 px-6 py-3">
            Try again
          </button>
        </div>
      </div>
    </section>
  );
}
