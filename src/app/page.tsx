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
        <section className="border-b border-vw-gold/30 bg-vw-paper py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-l-4 border-vw-gold pl-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-vw-muted">Your garage</p>
                <h2 className="mt-1 text-2xl font-bold text-vw-blue">
                  {vehicle.nickname ? `${vehicle.nickname}` : ''} {getGenerationName(vehicle.generation)} {vehicle.model}
                </h2>
                <p className="mt-1 text-sm text-vw-muted">
                  Hey {user.username}! Here&apos;s what&apos;s relevant for your ride.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/generation/${vehicle.generation}`} className="btn-secondary text-sm">
                  View Generation
                </Link>
                <Link href={`/guides?generation=${vehicle.generation}`} className="btn-primary text-sm">
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
        <section className="border-b border-vw-gold/30 bg-vw-paper py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-l-4 border-vw-gold pl-4">
              <div>
                <p className="text-sm text-vw-muted">Hey {user.username}.</p>
                <h2 className="text-xl font-bold text-vw-blue">Set up your garage for resources that fit your car</h2>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/profile" className="btn-secondary text-sm">
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
      <section className="relative overflow-hidden border-b border-vw-gold/35 bg-[url('/images/all_gens.webp')] bg-cover bg-[center_58%]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,39,48,0.98)_0%,rgba(20,39,48,0.91)_43%,rgba(20,39,48,0.5)_72%,rgba(20,39,48,0.32)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(197,138,58,0.16),transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-vw-gold-light">
              <span className="h-px w-9 bg-vw-gold" aria-hidden="true" />
              Built for Volkswagen owners
            </div>
            <h1 className="max-w-3xl text-5xl font-bold leading-[0.98] text-white sm:text-6xl lg:text-7xl">
              The Volkswagen knowledge worth keeping.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#eee7dc] sm:text-xl">
              Manuals, repair guides, specifications, and hard-earned context—from air-cooled classics to today&apos;s cars.
            </p>
            <form
              action="/search"
              method="get"
              className="mt-9 flex max-w-2xl flex-col gap-2 rounded-xl border border-white/20 bg-vw-paper p-2 text-left shadow-[0_22px_60px_rgba(0,0,0,0.3)] sm:flex-row"
            >
              <label htmlFor="home-search" className="sr-only">Search VW Repo</label>
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
                  id="home-search"
                  type="text"
                  name="q"
                  placeholder="Search manuals, guides, systems, models..."
                  className="w-full rounded-lg border border-vw-line bg-vw-cream py-4 pl-14 pr-5 text-lg font-medium text-vw-dark placeholder:text-vw-muted focus:border-vw-gold focus:outline-none focus:ring-4 focus:ring-vw-gold/20"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg border border-vw-gold bg-vw-gold px-8 py-4 text-lg font-bold text-vw-dark shadow-md transition-colors hover:bg-vw-gold-light"
              >
                Search
              </button>
            </form>
            <div className="mt-6 flex flex-wrap items-center gap-5 text-sm font-semibold">
              <Link href="#generations" className="text-vw-gold-light transition-colors hover:text-white">
                Browse generations <span aria-hidden="true">→</span>
              </Link>
              <Link href="/library" className="text-[#eee7dc] transition-colors hover:text-white">
                Open the manual library <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-vw-line bg-vw-paper py-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-y-6 md:grid-cols-4 md:divide-x md:divide-vw-line">
            <div className="md:px-6 md:first:pl-0">
              <div className="text-2xl font-bold text-vw-blue">{generations.length}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-vw-muted">Generations covered</div>
            </div>
            <div className="md:px-6">
              <div className="text-2xl font-bold text-vw-blue">6</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-vw-muted">Core systems</div>
            </div>
            <div className="md:px-6">
              <div className="text-2xl font-bold text-vw-blue">50+</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-vw-muted">Vehicle models</div>
            </div>
            <div className="md:px-6">
              <div className="text-2xl font-bold text-vw-blue">80+</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-vw-muted">Years of history</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Systems for Your Vehicle */}
      {vehicle && userGen && (
        <section className="border-b border-vw-line bg-vw-cream py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-vw-red">From your garage</p>
                <h2 className="text-2xl font-bold text-vw-blue">Recommended for Your {getGenerationName(vehicle.generation)}</h2>
                <p className="mt-2 text-sm text-vw-muted">Common systems and known issues for your generation.</p>
              </div>
              <Link href={`/generation/${vehicle.generation}`} className="text-vw-blue hover:text-vw-link-blue font-medium text-sm transition-colors">
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
                    className="group flex flex-col items-center rounded-xl border border-vw-line bg-vw-paper p-5 shadow-[0_8px_22px_rgba(55,42,28,0.05)] transition-all hover:-translate-y-0.5 hover:border-vw-gold/60"
                  >
                    <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-vw-gold/30 bg-vw-gold/10 text-vw-blue transition-colors group-hover:bg-vw-gold/20">
                      <UiIcon name={sysInfo?.icon || 'guide'} className="h-5 w-5" />
                    </span>
                    <span className="text-center text-sm font-semibold text-vw-dark">{system.name}</span>
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
      <section id="generations" className="bg-vw-surface py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(18rem,32rem)] md:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-vw-red">Find your Volkswagen</p>
              <h2 className="text-4xl font-bold text-vw-blue sm:text-5xl">Explore by generation</h2>
            </div>
            <p className="leading-relaxed text-vw-muted">
              Start with the car you know. Each generation brings together its systems, specifications, manuals, and practical repair guidance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {generations.map((gen) => (
              <Link 
                key={gen.id} 
                href={`/generation/${gen.slug}`}
                className="group"
              >
                <article className="overflow-hidden rounded-xl border border-vw-line bg-vw-paper shadow-[0_12px_30px_rgba(55,42,28,0.07)] transition-all group-hover:-translate-y-1 group-hover:border-vw-gold/60 group-hover:shadow-[0_18px_42px_rgba(55,42,28,0.12)]">
                  {gen.image ? (
                    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-vw-blue to-vw-blue-light">
                      <Image 
                        src={gen.image} 
                        alt={`${gen.name} Volkswagen generation`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-vw-dark/90 via-vw-dark/15 to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <span className="border-l-3 border-vw-gold pl-3 text-3xl font-bold text-white">{gen.name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-gradient-to-br from-vw-blue to-vw-blue-light">
                      <span className="border-l-4 border-vw-gold pl-2 text-3xl font-bold text-white">{gen.name}</span>
                    </div>
                  )}
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-vw-muted">{gen.years}</span>
                      <span className="badge badge-blue">{gen.models.length} models</span>
                    </div>
                    <p className="line-clamp-3 text-sm leading-relaxed text-vw-muted">{gen.description}</p>
                    <div className="mt-4 border-t border-vw-line pt-4 text-sm font-semibold text-vw-blue transition-colors group-hover:text-vw-red">
                      Open generation <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Systems */}
      <section className="border-y border-vw-line bg-vw-paper py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(18rem,32rem)] md:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-vw-red">Work by system</p>
              <h2 className="text-4xl font-bold text-vw-blue sm:text-5xl">From engines to electrics</h2>
            </div>
            <p className="leading-relaxed text-vw-muted">
              Follow the problem, not just the model. Technical information is organized around the systems you inspect, maintain, and repair.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {systemsList.map((system) => (
              <Link 
                key={system.slug}
                href={`/systems/${system.slug}`}
                className="group flex flex-col items-center rounded-xl border border-vw-line bg-vw-cream p-6 text-vw-dark transition-all hover:-translate-y-0.5 hover:border-vw-gold/60 hover:bg-vw-surface"
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-vw-gold/35 bg-vw-gold/10 text-vw-blue transition-colors group-hover:bg-vw-gold/20">
                  <UiIcon name={system.icon} className="h-6 w-6" />
                </span>
                <span className="font-semibold">{system.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-vw-dark py-16">
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-vw-gold/20" aria-hidden="true" />
        <div className="absolute -right-8 -top-20 h-56 w-56 rounded-full border border-vw-gold/15" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center lg:px-8">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-vw-gold-light">Keep good information moving</p>
            <h2 className="text-4xl font-bold text-white">Have something useful in your garage?</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-[#d9d2c8]">
              Share a repair guide or technical document and help another Volkswagen owner solve the next problem with better information.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href="/submit-guide" className="rounded-md border border-vw-gold bg-vw-gold px-6 py-3 font-bold text-vw-dark transition-colors hover:bg-vw-gold-light">
              Share a Guide
            </Link>
            <Link href="/library" className="rounded-md border border-white/30 px-6 py-3 font-semibold text-white transition-colors hover:border-vw-gold hover:text-vw-gold-light">
              Browse Manuals
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
