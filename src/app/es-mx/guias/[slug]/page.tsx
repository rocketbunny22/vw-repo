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
      <section className="bg-vw-blue py-16">
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
          <p className="text-gray-300">
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

      <section className="py-12 bg-white flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <MarkdownContent content={translated.content} />
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                <h3 className="font-bold text-vw-blue mb-4">Información de la guía</h3>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">Dificultad</span>
                    <p className={`inline-flex ml-2 badge ${getDifficultyColor(guide.difficulty)}`}>
                      {difficultyNamesEs[guide.difficulty]}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">Tiempo estimado</span>
                    <p className="font-medium">{formatTimeEstimateEs(guide.timeEstimate)}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">Autor</span>
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
                      <span className="text-sm text-gray-500">Herramientas necesarias</span>
                      <ul className="mt-1 space-y-1">
                        {translated.tools.map((tool) => (
                          <li key={tool} className="text-sm">• {tool}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {translated.parts.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500">Refacciones</span>
                      <ul className="mt-1 space-y-1">
                        {translated.parts.map((part) => (
                          <li key={part} className="text-sm">• {part}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
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
