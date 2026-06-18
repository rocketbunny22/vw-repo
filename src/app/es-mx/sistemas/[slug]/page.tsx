import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { generations } from '@/data/generations';
import { diyGuides } from '@/data/diyGuides';
import { spanishGuideContent } from '@/data/diyGuides.es-MX';
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
  const guides = diyGuides.filter((guide) => guide.system === englishSlug && spanishGuideContent[guide.slug] && (!selectedGeneration || guide.generation === selectedGeneration.id));
  const path = toSpanishPath(selectedGeneration ? `/systems/${englishSlug}?gen=${selectedGeneration.slug}` : `/systems/${englishSlug}`);
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Inicio', path: '/es-mx' },
    ...(selectedGeneration ? [{ name: selectedGeneration.name, path: toSpanishPath(`/generation/${selectedGeneration.slug}`) }] : []),
    { name, path },
  ]);

  return (
    <div className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <header className="bg-vw-blue py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Migas de pan" className="mb-3 flex flex-wrap gap-2 text-sm text-gray-300">
            <Link href="/es-mx" className="hover:text-vw-gold">Inicio</Link>
            {selectedGeneration && <><span>/</span><Link href={toSpanishPath(`/generation/${selectedGeneration.slug}`)} className="hover:text-vw-gold">{selectedGeneration.name}</Link></>}
            <span>/</span><span className="text-vw-gold">{name}</span>
          </nav>
          <h1 className="text-4xl font-bold text-white">{selectedGeneration ? `${name} del Volkswagen ${selectedGeneration.name}` : `${name} Volkswagen`}</h1>
          <p className="mt-4 max-w-3xl text-xl text-gray-300">
            {selectedGeneration ? `Recursos técnicos y guías relacionadas con ${name.toLowerCase()} para la generación ${selectedGeneration.name}.` : `Compara información y recursos de ${name.toLowerCase()} entre generaciones Volkswagen.`}
          </p>
        </div>
      </header>

      <section className="bg-gray-50 py-12" aria-labelledby="generaciones-sistema-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="generaciones-sistema-title" className="mb-6 text-2xl font-bold text-vw-blue">Generaciones disponibles</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableGenerations.map((generation) => (
              <Link key={generation.id} href={toSpanishPath(`/systems/${englishSlug}?gen=${generation.slug}`)} className="border bg-white p-5 hover:border-vw-gold">
                <h3 className="font-bold text-vw-blue">{generation.name} · {generation.years}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">{generationDescriptionsEs[generation.slug]}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {guides.length > 0 && (
        <section className="bg-white py-12" aria-labelledby="guias-sistema-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="guias-sistema-title" className="mb-6 text-2xl font-bold text-vw-blue">Guías relacionadas</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => <Link key={guide.id} href={toSpanishPath(`/guides/${guide.slug}`)} className="border bg-gray-50 p-5 font-semibold text-vw-blue hover:border-vw-gold hover:underline">{spanishGuideContent[guide.slug].title}</Link>)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
