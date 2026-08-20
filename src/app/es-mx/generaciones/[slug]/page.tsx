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
      <section className="bg-vw-blue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 text-sm text-gray-300 mb-2">
            <Link href="/es-mx" className="hover:text-vw-gold">Inicio</Link>
            <span>/</span>
            <span className="text-vw-gold">{generation.name}</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Volkswagen {generation.name}</h1>
          <p className="text-xl text-gray-300">{generation.years}</p>
        </div>
      </section>

      <section className="bg-vw-gold py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div><div className="text-2xl font-bold text-vw-blue">{generation.systems.length}</div><div className="text-sm text-vw-dark">Sistemas</div></div>
            <div><div className="text-2xl font-bold text-vw-blue">{generation.models.length}</div><div className="text-sm text-vw-dark">Modelos</div></div>
            <div><div className="text-2xl font-bold text-vw-blue">{relatedPdfs.length}</div><div className="text-sm text-vw-dark">PDFs</div></div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-vw-blue mb-6">Sistemas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {generation.systems.map((system, index) => (
              <Link key={system.id} href={toSpanishPath(`/systems/${system.slug}?gen=${generation.slug}`)} className="block p-6 bg-white rounded-lg shadow hover:shadow-xl border hover:border-vw-gold text-center">
                <div className="w-12 h-12 bg-vw-blue rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-white font-bold">{index + 1}</span></div>
                <h3 className="font-bold text-vw-dark">{systemNamesEs[system.slug] || system.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {relatedPdfs.length > 0 && (
        <section className="py-12 px-4 bg-white border-t" aria-labelledby="pdfs-generacion-title">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <h2 id="pdfs-generacion-title" className="text-2xl font-bold text-vw-blue">PDFs relacionados</h2>
                <p className="text-gray-600 mt-1">Documentos subidos para {generation.name}.</p>
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

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-vw-blue mb-6">Modelos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {generation.models.map((model) => (
              <div key={model} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">{model}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
