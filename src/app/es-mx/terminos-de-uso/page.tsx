import type { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Términos de uso',
  description: 'Términos aplicables al uso de VW Repo y al contenido enviado por sus usuarios.',
  path: '/es-mx/terminos-de-uso',
  locale: 'es-MX',
});

export default function SpanishTermsPage() {
  return (
    <div className="bg-vw-surface/70 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <article className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-vw-line bg-vw-paper shadow-[0_18px_50px_rgba(55,42,28,0.08)]">
        <header className="border-b border-vw-line bg-vw-cream px-6 py-10 sm:px-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-vw-red">La letra pequeña</p>
          <h1 className="text-4xl font-bold text-vw-blue sm:text-5xl">Términos de uso</h1>
          <p className="mt-4 max-w-2xl text-vw-muted">Las reglas que mantienen a VW Repo útil, seguro y enfocado en la comunidad.</p>
        </header>
        <div className="prose prose-lg max-w-none px-6 py-8 text-vw-muted prose-headings:text-vw-blue sm:px-10 sm:py-10">
        <h2>Uso del sitio</h2>
        <p>VW Repo proporciona información técnica con fines informativos. Verifica siempre el procedimiento y las especificaciones para el modelo y código de motor exactos antes de realizar una reparación.</p>
        <h2>Contenido de usuarios</h2>
        <p>Al enviar contenido, confirmas que tienes derecho a compartirlo y autorizas a VW Repo a mostrarlo y distribuirlo dentro del servicio.</p>
        <h2>Conducta</h2>
        <p>No debes enviar contenido falso, dañino, ilegal, malicioso ni intentar interferir con el funcionamiento o la seguridad del sitio.</p>
        <h2>Limitación</h2>
        <p>Las reparaciones automotrices pueden implicar riesgos. El usuario es responsable de confirmar la información y emplear herramientas, equipo de seguridad y procedimientos apropiados.</p>
        </div>
      </article>
    </div>
  );
}
