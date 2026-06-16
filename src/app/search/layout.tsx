import type { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Search Volkswagen Manuals, Guides & Specs',
  description:
    'Search VW Repo for Volkswagen manuals, DIY guides, technical specifications, maintenance checklists, and PDF resources.',
  path: '/search',
  robots: { index: false, follow: true },
});

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
