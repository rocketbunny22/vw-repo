import type { Metadata } from 'next';
import Link from 'next/link';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Buscar en VW Repo',
  description: 'Busca manuales, guías, generaciones, sistemas y modelos Volkswagen.',
  path: '/es-mx/buscar',
  locale: 'es-MX',
  robots: { index: false, follow: true },
});

export default function SpanishSearchPage() {
  return (
    <div className="flex flex-col">
      <header className="bg-vw-blue py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white">Buscar en VW Repo</h1>
          <p className="mt-3 text-xl text-gray-300">Encuentra manuales, guías y datos técnicos Volkswagen.</p>
        </div>
      </header>
      <section className="flex-1 bg-gray-50 py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <form action="/search" method="get" className="flex flex-col gap-3 bg-white p-6 shadow-sm sm:flex-row">
            <label htmlFor="spanish-search" className="sr-only">Término de búsqueda</label>
            <input id="spanish-search" type="search" name="q" required placeholder="Motor, modelo, generación o manual" className="min-w-0 flex-1 border border-gray-300 px-4 py-3 text-gray-950 focus:border-vw-blue focus:outline-none" />
            <button type="submit" className="btn-primary px-7 py-3">Buscar</button>
          </form>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/es-mx/guias" className="font-medium text-vw-blue hover:underline">Explorar guías</Link>
            <Link href="/es-mx/biblioteca" className="font-medium text-vw-blue hover:underline">Explorar PDFs</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
