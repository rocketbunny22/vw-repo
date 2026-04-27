import Link from 'next/link';
import { generations } from '@/data/generations';
import { getAllPdfs } from '@/data/pdfs';
import { notFound } from 'next/navigation';
import { PdfCard } from '@/components/PdfViewer';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function GenerationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const generation = generations.find((g) => g.slug === slug);
  
  if (!generation) notFound();

  const pdfs = await getAllPdfs();
  const relatedPdfs = pdfs.filter(
    (pdf) => pdf.generation === generation.id || pdf.generation === generation.slug
  );
  
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div><div className="text-2xl font-bold text-vw-blue">{generation.systems.length}</div><div className="text-sm text-vw-dark">Systems</div></div>
            <div><div className="text-2xl font-bold text-vw-blue">{generation.models.length}</div><div className="text-sm text-vw-dark">Models</div></div>
            <div><div className="text-2xl font-bold text-vw-blue">{relatedPdfs.length}</div><div className="text-sm text-vw-dark">PDFs</div></div>
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

      <section className="py-12 px-4 bg-white border-t">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-vw-blue">Related PDFs</h2>
              <p className="text-gray-600 mt-1">Documents uploaded for {generation.name}.</p>
            </div>
            <Link href={`/library?generation=${generation.id}`} className="text-vw-blue hover:underline">
              View all PDFs →
            </Link>
          </div>

          {relatedPdfs.length === 0 ? (
            <div className="bg-gray-50 rounded-lg border p-6 text-gray-600">
              No PDFs have been uploaded for this generation yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPdfs.slice(0, 6).map((pdf) => (
                <PdfCard key={pdf.id} pdf={pdf} formatFileSize={formatFileSize} />
              ))}
            </div>
          )}
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