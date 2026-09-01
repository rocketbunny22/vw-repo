'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error('Application error', error.digest || error.name);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-vw-blue">This page could not be loaded</h1>
      <p className="mt-4 text-gray-700">
        A required service may be temporarily unavailable. Your submitted data has not been discarded.
      </p>
      <button type="button" onClick={retry} className="btn-primary mt-6 px-6 py-3">
        Try again
      </button>
    </section>
  );
}
