import type { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Volkswagen PDF Manual Library',
  description:
    'Search and browse approved Volkswagen PDF manuals, technical documents, wiring diagrams, service references, and repair resources by generation and system.',
  path: '/library',
});

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
