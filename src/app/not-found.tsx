import Link from 'next/link';
import { generations } from '@/data/generations';

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-vw-surface/70 px-4 py-16 sm:px-6">
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-vw-line bg-vw-paper text-center shadow-[0_18px_50px_rgba(55,42,28,0.08)]">
        <div className="border-b border-vw-line bg-vw-cream px-6 py-10 sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-vw-red">Wrong turn</p>
          <div className="mt-2 text-7xl font-bold text-vw-gold sm:text-8xl" aria-hidden="true">404</div>
          <h1 className="mt-2 text-4xl font-bold text-vw-blue sm:text-5xl">Page Not Found</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-vw-muted">
            The page you&apos;re looking for may have moved. Let&apos;s get you back to the archive.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="btn-primary px-8 py-3 text-base">
              Go Home
            </Link>
            <Link href="/search" className="btn-secondary px-8 py-3 text-base">
              Search the Archive
            </Link>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10">
          <h2 className="text-xl font-bold text-vw-blue">Browse by generation</h2>
          <nav aria-label="Popular Volkswagen generations" className="mt-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {generations.slice(0, 6).map((gen) => (
                <Link
                  key={gen.id}
                  href={`/generation/${gen.slug}`}
                  className="rounded-lg border border-vw-line bg-vw-cream px-4 py-3 text-sm font-semibold text-vw-blue transition-colors hover:border-vw-gold/60 hover:bg-vw-gold/10"
                >
                  {gen.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
}
