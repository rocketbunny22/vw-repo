import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { generations } from '@/data/generations';
import { getAllPdfs } from '@/data/pdfs';
import { PdfCard } from '@/components/PdfViewer';
import { toPublicPdfSummary } from '@/lib/publicSummaries';
import { breadcrumbJsonLd, createMetadata, jsonLd, truncateDescription } from '@/lib/seo';
import { englishGenerationSlug, generationDescriptionsEs, generationSlugsEs, systemNamesEs, toSpanishPath } from '@/lib/localization';

export function generateStaticParams() {
  return generations.map((generation) => ({ slug: generationSlugsEs[generation.slug] }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const generation = generations.find((item) => item.slug === englishGenerationSlug(slug));
  if (!generation) return { title: 'Generación no encontrada', robots: { index: false, follow: false } };

  return createMetadata({
    title: `Volkswagen ${generation.name}: guías, sistemas y manuales`,
    description: truncateDescription(`${generationDescriptionsEs[generation.slug]} Consulta modelos, sistemas, guías y recursos técnicos.`),
    path: toSpanishPath(`/generation/${generation.slug}`),
    image: generation.image,
    locale: 'es-MX',
  });
}

export default async function SpanishGenerationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const generation = generations.find((item) => item.slug === englishGenerationSlug(slug));
  if (!generation) notFound();
  const path = toSpanishPath(`/generation/${generation.slug}`);
  if (slug !== generationSlugsEs[generation.slug]) permanentRedirect(path);

  const relatedPdfs = (await getAllPdfs())
    .filter((pdf) => pdf.approved !== false && (pdf.generation === generation.id || pdf.generation === generation.slug))
    .map(toPublicPdfSummary);
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Inicio', path: '/es-mx' },
    { name: generation.name, path },
  ]);

  return (
    <div className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <section className="border-b border-vw-gold/35 bg-[linear-gradient(135deg,var(--vw-dark),var(--vw-blue))] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 text-sm text-gray-300 mb-2">
            <Link href="/es-mx" className="hover:text-vw-gold">Inicio</Link>
            <span>/</span>
            <span className="text-vw-gold">{generation.name}</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Volkswagen {generation.name}</h1>
          <p className="text-xl text-vw-steel">{generation.years}</p>
        </div>
      </section>

      <section className="border-b border-vw-line bg-vw-paper py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-3 md:divide-x md:divide-vw-line">
            <div><div className="text-2xl font-bold text-vw-blue">{generation.systems.length}</div><div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-vw-muted">Sistemas</div></div>
            <div><div className="text-2xl font-bold text-vw-blue">{generation.models.length}</div><div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-vw-muted">Modelos</div></div>
            <div><div className="text-2xl font-bold text-vw-blue">{relatedPdfs.length}</div><div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-vw-muted">PDFs</div></div>
          </div>
        </div>
      </section>

      <section className="bg-vw-surface px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-vw-blue mb-6">Sistemas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {generation.systems.map((system, index) => (
              <Link key={system.id} href={toSpanishPath(`/systems/${system.slug}?gen=${generation.slug}`)} className="group block rounded-xl border border-vw-line bg-vw-paper p-6 text-center shadow-[0_8px_22px_rgba(55,42,28,0.05)] transition-all hover:-translate-y-0.5 hover:border-vw-gold/60 hover:shadow-[0_14px_32px_rgba(55,42,28,0.09)]">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-vw-gold/35 bg-vw-gold/10 text-vw-blue transition-colors group-hover:bg-vw-gold/20"><span className="font-bold">{index + 1}</span></div>
                <h3 className="font-bold text-vw-dark">{systemNamesEs[system.slug] || system.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {relatedPdfs.length > 0 && (
        <section className="border-t border-vw-line bg-vw-cream px-4 py-12" aria-labelledby="pdfs-generacion-title">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <h2 id="pdfs-generacion-title" className="text-2xl font-bold text-vw-blue">PDFs relacionados</h2>
                <p className="mt-1 text-vw-muted">Documentos subidos para {generation.name}.</p>
              </div>
              <Link href={toSpanishPath(`/library?generation=${generation.id}`)} className="text-vw-blue hover:underline">
                Ver todos los PDFs →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPdfs.slice(0, 6).map((pdf) => (
                <PdfCard key={pdf.id} pdf={pdf} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-vw-line bg-vw-paper px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-vw-blue mb-6">Modelos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {generation.models.map((model) => (
              <div key={model} className="flex items-center rounded-lg border border-vw-line bg-vw-cream p-4 text-vw-dark">
                <span className="font-medium">{model}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
