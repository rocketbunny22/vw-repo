import Link from 'next/link';
import { notFound } from 'next/navigation';
import { diyGuides } from '@/data/diyGuides';
import { generations } from '@/data/generations';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const systemsList = [
  { id: 'engine', name: 'Engine' },
  { id: 'suspension', name: 'Suspension' },
  { id: 'brakes', name: 'Brakes' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'transmission', name: 'Transmission' },
  { id: 'body', name: 'Body & Interior' },
  { id: 'cooling', name: 'Cooling System' },
];

export async function generateStaticParams() {
  const params = diyGuides.map((guide) => ({ slug: guide.slug }));
  
  // Also include approved user guides
  try {
    const guidesFile = path.resolve(process.cwd(), 'user-guides.json');
    if (existsSync(guidesFile)) {
      const data = await readFile(guidesFile, 'utf-8');
      const userGuides = JSON.parse(data).filter((g: any) => g.approved);
      userGuides.forEach((g: any) => {
        params.push({ slug: g.slug });
      });
    }
  } catch {
    // No user guides
  }
  
  return params;
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Check static guides first
  let guide = diyGuides.find((g) => g.slug === slug);
  
  // Then check user submitted guides
  if (!guide) {
    try {
      const guidesFile = path.resolve(process.cwd(), 'user-guides.json');
      const data = await readFile(guidesFile, 'utf-8');
      const userGuides = JSON.parse(data);
      guide = userGuides.find((g: any) => g.slug === slug && g.approved);
    } catch {
      // No user guides yet
    }
  }
  
  if (!guide) {
    notFound();
  }
  
  const gen = generations.find((g) => g.id === guide.generation);
  const sys = systemsList.find((s) => s.id === guide.system);
  
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col">
      <section className="bg-vw-blue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
            <Link href="/" className="hover:text-vw-gold">Home</Link>
            <span>/</span>
            <Link href="/guides" className="hover:text-vw-gold">DIY Guides</Link>
            <span>/</span>
            <span className="text-vw-gold">{guide.title}</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className={`badge ${getDifficultyColor(guide.difficulty)}`}>
              {guide.difficulty.charAt(0).toUpperCase() + guide.difficulty.slice(1)}
            </span>
            <span className="badge badge-blue">{gen?.name}</span>
            <span className="badge badge-gold">{sys?.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{guide.title}</h1>
          <p className="text-gray-300">
            By {guide.author} • {guide.timeEstimate || '2-4 hours'} • {guide.views?.toLocaleString() || 0} views
          </p>
        </div>
      </section>

      <section className="py-12 bg-white flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {guide.content}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                <h3 className="font-bold text-vw-blue mb-4">Guide Info</h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">Difficulty</span>
                    <p className={`inline-flex ml-2 badge ${getDifficultyColor(guide.difficulty)}`}>
                      {guide.difficulty.charAt(0).toUpperCase() + guide.difficulty.slice(1)}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Time Estimate</span>
                    <p className="font-medium">{guide.timeEstimate || '2-4 hours'}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Author</span>
                    <p className="font-medium">{guide.author}</p>
                  </div>
                  
                  {guide.tools && guide.tools.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500">Tools Needed</span>
                      <ul className="mt-1 space-y-1">
                        {guide.tools.map((tool: string, i: number) => (
                          <li key={i} className="text-sm">• {tool}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {guide.parts && guide.parts.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500">Parts</span>
                      <ul className="mt-1 space-y-1">
                        {guide.parts.map((part: string, i: number) => (
                          <li key={i} className="text-sm">• {part}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}