import type { Metadata } from 'next';
import SignupPage from '@/app/signup/page';

export const metadata: Metadata = { title: 'Crear cuenta', robots: { index: false, follow: false } };
export default function SpanishSignupPage() { return <SignupPage />; }
