import type { Metadata } from 'next';
import Link from 'next/link';
import { diyGuides } from '@/data/diyGuides';
import { spanishGuideContent } from '@/data/diyGuides.es-MX';
import { getUserGuides } from '@/data/guides';
import { generations } from '@/data/generations';
import { createMetadata } from '@/lib/seo';
import { difficultyNamesEs, formatTimeEstimateEs, systemNamesEs, toSpanishPath } from '@/lib/localization';

export const metadata: Metadata = createMetadata({
  title: 'Guías de reparación Volkswagen',
  description: 'Guías Volkswagen paso a paso en español con herramientas, refacciones, dificultad y tiempo estimado.',
  path: '/es-mx/guias',
  locale: 'es-MX',
});

export const dynamic = 'force-dynamic';

export default async function SpanishGuidesPage() {
  const userGuides = (await getUserGuides()).filter((guide) => guide.approved);
  const guides = [
    ...diyGuides.filter((guide) => spanishGuideContent[guide.slug]),
    ...userGuides,
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-vw-blue py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold text-white">Guías de reparación Volkswagen</h1>
          <p className="max-w-3xl text-xl text-gray-300">Procedimientos paso a paso para mantener, reparar y mejorar tu Volkswagen.</p>
        </div>
      </section>
      <section className="flex-1 bg-gray-50 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-2 lg:grid-cols-3 sm:px-6 lg:px-8">
          {guides.map((guide) => {
            const translated = spanishGuideContent[guide.slug] || guide;
            const generation = generations.find((item) => item.id === guide.generation);
            return (
              <article key={guide.id} className="border bg-white p-6 shadow-sm">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="badge badge-blue">{generation?.name}</span>
                  <span className="badge badge-gold">{systemNamesEs[guide.system] || guide.system}</span>
                  <span className="badge bg-gray-100 text-gray-700">{difficultyNamesEs[guide.difficulty] || guide.difficulty}</span>
                </div>
                <h2 className="text-xl font-bold text-vw-blue">
                  <Link href={toSpanishPath(`/guides/${guide.slug}`)} className="hover:underline">{translated.title}</Link>
                </h2>
                <p className="mt-3 text-sm text-gray-600">Por {guide.author} · {formatTimeEstimateEs(guide.timeEstimate)}</p>
                <Link href={toSpanishPath(`/guides/${guide.slug}`)} className="mt-5 inline-block font-medium text-vw-blue hover:underline">Leer guía</Link>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
