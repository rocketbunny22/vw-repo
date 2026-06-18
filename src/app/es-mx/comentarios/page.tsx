import type { Metadata } from 'next';
import FeedbackPage from '@/app/feedback/page';

export const metadata: Metadata = { title: 'Comentarios', robots: { index: false, follow: true } };
export default function SpanishFeedbackPage() { return <FeedbackPage />; }
