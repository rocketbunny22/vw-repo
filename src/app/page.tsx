'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { generations } from '@/data/generations';
import { VehicleProfile } from '@/types';
import UiIcon, { IconName } from '@/components/UiIcon';

const systemsList: Array<{ name: string; icon: IconName; slug: string }> = [
  { name: 'Engine', icon: 'engine', slug: 'engine' },
  { name: 'Suspension', icon: 'suspension', slug: 'suspension' },
  { name: 'Brakes', icon: 'brakes', slug: 'brakes' },
  { name: 'Electrical', icon: 'electrical', slug: 'electrical' },
  { name: 'Transmission', icon: 'transmission', slug: 'transmission' },
  { name: 'Body', icon: 'body', slug: 'body' },
];

export default function Home() {
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [vehicle, setVehicle] = useState<VehicleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissedGarage, setDismissedGarage] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('dismissedGarage') === 'true'
  );

  useEffect(() => {
    async function load() {
      try {
        const authRes = await fetch('/api/auth');
        const authData = await authRes.json();
        if (authData.authenticated) {
          setUser(authData.user);
          const vehRes = await fetch('/api/user/vehicle');
          const vehData = await vehRes.json();
          if (vehData.vehicle) {
            setVehicle(vehData.vehicle);
          }
        }
      } catch {
        // not authenticated
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getGenerationName = (id: string) => {
    const gen = generations.find(g => g.id === id);
    return gen?.name || id;
  };

  const userGen = vehicle ? generations.find(g => g.id === vehicle.generation) : null;

  return (
    <div className="flex flex-col">
      {/* Personalized Greeting */}
      {!loading && user && vehicle && !dismissedGarage && (
        <section className="bg-gradient-to-r from-vw-gold to-amber-500 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-vw-blue text-sm font-medium">YOUR GARAGE</p>
                <h2 className="text-2xl font-bold text-vw-blue">
                  {vehicle.nickname ? `${vehicle.nickname}` : ''} {getGenerationName(vehicle.generation)} {vehicle.model}
                </h2>
                <p className="text-vw-blue/80 text-sm">
                  Hey {user.username}! Here&apos;s what&apos;s relevant for your ride.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/generation/${vehicle.generation}`} className="bg-white text-vw-blue px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors text-sm">
                  View Generation
                </Link>
                <Link href={`/guides?generation=${vehicle.generation}`} className="bg-vw-blue text-white px-4 py-2 rounded-md font-medium hover:bg-vw-blue-light transition-colors text-sm">
                  Guides for Your Car
                </Link>
                <button
                  onClick={() => { setDismissedGarage(true); localStorage.setItem('dismissedGarage', 'true'); }}
                  className="text-vw-blue/60 hover:text-vw-blue text-2xl ml-2"
                  aria-label="Dismiss garage bar"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {!loading && !vehicle && user && !dismissedGarage && (
        <section className="bg-gradient-to-r from-vw-gold to-amber-500 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-vw-blue text-sm">Hey {user.username}.</p>
                <h2 className="text-xl font-bold text-vw-blue">Set up your garage to get personalized content</h2>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/profile" className="bg-white text-vw-blue px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors text-sm">
                  Add Your Car
                </Link>
                <button
                  onClick={() => { setDismissedGarage(true); localStorage.setItem('dismissedGarage', 'true'); }}
                  className="text-vw-blue/60 hover:text-vw-blue text-2xl"
                  aria-label="Dismiss garage bar"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative bg-[url('/images/all_gens.webp')] bg-cover bg-center overflow-hidden">
        <div className="absolute inset-0 bg-black/60" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-24 relative">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-vw-gold rounded-full mb-6">
              <span className="text-vw-blue font-bold text-xl">VW</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              VW Repo
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              The comprehensive knowledge base for Volkswagen enthusiasts. 
              From air-cooled classics to modern performance.
            </p>
            <form
              action="/search"
              method="get"
              className="mx-auto mb-5 flex max-w-3xl flex-col gap-3 rounded-xl bg-white p-2 text-left shadow-2xl ring-4 ring-vw-gold/50 sm:flex-row"
            >
              <div className="relative flex-1">
                <svg
                  className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-vw-blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.1-5.4a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                </svg>
                <input
                  type="text"
                  name="q"
                  placeholder="Search manuals, guides, systems, models..."
                  className="w-full rounded-lg border-2 border-vw-blue/20 bg-white py-4 pl-14 pr-5 text-lg font-medium text-gray-950 placeholder:text-gray-500 focus:border-vw-gold focus:outline-none focus:ring-4 focus:ring-vw-gold/30"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-vw-gold px-8 py-4 text-lg font-bold text-vw-blue shadow-md transition-colors hover:bg-vw-gold-light"
              >
                Search
              </button>
            </form>
            <div className="flex justify-center">
              <Link href="#generations" className="bg-white/95 text-vw-blue hover:bg-white px-8 py-3 rounded-md font-medium transition-colors text-lg shadow-lg">
                Browse Generations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 -mt-16 bg-slate-50 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-vw-blue/10 bg-vw-blue/10 shadow-xl md:grid-cols-4">
            <div className="bg-white/95 px-4 py-6 text-center">
              <div className="text-3xl font-bold text-vw-blue">{generations.length}</div>
              <div className="text-vw-dark/70 text-sm">Generations</div>
            </div>
            <div className="bg-white/95 px-4 py-6 text-center">
              <div className="text-3xl font-bold text-vw-blue">6</div>
              <div className="text-vw-dark/70 text-sm">Core Systems</div>
            </div>
            <div className="bg-white/95 px-4 py-6 text-center">
              <div className="text-3xl font-bold text-vw-blue">50+</div>
              <div className="text-vw-dark/70 text-sm">Vehicle Models</div>
            </div>
            <div className="bg-white/95 px-4 py-6 text-center">
              <div className="text-3xl font-bold text-vw-blue">80+</div>
              <div className="text-vw-dark/70 text-sm">Years of VW History</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Systems for Your Vehicle */}
      {vehicle && userGen && (
        <section className="bg-slate-50 pt-12 pb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-vw-blue">Recommended for Your {getGenerationName(vehicle.generation)}</h2>
                <p className="text-gray-600 text-sm mt-1">Common systems and known issues for your generation.</p>
              </div>
              <Link href={`/generation/${vehicle.generation}`} className="text-vw-blue hover:text-vw-gold font-medium text-sm transition-colors">
                View all systems →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {userGen.systems.slice(0, 6).map((system) => {
                const sysInfo = systemsList.find(s => s.slug === system.id);
                return (
                  <Link
                    key={system.id}
                    href={`/systems/${system.slug}?gen=${vehicle.generation}`}
                    className="group flex flex-col items-center rounded-md border border-vw-blue/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-vw-gold/70 hover:shadow-md"
                  >
                    <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-vw-blue/15 bg-vw-blue/5 text-vw-blue group-hover:border-vw-gold/60 group-hover:bg-vw-gold/10">
                      <UiIcon name={sysInfo?.icon || 'guide'} className="h-5 w-5" />
                    </span>
                    <span className="font-medium text-sm text-center">{system.name}</span>
                    {system.commonIssues && system.commonIssues.length > 0 && (
                      <span className="text-xs text-vw-red mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Known issues
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Generations Grid */}
      <section id="generations" className="bg-slate-50 py-16">
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
                <div className="overflow-hidden rounded-md border border-vw-blue/10 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-vw-gold/70 hover:shadow-lg">
                  {gen.image ? (
                    <div className="h-24 relative bg-gradient-to-br from-vw-blue to-vw-blue-light">
                      <Image 
                        src={gen.image} 
                        alt={gen.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-vw-blue/80 to-transparent" />
                      <div className="absolute bottom-2 left-2">
                        <span className="text-2xl font-bold text-vw-gold">{gen.name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-24 bg-gradient-to-br from-vw-blue to-vw-blue-light flex items-center justify-center">
                      <span className="text-3xl font-bold text-vw-gold">{gen.name}</span>
                    </div>
                  )}
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
      <section className="bg-gradient-to-b from-slate-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-vw-blue mb-4">Vehicle Systems</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Technical information organized by vehicle system. From engine rebuilding to electrical diagnostics.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {systemsList.map((system) => (
              <Link 
                key={system.slug}
                href={`/systems/${system.slug}`}
                className="group flex flex-col items-center rounded-md border border-vw-blue/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-vw-gold/70 hover:shadow-md"
              >
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-md border border-vw-blue/15 bg-vw-blue/5 text-vw-blue group-hover:border-vw-gold/60 group-hover:bg-vw-gold/10">
                  <UiIcon name={system.icon} className="h-6 w-6" />
                </span>
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
