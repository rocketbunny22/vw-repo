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
      <section className="relative overflow-hidden border-b border-vw-gold/35 bg-[url('/images/all_gens.webp')] bg-cover bg-[center_58%]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,39,48,0.98)_0%,rgba(20,39,48,0.91)_43%,rgba(20,39,48,0.5)_72%,rgba(20,39,48,0.32)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(197,138,58,0.16),transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-vw-gold-light">
              <span className="h-px w-9 bg-vw-gold" aria-hidden="true" />
              Hecho para propietarios Volkswagen
            </div>
            <h1 className="max-w-3xl text-5xl font-bold leading-[0.98] text-white sm:text-6xl lg:text-7xl">
              El conocimiento Volkswagen que vale la pena conservar.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#eee7dc] sm:text-xl">
              Manuales, guías de reparación, especificaciones y experiencia práctica, desde clásicos enfriados por aire hasta modelos actuales.
          </p>
          <form
            action="/es-mx/buscar"
            method="get"
            className="mt-9 flex max-w-2xl flex-col gap-2 rounded-xl border border-white/20 bg-vw-paper p-2 text-left shadow-[0_22px_60px_rgba(0,0,0,0.3)] sm:flex-row"
          >
            <label htmlFor="buscar-inicio" className="sr-only">Buscar en VW Repo</label>
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
                id="buscar-inicio"
                type="text"
                name="q"
                placeholder="Buscar manuales, guías, sistemas o modelos..."
                className="w-full rounded-lg border border-vw-line bg-vw-cream py-4 pl-14 pr-5 text-lg font-medium text-vw-dark placeholder:text-vw-muted focus:border-vw-gold focus:outline-none focus:ring-4 focus:ring-vw-gold/20"
              />
            </div>
            <button type="submit" className="rounded-lg border border-vw-gold bg-vw-gold px-8 py-4 text-lg font-bold text-vw-dark shadow-md transition-colors hover:bg-vw-gold-light">
              Buscar
            </button>
          </form>
            <div className="mt-6 flex flex-wrap items-center gap-5 text-sm font-semibold">
              <Link href="#generaciones" className="text-vw-gold-light transition-colors hover:text-white">Explorar generaciones <span aria-hidden="true">→</span></Link>
              <Link href="/es-mx/biblioteca" className="text-[#eee7dc] transition-colors hover:text-white">Abrir la biblioteca <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-vw-line bg-vw-paper py-7" aria-labelledby="resumen-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="resumen-title" className="sr-only">Resumen del contenido</h2>
          <dl className="grid grid-cols-2 gap-y-6 md:grid-cols-4 md:divide-x md:divide-vw-line">
            <div className="flex flex-col md:px-6 md:first:pl-0"><dt className="order-2 mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-vw-muted">Generaciones</dt><dd className="order-1 text-2xl font-bold text-vw-blue">{generations.length}</dd></div>
            <div className="flex flex-col md:px-6"><dt className="order-2 mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-vw-muted">Sistemas principales</dt><dd className="order-1 text-2xl font-bold text-vw-blue">6</dd></div>
            <div className="flex flex-col md:px-6"><dt className="order-2 mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-vw-muted">Modelos Volkswagen</dt><dd className="order-1 text-2xl font-bold text-vw-blue">50+</dd></div>
            <div className="flex flex-col md:px-6"><dt className="order-2 mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-vw-muted">Años de historia</dt><dd className="order-1 text-2xl font-bold text-vw-blue">80+</dd></div>
          </dl>
        </div>
      </section>

      <section id="generaciones" className="bg-vw-surface py-20" aria-labelledby="generaciones-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(18rem,32rem)] md:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-vw-red">Encuentra tu Volkswagen</p>
              <h2 id="generaciones-title" className="text-4xl font-bold text-vw-blue sm:text-5xl">Explora por generación</h2>
            </div>
            <p className="leading-relaxed text-vw-muted">Empieza con el auto que conoces. Cada generación reúne sus sistemas, especificaciones, manuales y guías prácticas.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {generations.map((generation) => (
              <Link key={generation.id} href={toSpanishPath(`/generation/${generation.slug}`)} className="group">
                <article className="overflow-hidden rounded-xl border border-vw-line bg-vw-paper shadow-[0_12px_30px_rgba(55,42,28,0.07)] transition-all group-hover:-translate-y-1 group-hover:border-vw-gold/60 group-hover:shadow-[0_18px_42px_rgba(55,42,28,0.12)]">
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-vw-blue to-vw-blue-light">
                    <Image src={generation.image} alt={`${generation.name} Volkswagen`} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-vw-dark/90 via-vw-dark/15 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <h3 className="border-l-3 border-vw-gold pl-3 text-3xl font-bold text-white">{generation.name}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-vw-muted">{generation.years}</span>
                      <span className="badge badge-blue">{generation.models.length} modelos</span>
                    </div>
                    <p className="line-clamp-3 text-sm leading-relaxed text-vw-muted">{generationDescriptionsEs[generation.slug]}</p>
                    <div className="mt-4 border-t border-vw-line pt-4 text-sm font-semibold text-vw-blue transition-colors group-hover:text-vw-red">
                      Abrir generación <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-vw-line bg-vw-paper py-20" aria-labelledby="sistemas-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(18rem,32rem)] md:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-vw-red">Trabaja por sistema</p>
              <h2 id="sistemas-title" className="text-4xl font-bold text-vw-blue sm:text-5xl">Del motor al sistema eléctrico</h2>
            </div>
            <p className="leading-relaxed text-vw-muted">Sigue el problema, no solo el modelo. La información técnica está organizada alrededor de los sistemas que inspeccionas y reparas.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {systems.map((system) => (
              <Link key={system.slug} href={toSpanishPath(`/systems/${system.slug}`)} className="group flex flex-col items-center rounded-xl border border-vw-line bg-vw-cream p-6 text-center font-semibold text-vw-dark transition-all hover:-translate-y-0.5 hover:border-vw-gold/60 hover:bg-vw-surface">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-vw-gold/35 bg-vw-gold/10 text-vw-blue transition-colors group-hover:bg-vw-gold/20">
                  <UiIcon name={system.icon} className="h-6 w-6" />
                </span>
                {systemNamesEs[system.slug]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-vw-dark py-16">
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-vw-gold/20" aria-hidden="true" />
        <div className="absolute -right-8 -top-20 h-56 w-56 rounded-full border border-vw-gold/15" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center lg:px-8">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-vw-gold-light">Comparte buena información</p>
            <h2 className="text-4xl font-bold text-white">¿Tienes algo útil en tu garage?</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-[#d9d2c8]">Comparte una guía o documento técnico y ayuda a otro propietario Volkswagen a resolver su próximo problema con mejor información.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href="/es-mx/enviar-guia" className="rounded-md border border-vw-gold bg-vw-gold px-6 py-3 font-bold text-vw-dark transition-colors hover:bg-vw-gold-light">Compartir una guía</Link>
            <Link href="/es-mx/biblioteca" className="rounded-md border border-white/30 px-6 py-3 font-semibold text-white transition-colors hover:border-vw-gold hover:text-vw-gold-light">Explorar manuales</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
