import type { Metadata } from 'next';
import UserProfilePage from '@/app/users/[username]/page';

export const metadata: Metadata = {
  title: 'Perfil de usuario',
  robots: { index: false, follow: true },
};

export default function SpanishUserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  return <UserProfilePage params={params} />;
}
