import type { Metadata } from 'next';
import UploadPage from '@/app/upload/page';

export const metadata: Metadata = { title: 'Subir PDF', robots: { index: false, follow: false } };
export default function SpanishUploadPage() { return <UploadPage />; }
