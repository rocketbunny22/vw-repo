import { getAllPdfs } from '@/data/pdfs';
import LibraryClient from './LibraryClient';

export const dynamic = 'force-dynamic';

type LibrarySearchParams = {
  generation?: string;
  system?: string;
  model?: string;
};

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<LibrarySearchParams>;
}) {
  const params = await searchParams;
  const pdfs = (await getAllPdfs()).filter((pdf) => pdf.approved !== false);

  return (
    <LibraryClient
      initialPdfs={pdfs}
      initialGeneration={params.generation || 'all'}
      initialSystem={params.system || 'all'}
      initialModel={params.model || 'all'}
    />
  );
}
