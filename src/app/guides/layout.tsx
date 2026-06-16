import type { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Volkswagen DIY Guides',
  description:
    'Browse Volkswagen DIY repair and maintenance guides with tools, parts, difficulty, and time estimates for classic and modern VW models.',
  path: '/guides',
});

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
