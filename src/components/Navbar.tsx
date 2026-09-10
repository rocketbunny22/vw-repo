'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { generations } from '@/data/generations';
import { VehicleProfile } from '@/types';
import UiIcon from '@/components/UiIcon';
import { useLanguage } from '@/components/LanguageProvider';
import { localizedPath, navigationLabels } from '@/lib/localization';
import { useAuth } from '@/components/AuthProvider';

export default function Navbar() {
  const { locale } = useLanguage();
  const labels = navigationLabels[locale];
  const href = (path: string) => localizedPath(path, locale);
  const { user, serviceUnavailable, logout } = useAuth();
  const [vehicle, setVehicle] = useState<VehicleProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadVehicle() {
      if (!user) {
        setVehicle(null);
        return;
      }

      try {
        const vehRes = await fetch('/api/user/vehicle');
        const vehData = await vehRes.json();
        if (isActive) setVehicle(vehData.vehicle || null);
      } catch {
        if (isActive) setVehicle(null);
      }
    }

    void loadVehicle();

    return () => {
      isActive = false;
    };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    window.location.href = href('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-vw-gold/30 bg-vw-dark text-vw-cream shadow-[0_5px_24px_rgba(20,39,48,0.18)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] items-center justify-between">
          <a href={href('/')} className="flex h-12 w-36 items-center justify-center overflow-hidden rounded-md transition-opacity hover:opacity-90">
            <Image
              src="/images/vwrepo_log_nobg.png"
              alt="VW Repo"
              width={200}
              height={133}
              className="h-14 w-auto scale-[2] object-contain"
              priority
            />
          </a>

          <div className="hidden xl:block">
            <div className="flex items-baseline space-x-2">
              <a href={href('/')} className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white">
                {labels.home}
              </a>

              <div className="relative group">
                <button className="flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white" aria-haspopup="true">
                  {labels.generations}
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="invisible absolute left-0 z-50 mt-0 w-48 rounded-lg border border-vw-line bg-vw-paper opacity-0 shadow-[0_18px_45px_rgba(20,39,48,0.2)] transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="py-1">
                    {generations.map((gen) => (
                      <a
                        key={gen.id}
                        href={href(`/generation/${gen.slug}`)}
                        className="block px-4 py-2 text-sm text-vw-dark transition-colors hover:bg-vw-steel hover:text-vw-blue"
                      >
                        {gen.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <a href={href('/search')} className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white">
                {labels.search}
              </a>

              <a href={href('/library')} className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white">
                {labels.pdfs}
              </a>

              <a href={href('/guides')} className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white">
                {labels.guides}
              </a>

              {user && (
                <a href={href('/my-vw')} className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white">
                  {labels.myVw}
                </a>
              )}

              <a href={href('/feedback')} className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white">
                {labels.feedback}
              </a>

              {user?.role === 'admin' && (
                <a href={href('/admin')} className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white">
                  {labels.admin}
                </a>
              )}

              <a href={href('/submit-guide')} className="rounded-md border border-vw-gold/60 bg-vw-gold px-3 py-2 text-sm font-semibold text-vw-dark transition-colors hover:bg-vw-gold-light">
                {labels.submitGuide}
              </a>

              {serviceUnavailable ? (
                <span className="px-3 py-2 text-sm text-amber-200" role="status">Account service unavailable</span>
              ) : user ? (
                <div className="relative group">
                  <button className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white" aria-haspopup="true">
                    {vehicle && (
                      <UiIcon
                        name="vehicle"
                        title={`${vehicle.nickname || ''} ${vehicle.model}`}
                        className="h-4 w-4"
                      />
                    )}
                    {user.username}
                    <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="invisible absolute right-0 z-50 mt-0 w-40 rounded-lg border border-vw-line bg-vw-paper opacity-0 shadow-[0_18px_45px_rgba(20,39,48,0.2)] transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="py-1">
                      <a href={href('/my-vw')} className="block px-4 py-2 text-sm text-vw-dark hover:bg-vw-steel hover:text-vw-blue">
                        {labels.myVw}
                      </a>
                      <a href={href('/profile')} className="block px-4 py-2 text-sm text-vw-dark hover:bg-vw-steel hover:text-vw-blue">
                        {labels.profile}
                      </a>
                      <a href={href('/upload')} className="block px-4 py-2 text-sm text-vw-dark hover:bg-vw-steel hover:text-vw-blue">
                        {labels.upload}
                      </a>
                      <a href={href('/bookmarks')} className="block px-4 py-2 text-sm text-vw-dark hover:bg-vw-steel hover:text-vw-blue">
                        {labels.saved}
                      </a>
                      <button onClick={handleLogout} className="block w-full px-4 py-2 text-left text-sm text-vw-dark hover:bg-vw-steel hover:text-vw-blue">
                        {labels.signOut}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <a href={href('/login')} className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white">
                    {labels.signIn}
                  </a>
                  <a href={href('/signup')} className="rounded-md border border-vw-gold/60 bg-vw-gold px-3 py-2 text-sm font-semibold text-vw-dark transition-colors hover:bg-vw-gold-light">
                    {labels.signUp}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="xl:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-md p-2 transition-colors hover:bg-white/10"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div id="mobile-navigation" className="border-t border-vw-gold/20 pb-4 xl:hidden">
            <a href={href('/')} className="block rounded-md px-3 py-2 text-sm hover:bg-white/10">
              {labels.home}
            </a>
            <a href={href('/search')} className="block rounded-md px-3 py-2 text-sm hover:bg-white/10">
              {labels.search}
            </a>
            <a href={href('/library')} className="block rounded-md px-3 py-2 text-sm hover:bg-white/10">
              {labels.pdfs}
            </a>
            <a href={href('/guides')} className="block rounded-md px-3 py-2 text-sm hover:bg-white/10">
              {labels.guides}
            </a>
            <a href={href('/feedback')} className="block rounded-md px-3 py-2 text-sm hover:bg-white/10">
              {labels.feedback}
            </a>
            <a href={href('/submit-guide')} className="block rounded-md px-3 py-2 text-sm hover:bg-white/10">
              {labels.submitGuide}
            </a>
            {user?.role === 'admin' && (
              <a href={href('/admin')} className="block rounded-md px-3 py-2 text-sm hover:bg-white/10">
                {labels.admin}
              </a>
            )}
            {serviceUnavailable ? (
              <p className="px-3 py-2 text-sm text-amber-200" role="status">Account service unavailable</p>
            ) : user ? (
              <>
                <a href={href('/my-vw')} className="block rounded-md px-3 py-2 text-sm hover:bg-white/10">
                  {labels.myVw}
                </a>
                <a href={href('/profile')} className="block rounded-md px-3 py-2 text-sm hover:bg-white/10">
                  {labels.profile}
                </a>
                <a href={href('/upload')} className="block rounded-md px-3 py-2 text-sm hover:bg-white/10">
                  {labels.upload}
                </a>
                <a href={href('/bookmarks')} className="block rounded-md px-3 py-2 text-sm hover:bg-white/10">
                  {labels.saved}
                </a>
                <button onClick={handleLogout} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-white/10">
                  {labels.signOut}
                </button>
              </>
            ) : (
              <>
                <a href={href('/login')} className="block rounded-md px-3 py-2 text-sm hover:bg-white/10">
                  {labels.signIn}
                </a>
                <a href={href('/signup')} className="block rounded-md px-3 py-2 text-sm hover:bg-white/10">
                  {labels.signUp}
                </a>
              </>
            )}
            <div className="mt-2 border-t border-vw-gold/20 pt-2">
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-vw-gold-light">{labels.generations}</div>
              {generations.map((gen) => (
                <a
                  key={gen.id}
                  href={href(`/generation/${gen.slug}`)}
                  className="block rounded-md px-3 py-1 text-sm hover:bg-white/10"
                >
                  {gen.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
