import Link from 'next/link';
import { generations } from '@/data/generations';

export default function Home() {
  const mainGenerations = generations.slice(0, 8);
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-vw-blue overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(178, 151, 90, 0.1) 10px,
              rgba(178, 151, 90, 0.1) 20px
            )`
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-vw-gold rounded-full mb-6">
              <span className="text-vw-blue font-bold text-xl">VW</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              VW Registry
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              The comprehensive knowledge base for Volkswagen enthusiasts. 
              From air-cooled classics to modern performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search" className="btn-secondary text-lg px-8 py-3">
                Search Database
              </Link>
              <Link href="#generations" className="bg-white text-vw-blue hover:bg-gray-100 px-8 py-3 rounded-md font-medium transition-colors text-lg">
                Browse Generations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-vw-gold py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-vw-blue">{generations.length}</div>
              <div className="text-vw-dark text-sm">Generations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-vw-blue">6</div>
              <div className="text-vw-dark text-sm">Core Systems</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-vw-blue">50+</div>
              <div className="text-vw-dark text-sm">Vehicle Models</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-vw-blue">80+</div>
              <div className="text-vw-dark text-sm">Years of VW History</div>
            </div>
          </div>
        </div>
      </section>

      {/* Generations Grid */}
      <section id="generations" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-vw-blue mb-4">Explore by Generation</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select your generation to explore detailed technical information, specifications, and maintenance guides.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {generations.map((gen) => (
              <Link 
                key={gen.id} 
                href={`/generation/${gen.slug}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="h-24 bg-gradient-to-br from-vw-blue to-vw-blue-light flex items-center justify-center">
                    <span className="text-3xl font-bold text-vw-gold">{gen.name}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">{gen.years}</span>
                      <span className="badge badge-blue">{gen.models.length} models</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{gen.description}</p>
                    <div className="mt-3 text-vw-blue text-sm font-medium group-hover:text-vw-gold transition-colors">
                      View Systems →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Systems */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-vw-blue mb-4">Vehicle Systems</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Technical information organized by vehicle system. From engine rebuilding to electrical diagnostics.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Engine', icon: '⚙️', slug: 'engine' },
              { name: 'Suspension', icon: '🔧', slug: 'suspension' },
              { name: 'Brakes', icon: '🛑', slug: 'brakes' },
              { name: 'Electrical', icon: '⚡', slug: 'electrical' },
              { name: 'Transmission', icon: '🔄', slug: 'transmission' },
              { name: 'Body', icon: '🚗', slug: 'body' },
            ].map((system) => (
              <Link 
                key={system.slug}
                href={`/systems/${system.slug}`}
                className="flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-vw-blue hover:text-white transition-colors group"
              >
                <span className="text-3xl mb-2">{system.icon}</span>
                <span className="font-medium">{system.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-vw-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to dive in?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Start exploring the most comprehensive VW knowledge base. Select a generation above or use our search feature.
          </p>
          <Link href="/search" className="btn-primary text-lg px-8 py-3">
            Search All Content
          </Link>
        </div>
      </section>
    </div>
  );
}