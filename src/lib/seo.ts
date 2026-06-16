import type { Metadata } from 'next';

export const siteName = 'VW Repo';
export const defaultSiteUrl = 'https://vwrepo.com';
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl).replace(/\/+$/, '');
export const defaultDescription =
  'Volkswagen repair manuals, DIY guides, technical specifications, maintenance checklists, and searchable PDF resources for air-cooled and water-cooled VW models.';

export const defaultKeywords = [
  'Volkswagen repair manuals',
  'VW repair manuals',
  'Volkswagen DIY guides',
  'VW technical specs',
  'Volkswagen maintenance',
  'VW PDF manuals',
  'air-cooled VW',
  'water-cooled VW',
];

export function absoluteUrl(path = '/') {
  return new URL(path, `${siteUrl}/`).toString();
}

export function truncateDescription(value: string, maxLength = 155) {
  const normalized = value.replace(/\s+/g, ' ').trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function createMetadata({
  title,
  description = defaultDescription,
  path = '/',
  image = '/images/mk1.jpg',
  robots,
  type = 'website',
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  robots?: Metadata['robots'];
  type?: 'website' | 'article';
}): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title: title ? { absolute: `${title} | ${siteName}` } : undefined,
    description,
    keywords: defaultKeywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: title ? `${title} | ${siteName}` : siteName,
      description,
      url,
      siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title ? `${title} on ${siteName}` : `${siteName} Volkswagen knowledge base`,
        },
      ],
      locale: 'en_US',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: title ? `${title} | ${siteName}` : siteName,
      description,
      images: [imageUrl],
    },
    robots,
  };
}

export function jsonLd(data: object) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteName,
  url: siteUrl,
  logo: absoluteUrl('/favicon.ico'),
};

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
  url: siteUrl,
  description: defaultDescription,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${absoluteUrl('/search')}?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};
