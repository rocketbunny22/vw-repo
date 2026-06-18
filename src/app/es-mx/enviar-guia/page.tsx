import type { Metadata } from 'next';
import SubmitGuidePage from '@/app/submit-guide/page';

export const metadata: Metadata = { title: 'Enviar guía', robots: { index: false, follow: false } };
export default function SpanishSubmitGuidePage() { return <SubmitGuidePage />; }
