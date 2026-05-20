'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { diyGuides } from '@/data/diyGuides';
import { generations } from '@/data/generations';
import {
  DiyGuide,
  MaintenanceChecklist,
  PdfDocument,
  UserChecklists,
  VehicleProfile,
} from '@/types';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface BookmarkPayload {
  pdfs?: PdfDocument[];
  guides?: DiyGuide[];
}

const emptyProgress: UserChecklists = {
  completedItemIdsByChecklist: {},
};

function getCompletedCount(checklist: MaintenanceChecklist, progress: UserChecklists) {
  const completed = progress.completedItemIdsByChecklist[checklist.id] || [];
  return checklist.items.filter((item) => completed.includes(item.id)).length;
}

function getPercent(checklist: MaintenanceChecklist, progress: UserChecklists) {
  if (checklist.items.length === 0) return 0;
  return Math.round((getCompletedCount(checklist, progress) / checklist.items.length) * 100);
}

function getSystemName(systemId: string) {
  for (const generation of generations) {
    const system = generation.systems.find((item) => item.slug === systemId || item.id === systemId);
    if (system) return system.name;
  }

  return systemId;
}

export default function MyVwPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [vehicle, setVehicle] = useState<VehicleProfile | null>(null);
  const [savedPdfs, setSavedPdfs] = useState<PdfDocument[]>([]);
  const [savedGuides, setSavedGuides] = useState<DiyGuide[]>([]);
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [checklists, setChecklists] = useState<MaintenanceChecklist[]>([]);
  const [progress, setProgress] = useState<UserChecklists>(emptyProgress);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadDashboard() {
      try {
        const authResponse = await fetch('/api/auth');
        const authData = await authResponse.json();

        if (!authData.authenticated) {
          router.push('/login');
          return;
        }

        const [vehicleResponse, bookmarkResponse, checklistResponse, pdfResponse] = await Promise.all([
          fetch('/api/user/vehicle'),
          fetch('/api/user/bookmarks'),
          fetch('/api/user/checklists'),
          fetch('/api/pdfs'),
        ]);

        if (!isActive) return;

        const vehicleData = vehicleResponse.ok ? await vehicleResponse.json() : {};
        const bookmarkData: BookmarkPayload = bookmarkResponse.ok ? await bookmarkResponse.json() : {};
        const checklistData = checklistResponse.ok ? await checklistResponse.json() : {};
        const pdfData = pdfResponse.ok ? await pdfResponse.json() : {};

        setUser(authData.user);
        setVehicle(vehicleData.vehicle || null);
        setSavedPdfs(bookmarkData.pdfs || []);
        setSavedGuides(bookmarkData.guides || []);
        setChecklists(checklistData.checklists || []);
        setProgress(checklistData.progress || emptyProgress);
        setPdfs(pdfData.pdfs || []);
      } catch {
        if (isActive) {
          setSavedPdfs([]);
          setSavedGuides([]);
          setChecklists([]);
          setProgress(emptyProgress);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isActive = false;
    };
  }, [router]);

  const vehicleGeneration = useMemo(() => (
    vehicle ? generations.find((generation) => generation.id === vehicle.generation) || null : null
  ), [vehicle]);

  const recommendedSystems = vehicleGeneration?.systems.slice(0, 4) || generations[0]?.systems.slice(0, 4) || [];

  const recommendedGuides = useMemo(() => {
    const generationGuides = vehicle
      ? diyGuides.filter((guide) => guide.generation === vehicle.generation)
      : diyGuides.filter((guide) => guide.featured);

    return generationGuides.slice(0, 3);
  }, [vehicle]);

  const recommendedPdfs = useMemo(() => {
    const generationPdfs = vehicle
      ? pdfs.filter((pdf) => pdf.generation === vehicle.generation)
      : pdfs;

    return generationPdfs.slice(0, 3);
  }, [pdfs, vehicle]);

  const sortedChecklists = useMemo(() => (
    [...checklists].sort((a, b) => getPercent(b, progress) - getPercent(a, progress))
  ), [checklists, progress]);

  const overallCompleted = sortedChecklists.reduce((total, checklist) => total + getCompletedCount(checklist, progress), 0);
  const overallItems = sortedChecklists.reduce((total, checklist) => total + checklist.items.length, 0);
  const overallPercent = overallItems > 0 ? Math.round((overallCompleted / overallItems) * 100) : 0;

  async function toggleChecklistItem(checklistId: string, itemId: string, completed: boolean) {
    const updateKey = `${checklistId}:${itemId}`;
    setUpdatingItem(updateKey);

    const previousProgress = progress;
    const currentIds = progress.completedItemIdsByChecklist[checklistId] || [];
    const nextProgress: UserChecklists = {
      ...progress,
      completedItemIdsByChecklist: {
        ...progress.completedItemIdsByChecklist,
        [checklistId]: completed
          ? [...new Set([...currentIds, itemId])]
          : currentIds.filter((id) => id !== itemId),
      },
    };

    setProgress(nextProgress);

    try {
      const response = await fetch('/api/user/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklistId, itemId, completed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update checklist');
      }

      const data = await response.json();
      setProgress(data.progress || nextProgress);
    } catch {
      setProgress(previousProgress);
    } finally {
      setUpdatingItem(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col">
        <section className="bg-vw-blue py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-white">My VW</h1>
          </div>
        </section>
        <section className="py-12 bg-gray-50 flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="bg-vw-blue py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <p className="text-vw-gold font-medium mb-2">My VW Dashboard</p>
              <h1 className="text-4xl font-bold text-white mb-3">
                {vehicle?.nickname ? vehicle.nickname : user?.username}
              </h1>
              <p className="text-lg text-gray-200">
                {vehicle && vehicleGeneration
                  ? `${vehicleGeneration.name} ${vehicle.model}${vehicle.year ? ` - ${vehicle.year}` : ''}`
                  : 'Set up your garage to personalize the dashboard.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-3">
                <p className="text-2xl font-bold text-white">{overallPercent}%</p>
                <p className="text-xs text-gray-200">Checklist</p>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-3">
                <p className="text-2xl font-bold text-white">{savedPdfs.length + savedGuides.length}</p>
                <p className="text-xs text-gray-200">Saved</p>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-3">
                <p className="text-2xl font-bold text-white">{recommendedSystems.length}</p>
                <p className="text-xs text-gray-200">Systems</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-gray-50 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-vw-blue">Garage</h2>
                      <p className="text-gray-600 mt-1">Your current car context.</p>
                    </div>
                    <Link href="/profile" className="btn-secondary px-4 py-2 text-sm">
                      {vehicle ? 'Edit Garage' : 'Add Car'}
                    </Link>
                  </div>
                </div>

                {vehicle && vehicleGeneration ? (
                  <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
                    <div className="relative min-h-48 bg-gray-100">
                      <Image
                        src={vehicleGeneration.image}
                        alt={vehicleGeneration.name}
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 220px, 100vw"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-vw-dark">
                        {vehicle.nickname && `${vehicle.nickname} - `}{vehicleGeneration.name} {vehicle.model}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {[vehicle.year, vehicle.engineCode, vehicle.color].filter(Boolean).join(' - ') || vehicleGeneration.years}
                      </p>
                      <p className="text-gray-700 mt-4">{vehicleGeneration.description}</p>
                      <div className="flex flex-wrap gap-2 mt-5">
                        <Link href={`/generation/${vehicleGeneration.slug}`} className="btn-primary px-4 py-2 text-sm">
                          View Generation
                        </Link>
                        <Link href={`/library?generation=${vehicleGeneration.id}`} className="btn-secondary px-4 py-2 text-sm">
                          Matching PDFs
                        </Link>
                        <Link href={`/guides?generation=${vehicleGeneration.id}`} className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                          Matching Guides
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">Add a vehicle to turn this into a personalized VW workspace.</p>
                    <Link href="/profile" className="btn-primary inline-block">Set Up Garage</Link>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-vw-blue">Maintenance Checklists</h2>
                    <p className="text-gray-600 mt-1">{overallCompleted} of {overallItems} tasks complete.</p>
                  </div>
                  <div className="w-28">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-vw-gold" style={{ width: `${overallPercent}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 text-right mt-1">{overallPercent}%</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {sortedChecklists.map((checklist) => {
                    const completedIds = progress.completedItemIdsByChecklist[checklist.id] || [];
                    const checklistPercent = getPercent(checklist, progress);

                    return (
                      <div key={checklist.id} className="border border-gray-200 rounded-lg p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-vw-dark">{checklist.title}</h3>
                              <span className="badge badge-gold">{checklist.difficulty}</span>
                              {checklist.system && <span className="badge badge-blue">{getSystemName(checklist.system)}</span>}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{checklist.description}</p>
                          </div>
                          <div className="min-w-24 text-right">
                            <p className="text-sm font-semibold text-vw-blue">{checklistPercent}%</p>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                              <div className="h-full bg-vw-blue" style={{ width: `${checklistPercent}%` }} />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {checklist.items.map((item) => {
                            const updateKey = `${checklist.id}:${item.id}`;
                            const completed = completedIds.includes(item.id);

                            return (
                              <label
                                key={item.id}
                                className={`flex items-start gap-3 rounded-md border p-3 transition-colors ${
                                  completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={completed}
                                  disabled={updatingItem === updateKey}
                                  onChange={(event) => toggleChecklistItem(checklist.id, item.id, event.target.checked)}
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-vw-blue focus:ring-vw-blue"
                                />
                                <span className="flex-1">
                                  <span className="block font-medium text-vw-dark">{item.label}</span>
                                  <span className="block text-sm text-gray-600 mt-1">{item.detail}</span>
                                  {item.href && (
                                    <Link
                                      href={item.href}
                                      onClick={(event) => event.stopPropagation()}
                                      className="inline-block text-sm text-vw-blue hover:underline mt-2"
                                    >
                                      Open reference
                                    </Link>
                                  )}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-vw-blue">Saved Items</h2>
                  <Link href="/bookmarks" className="text-sm text-vw-blue hover:underline">View all</Link>
                </div>
                {savedPdfs.length === 0 && savedGuides.length === 0 ? (
                  <p className="text-sm text-gray-600">Save PDFs and guides to build a quick repair queue.</p>
                ) : (
                  <div className="space-y-4">
                    {savedGuides.slice(0, 2).map((guide) => (
                      <Link key={guide.id} href={`/guides/${guide.slug}`} className="block border-b border-gray-100 pb-3 last:border-b-0">
                        <p className="font-medium text-vw-dark hover:text-vw-blue">{guide.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{guide.timeEstimate} - {getSystemName(guide.system)}</p>
                      </Link>
                    ))}
                    {savedPdfs.slice(0, 2).map((pdf) => (
                      <a key={pdf.id} href={`${pdf.url}?view=true`} target="_blank" rel="noreferrer" className="block border-b border-gray-100 pb-3 last:border-b-0">
                        <p className="font-medium text-vw-dark hover:text-vw-blue">{pdf.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{getSystemName(pdf.system)}</p>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-vw-blue mb-4">Recommended Systems</h2>
                <div className="space-y-3">
                  {recommendedSystems.map((system) => (
                    <Link
                      key={system.id}
                      href={`/systems/${system.slug}${vehicleGeneration ? `?gen=${vehicleGeneration.id}` : ''}`}
                      className="block rounded-md border border-gray-200 p-3 hover:border-vw-gold hover:bg-gray-50"
                    >
                      <p className="font-medium text-vw-dark">{system.name}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{system.description}</p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-vw-blue">Next Reads</h2>
                  <Link href="/guides" className="text-sm text-vw-blue hover:underline">Guides</Link>
                </div>
                <div className="space-y-3">
                  {recommendedGuides.map((guide) => (
                    <Link key={guide.id} href={`/guides/${guide.slug}`} className="block border-b border-gray-100 pb-3 last:border-b-0">
                      <p className="font-medium text-vw-dark hover:text-vw-blue">{guide.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{guide.difficulty} - {guide.timeEstimate}</p>
                    </Link>
                  ))}
                  {recommendedGuides.length === 0 && (
                    <p className="text-sm text-gray-600">No guide recommendations yet.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-vw-blue">Useful PDFs</h2>
                  <Link href="/library" className="text-sm text-vw-blue hover:underline">Library</Link>
                </div>
                <div className="space-y-3">
                  {recommendedPdfs.map((pdf) => (
                    <a key={pdf.id} href={`${pdf.url}?view=true`} target="_blank" rel="noreferrer" className="block border-b border-gray-100 pb-3 last:border-b-0">
                      <p className="font-medium text-vw-dark hover:text-vw-blue">{pdf.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{getSystemName(pdf.system)}</p>
                    </a>
                  ))}
                  {recommendedPdfs.length === 0 && (
                    <p className="text-sm text-gray-600">Upload or save PDFs to populate this list.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
