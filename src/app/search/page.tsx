'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { generations } from '@/data/generations';

const systemsList = [
  { id: 'engine', name: 'Engine' },
  { id: 'suspension', name: 'Suspension' },
  { id: 'brakes', name: 'Brakes' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'transmission', name: 'Transmission' },
  { id: 'body', name: 'Body & Interior' },
  { id: 'cooling', name: 'Cooling System' },
];

interface SearchResult {
  type: 'generation' | 'pdf' | 'guide';
  id: string;
  title: string;
  description: string;
  generation: string;
  system?: string;
  url: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const [pdfsRes, guidesRes] = await Promise.all([
        fetch('/api/pdfs'),
        fetch('/api/guides')
      ]);

      const pdfsData = await pdfsRes.json();
      const guidesData = await guidesRes.json();

      const pdfs: SearchResult[] = (pdfsData.pdfs || [])
        .filter((p: any) => 
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
        )
        .map((p: any) => ({
          type: 'pdf' as const,
          id: p.id,
          title: p.title,
          description: p.description,
          generation: p.generation,
          system: p.system,
          url: p.url
        }));

      const guides: SearchResult[] = (guidesData.guides || [])
        .filter((g: any) =>
          g.title.toLowerCase().includes(query.toLowerCase()) ||
          g.content?.toLowerCase().includes(query.toLowerCase())
        )
        .map((g: any) => ({
          type: 'guide' as const,
          id: g.id,
          title: g.title,
          description: g.content?.substring(0, 150) + '...',
          generation: g.generation,
          system: g.system,
          url: `/guides/${g.slug}`
        }));

      // Search generations
      const generationResults: SearchResult[] = generations
        .filter(g =>
          g.name.toLowerCase().includes(query.toLowerCase()) ||
          g.slug.toLowerCase().includes(query.toLowerCase())
        )
        .map(g => ({
          type: 'generation' as const,
          id: g.id,
          title: g.name,
          description: g.description,
          generation: g.id,
          url: `/generation/${g.slug}`
        }));

      // Search systems within generations
      const systemResults: SearchResult[] = [];
      generations.forEach(g => {
        g.systems.forEach(sys => {
          if (
            sys.name.toLowerCase().includes(query.toLowerCase()) ||
            sys.description.toLowerCase().includes(query.toLowerCase())
          ) {
            systemResults.push({
              type: 'generation',
              id: `${g.slug}-${sys.slug}`,
              title: `${g.name} - ${sys.name}`,
              description: sys.description,
              generation: g.slug,
              system: sys.slug,
              url: `/systems/${sys.slug}?gen=${g.slug}`
            });
          }
        });
      });

      setResults([...systemResults, ...generationResults, ...pdfs, ...guides]);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'generation': return '🏎️';
      case 'pdf': return '📄';
      case 'guide': return '🔧';
      default: return '📌';
    }
  };

  const getGenerationName = (id: string) => {
    const gen = generations.find(g => g.id === id);
    return gen?.name || id;
  };

  const getSystemName = (id?: string) => {
    if (!id) return '';
    const sys = systemsList.find(s => s.id === id);
    return sys?.name || id;
  };

  return (
    <div className="flex flex-col">
      <section className="bg-vw-blue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-4">Search VW Registry</h1>
          <p className="text-xl text-gray-300 mb-8">
            Search across generations, PDFs, and DIY guides.
          </p>
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for anything..."
              className="flex-1 px-6 py-4 rounded-lg text-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-vw-gold"
            />
            <button
              type="submit"
              className="btn-primary px-8 py-4 text-lg"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>
      </section>

      {searched && !loading && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-vw-blue">
                {results.length} results for "{query}"
              </h2>
              <Link href="/search" className="text-vw-blue hover:underline">
                Clear search
              </Link>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No results found</p>
                <p className="text-gray-400 text-sm mt-2">Try different keywords</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <Link
                    key={`${result.type}-${result.id}-${index}`}
                    href={result.url}
                    className="block bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">{getTypeIcon(result.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs uppercase text-gray-500">{result.type}</span>
                          <span className="badge badge-blue">{getGenerationName(result.generation)}</span>
                          {result.system && (
                            <span className="badge badge-gold">{getSystemName(result.system)}</span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-vw-blue mb-1">{result.title}</h3>
                        <p className="text-gray-600 line-clamp-2">{result.description}</p>
                      </div>
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {!searched && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-vw-blue mb-6">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-vw-blue mb-3">Browse by Generation</h3>
                <div className="space-y-2">
                  {generations.slice(0, 6).map(gen => (
                    <Link
                      key={gen.id}
                      href={`/generation/${gen.slug}`}
                      className="block text-gray-600 hover:text-vw-blue"
                    >
                      {gen.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-vw-blue mb-3">Browse by System</h3>
                <div className="space-y-2">
                  {systemsList.map(sys => (
                    <Link
                      key={sys.id}
                      href={`/systems/${sys.id}`}
                      className="block text-gray-600 hover:text-vw-blue"
                    >
                      {sys.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-vw-blue mb-3">Popular Categories</h3>
                <div className="space-y-2">
                  <Link href="/library" className="block text-gray-600 hover:text-vw-blue">PDF Library</Link>
                  <Link href="/guides" className="block text-gray-600 hover:text-vw-blue">DIY Guides</Link>
                  <Link href="/generation/mk1" className="block text-gray-600 hover:text-vw-blue">Mk1 Golf</Link>
                  <Link href="/generation/mk4" className="block text-gray-600 hover:text-vw-blue">Mk4 GTI</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}