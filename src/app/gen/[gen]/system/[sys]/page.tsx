import type { Metadata } from 'next';
import Link from 'next/link';
import { generations } from '@/data/generations';
import { notFound } from 'next/navigation';
import { createMetadata, truncateDescription } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gen: string; sys: string }>;
}): Promise<Metadata> {
  const { gen, sys } = await params;
  const generation = generations.find((item) => item.slug === gen);
  const system = generation?.systems.find((item) => item.slug === sys);

  if (!generation || !system) {
    return {
      title: 'Volkswagen System Not Found',
      robots: { index: false, follow: false },
    };
  }

  return createMetadata({
    title: `${generation.name} Volkswagen ${system.name} Specs`,
    description: truncateDescription(
      `${generation.name} Volkswagen ${system.name}: ${system.description} Browse specifications, common issues, maintenance notes, and related resources.`
    ),
    path: `/systems/${sys}?gen=${gen}`,
    image: generation.image,
  });
}

export default async function SystemPage({
  params,
}: {
  params: Promise<{ gen: string; sys: string }>;
}) {
  const { gen, sys } = await params;
  const generation = generations.find((g) => g.slug === gen);
  
  if (!generation) notFound();
  
  const system = generation.systems.find((s) => s.slug === sys);
  if (!system) notFound();

  return (
    <div className="flex flex-col">
      <section className="bg-vw-blue py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 text-sm text-gray-300 mb-2">
            <Link href="/" className="hover:text-vw-gold">Home</Link>
            <span>/</span>
            <Link href={`/generation/${gen}`} className="hover:text-vw-gold">{generation.name}</Link>
            <span>/</span>
            <span className="text-vw-gold">{system.name}</span>
          </div>
          <h1 className="text-4xl font-bold text-white">{generation.name} - {system.name}</h1>
          <p className="text-xl text-gray-300">{generation.years}</p>
        </div>
      </section>

      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="whitespace-pre-wrap text-gray-800 mb-8">{system.content}</div>
          
          {system.specs && Object.keys(system.specs).length > 0 && (
            <div className="bg-gray-50 p-6 rounded-lg mt-8">
              <h3 className="font-bold text-vw-blue mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(system.specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">{k}</span>
                    <span className="font-medium">{v as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
