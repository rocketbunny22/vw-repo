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
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-vw-blue">Política de privacidad</h1>
      <div className="prose max-w-none text-gray-700">
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
  );
}
