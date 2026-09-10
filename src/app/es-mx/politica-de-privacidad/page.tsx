import type { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Política de privacidad',
  description: 'Política de privacidad de VW Repo para cuentas, contenido enviado y datos de uso.',
  path: '/es-mx/politica-de-privacidad',
  locale: 'es-MX',
});

export default function SpanishPrivacyPolicyPage() {
  return (
    <div className="bg-vw-surface/70 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <article className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-vw-line bg-vw-paper shadow-[0_18px_50px_rgba(55,42,28,0.08)]">
        <header className="border-b border-vw-line bg-vw-cream px-6 py-10 sm:px-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-vw-red">La letra pequeña</p>
          <h1 className="text-4xl font-bold text-vw-blue sm:text-5xl">Política de privacidad</h1>
          <p className="mt-4 max-w-2xl text-vw-muted">Cómo VW Repo recopila, utiliza y protege la información de cuentas y de la comunidad.</p>
        </header>
        <div className="prose prose-lg max-w-none px-6 py-8 text-vw-muted prose-headings:text-vw-blue sm:px-10 sm:py-10">
        <h2>Información que recopilamos</h2>
        <p>Podemos recopilar la información de cuenta que proporcionas, el contenido que envías y datos técnicos básicos necesarios para operar y mejorar VW Repo.</p>
        <h2>Cómo utilizamos la información</h2>
        <p>Utilizamos la información para prestar el servicio, administrar cuentas, moderar contenido, mejorar el sitio y protegerlo contra abuso.</p>
        <h2>Contenido enviado</h2>
        <p>Las guías, comentarios y documentos enviados pueden mostrarse públicamente después de su revisión.</p>
        <h2>Seguridad y solicitudes</h2>
        <p>Aplicamos medidas razonables para proteger la información. Puedes solicitar acceso, corrección o eliminación de tus datos mediante el formulario de comentarios.</p>
        </div>
      </article>
    </div>
  );
}
