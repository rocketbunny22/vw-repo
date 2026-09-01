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
    <nav className="bg-vw-blue text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href={href('/')} className="flex items-center">
            <Image
              src="/images/vwrepo_log_nobg.png"
              alt="VW Repo"
              width={200}
              height={133}
              className="h-[6.5rem] w-auto object-contain"
              priority
            />
          </a>

          <div className="hidden md:block">
            <div className="flex items-baseline space-x-2">
              <a href={href('/')} className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium">
                {labels.home}
              </a>

              <div className="relative group">
                <button className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium flex items-center" aria-haspopup="true">
                  {labels.generations}
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-0 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50">
                  <div className="py-1">
                    {generations.map((gen) => (
                      <a
                        key={gen.id}
                        href={href(`/generation/${gen.slug}`)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-vw-gold hover:text-vw-blue"
                      >
                        {gen.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <a href={href('/search')} className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium">
                {labels.search}
              </a>

              <a href={href('/library')} className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium">
                {labels.pdfs}
              </a>

              <a href={href('/guides')} className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium">
                {labels.guides}
              </a>

              {user && (
                <a href={href('/my-vw')} className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium">
                  {labels.myVw}
                </a>
              )}

              <a href={href('/feedback')} className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium">
                {labels.feedback}
              </a>

              {user?.role === 'admin' && (
                <a href={href('/admin')} className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium">
                  {labels.admin}
                </a>
              )}

              <a href={href('/submit-guide')} className="bg-vw-gold text-vw-blue px-3 py-2 rounded-md text-sm font-medium hover:bg-vw-gold-light">
                {labels.submitGuide}
              </a>

              {serviceUnavailable ? (
                <span className="px-3 py-2 text-sm text-amber-200" role="status">Account service unavailable</span>
              ) : user ? (
                <div className="relative group">
                  <button className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5" aria-haspopup="true">
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
                  <div className="absolute right-0 mt-0 w-40 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50">
                    <div className="py-1">
                      <a href={href('/my-vw')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-vw-gold hover:text-vw-blue">
                        {labels.myVw}
                      </a>
                      <a href={href('/profile')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-vw-gold hover:text-vw-blue">
                        {labels.profile}
                      </a>
                      <a href={href('/upload')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-vw-gold hover:text-vw-blue">
                        {labels.upload}
                      </a>
                      <a href={href('/bookmarks')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-vw-gold hover:text-vw-blue">
                        {labels.saved}
                      </a>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-vw-gold hover:text-vw-blue">
                        {labels.signOut}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <a href={href('/login')} className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium">
                    {labels.signIn}
                  </a>
                  <a href={href('/signup')} className="bg-vw-gold text-vw-blue px-3 py-2 rounded-md text-sm font-medium hover:bg-vw-gold-light">
                    {labels.signUp}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md hover:bg-vw-blue-light"
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
          <div id="mobile-navigation" className="md:hidden border-t border-vw-blue-light pb-4">
            <a href={href('/')} className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
              {labels.home}
            </a>
            <a href={href('/search')} className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
              {labels.search}
            </a>
            <a href={href('/library')} className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
              {labels.pdfs}
            </a>
            <a href={href('/guides')} className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
              {labels.guides}
            </a>
            <a href={href('/submit-guide')} className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
              {labels.submitGuide}
            </a>
            {serviceUnavailable ? (
              <p className="px-3 py-2 text-sm text-amber-200" role="status">Account service unavailable</p>
            ) : user ? (
              <>
                <a href={href('/my-vw')} className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
                  {labels.myVw}
                </a>
                <a href={href('/profile')} className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
                  {labels.profile}
                </a>
                <a href={href('/bookmarks')} className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
                  {labels.saved}
                </a>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
                  {labels.signOut}
                </button>
              </>
            ) : (
              <>
                <a href={href('/login')} className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
                  {labels.signIn}
                </a>
                <a href={href('/signup')} className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
                  {labels.signUp}
                </a>
              </>
            )}
            <div className="pt-2 border-t border-vw-blue-light mt-2">
              <div className="text-xs text-gray-400 mb-1">{labels.generations}</div>
              {generations.map((gen) => (
                <a
                  key={gen.id}
                  href={href(`/generation/${gen.slug}`)}
                  className="block px-3 py-1 text-sm hover:bg-vw-blue-light"
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
