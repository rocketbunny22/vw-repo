'use client';

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body className="bg-[#f7f2e9] text-[#2d2a26]">
        <main className="flex min-h-screen items-center px-4 py-16 text-center sm:px-6">
          <title>Service unavailable | VW Repo</title>
          <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[#d8ccbd] bg-[#fffdf8] shadow-[0_18px_50px_rgba(55,42,28,0.08)]">
            <div className="h-1.5 bg-[#c58a3a]" aria-hidden="true" />
            <div className="px-6 py-12 sm:px-12 sm:py-14">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a94e3b]">Service interruption</p>
              <h1 className="mt-3 font-serif text-3xl font-bold text-[#102f43] sm:text-4xl">VW Repo is temporarily unavailable</h1>
              <p className="mx-auto mt-4 max-w-lg leading-7 text-[#71685f]">
                Please retry. If the data service is recovering, this page will return without data loss.
              </p>
              <button
                type="button"
                onClick={retry}
                className="mt-7 rounded-md border border-[#102f43] bg-[#102f43] px-6 py-3 font-semibold text-white shadow-[0_4px_12px_rgba(20,39,48,0.14)] transition-colors hover:bg-[#315b70]"
              >
                Try again
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
