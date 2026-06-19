import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { generations } from '@/data/generations';
import { diyGuides } from '@/data/diyGuides';
import { spanishGuideContent } from '@/data/diyGuides.es-MX';
import { getAllPdfs } from '@/data/pdfs';
import { PdfCard } from '@/components/PdfViewer';
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

  const guides = diyGuides.filter((guide) => guide.generation === generation.id && spanishGuideContent[guide.slug]);
  const relatedPdfs = (await getAllPdfs())
    .filter((pdf) => pdf.approved !== false && pdf.generation === generation.id)
    .slice(0, 6);
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Inicio', path: '/es-mx' },
    { name: generation.name, path },
  ]);

  return (
    <div className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <header className="bg-vw-blue py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-[1fr_360px] md:items-center sm:px-6 lg:px-8">
          <div>
            <nav aria-label="Migas de pan" className="mb-3 flex gap-2 text-sm text-gray-300">
              <Link href="/es-mx" className="hover:text-vw-gold">Inicio</Link><span>/</span><span className="text-vw-gold">{generation.name}</span>
            </nav>
            <h1 className="text-4xl font-bold text-white">Volkswagen {generation.name}</h1>
            <p className="mt-2 text-xl text-vw-gold">{generation.years}</p>
            <p className="mt-5 max-w-3xl text-gray-200">{generationDescriptionsEs[generation.slug]}</p>
          </div>
          <Image src={generation.image} alt={`Volkswagen ${generation.name}`} width={720} height={405} className="aspect-video w-full object-cover" priority />
        </div>
      </header>

      <section className="bg-gray-50 py-12" aria-labelledby="sistemas-generacion-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="sistemas-generacion-title" className="mb-6 text-2xl font-bold text-vw-blue">Sistemas</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {generation.systems.map((system) => (
              <Link key={system.id} href={toSpanishPath(`/systems/${system.slug}?gen=${generation.slug}`)} className="border bg-white p-5 text-center font-semibold text-vw-blue hover:border-vw-gold">
                {systemNamesEs[system.slug] || system.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {relatedPdfs.length > 0 && (
        <section className="bg-white py-12" aria-labelledby="pdfs-generacion-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 id="pdfs-generacion-title" className="text-2xl font-bold text-vw-blue">PDFs relacionados</h2>
              <Link href={toSpanishPath(`/library?generation=${generation.id}`)} className="font-medium text-vw-blue hover:underline">Ver todos</Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {relatedPdfs.map((pdf) => <PdfCard key={pdf.id} pdf={pdf} />)}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-12" aria-labelledby="modelos-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="modelos-title" className="mb-6 text-2xl font-bold text-vw-blue">Modelos</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {generation.models.map((model) => <li key={model} className="border bg-gray-50 px-4 py-3 font-medium">{model}</li>)}
          </ul>
        </div>
      </section>

      {guides.length > 0 && (
        <section className="bg-gray-50 py-12" aria-labelledby="guias-generacion-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="guias-generacion-title" className="mb-6 text-2xl font-bold text-vw-blue">Guías relacionadas</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => (
                <Link key={guide.id} href={toSpanishPath(`/guides/${guide.slug}`)} className="border bg-white p-5 font-semibold text-vw-blue hover:border-vw-gold hover:underline">
                  {spanishGuideContent[guide.slug].title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
