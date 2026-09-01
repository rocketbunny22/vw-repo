'use client';

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 text-center">
          <title>Service unavailable | VW Repo</title>
          <h1 className="text-3xl font-bold">VW Repo is temporarily unavailable</h1>
          <p className="mt-4">Please retry. If the data service is recovering, this page will return without data loss.</p>
          <button type="button" onClick={retry} className="mt-6 rounded-md bg-blue-800 px-6 py-3 text-white">
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
