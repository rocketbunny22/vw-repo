'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DiyGuide } from '@/types';
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

export default function GuidesPage({ searchParams }: { searchParams: Promise<{ generation?: string; system?: string }> }) {
  const [guides, setGuides] = useState<DiyGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGeneration, setSelectedGeneration] = useState<string>('all');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');

  useEffect(() => {
    async function init() {
      const params = await searchParams;
      setSelectedGeneration(params.generation || 'all');
      setSelectedSystem(params.system || 'all');
      fetchGuides();
    }
    init();
  }, []);

  const fetchGuides = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedGeneration !== 'all') params.set('generation', selectedGeneration);
      if (selectedSystem !== 'all') params.set('system', selectedSystem);
      
      const response = await fetch(`/api/guides?${params}`);
      const data = await response.json();
      setGuides(data.guides || []);
    } catch (error) {
      console.error('Failed to fetch guides:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, [selectedGeneration, selectedSystem]);

  const filteredGuides = guides.filter((guide) => {
    if (difficulty !== 'all' && guide.difficulty !== difficulty) return false;
    return true;
  });

  const getGenerationName = (id: string) => {
    const gen = generations.find((g) => g.id === id);
    return gen?.name || id;
  };

  const getSystemName = (id: string) => {
    const sys = systemsList.find((s) => s.id === id);
    return sys?.name || id;
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col">
      <section className="bg-vw-blue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-4">DIY Guides</h1>
          <p className="text-xl text-gray-300">
            Step-by-step tutorials for maintaining and modifying your VW.
          </p>
        </div>
      </section>

      <section className="bg-vw-gold py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 flex-wrap">
            <select
              value={selectedGeneration}
              onChange={(e) => setSelectedGeneration(e.target.value)}
              className="px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-vw-blue"
            >
              <option value="all">All Generations</option>
              {generations.map((gen) => (
                <option key={gen.id} value={gen.id}>
                  {gen.name}
                </option>
              ))}
            </select>
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-vw-blue"
            >
              <option value="all">All Systems</option>
              {systemsList.map((sys) => (
                <option key={sys.id} value={sys.id}>
                  {sys.name}
                </option>
              ))}
            </select>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-vw-blue"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading guides...</p>
            </div>
          ) : filteredGuides.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-gray-500">No guides found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/guides/${guide.slug}`}
                  className="block bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {guide.featured && (
                        <span className="badge bg-vw-gold text-vw-blue">Featured</span>
                      )}
                      <span className={`badge ${getDifficultyColor(guide.difficulty)}`}>
                        {guide.difficulty.charAt(0).toUpperCase() + guide.difficulty.slice(1)}
                      </span>
                    </div>
                    <h3 className="font-bold text-vw-dark mb-2 line-clamp-2">{guide.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="badge badge-blue">{getGenerationName(guide.generation)}</span>
                      <span className="badge badge-gold">{getSystemName(guide.system)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      By {guide.author} • {guide.timeEstimate}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{guide.views.toLocaleString()} views</span>
                      <span>{formatDate(guide.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}