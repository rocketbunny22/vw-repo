import type { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { getAllPdfs } from '@/data/pdfs';
import { generations } from '@/data/generations';
import type { PdfDocument } from '@/types';
import { pdfManualPath, pdfViewUrl } from '@/lib/pdfUrls';
import {
  absoluteUrl,
  breadcrumbJsonLd,
  createMetadata,
  jsonLd,
  siteName,
  truncateDescription,
} from '@/lib/seo';

export const dynamic = 'force-dynamic';

const getApprovedPdf = cache(async (id: string): Promise<PdfDocument | undefined> => {
  const pdfs = await getAllPdfs();
  return pdfs.find((pdf) => pdf.id === id && pdf.approved !== false);
});

function manualTitle(title: string) {
  return /\b(?:manual|pdf)\b/i.test(title) ? title : `${title} PDF Manual`;
}

function manualDescription(pdf: PdfDocument) {
  const generation = generations.find((item) => item.id === pdf.generation || item.slug === pdf.generation);
  const models = [...new Set([pdf.model, ...(pdf.models || [])].filter((model): model is string => Boolean(model)))];
  const applicability = [generation?.name || pdf.generation, models.join(', '), pdf.system]
    .filter(Boolean)
    .join(' ');

  return truncateDescription(
    pdf.description || `View and download this Volkswagen ${applicability} technical PDF document, with applicability and file details.`,
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pdf = await getApprovedPdf(id);

  if (!pdf) {
    return {
      title: 'Volkswagen Manual Not Found',
      robots: { index: false, follow: false },
    };
  }

  return createMetadata({
    title: manualTitle(pdf.title),
    description: manualDescription(pdf),
    path: pdfManualPath(pdf),
    type: 'article',
    includeLanguageAlternates: false,
  });
}

export default async function ManualPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  const pdf = await getApprovedPdf(id);
  if (!pdf) notFound();

  const canonicalPath = pdfManualPath(pdf);
  if (canonicalPath.split('/').at(-1) !== slug) permanentRedirect(canonicalPath);

  const generation = generations.find((item) => item.id === pdf.generation || item.slug === pdf.generation);
  const system = generation?.systems.find((item) => item.slug === pdf.system || item.id === pdf.system);
  const models = [...new Set([pdf.model, ...(pdf.models || [])].filter((model): model is string => Boolean(model)))];
  const description = manualDescription(pdf);
  const documentJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DigitalDocument',
    name: pdf.title,
    description,
    url: absoluteUrl(canonicalPath),
    datePublished: pdf.uploadedAt,
    encodingFormat: 'application/pdf',
    isAccessibleForFree: true,
    mainEntityOfPage: absoluteUrl(canonicalPath),
    associatedMedia: {
      '@type': 'MediaObject',
      contentUrl: absoluteUrl(pdf.url),
      encodingFormat: 'application/pdf',
      contentSize: `${pdf.fileSize} bytes`,
    },
    about: [generation?.name, ...models, system?.name || pdf.system]
      .filter(Boolean)
      .map((name) => ({ '@type': 'Thing', name })),
    ...(pdf.uploadedBy ? {
      author: {
        '@type': 'Person',
        name: pdf.uploadedBy,
        url: absoluteUrl(`/users/${encodeURIComponent(pdf.uploadedBy)}`),
      },
    } : {}),
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: absoluteUrl('/'),
    },
  };
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'PDF Library', path: '/library' },
    { name: pdf.title, path: canonicalPath },
  ]);

  return (
    <main className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(documentJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />

      <section className="border-b border-white/10 bg-vw-dark py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-sm text-white/65">
            <Link href="/" className="hover:text-vw-gold">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/library" className="hover:text-vw-gold">PDF Library</Link>
            <span aria-hidden="true">/</span>
            <span className="text-vw-gold">{pdf.title}</span>
          </nav>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="badge badge-blue border border-white/30">{generation?.name || pdf.generation}</span>
            {models.map((model) => <span key={model} className="badge badge-green">{model}</span>)}
            <span className="badge badge-gold">{system?.name || pdf.system}</span>
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-vw-gold-light">Workshop document</p>
          <h1 className="text-3xl font-bold text-white md:text-5xl">{manualTitle(pdf.title)}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/75">{description}</p>
        </div>
      </section>

      <section className="bg-vw-surface py-12">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
          <article className="rounded-2xl border border-vw-line bg-vw-paper p-6 shadow-[0_16px_45px_rgba(70,52,35,0.08)] sm:p-8">
            <h2 className="text-2xl font-bold text-vw-blue">About this document</h2>
            <p className="mt-4 leading-relaxed text-vw-muted">
              {pdf.description || `This technical document was added to the VW Repo library for ${generation?.name || pdf.generation} Volkswagen vehicles and ${system?.name?.toLowerCase() || pdf.system} reference.`}
            </p>

            <h2 className="mt-8 text-2xl font-bold text-vw-blue">Vehicle applicability</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-vw-line/70 bg-vw-cream p-4">
                <dt className="text-sm font-medium text-vw-muted">Volkswagen generation</dt>
                <dd className="mt-1 font-semibold text-vw-dark">{generation?.name || pdf.generation}</dd>
              </div>
              <div className="rounded-lg border border-vw-line/70 bg-vw-cream p-4">
                <dt className="text-sm font-medium text-vw-muted">System</dt>
                <dd className="mt-1 font-semibold text-vw-dark">{system?.name || pdf.system}</dd>
              </div>
              <div className="rounded-lg border border-vw-line/70 bg-vw-cream p-4 sm:col-span-2">
                <dt className="text-sm font-medium text-vw-muted">Models</dt>
                <dd className="mt-1 font-semibold text-vw-dark">{models.length > 0 ? models.join(', ') : 'Multiple or unspecified models'}</dd>
              </div>
            </dl>

            <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
              Confirm that the document matches your exact model year, engine code, transmission, and market before beginning a repair. Specifications can vary between vehicles.
            </div>

            <h2 className="mt-8 text-2xl font-bold text-vw-blue">Related Volkswagen resources</h2>
            <ul className="mt-4 space-y-3">
              {generation && (
                <li><Link href={`/generation/${generation.slug}`} className="font-medium text-vw-link-blue hover:underline">Browse {generation.name} specifications, guides, and manuals</Link></li>
              )}
              {system && (
                <li><Link href={`/systems/${system.slug}${generation ? `?gen=${generation.slug}` : ''}`} className="font-medium text-vw-link-blue hover:underline">View {generation?.name || 'Volkswagen'} {system.name.toLowerCase()} resources</Link></li>
              )}
              <li><Link href="/guides" className="font-medium text-vw-link-blue hover:underline">Browse Volkswagen DIY guides</Link></li>
            </ul>
          </article>

          <aside className="h-fit rounded-2xl border border-vw-line bg-vw-paper p-6 shadow-[0_16px_45px_rgba(70,52,35,0.08)] lg:sticky lg:top-6">
            <h2 className="text-xl font-bold text-vw-blue">Document details</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div><dt className="text-vw-muted">Format</dt><dd className="font-medium text-vw-dark">PDF</dd></div>
              <div><dt className="text-vw-muted">File size</dt><dd className="font-medium text-vw-dark">{formatFileSize(pdf.fileSize)}</dd></div>
              <div><dt className="text-vw-muted">Added</dt><dd className="font-medium text-vw-dark">{formatDate(pdf.uploadedAt)}</dd></div>
              <div><dt className="text-vw-muted">Original filename</dt><dd className="break-words font-medium text-vw-dark">{pdf.originalName}</dd></div>
              {pdf.uploadedBy && (
                <div>
                  <dt className="text-vw-muted">Uploaded by</dt>
                  <dd><Link href={`/users/${encodeURIComponent(pdf.uploadedBy)}`} className="font-medium text-vw-link-blue hover:underline">{pdf.uploadedBy}</Link></dd>
                </div>
              )}
            </dl>
            <div className="mt-6 grid gap-3">
              <a href={pdfViewUrl(pdf)} target="_blank" rel="noreferrer" className="btn-secondary text-center">Preview PDF</a>
              <a href={pdf.url} download className="btn-primary text-center">Download PDF</a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
