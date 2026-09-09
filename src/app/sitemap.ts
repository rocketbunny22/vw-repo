import type { MetadataRoute } from 'next';
import { diyGuides } from '@/data/diyGuides';
import { generations } from '@/data/generations';
import { getUserGuides } from '@/data/guides';
import { getAllPdfs } from '@/data/pdfs';
import { getUsers } from '@/data/users';
import { absoluteUrl } from '@/lib/seo';
import { toSpanishPath } from '@/lib/localization';
import { pdfManualPath } from '@/lib/pdfUrls';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '/',
    '/library',
    '/guides',
    '/privacy-policy',
    '/terms-of-use',
    '/es-mx',
    '/es-mx/biblioteca',
    '/es-mx/guias',
    '/es-mx/politica-de-privacidad',
    '/es-mx/terminos-de-uso',
  ].map((path) => ({ url: absoluteUrl(path) }));

  const generationRoutes: MetadataRoute.Sitemap = generations.map((generation) => ({
    url: absoluteUrl(`/generation/${generation.slug}`),
    images: [absoluteUrl(generation.image)],
  }));
  const spanishGenerationRoutes: MetadataRoute.Sitemap = generations.map((generation) => ({
    url: absoluteUrl(toSpanishPath(`/generation/${generation.slug}`)),
    images: [absoluteUrl(generation.image)],
  }));

  const systemSlugs = new Set<string>();
  generations.forEach((generation) => {
    generation.systems.forEach((system) => systemSlugs.add(system.slug));
  });

  const systemRoutes: MetadataRoute.Sitemap = Array.from(systemSlugs).map((slug) => ({
    url: absoluteUrl(`/systems/${slug}`),
  }));
  const spanishSystemRoutes: MetadataRoute.Sitemap = Array.from(systemSlugs).map((slug) => ({
    url: absoluteUrl(toSpanishPath(`/systems/${slug}`)),
  }));
  const generationSystemRoutes: MetadataRoute.Sitemap = generations.flatMap((generation) => (
    generation.systems.map((system) => ({
      url: absoluteUrl(`/systems/${system.slug}?gen=${generation.slug}`),
    }))
  ));
  const spanishGenerationSystemRoutes: MetadataRoute.Sitemap = generations.flatMap((generation) => (
    generation.systems.map((system) => ({
      url: absoluteUrl(toSpanishPath(`/systems/${system.slug}?gen=${generation.slug}`)),
    }))
  ));

  const staticGuideRoutes: MetadataRoute.Sitemap = diyGuides.map((guide) => ({
    url: absoluteUrl(`/guides/${guide.slug}`),
    lastModified: validDate(guide.updatedAt),
  }));
  const spanishGuideRoutes: MetadataRoute.Sitemap = diyGuides.map((guide) => ({
    url: absoluteUrl(toSpanishPath(`/guides/${guide.slug}`)),
    lastModified: validDate(guide.updatedAt),
  }));

  let userGuideRoutes: MetadataRoute.Sitemap = [];
  let pdfRoutes: MetadataRoute.Sitemap = [];
  let userProfileRoutes: MetadataRoute.Sitemap = [];

  try {
    const [userGuides, pdfs, users] = await Promise.all([
      getUserGuides(),
      getAllPdfs(),
      getUsers(),
    ]);
    const approvedUserGuides = userGuides.filter((guide) => guide.approved);
    const approvedPdfs = pdfs.filter((pdf) => pdf.approved !== false);

    userGuideRoutes = approvedUserGuides.map((guide) => ({
        url: absoluteUrl(`/guides/${guide.slug}`),
        lastModified: validDate(guide.updatedAt || guide.createdAt),
    }));

    pdfRoutes = approvedPdfs.map((pdf) => ({
      url: absoluteUrl(pdfManualPath(pdf)),
      lastModified: validDate(pdf.uploadedAt),
    }));

    userProfileRoutes = users
      .filter((user) => (
        (user.vehiclePublic === true && Boolean(user.vehicle))
        || approvedUserGuides.some((guide) => guide.authorId === user.id || guide.author === user.username)
        || approvedPdfs.some((pdf) => pdf.uploadedById === user.id || pdf.uploadedBy === user.username)
      ))
      .map((user) => ({
        url: absoluteUrl(`/users/${encodeURIComponent(user.username)}`),
      }));
  } catch {
    userGuideRoutes = [];
    pdfRoutes = [];
    userProfileRoutes = [];
  }

  const routes = [
    ...staticRoutes,
    ...generationRoutes,
    ...spanishGenerationRoutes,
    ...systemRoutes,
    ...spanishSystemRoutes,
    ...generationSystemRoutes,
    ...spanishGenerationSystemRoutes,
    ...staticGuideRoutes,
    ...spanishGuideRoutes,
    ...userGuideRoutes,
    ...pdfRoutes,
    ...userProfileRoutes,
  ];

  return Array.from(new Map(routes.map((route) => [route.url, route])).values());
}

function validDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
