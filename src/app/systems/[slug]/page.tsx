import Link from 'next/link';
import { generations } from '@/data/generations';
import { notFound } from 'next/navigation';
import { readFile } from 'fs/promises';
import path from 'path';

export async function generateStaticParams() {
  const systemSlugs = new Set<string>();
  generations.forEach((gen) => {
    gen.systems.forEach((sys) => {
      systemSlugs.add(sys.slug);
    });
  });
  return Array.from(systemSlugs).map((slug) => ({ slug }));
}

async function getPdfs() {
  try {
    const dbPath = path.resolve(process.cwd(), 'pdfs.json');
    const data = await readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function getGuides() {
  try {
    const dbPath = path.resolve(process.cwd(), 'pdfs.json');
    const data = await readFile(dbPath, 'utf-8');
    return [];
  } catch {
    return [];
  }
}

export default async function SystemsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ gen?: string }>;
}) {
  const { slug } = await params;
  const { gen } = await searchParams;
  
  const allSystems = generations.flatMap((g) =>
    g.systems
      .filter((sys) => sys.slug === slug)
      .map((sys) => ({ ...sys, generation: g.name, generationSlug: g.slug }))
  );
  
  if (allSystems.length === 0) {
    notFound();
  }

  let filteredSystems = allSystems;
  if (gen) {
    filteredSystems = allSystems.filter((s) => s.generationSlug === gen);
    if (filteredSystems.length === 0) filteredSystems = allSystems;
  }

  const systemInfo = filteredSystems[0];
  const selectedGen = gen ? generations.find((g) => g.slug === gen) : null;

  const pdfs = await getPdfs();
  const relatedPdfs = pdfs.filter((p: any) => p.system === slug && (!gen || p.generation === gen));

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="bg-vw-blue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
            <Link href="/" className="hover:text-vw-gold">Home</Link>
            {selectedGen && (
              <>
                <span>/</span>
                <Link href={`/generation/${selectedGen.slug}`} className="hover:text-vw-gold">{selectedGen.name}</Link>
              </>
            )}
            <span>/</span>
            <span className="text-vw-gold">{systemInfo.name}</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {selectedGen ? `${selectedGen.name} - ` : ''}{systemInfo.name}
          </h1>
          <p className="text-xl text-gray-300">{systemInfo.description}</p>
        </div>
      </section>

      {/* System Details */}
      {selectedGen && systemInfo.specs && (
        <section className="py-12 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-vw-blue mb-6">Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(systemInfo.specs).map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">{key}</div>
                  <div className="font-semibold text-vw-dark">{value as string}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Common Issues */}
      {selectedGen && systemInfo.commonIssues && systemInfo.commonIssues.length > 0 && (
        <section className="py-12 bg-red-50 border-b">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Common Issues</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {systemInfo.commonIssues.map((issue: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">⚠️</span>
                  <span className="text-gray-700">{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Maintenance Tips */}
      {selectedGen && systemInfo.maintenanceTips && systemInfo.maintenanceTips.length > 0 && (
        <section className="py-12 bg-green-50 border-b">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-green-800 mb-4">Maintenance Tips</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {systemInfo.maintenanceTips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Related PDFs */}
      {selectedGen && relatedPdfs.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-vw-blue">Related PDFs</h2>
              <Link href={`/library?generation=${gen}&system=${slug}`} className="text-vw-blue hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPdfs.slice(0, 3).map((pdf: any) => (
                <div key={pdf.id} className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-all">
                  <h3 className="font-bold text-vw-dark mb-1">{pdf.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{pdf.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{formatFileSize(pdf.fileSize)}</span>
                    <a href={pdf.url} download className="text-vw-blue text-sm hover:underline">Download</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related DIY Guides */}
      {selectedGen && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-vw-blue">DIY Guides</h2>
              <Link href={`/guides?generation=${gen}&system=${slug}`} className="text-vw-blue hover:underline">
                View All →
              </Link>
            </div>
            <p className="text-gray-600 mb-4">
              Check the DIY Guides page for step-by-step tutorials on {selectedGen.name} {systemInfo.name}.
            </p>
            <Link href={`/guides?generation=${gen}&system=${slug}`} className="btn-primary">
              Browse {selectedGen.name} {systemInfo.name} Guides
            </Link>
          </div>
        </section>
      )}

      {/* No resources message */}
      {selectedGen && relatedPdfs.length === 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-gray-600 mb-4">
              No PDFs or guides found specifically for {selectedGen.name} {systemInfo.name}.
            </p>
            <div className="flex gap-4">
              <Link href={`/library?generation=${gen}`} className="text-vw-blue hover:underline">
                Browse All {selectedGen.name} PDFs
              </Link>
              <Link href={`/guides?generation=${gen}`} className="text-vw-blue hover:underline">
                Browse All {selectedGen.name} Guides
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Other Generations with this system */}
      {!selectedGen && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-vw-blue mb-6">
              {systemInfo.name} across all generations
            </h2>
            <div className="space-y-6">
              {allSystems.map((sys, index) => (
                <Link
                  key={`${sys.generationSlug}-${index}`}
                  href={`/systems/${sys.slug}?gen=${sys.generationSlug}`}
                  className="block bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-vw-blue">{sys.generation}</h3>
                      <p className="text-gray-600 mt-1 line-clamp-2">{sys.description}</p>
                    </div>
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}