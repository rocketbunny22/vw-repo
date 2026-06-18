import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import BookmarkButton from '@/components/BookmarkButton';
import MarkdownContent from '@/components/MarkdownContent';
import { diyGuides } from '@/data/diyGuides';
import { spanishGuideContent } from '@/data/diyGuides.es-MX';
import { generations } from '@/data/generations';
import { absoluteUrl, breadcrumbJsonLd, createMetadata, jsonLd, siteName, truncateDescription } from '@/lib/seo';
import { difficultyNamesEs, englishGuideSlug, formatTimeEstimateEs, guideSlugsEs, systemNamesEs, toSpanishPath } from '@/lib/localization';

export function generateStaticParams() {
  return diyGuides.filter((guide) => spanishGuideContent[guide.slug]).map((guide) => ({ slug: guideSlugsEs[guide.slug] }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const englishSlug = englishGuideSlug(slug);
  const guide = diyGuides.find((item) => item.slug === englishSlug);
  const translated = spanishGuideContent[englishSlug];
  if (!guide || !translated) return { title: 'Guía no encontrada', robots: { index: false, follow: false } };

  const generation = generations.find((item) => item.id === guide.generation);
  return createMetadata({
    title: translated.title,
    description: truncateDescription(`${translated.title}. Procedimiento Volkswagen paso a paso con herramientas, refacciones y tiempo estimado.`),
    path: toSpanishPath(`/guides/${englishSlug}`),
    image: generation?.image,
    type: 'article',
    locale: 'es-MX',
  });
}

export default async function SpanishGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const englishSlug = englishGuideSlug(slug);
  const guide = diyGuides.find((item) => item.slug === englishSlug);
  const translated = spanishGuideContent[englishSlug];
  if (!guide || !translated) notFound();
  const canonicalPath = toSpanishPath(`/guides/${englishSlug}`);
  if (slug !== guideSlugsEs[englishSlug]) permanentRedirect(canonicalPath);

  const generation = generations.find((item) => item.id === guide.generation);
  const path = canonicalPath;
  const article = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    inLanguage: 'es-MX',
    headline: translated.title,
    description: truncateDescription(translated.content),
    url: absoluteUrl(path),
    datePublished: guide.createdAt,
    dateModified: guide.updatedAt,
    author: { '@type': 'Person', name: guide.author },
    publisher: { '@type': 'Organization', name: siteName, url: absoluteUrl('/') },
  };
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Inicio', path: '/es-mx' },
    { name: 'Guías', path: '/es-mx/guias' },
    { name: translated.title, path },
  ]);

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <header className="bg-vw-blue py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Migas de pan" className="mb-4 flex flex-wrap gap-2 text-sm text-gray-300">
            <Link href="/es-mx" className="hover:text-vw-gold">Inicio</Link><span>/</span>
            <Link href="/es-mx/guias" className="hover:text-vw-gold">Guías</Link><span>/</span>
            <span className="text-vw-gold">{translated.title}</span>
          </nav>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="badge badge-blue">{generation?.name}</span>
            <span className="badge badge-gold">{systemNamesEs[guide.system]}</span>
            <span className="badge bg-white text-vw-blue">{difficultyNamesEs[guide.difficulty]}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-white md:text-4xl">{translated.title}</h1>
            <BookmarkButton itemType="guide" itemId={guide.id} className="shrink-0" />
          </div>
          <p className="mt-3 text-gray-300">Por {guide.author} · {formatTimeEstimateEs(guide.timeEstimate)}</p>
        </div>
      </header>
      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 lg:grid-cols-[minmax(0,1fr)_280px] sm:px-6 lg:px-8">
          <MarkdownContent content={translated.content} />
          <aside className="h-fit border bg-gray-50 p-6 lg:sticky lg:top-4">
            <h2 className="text-lg font-bold text-vw-blue">Información de la guía</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div><dt className="text-gray-500">Dificultad</dt><dd className="font-medium">{difficultyNamesEs[guide.difficulty]}</dd></div>
              <div><dt className="text-gray-500">Tiempo estimado</dt><dd className="font-medium">{formatTimeEstimateEs(guide.timeEstimate)}</dd></div>
            </dl>
            <h3 className="mt-6 font-bold text-vw-blue">Herramientas</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{translated.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
            <h3 className="mt-6 font-bold text-vw-blue">Refacciones</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{translated.parts.map((part) => <li key={part}>{part}</li>)}</ul>
          </aside>
        </div>
      </section>
    </article>
  );
}
