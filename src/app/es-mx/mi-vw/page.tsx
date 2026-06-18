import type { Metadata } from 'next';
import MyVwPage from '@/app/my-vw/page';

export const metadata: Metadata = { title: 'Mi VW', robots: { index: false, follow: false } };
export default function SpanishMyVwPage() { return <MyVwPage />; }
