import type { Metadata } from 'next';
import LibraryPage from '@/app/library/page';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Biblioteca de manuales PDF Volkswagen',
  description: 'Consulta, filtra, previsualiza y descarga manuales, diagramas y documentos técnicos Volkswagen organizados por generación y sistema.',
  path: '/es-mx/biblioteca',
  locale: 'es-MX',
});

export default function SpanishLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ generation?: string; system?: string; model?: string }>;
}) {
  return <LibraryPage searchParams={searchParams} />;
}
