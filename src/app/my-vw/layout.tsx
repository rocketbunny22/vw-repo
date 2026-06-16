import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My VW',
  robots: { index: false, follow: false },
};

export default function MyVwLayout({ children }: { children: React.ReactNode }) {
  return children;
}
