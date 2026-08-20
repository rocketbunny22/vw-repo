import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import UiIcon from '@/components/UiIcon';
import { generations } from '@/data/generations';
import { getAllPdfs } from '@/data/pdfs';
import { PdfCard } from '@/components/PdfViewer';
import { toPublicPdfSummary } from '@/lib/publicSummaries';
import { breadcrumbJsonLd, createMetadata, jsonLd, truncateDescription } from '@/lib/seo';
import { englishGenerationSlug, englishSystemSlug, generationDescriptionsEs, systemNamesEs, systemSlugsEs, toSpanishPath } from '@/lib/localization';

export function generateStaticParams() {
  const slugs = new Set(generations.flatMap((generation) => generation.systems.map((system) => system.slug)));
  return Array.from(slugs).map((slug) => ({ slug: systemSlugsEs[slug] || slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ gen?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { gen } = await searchParams;
  const englishSlug = englishSystemSlug(slug);
  const name = systemNamesEs[englishSlug];
  if (!name) return { title: 'Sistema no encontrado', robots: { index: false, follow: false } };
  const generation = gen ? generations.find((item) => item.slug === englishGenerationSlug(gen)) : null;
  const title = generation ? `${name} del Volkswagen ${generation.name}` : `${name} Volkswagen`;

  return createMetadata({
    title,
    description: truncateDescription(`Información del ${name.toLowerCase()} Volkswagen por generación, con guías de reparación y recursos técnicos relacionados.`),
    path: toSpanishPath(generation ? `/systems/${englishSlug}?gen=${generation.slug}` : `/systems/${englishSlug}`),
    image: generation?.image,
    locale: 'es-MX',
  });
}

export default async function SpanishSystemPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ gen?: string }>;
}) {
  const { slug } = await params;
  const { gen } = await searchParams;
  const englishSlug = englishSystemSlug(slug);
  const name = systemNamesEs[englishSlug];
  if (!name) notFound();
  const canonicalSlug = systemSlugsEs[englishSlug] || englishSlug;
  if (slug !== canonicalSlug) {
    permanentRedirect(toSpanishPath(gen ? `/systems/${englishSlug}?gen=${englishGenerationSlug(gen)}` : `/systems/${englishSlug}`));
  }

  const availableGenerations = generations.filter((generation) => generation.systems.some((system) => system.slug === englishSlug));
  const selectedGeneration = gen ? availableGenerations.find((generation) => generation.slug === englishGenerationSlug(gen)) : null;
  const systemInfo = selectedGeneration?.systems.find((system) => system.slug === englishSlug) || availableGenerations[0]?.systems.find((system) => system.slug === englishSlug);
  const relatedPdfs = selectedGeneration
    ? (await getAllPdfs())
        .filter((pdf) => pdf.approved !== false && pdf.generation === selectedGeneration.id && pdf.system === englishSlug)
        .slice(0, 6)
        .map(toPublicPdfSummary)
    : [];
  const path = toSpanishPath(selectedGeneration ? `/systems/${englishSlug}?gen=${selectedGeneration.slug}` : `/systems/${englishSlug}`);
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Inicio', path: '/es-mx' },
    ...(selectedGeneration ? [{ name: selectedGeneration.name, path: toSpanishPath(`/generation/${selectedGeneration.slug}`) }] : []),
    { name, path },
  ]);

  return (
    <div className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <section className="bg-vw-blue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
            <Link href="/es-mx" className="hover:text-vw-gold">Inicio</Link>
            {selectedGeneration && (
              <>
                <span>/</span>
                <Link href={toSpanishPath(`/generation/${selectedGeneration.slug}`)} className="hover:text-vw-gold">{selectedGeneration.name}</Link>
              </>
            )}
            <span>/</span>
            <span className="text-vw-gold">{name}</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {selectedGeneration ? `${name} del Volkswagen ${selectedGeneration.name}` : `${name} Volkswagen`}
          </h1>
          <p className="text-xl text-gray-300">
            {selectedGeneration
              ? `${selectedGeneration.name} Volkswagen ${name.toLowerCase()}: ${systemInfo?.description || ''}`
              : `Información del ${name.toLowerCase()} Volkswagen en múltiples generaciones.`}
          </p>
        </div>
      </section>

      {selectedGeneration && systemInfo?.specs && (
        <section className="py-12 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-vw-blue mb-6">Especificaciones</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(systemInfo.specs).map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">{key}</div>
                  <div className="font-semibold text-vw-dark">{value as string}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedGeneration && systemInfo?.commonIssues && systemInfo.commonIssues.length > 0 && (
        <section className="py-12 bg-red-50 border-b">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Problemas comunes</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {systemInfo.commonIssues.map((issue: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <UiIcon name="warning" className="mt-1 h-4 w-4 shrink-0 text-red-600" />
                  <span className="text-gray-700">{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {selectedGeneration && systemInfo?.maintenanceTips && systemInfo.maintenanceTips.length > 0 && (
        <section className="py-12 bg-green-50 border-b">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-green-800 mb-4">Consejos de mantenimiento</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {systemInfo.maintenanceTips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {selectedGeneration && relatedPdfs.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-vw-blue">PDFs relacionados</h2>
              <Link href={toSpanishPath(`/library?generation=${selectedGeneration.id}&system=${englishSlug}`)} className="text-vw-blue hover:underline">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPdfs.slice(0, 3).map((pdf) => (
                <PdfCard key={pdf.id} pdf={pdf} />
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedGeneration && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-vw-blue">Guías de bricolaje</h2>
              <Link href={toSpanishPath(`/guides?generation=${selectedGeneration.id}&system=${englishSlug}`)} className="text-vw-blue hover:underline">
                Ver todos →
              </Link>
            </div>
            <p className="text-gray-600 mb-4">
              Consulta la página de guías de bricolaje para tutoriales paso a paso sobre {selectedGeneration.name} {systemInfo?.name}.
            </p>
            <Link href={toSpanishPath(`/guides?generation=${selectedGeneration.id}&system=${englishSlug}`)} className="btn-primary">
              Ver guías de {selectedGeneration.name} {systemInfo?.name}
            </Link>
          </div>
        </section>
      )}

      {selectedGeneration && relatedPdfs.length === 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-gray-600 mb-4">
              No se encontraron PDFs ni guías específicas para {selectedGeneration.name} {systemInfo?.name}.
            </p>
            <div className="flex gap-4">
              <Link href={toSpanishPath(`/library?generation=${selectedGeneration.id}`)} className="text-vw-blue hover:underline">
                Explorar PDFs de {selectedGeneration.name}
              </Link>
              <Link href={toSpanishPath(`/guides?generation=${selectedGeneration.id}`)} className="text-vw-blue hover:underline">
                Explorar guías de {selectedGeneration.name}
              </Link>
            </div>
          </div>
        </section>
      )}

      {!selectedGeneration && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-vw-blue mb-6">
              {name} en todas las generaciones
            </h2>
            <div className="space-y-6">
              {availableGenerations.map((generation, index) => (
                <Link
                  key={`${generation.slug}-${index}`}
                  href={toSpanishPath(`/systems/${englishSlug}?gen=${generation.slug}`)}
                  className="block bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-vw-blue">{generation.name}</h3>
                      <p className="text-gray-600 mt-1 line-clamp-2">{generationDescriptionsEs[generation.slug]}</p>
                    </div>
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
