import type { Metadata } from 'next';
import LoginPage from '@/app/login/page';

export const metadata: Metadata = { title: 'Iniciar sesión', robots: { index: false, follow: false } };
export default function SpanishLoginPage() { return <LoginPage />; }
