import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Redis } from '@upstash/redis';
import { generations } from '@/data/generations';
import { getAllPdfs } from '@/data/pdfs';
import { getUserGuides } from '@/data/guides';
import { User } from '@/types';
import { PdfCard } from '@/components/PdfViewer';

export const dynamic = 'force-dynamic';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

async function getUsers(): Promise<User[]> {
  if (!redis) return [];
  const users = await redis.get<User[]>('users');
  return Array.isArray(users) ? users : [];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getGenerationName(id?: string) {
  if (!id) return '';
  const generation = generations.find((gen) => gen.id === id || gen.slug === id);
  return generation?.name || id;
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  const users = await getUsers();
  const user = users.find((item) => item.username.toLowerCase() === decodedUsername.toLowerCase());

  if (!user) {
    notFound();
  }

  const [guides, pdfs] = await Promise.all([getUserGuides(), getAllPdfs()]);
  const submittedGuides = guides
    .filter((guide) => guide.approved && (guide.authorId === user.id || guide.author === user.username))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const uploadedPdfs = pdfs
    .filter((pdf) => pdf.approved !== false && pdf.uploadedBy === user.username)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  const vehicle = user.vehicle;
  const profileLinks = user.profileLinks || {};

  return (
    <div className="flex flex-col">
      <section className="bg-vw-blue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
            <Link href="/" className="hover:text-vw-gold">Home</Link>
            <span>/</span>
            <span className="text-vw-gold">{user.username}</span>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-vw-gold text-3xl font-bold text-vw-blue">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">{user.username}</h1>
                <p className="mt-2 text-gray-300">Member since {formatDate(user.createdAt)}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {profileLinks.instagram && (
                <a
                  href={profileLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md bg-white px-4 py-2 text-sm font-medium text-vw-blue hover:bg-gray-100"
                >
                  Instagram
                </a>
              )}
              {profileLinks.vwVortex && (
                <a
                  href={profileLinks.vwVortex}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md bg-white px-4 py-2 text-sm font-medium text-vw-blue hover:bg-gray-100"
                >
                  VWVortex
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-vw-gold py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white/90 p-4">
              <div className="text-sm font-medium text-gray-600">Garage</div>
              {vehicle ? (
                <div className="mt-1 text-lg font-bold text-vw-blue">
                  {vehicle.nickname ? `${vehicle.nickname} - ` : ''}{vehicle.year ? `${vehicle.year} ` : ''}
                  {getGenerationName(vehicle.generation)} {vehicle.model}
                </div>
              ) : (
                <div className="mt-1 text-lg font-bold text-vw-blue">No vehicle listed</div>
              )}
            </div>
            <div className="rounded-lg bg-white/90 p-4">
              <div className="text-sm font-medium text-gray-600">Submitted Guides</div>
              <div className="mt-1 text-3xl font-bold text-vw-blue">{submittedGuides.length}</div>
            </div>
            <div className="rounded-lg bg-white/90 p-4">
              <div className="text-sm font-medium text-gray-600">Uploaded PDFs</div>
              <div className="mt-1 text-3xl font-bold text-vw-blue">{uploadedPdfs.length}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-vw-blue">Submitted Guides</h2>
                <p className="mt-1 text-gray-600">Approved DIY guides from {user.username}.</p>
              </div>

              {submittedGuides.length === 0 ? (
                <div className="rounded-lg border bg-white p-6 text-gray-600">
                  No approved guides yet.
                </div>
              ) : (
                <div className="grid gap-4">
                  {submittedGuides.map((guide) => (
                    <Link
                      key={guide.id}
                      href={`/guides/${guide.slug}`}
                      className="block rounded-lg border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-bold text-vw-dark">{guide.title}</h3>
                          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{guide.content}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-vw-gold px-3 py-1 text-xs font-medium text-vw-blue">
                          {guide.difficulty}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>{getGenerationName(guide.generation)}</span>
                        <span>/</span>
                        <span>{guide.system}</span>
                        <span>{formatDate(guide.createdAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-vw-blue">Vehicle</h2>
                {vehicle ? (
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-gray-500">Generation</dt>
                      <dd className="font-medium text-gray-900">{getGenerationName(vehicle.generation)}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Model</dt>
                      <dd className="font-medium text-gray-900">{vehicle.model}</dd>
                    </div>
                    {vehicle.year && (
                      <div>
                        <dt className="text-gray-500">Year</dt>
                        <dd className="font-medium text-gray-900">{vehicle.year}</dd>
                      </div>
                    )}
                    {vehicle.engineCode && (
                      <div>
                        <dt className="text-gray-500">Engine Code</dt>
                        <dd className="font-medium text-gray-900">{vehicle.engineCode}</dd>
                      </div>
                    )}
                    {vehicle.color && (
                      <div>
                        <dt className="text-gray-500">Color</dt>
                        <dd className="font-medium text-gray-900">{vehicle.color}</dd>
                      </div>
                    )}
                  </dl>
                ) : (
                  <p className="mt-3 text-sm text-gray-600">No vehicle details added.</p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-vw-blue">Uploaded PDFs</h2>
            <p className="mt-1 text-gray-600">Approved documents uploaded by {user.username}.</p>
          </div>

          {uploadedPdfs.length === 0 ? (
            <div className="rounded-lg border bg-gray-50 p-6 text-gray-600">
              No approved PDFs yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {uploadedPdfs.map((pdf) => (
                <PdfCard key={pdf.id} pdf={pdf} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
