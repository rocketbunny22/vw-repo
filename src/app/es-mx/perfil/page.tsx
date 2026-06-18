import type { Metadata } from 'next';
import ProfilePage from '@/app/profile/page';

export const metadata: Metadata = {
  title: 'Perfil',
  robots: { index: false, follow: false },
};

export default function SpanishProfilePage() {
  return <ProfilePage />;
}
