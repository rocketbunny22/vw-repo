import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Analytics } from '@vercel/analytics/next';
import {
  absoluteUrl,
  defaultDescription,
  defaultKeywords,
  jsonLd,
  organizationJsonLd,
  siteName,
  siteUrl,
  websiteJsonLd,
} from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "VW Repo | Volkswagen Repair Manuals, DIY Guides & Technical Specs",
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: defaultKeywords,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: absoluteUrl('/'),
    languages: {
      'en-US': absoluteUrl('/'),
      'es-MX': absoluteUrl('/es-mx'),
      'x-default': absoluteUrl('/'),
    },
  },
  openGraph: {
    title: "VW Repo | Volkswagen Repair Manuals, DIY Guides & Technical Specs",
    description: defaultDescription,
    url: siteUrl,
    siteName,
    images: [
      {
        url: absoluteUrl('/images/mk1.jpg'),
        width: 1200,
        height: 630,
        alt: "Classic Volkswagen technical resource on VW Repo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VW Repo | Volkswagen Repair Manuals, DIY Guides & Technical Specs",
    description: defaultDescription,
    images: [absoluteUrl('/images/mk1.jpg')],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const locale = requestHeaders.get('x-vw-locale') === 'es-MX' ? 'es-MX' : 'en';
  const localizedWebsiteJsonLd = locale === 'es-MX'
    ? {
        ...websiteJsonLd,
        inLanguage: 'es-MX',
        description: 'Manuales, guías de reparación y datos técnicos para entusiastas de Volkswagen en México.',
        potentialAction: {
          ...websiteJsonLd.potentialAction,
          target: `${absoluteUrl('/es-mx/buscar')}?q={search_term_string}`,
        },
      }
    : { ...websiteJsonLd, inLanguage: 'en-US' };

  return (
    <html lang={locale} className="h-full antialiased">
      <body className={`${inter.variable} min-h-full flex flex-col font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(localizedWebsiteJsonLd) }}
        />
        <LanguageProvider initialLocale={locale}>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
