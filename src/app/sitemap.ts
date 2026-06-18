import type { MetadataRoute } from 'next';
import { diyGuides } from '@/data/diyGuides';
import { generations } from '@/data/generations';
import { getUserGuides } from '@/data/guides';
import { absoluteUrl } from '@/lib/seo';
import { toSpanishPath } from '@/lib/localization';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/library'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/guides'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/privacy-policy'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: absoluteUrl('/terms-of-use'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: absoluteUrl('/es-mx'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: absoluteUrl('/es-mx/biblioteca'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: absoluteUrl('/es-mx/guias'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: absoluteUrl('/es-mx/politica-de-privacidad'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: absoluteUrl('/es-mx/terminos-de-uso'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  const generationRoutes: MetadataRoute.Sitemap = generations.map((generation) => ({
    url: absoluteUrl(`/generation/${generation.slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
    images: [absoluteUrl(generation.image)],
  }));
  const spanishGenerationRoutes: MetadataRoute.Sitemap = generations.map((generation) => ({
    url: absoluteUrl(toSpanishPath(`/generation/${generation.slug}`)),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.75,
    images: [absoluteUrl(generation.image)],
  }));

  const systemSlugs = new Set<string>();
  generations.forEach((generation) => {
    generation.systems.forEach((system) => systemSlugs.add(system.slug));
  });

  const systemRoutes: MetadataRoute.Sitemap = Array.from(systemSlugs).map((slug) => ({
    url: absoluteUrl(`/systems/${slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.75,
  }));
  const spanishSystemRoutes: MetadataRoute.Sitemap = Array.from(systemSlugs).map((slug) => ({
    url: absoluteUrl(toSpanishPath(`/systems/${slug}`)),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const staticGuideRoutes: MetadataRoute.Sitemap = diyGuides.map((guide) => ({
    url: absoluteUrl(`/guides/${guide.slug}`),
    lastModified: guide.updatedAt ? new Date(guide.updatedAt) : now,
    changeFrequency: 'monthly',
    priority: guide.featured ? 0.85 : 0.7,
  }));
  const spanishGuideRoutes: MetadataRoute.Sitemap = diyGuides.map((guide) => ({
    url: absoluteUrl(toSpanishPath(`/guides/${guide.slug}`)),
    lastModified: guide.updatedAt ? new Date(guide.updatedAt) : now,
    changeFrequency: 'monthly',
    priority: guide.featured ? 0.8 : 0.65,
  }));

  let userGuideRoutes: MetadataRoute.Sitemap = [];

  try {
    const userGuides = await getUserGuides();
    userGuideRoutes = userGuides
      .filter((guide) => guide.approved)
      .map((guide) => ({
        url: absoluteUrl(`/guides/${guide.slug}`),
        lastModified: guide.updatedAt ? new Date(guide.updatedAt) : now,
        changeFrequency: 'monthly',
        priority: guide.featured ? 0.8 : 0.65,
      }));
  } catch {
    userGuideRoutes = [];
  }

  return [
    ...staticRoutes,
    ...generationRoutes,
    ...spanishGenerationRoutes,
    ...systemRoutes,
    ...spanishSystemRoutes,
    ...staticGuideRoutes,
    ...spanishGuideRoutes,
    ...userGuideRoutes,
  ];
}
