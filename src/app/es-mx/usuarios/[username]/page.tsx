import type { Metadata } from 'next';
import UserProfilePage from '@/app/users/[username]/page';
import { createMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  return createMetadata({
    title: `Perfil de ${decodedUsername}`,
    description: `Perfil público de ${decodedUsername} en VW Repo con guías, documentos y datos de Volkswagen aprobados.`,
    path: `/es-mx/usuarios/${encodeURIComponent(decodedUsername)}`,
    locale: 'es-MX',
  });
}

export default function SpanishUserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  return <UserProfilePage params={params} />;
}
