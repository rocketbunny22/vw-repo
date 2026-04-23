import Link from 'next/link';
import { generations } from '@/data/generations';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-vw-blue py-24 flex-1">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-8xl font-bold text-vw-gold mb-4">404</div>
          <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
          <p className="text-xl text-gray-300 mb-8 max-w-xl mx-auto">
            Sorry, the page you're looking for doesn't exist. Let's get you back on track.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/" className="btn-primary text-lg px-8 py-3">
              Go Home
            </Link>
            <Link href="/search" className="btn-secondary text-lg px-8 py-3">
              Search
            </Link>
          </div>

          <div className="bg-vw-dark rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-4">Quick Links</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
              {generations.slice(0, 6).map((gen) => (
                <Link
                  key={gen.id}
                  href={`/generation/${gen.slug}`}
                  className="text-vw-gold hover:underline"
                >
                  {gen.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}