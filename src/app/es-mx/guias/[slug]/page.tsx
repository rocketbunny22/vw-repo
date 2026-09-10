import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import BookmarkButton from '@/components/BookmarkButton';
import MarkdownContent from '@/components/MarkdownContent';
import CommentsSection from '@/components/CommentsSection';
import { diyGuides } from '@/data/diyGuides';
import { spanishGuideContent } from '@/data/diyGuides.es-MX';
import { getUserGuides } from '@/data/guides';
import { generations } from '@/data/generations';
import { absoluteUrl, breadcrumbJsonLd, createMetadata, jsonLd, siteName, truncateDescription } from '@/lib/seo';
import { difficultyNamesEs, englishGuideSlug, formatTimeEstimateEs, guideSlugsEs, systemNamesEs, toSpanishPath } from '@/lib/localization';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return diyGuides.filter((guide) => spanishGuideContent[guide.slug]).map((guide) => ({ slug: guideSlugsEs[guide.slug] }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const englishSlug = englishGuideSlug(slug);
  const userGuides = await getUserGuides();
  const guide = diyGuides.find((item) => item.slug === englishSlug)
    || userGuides.find((item) => item.slug === englishSlug && item.approved);
  if (!guide) return { title: 'Guía no encontrada', robots: { index: false, follow: false } };
  const translated = spanishGuideContent[englishSlug] || guide;

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
  const userGuides = await getUserGuides();
  const guide = diyGuides.find((item) => item.slug === englishSlug)
    || userGuides.find((item) => item.slug === englishSlug && item.approved);
  if (!guide) notFound();
  const translated = spanishGuideContent[englishSlug] || guide;
  const canonicalPath = toSpanishPath(`/guides/${englishSlug}`);
  if (slug !== (guideSlugsEs[englishSlug] || englishSlug)) permanentRedirect(canonicalPath);

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

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <section className="border-b border-vw-gold/35 bg-[linear-gradient(135deg,var(--vw-dark),var(--vw-blue))] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
            <Link href="/es-mx" className="hover:text-vw-gold">Inicio</Link>
            <span>/</span>
            <Link href="/es-mx/guias" className="hover:text-vw-gold">Guías de bricolaje</Link>
            <span>/</span>
            <span className="text-vw-gold">{translated.title}</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className={`badge ${getDifficultyColor(guide.difficulty)}`}>
              {difficultyNamesEs[guide.difficulty]}
            </span>
            <span className="badge badge-blue">{generation?.name}</span>
            <span className="badge badge-gold">{systemNamesEs[guide.system]}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{translated.title}</h1>
            <BookmarkButton itemType="guide" itemId={guide.id} className="mt-1 shrink-0" />
          </div>
          <p className="text-vw-steel">
            Por{' '}
            {guide.authorId ? (
              <Link href={`/users/${encodeURIComponent(guide.author)}`} className="hover:text-vw-gold hover:underline">
                {guide.author}
              </Link>
            ) : (
              guide.author
            )}{' '}
            • {formatTimeEstimateEs(guide.timeEstimate)} • {guide.views?.toLocaleString() || 0} vistas
          </p>
        </div>
      </section>

      <section className="flex-1 bg-vw-surface py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <article className="rounded-xl border border-vw-line bg-vw-paper p-6 shadow-[0_10px_30px_rgba(55,42,28,0.05)] sm:p-8 lg:col-span-2">
              <MarkdownContent content={translated.content} />
            </article>

            <div className="lg:col-span-1">
              <aside className="sticky top-4 rounded-xl border border-vw-line bg-vw-cream p-6 shadow-[0_8px_24px_rgba(55,42,28,0.05)]">
                <h2 className="mb-4 text-xl font-bold text-vw-blue">Información de la guía</h2>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-vw-muted">Dificultad</span>
                    <p className={`inline-flex ml-2 badge ${getDifficultyColor(guide.difficulty)}`}>
                      {difficultyNamesEs[guide.difficulty]}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-vw-muted">Tiempo estimado</span>
                    <p className="font-medium">{formatTimeEstimateEs(guide.timeEstimate)}</p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-vw-muted">Autor</span>
                    <p className="font-medium">
                      {guide.authorId ? (
                        <Link href={`/users/${encodeURIComponent(guide.author)}`} className="text-vw-blue hover:underline">
                          {guide.author}
                        </Link>
                      ) : (
                        guide.author
                      )}
                    </p>
                  </div>

                  {translated.tools.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-vw-muted">Herramientas necesarias</span>
                      <ul className="mt-2 space-y-1 border-l-2 border-vw-gold/40 pl-3">
                        {translated.tools.map((tool) => (
                          <li key={tool} className="text-sm">• {tool}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {translated.parts.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-vw-muted">Refacciones</span>
                      <ul className="mt-2 space-y-1 border-l-2 border-vw-gold/40 pl-3">
                        {translated.parts.map((part) => (
                          <li key={part} className="text-sm">• {part}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <CommentsSection guideId={guide.id} />
          </div>
        </div>
      </section>
    </div>
  );
}
