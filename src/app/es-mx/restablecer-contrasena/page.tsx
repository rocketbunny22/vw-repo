import type { Metadata } from 'next';
import ResetPasswordPage from '@/app/reset-password/page';

export const metadata: Metadata = {
  title: 'Restablecer contraseña',
  robots: { index: false, follow: false },
};

export default function SpanishResetPasswordPage() {
  return <ResetPasswordPage />;
}
