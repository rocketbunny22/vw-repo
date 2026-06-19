import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPdfs } from '@/data/pdfs';
import { generations } from '@/data/generations';
import { createMetadata } from '@/lib/seo';
import { systemNamesEs } from '@/lib/localization';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createMetadata({
  title: 'Biblioteca de manuales PDF Volkswagen',
  description: 'Consulta y descarga manuales, diagramas y documentos técnicos Volkswagen organizados por generación y sistema.',
  path: '/es-mx/biblioteca',
  locale: 'es-MX',
});

export default async function SpanishLibraryPage() {
  const pdfs = (await getAllPdfs()).filter((pdf) => pdf.approved !== false);

  return (
    <div className="flex flex-col">
      <header className="bg-vw-blue py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white">Biblioteca de manuales PDF</h1>
          <p className="mt-4 max-w-3xl text-xl text-gray-300">Documentos técnicos Volkswagen organizados por generación y sistema.</p>
        </div>
      </header>
      <section className="flex-1 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {pdfs.length === 0 ? (
            <p className="border bg-white p-6 text-gray-600">Todavía no hay documentos PDF aprobados.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pdfs.map((pdf) => {
                const generation = generations.find((item) => item.id === pdf.generation || item.slug === pdf.generation);
                return (
                  <article key={pdf.id} className="border bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-vw-blue">{pdf.title}</h2>
                    {pdf.description && <p className="mt-2 line-clamp-3 text-sm text-gray-600">{pdf.description}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="badge badge-blue">{generation?.name || pdf.generation}</span>
                      <span className="badge badge-gold">{systemNamesEs[pdf.system] || pdf.system}</span>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <a href={pdf.url} download className="btn-primary">Descargar</a>
                      <a href={`${pdf.url}?view=true`} target="_blank" rel="noreferrer" className="btn-secondary">Abrir</a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          <Link href="/es-mx/guias" className="mt-8 inline-block font-medium text-vw-blue hover:underline">Explorar guías de reparación</Link>
        </div>
      </section>
    </div>
  );
}
