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
  const staticRoutes = [
    '/',
    '/library',
    '/guides',
    '/privacy-policy',
    '/terms-of-use',
  ].flatMap((path) => localizedEntries(path));

  const generationRoutes = generations.flatMap((generation) => localizedEntries(
    `/generation/${generation.slug}`,
    { images: [absoluteUrl(generation.image)] },
  ));

  const systemSlugs = new Set<string>();
  generations.forEach((generation) => {
    generation.systems.forEach((system) => systemSlugs.add(system.slug));
  });

  const systemRoutes: MetadataRoute.Sitemap = Array.from(systemSlugs).map((slug) => ({
    url: absoluteUrl(`/systems/${slug}`),
  }));
  const generationSystemRoutes = generations.flatMap((generation) => (
    generation.systems.map((system) => ({
      url: absoluteUrl(`/systems/${system.slug}?gen=${generation.slug}`),
    }))
  ));

  const staticGuideRoutes = diyGuides.flatMap((guide) => localizedEntries(
    `/guides/${guide.slug}`,
    { lastModified: validDate(guide.updatedAt) },
  ));

  let userGuideRoutes: MetadataRoute.Sitemap = [];
  let pdfRoutes: MetadataRoute.Sitemap = [];
  let userProfileRoutes: MetadataRoute.Sitemap = [];

  const [userGuidesResult, pdfsResult, usersResult] = await Promise.allSettled([
    getUserGuides(),
    getAllPdfs(),
    getUsers(),
  ]);
  const approvedUserGuides = userGuidesResult.status === 'fulfilled'
    ? userGuidesResult.value.filter((guide) => guide.approved)
    : [];
  const approvedPdfs = pdfsResult.status === 'fulfilled'
    ? pdfsResult.value.filter((pdf) => pdf.approved !== false)
    : [];

  if (userGuidesResult.status === 'fulfilled') {
    userGuideRoutes = approvedUserGuides.map((guide) => ({
      url: absoluteUrl(`/guides/${guide.slug}`),
      lastModified: validDate(guide.updatedAt || guide.createdAt),
    }));
  }

  if (pdfsResult.status === 'fulfilled') {
    pdfRoutes = approvedPdfs.map((pdf) => ({
      url: absoluteUrl(pdfManualPath(pdf)),
      lastModified: validDate(pdf.uploadedAt),
    }));
  }

  if (usersResult.status === 'fulfilled') {
    userProfileRoutes = usersResult.value
      .filter((user) => (
        (user.vehiclePublic === true && Boolean(user.vehicle))
        || approvedUserGuides.some((guide) => guide.authorId === user.id || guide.author === user.username)
        || approvedPdfs.some((pdf) => pdf.uploadedById === user.id || pdf.uploadedBy === user.username)
      ))
      .map((user) => ({
        url: absoluteUrl(`/users/${encodeURIComponent(user.username)}`),
      }));
  }

  const routes = [
    ...staticRoutes,
    ...generationRoutes,
    ...systemRoutes,
    ...generationSystemRoutes,
    ...staticGuideRoutes,
    ...userGuideRoutes,
    ...pdfRoutes,
    ...userProfileRoutes,
  ];

  return Array.from(new Map(routes.map((route) => [route.url, route])).values());
}

function localizedEntries(
  englishPath: string,
  fields: Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'> = {},
): MetadataRoute.Sitemap {
  const spanishPath = toSpanishPath(englishPath);
  const englishUrl = absoluteUrl(englishPath);
  const spanishUrl = absoluteUrl(spanishPath);
  const alternates = {
    languages: {
      'en-US': englishUrl,
      'es-MX': spanishUrl,
      'x-default': englishUrl,
    },
  };

  return [
    { ...fields, url: englishUrl, alternates },
    { ...fields, url: spanishUrl, alternates },
  ];
}

function validDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
