import type { Metadata } from 'next';
import Link from 'next/link';
import { diyGuides } from '@/data/diyGuides';
import { generations } from '@/data/generations';
import { getAllPdfs } from '@/data/pdfs';
import { notFound } from 'next/navigation';
import { PdfCard } from '@/components/PdfViewer';
import { toPublicPdfSummary } from '@/lib/publicSummaries';
import { isRedisUnavailableError } from '@/lib/redis';
import { absoluteUrl, breadcrumbJsonLd, createMetadata, jsonLd, siteName, truncateDescription } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return generations.map((generation) => ({ slug: generation.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const generation = generations.find((g) => g.slug === slug);

  if (!generation) {
    return {
      title: 'Volkswagen Generation Not Found',
      robots: { index: false, follow: false },
    };
  }

  return createMetadata({
    title: `${generation.name} Volkswagen ${generation.years} Guides, Specs & Manuals`,
    description: truncateDescription(
      `${generation.name} Volkswagen ${generation.years} repair resources for ${generation.models.join(', ')}. Browse system specs, common issues, DIY guides, and PDF manuals.`
    ),
    path: `/generation/${generation.slug}`,
    image: generation.image,
  });
}

export default async function GenerationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const generation = generations.find((g) => g.slug === slug);
  
  if (!generation) notFound();

  const { pdfs, unavailable: pdfsUnavailable } = await getApprovedPdfs();
  const relatedPdfs = pdfs.filter(
    (pdf) => pdf.generation === generation.id || pdf.generation === generation.slug
  );
  const relatedGuides = diyGuides.filter((guide) => guide.generation === generation.id);
  const pageUrl = absoluteUrl(`/generation/${generation.slug}`);
  const generationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${generation.name} Volkswagen ${generation.years}`,
    description: generation.description,
    url: pageUrl,
    image: absoluteUrl(generation.image),
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: absoluteUrl('/'),
    },
    about: generation.models.map((model) => ({
      '@type': 'Car',
      name: `${generation.name} Volkswagen ${model}`,
    })),
    hasPart: [
      ...generation.systems.map((system) => ({
        '@type': 'TechArticle',
        name: `${generation.name} Volkswagen ${system.name}`,
        url: absoluteUrl(`/systems/${system.slug}?gen=${generation.slug}`),
      })),
      ...relatedGuides.map((guide) => ({
        '@type': 'TechArticle',
        name: guide.title,
        url: absoluteUrl(`/guides/${guide.slug}`),
      })),
    ],
  };
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: generation.name, path: `/generation/${generation.slug}` },
  ]);
  
  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(generationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
      />
      <section className="border-b border-vw-gold/35 bg-[linear-gradient(135deg,var(--vw-dark),var(--vw-blue))] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 text-sm text-gray-300 mb-2">
            <Link href="/" className="hover:text-vw-gold">Home</Link>
            <span>/</span>
            <span className="text-vw-gold">{generation.name}</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{generation.name}</h1>
          <p className="text-xl text-vw-steel">{generation.years}</p>
        </div>
      </section>

      <section className="border-b border-vw-line bg-vw-paper py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-3 md:divide-x md:divide-vw-line">
            <div><div className="text-2xl font-bold text-vw-blue">{generation.systems.length}</div><div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-vw-muted">Systems</div></div>
            <div><div className="text-2xl font-bold text-vw-blue">{generation.models.length}</div><div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-vw-muted">Models</div></div>
            <div><div className="text-2xl font-bold text-vw-blue">{relatedPdfs.length}</div><div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-vw-muted">PDFs</div></div>
          </div>
        </div>
      </section>

      <section className="border-b border-vw-line bg-vw-cream px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl border-l-4 border-vw-gold pl-5">
            <h2 className="text-2xl font-bold text-vw-blue">
              {generation.name} Volkswagen repair information
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-vw-muted">{generation.description}</p>
            <p className="mt-3 leading-relaxed text-vw-muted">
              This archive covers the {generation.models.map((model) => `Volkswagen ${model}`).join(', ')}
              {' '}from {generation.years}, including system specifications, known issues, maintenance notes,
              step-by-step DIY guides, and available PDF manuals.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-vw-surface px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="mb-2 text-2xl font-bold text-vw-blue">{generation.name} repair systems</h2>
          <p className="mb-6 max-w-3xl text-vw-muted">Choose a system for generation-specific specifications, maintenance guidance, common problems, manuals, and repair resources.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {generation.systems.map((sys, i) => (
              <Link key={sys.id} href={`/systems/${sys.slug}?gen=${generation.slug}`} className="group block rounded-xl border border-vw-line bg-vw-paper p-6 shadow-[0_8px_22px_rgba(55,42,28,0.05)] transition-all hover:-translate-y-0.5 hover:border-vw-gold/60 hover:shadow-[0_14px_32px_rgba(55,42,28,0.09)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-vw-gold/35 bg-vw-gold/10 text-vw-blue transition-colors group-hover:bg-vw-gold/20"><span className="font-bold">{i + 1}</span></div>
                  <div>
                    <h3 className="font-bold text-vw-dark">{generation.name} Volkswagen {sys.name}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-vw-muted">{sys.description}</p>
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
                <h2 className="text-2xl font-bold text-vw-blue">{generation.name} Volkswagen DIY guides</h2>
                <p className="mt-1 text-vw-muted">Step-by-step repair and maintenance procedures for this generation.</p>
              </div>
              <Link href={`/guides?generation=${generation.id}`} className="shrink-0 font-medium text-vw-link-blue hover:underline">View all guides →</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {relatedGuides.map((guide) => {
                const system = generation.systems.find((item) => item.slug === guide.system || item.id === guide.system);
                return (
                  <article key={guide.id} className="rounded-xl border border-vw-line bg-vw-cream p-5">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="badge badge-gold">{system?.name || guide.system}</span>
                      <span className="badge badge-gray">{guide.difficulty}</span>
                    </div>
                    <h3 className="text-lg font-bold text-vw-blue">
                      <Link href={`/guides/${guide.slug}`} className="hover:underline">{guide.title}</Link>
                    </h3>
                    <p className="mt-2 text-sm text-vw-muted">Estimated time: {guide.timeEstimate}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-vw-line bg-vw-cream px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-vw-blue">Related PDFs</h2>
              <p className="mt-1 text-vw-muted">Documents uploaded for {generation.name}.</p>
            </div>
            <Link href={`/library?generation=${generation.id}`} className="text-vw-blue hover:underline">
              View all PDFs →
            </Link>
          </div>

          {pdfsUnavailable ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
              The manual inventory is temporarily unavailable. The generation specifications and guides on this page remain available.
            </div>
          ) : relatedPdfs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-vw-line bg-vw-paper p-6 text-vw-muted">
              No PDFs have been uploaded for this generation yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPdfs.slice(0, 6).map((pdf) => (
                <PdfCard key={pdf.id} pdf={pdf} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-vw-line bg-vw-paper px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-vw-blue mb-6">Models</h2>
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

async function getApprovedPdfs() {
  try {
    const pdfs = (await getAllPdfs())
      .filter((pdf) => pdf.approved !== false)
      .map(toPublicPdfSummary);
    return { pdfs, unavailable: false };
  } catch (error) {
    if (!isRedisUnavailableError(error)) throw error;
    return { pdfs: [], unavailable: true };
  }
}
