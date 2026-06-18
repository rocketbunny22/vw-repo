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
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-vw-blue">Términos de uso</h1>
      <div className="prose max-w-none text-gray-700">
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
  );
}
