import type { Metadata } from 'next';
import AdminPage from '@/app/admin/page';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };
export default function SpanishAdminPage() { return <AdminPage />; }
