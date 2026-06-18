import type { Metadata } from 'next';
import BookmarksPage from '@/app/bookmarks/page';

export const metadata: Metadata = { title: 'Guardados', robots: { index: false, follow: false } };
export default function SpanishBookmarksPage() { return <BookmarksPage />; }
