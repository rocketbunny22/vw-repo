import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { generations } from '@/data/generations';
import { createMetadata } from '@/lib/seo';
import { generationDescriptionsEs, systemNamesEs, toSpanishPath } from '@/lib/localization';
import UiIcon, { IconName } from '@/components/UiIcon';

const systems: Array<{ slug: string; icon: IconName }> = [
  { slug: 'engine', icon: 'engine' },
  { slug: 'suspension', icon: 'suspension' },
  { slug: 'brakes', icon: 'brakes' },
  { slug: 'electrical', icon: 'electrical' },
  { slug: 'transmission', icon: 'transmission' },
  { slug: 'body', icon: 'body' },
];

export const metadata: Metadata = createMetadata({
  title: 'Manuales, guías y especificaciones Volkswagen',
  description: 'Manuales de reparación, guías paso a paso, especificaciones técnicas y recursos PDF para modelos Volkswagen clásicos y modernos.',
  path: '/es-mx',
  image: '/images/all_gens.webp',
  locale: 'es-MX',
});

export default function SpanishHomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-[url('/images/all_gens.webp')] bg-cover bg-center">
        <div className="absolute inset-0 bg-vw-dark/80" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <Image src="/images/vw_repo_logo_squared.png" alt="VW Repo" width={80} height={80} className="mx-auto mb-6" priority />
          <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">VW Repo</h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-200">
            Manuales, guías de reparación y datos técnicos para entusiastas de Volkswagen en México.
          </p>
          <form
            action="/es-mx/buscar"
            method="get"
            className="mx-auto mb-5 flex max-w-3xl flex-col gap-3 rounded-xl bg-white p-2 text-left shadow-2xl ring-1 ring-white/30 sm:flex-row"
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
                placeholder="Buscar manuales, guías, sistemas o modelos..."
                className="w-full rounded-lg border-2 border-vw-blue/20 bg-white py-4 pl-14 pr-5 text-lg font-medium text-gray-950 placeholder:text-gray-500 focus:border-vw-gold focus:outline-none focus:ring-4 focus:ring-vw-gold/30"
              />
            </div>
            <button type="submit" className="rounded-lg bg-vw-gold px-8 py-4 text-lg font-bold text-vw-blue shadow-md transition-colors hover:bg-vw-gold-light">
              Buscar
            </button>
          </form>
        </div>
      </section>

      <section className="border-y border-vw-line bg-vw-steel py-10" aria-labelledby="resumen-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="resumen-title" className="sr-only">Resumen del contenido</h2>
          <dl className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            <div><dt className="text-sm text-vw-dark">Generaciones</dt><dd className="order-first text-3xl font-bold text-vw-blue">{generations.length}</dd></div>
            <div><dt className="text-sm text-vw-dark">Sistemas principales</dt><dd className="order-first text-3xl font-bold text-vw-blue">6</dd></div>
            <div><dt className="text-sm text-vw-dark">Modelos Volkswagen</dt><dd className="order-first text-3xl font-bold text-vw-blue">50+</dd></div>
            <div><dt className="text-sm text-vw-dark">Años de historia</dt><dd className="order-first text-3xl font-bold text-vw-blue">80+</dd></div>
          </dl>
        </div>
      </section>

      <section className="bg-vw-surface py-14" aria-labelledby="generaciones-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 id="generaciones-title" className="mb-4 text-3xl font-bold text-vw-blue">Explora por generación</h2>
            <p className="mx-auto max-w-2xl text-gray-600">Consulta sistemas, modelos, manuales y guías organizados por generación Volkswagen.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {generations.map((generation) => (
              <Link key={generation.id} href={toSpanishPath(`/generation/${generation.slug}`)} className="group">
                <article className="overflow-hidden rounded-xl border border-vw-line bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-vw-blue/30 hover:shadow-md">
                  <div className="relative h-24 bg-gradient-to-br from-vw-blue to-vw-blue-light">
                    <Image src={generation.image} alt={`${generation.name} Volkswagen`} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-vw-blue/80 to-transparent" />
                    <div className="absolute bottom-2 left-2">
                      <h3 className="border-l-4 border-vw-gold pl-2 text-2xl font-bold text-white">{generation.name}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500">{generation.years}</span>
                      <span className="badge badge-blue">{generation.models.length} modelos</span>
                    </div>
                    <p className="line-clamp-2 text-sm text-gray-600">{generationDescriptionsEs[generation.slug]}</p>
                    <div className="mt-3 text-sm font-medium text-vw-blue transition-colors group-hover:text-vw-link-blue">
                      Ver sistemas →
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14" aria-labelledby="sistemas-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="sistemas-title" className="mb-8 text-center text-3xl font-bold text-vw-blue">Sistemas del vehículo</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {systems.map((system) => (
              <Link key={system.slug} href={toSpanishPath(`/systems/${system.slug}`)} className="group flex flex-col items-center rounded-lg bg-gray-50 p-6 text-center font-semibold text-vw-blue transition-colors hover:bg-vw-blue hover:text-white">
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-md border border-vw-blue/15 bg-white text-vw-blue group-hover:border-white/30 group-hover:bg-white/10 group-hover:text-white">
                  <UiIcon name={system.icon} className="h-6 w-6" />
                </span>
                {systemNamesEs[system.slug]}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
