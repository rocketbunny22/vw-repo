import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit DIY Guide',
  robots: { index: false, follow: false },
};

export default function SubmitGuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
