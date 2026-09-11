import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { diyGuides } from '@/data/diyGuides';
import { spanishGuideContent } from '@/data/diyGuides.es-MX';
import { generations } from '@/data/generations';
import { getAllPdfs } from '@/data/pdfs';
import { PdfCard } from '@/components/PdfViewer';
import { toPublicPdfSummary } from '@/lib/publicSummaries';
import { isRedisUnavailableError } from '@/lib/redis';
import { absoluteUrl, breadcrumbJsonLd, createMetadata, jsonLd, siteName, truncateDescription } from '@/lib/seo';
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
    description: truncateDescription(`Recursos de reparación para Volkswagen ${generation.name} ${generation.years}: ${generation.models.join(', ')}. Consulta sistemas, problemas, guías y manuales PDF.`),
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

  const { pdfs: relatedPdfs, unavailable: pdfsUnavailable } = await getApprovedPdfs(generation.id, generation.slug);
  const relatedGuides = diyGuides.filter((guide) => (
    guide.generation === generation.id && Boolean(spanishGuideContent[guide.slug])
  ));
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Inicio', path: '/es-mx' },
    { name: generation.name, path },
  ]);
  const generationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    inLanguage: 'es-MX',
    name: `Volkswagen ${generation.name} ${generation.years}`,
    description: generationDescriptionsEs[generation.slug],
    url: absoluteUrl(path),
    image: absoluteUrl(generation.image),
    isPartOf: { '@type': 'WebSite', name: siteName, url: absoluteUrl('/es-mx') },
    about: generation.models.map((model) => ({ '@type': 'Car', name: `Volkswagen ${model} ${generation.name}` })),
    hasPart: relatedGuides.map((guide) => ({
        '@type': 'TechArticle',
        name: spanishGuideContent[guide.slug].title,
        url: absoluteUrl(toSpanishPath(`/guides/${guide.slug}`)),
      })),
  };

  return (
    <div className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(generationJsonLd) }} />
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

      <section className="border-b border-vw-line bg-vw-cream px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl border-l-4 border-vw-gold pl-5">
            <h2 className="text-2xl font-bold text-vw-blue">Información de reparación del Volkswagen {generation.name}</h2>
            <p className="mt-3 text-lg leading-relaxed text-vw-muted">{generationDescriptionsEs[generation.slug]}</p>
            <p className="mt-3 leading-relaxed text-vw-muted">
              Este archivo cubre los modelos {generation.models.map((model) => `Volkswagen ${model}`).join(', ')}
              {' '}de {generation.years}, con especificaciones por sistema, problemas conocidos, consejos de mantenimiento,
              guías paso a paso y manuales PDF disponibles.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-vw-surface px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="mb-2 text-2xl font-bold text-vw-blue">Sistemas del Volkswagen {generation.name}</h2>
          <p className="mb-6 max-w-3xl text-vw-muted">Elige un sistema para consultar especificaciones, problemas comunes, mantenimiento, manuales y recursos de reparación de esta generación.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {generation.systems.map((system, index) => (
              <Link key={system.id} href={toSpanishPath(`/systems/${system.slug}?gen=${generation.slug}`)} className="group block rounded-xl border border-vw-line bg-vw-paper p-6 shadow-[0_8px_22px_rgba(55,42,28,0.05)] transition-all hover:-translate-y-0.5 hover:border-vw-gold/60 hover:shadow-[0_14px_32px_rgba(55,42,28,0.09)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-vw-gold/35 bg-vw-gold/10 text-vw-blue transition-colors group-hover:bg-vw-gold/20"><span className="font-bold">{index + 1}</span></div>
                  <div>
                    <h3 className="font-bold text-vw-dark">{systemNamesEs[system.slug] || system.name} del Volkswagen {generation.name}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-vw-muted">
                      Especificaciones, problemas comunes, mantenimiento, guías y manuales de {systemNamesEs[system.slug]?.toLowerCase() || system.name.toLowerCase()}.
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {relatedGuides.length > 0 && (
        <section className="border-t border-vw-line bg-vw-paper px-4 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-vw-blue">Guías de reparación del Volkswagen {generation.name}</h2>
                <p className="mt-1 text-vw-muted">Procedimientos paso a paso de reparación y mantenimiento para esta generación.</p>
              </div>
              <Link href={toSpanishPath(`/guides?generation=${generation.id}`)} className="shrink-0 font-medium text-vw-link-blue hover:underline">Ver todas →</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {relatedGuides.map((guide) => (
                <article key={guide.id} className="rounded-xl border border-vw-line bg-vw-cream p-5">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="badge badge-gold">{systemNamesEs[guide.system] || guide.system}</span>
                    <span className="badge badge-gray">{guide.difficulty}</span>
                  </div>
                  <h3 className="text-lg font-bold text-vw-blue">
                    <Link href={toSpanishPath(`/guides/${guide.slug}`)} className="hover:underline">{spanishGuideContent[guide.slug].title}</Link>
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

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

      {pdfsUnavailable && (
        <section className="border-t border-vw-line bg-vw-cream px-4 py-8">
          <div className="mx-auto max-w-7xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
            El inventario de manuales no está disponible temporalmente. Las especificaciones y guías de esta generación siguen disponibles.
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

async function getApprovedPdfs(generationId: string, generationSlug: string) {
  try {
    const pdfs = (await getAllPdfs())
      .filter((pdf) => pdf.approved !== false && (pdf.generation === generationId || pdf.generation === generationSlug))
      .map(toPublicPdfSummary);
    return { pdfs, unavailable: false };
  } catch (error) {
    if (!isRedisUnavailableError(error)) throw error;
    return { pdfs: [], unavailable: true };
  }
}
