import type { Metadata } from 'next';
import SearchPage from '@/app/search/page';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Buscar en VW Repo',
  description: 'Busca manuales, guías, generaciones, sistemas y modelos Volkswagen.',
  path: '/es-mx/buscar',
  locale: 'es-MX',
  robots: { index: false, follow: true },
});

export default function SpanishSearchPage() {
  return <SearchPage />;
}
