import Link from 'next/link';
import { generations } from '@/data/generations';
import { notFound } from 'next/navigation';

export default async function GenerationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const generation = generations.find((g) => g.slug === slug);
  
  if (!generation) notFound();
  
  return (
    <div className="flex flex-col">
      <section className="bg-vw-blue py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 text-sm text-gray-300 mb-2">
            <Link href="/" className="hover:text-vw-gold">Home</Link>
            <span>/</span>
            <span className="text-vw-gold">{generation.name}</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{generation.name}</h1>
          <p className="text-xl text-gray-300">{generation.years}</p>
        </div>
      </section>

      <section className="bg-vw-gold py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div><div className="text-2xl font-bold text-vw-blue">{generation.systems.length}</div><div className="text-sm text-vw-dark">Systems</div></div>
            <div><div className="text-2xl font-bold text-vw-blue">{generation.models.length}</div><div className="text-sm text-vw-dark">Models</div></div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-vw-blue mb-6">Systems</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {generation.systems.map((sys, i) => (
              <Link key={sys.id} href={`/systems/${sys.slug}?gen=${generation.slug}`} className="block p-6 bg-white rounded-lg shadow hover:shadow-xl border hover:border-vw-gold text-center">
                <div className="w-12 h-12 bg-vw-blue rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-white font-bold">{i+1}</span></div>
                <h3 className="font-bold text-vw-dark">{sys.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-vw-blue mb-6">Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {generation.models.map((model) => (
              <div key={model} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">{model}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}