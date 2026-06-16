import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { diyGuides } from '@/data/diyGuides';
import { generations } from '@/data/generations';
import { DiyGuide } from '@/types';
import { getUserGuides } from '@/data/guides';
import CommentsSection from '@/components/CommentsSection';
import BookmarkButton from '@/components/BookmarkButton';
import MarkdownContent from '@/components/MarkdownContent';
import { absoluteUrl, breadcrumbJsonLd, createMetadata, jsonLd, siteName, truncateDescription } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const systemsList = [
  { id: 'engine', name: 'Engine' },
  { id: 'suspension', name: 'Suspension' },
  { id: 'brakes', name: 'Brakes' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'transmission', name: 'Transmission' },
  { id: 'body', name: 'Body & Interior' },
  { id: 'cooling', name: 'Cooling System' },
];

async function getApprovedGuide(slug: string) {
  const staticGuide = diyGuides.find((guide) => guide.slug === slug);

  if (staticGuide) {
    return staticGuide;
  }

  const userGuides: DiyGuide[] = await getUserGuides();
  return userGuides.find((guide) => guide.slug === slug && guide.approved);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getApprovedGuide(slug);

  if (!guide) {
    return {
      title: 'DIY Guide Not Found',
      robots: { index: false, follow: false },
    };
  }

  const gen = generations.find((generation) => generation.id === guide.generation);
  const sys = systemsList.find((system) => system.id === guide.system);
  const description = truncateDescription(
    `${guide.title}: step-by-step Volkswagen DIY guide for ${gen?.name || 'VW'} ${sys?.name || 'maintenance'} with tools, parts, difficulty, and time estimate.`
  );

  return createMetadata({
    title: /\bguide\b/i.test(guide.title) ? guide.title : `${guide.title} DIY Guide`,
    description,
    path: `/guides/${guide.slug}`,
    image: gen?.image,
    type: 'article',
  });
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getApprovedGuide(slug);
  
  if (!guide) {
    notFound();
  }
  
  const gen = generations.find((g) => g.id === guide.generation);
  const sys = systemsList.find((s) => s.id === guide.system);
  const pagePath = `/guides/${guide.slug}`;
  const guideJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: guide.title,
    description: truncateDescription(guide.content),
    url: absoluteUrl(pagePath),
    datePublished: guide.createdAt,
    dateModified: guide.updatedAt || guide.createdAt,
    author: {
      '@type': 'Person',
      name: guide.author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: absoluteUrl('/'),
    },
    about: [
      gen ? `${gen.name} Volkswagen` : 'Volkswagen',
      sys?.name || 'Volkswagen maintenance',
    ],
    timeRequired: guide.timeEstimate,
    proficiencyLevel: guide.difficulty,
    tool: guide.tools?.map((tool) => ({ '@type': 'HowToTool', name: tool })),
    supply: guide.parts?.map((part) => ({ '@type': 'HowToSupply', name: part })),
    mainEntityOfPage: absoluteUrl(pagePath),
  };
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'DIY Guides', path: '/guides' },
    { name: guide.title, path: pagePath },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(guideJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
      />
      <section className="bg-vw-blue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
            <Link href="/" className="hover:text-vw-gold">Home</Link>
            <span>/</span>
            <Link href="/guides" className="hover:text-vw-gold">DIY Guides</Link>
            <span>/</span>
            <span className="text-vw-gold">{guide.title}</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className={`badge ${getDifficultyColor(guide.difficulty)}`}>
              {guide.difficulty.charAt(0).toUpperCase() + guide.difficulty.slice(1)}
            </span>
            <span className="badge badge-blue">{gen?.name}</span>
            <span className="badge badge-gold">{sys?.name}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{guide.title}</h1>
            <BookmarkButton itemType="guide" itemId={guide.id} className="mt-1 shrink-0" />
          </div>
          <p className="text-gray-300">
            By{' '}
            {guide.authorId ? (
              <Link href={`/users/${encodeURIComponent(guide.author)}`} className="hover:text-vw-gold hover:underline">
                {guide.author}
              </Link>
            ) : (
              guide.author
            )}{' '}
            • {guide.timeEstimate || '2-4 hours'} • {guide.views?.toLocaleString() || 0} views
          </p>
        </div>
      </section>

      <section className="py-12 bg-white flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <MarkdownContent content={guide.content} />
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                <h3 className="font-bold text-vw-blue mb-4">Guide Info</h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">Difficulty</span>
                    <p className={`inline-flex ml-2 badge ${getDifficultyColor(guide.difficulty)}`}>
                      {guide.difficulty.charAt(0).toUpperCase() + guide.difficulty.slice(1)}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Time Estimate</span>
                    <p className="font-medium">{guide.timeEstimate || '2-4 hours'}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Author</span>
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
                  
                  {guide.tools && guide.tools.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500">Tools Needed</span>
                      <ul className="mt-1 space-y-1">
                        {guide.tools.map((tool: string, i: number) => (
                          <li key={i} className="text-sm">• {tool}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {guide.parts && guide.parts.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500">Parts</span>
                      <ul className="mt-1 space-y-1">
                        {guide.parts.map((part: string, i: number) => (
                          <li key={i} className="text-sm">• {part}</li>
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
