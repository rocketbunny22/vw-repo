import { diyGuides } from '@/data/diyGuides';
import { getUserGuides } from '@/data/guides';
import { toPublicGuideSummary } from '@/lib/publicSummaries';
import GuidesClient from './GuidesClient';

export const dynamic = 'force-dynamic';

type GuidesSearchParams = {
  generation?: string;
  system?: string;
};

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<GuidesSearchParams>;
}) {
  const params = await searchParams;
  const userGuides = await getUserGuides();
  const guides = [
    ...diyGuides,
    ...userGuides.filter((guide) => guide.approved),
  ].map(toPublicGuideSummary);

  return (
    <GuidesClient
      initialGuides={guides}
      initialGeneration={params.generation || 'all'}
      initialSystem={params.system || 'all'}
    />
  );
}
