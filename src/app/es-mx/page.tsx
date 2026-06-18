import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { generations } from '@/data/generations';
import { createMetadata } from '@/lib/seo';
import { generationDescriptionsEs, systemNamesEs, toSpanishPath } from '@/lib/localization';

const systems = ['engine', 'suspension', 'brakes', 'electrical', 'transmission', 'body'];

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
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <Image src="/images/vw_repo_logo_squared.png" alt="VW Repo" width={80} height={80} className="mx-auto mb-6" priority />
          <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">VW Repo</h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-200">
            Manuales, guías de reparación y datos técnicos para entusiastas de Volkswagen en México.
          </p>
          <form action="/search" method="get" className="mx-auto flex max-w-3xl flex-col gap-3 bg-white p-2 shadow-2xl sm:flex-row">
            <input
              type="search"
              name="q"
              placeholder="Buscar manuales, guías, sistemas o modelos"
              className="min-w-0 flex-1 border border-gray-300 px-4 py-3 text-gray-950 focus:border-vw-gold focus:outline-none"
            />
            <button type="submit" className="bg-vw-gold px-7 py-3 font-bold text-vw-blue hover:bg-vw-gold-light">
              Buscar
            </button>
          </form>
        </div>
      </section>

      <section className="bg-vw-gold py-10" aria-labelledby="resumen-title">
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

      <section className="bg-gray-50 py-14" aria-labelledby="generaciones-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="generaciones-title" className="mb-3 text-3xl font-bold text-vw-blue">Explora por generación</h2>
          <p className="mb-8 max-w-3xl text-gray-600">Consulta sistemas, modelos, manuales y guías organizados por generación Volkswagen.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {generations.map((generation) => (
              <article key={generation.id} className="overflow-hidden border bg-white shadow-sm">
                <Image src={generation.image} alt={`${generation.name} Volkswagen`} width={640} height={360} className="aspect-video w-full object-cover" />
                <div className="p-5">
                  <h3 className="text-xl font-bold text-vw-blue">{generation.name}</h3>
                  <p className="mt-1 text-sm font-medium text-gray-500">{generation.years}</p>
                  <p className="mt-3 line-clamp-3 text-sm text-gray-700">{generationDescriptionsEs[generation.slug]}</p>
                  <Link href={toSpanishPath(`/generation/${generation.slug}`)} className="mt-4 inline-block font-medium text-vw-blue hover:underline">
                    Ver generación
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14" aria-labelledby="sistemas-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="sistemas-title" className="mb-8 text-3xl font-bold text-vw-blue">Sistemas del vehículo</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {systems.map((system) => (
              <Link key={system} href={toSpanishPath(`/systems/${system}`)} className="border bg-gray-50 p-5 text-center font-semibold text-vw-blue hover:border-vw-gold hover:bg-white">
                {systemNamesEs[system]}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
