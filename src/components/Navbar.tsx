'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { generations } from '@/data/generations';
import { VehicleProfile } from '@/types';

interface User {
  id: string;
  username: string;
  role: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [vehicle, setVehicle] = useState<VehicleProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadAuth() {
      try {
        const response = await fetch('/api/auth');
        const data = await response.json();

        if (isActive && data.authenticated) {
          setUser(data.user);
          const vehRes = await fetch('/api/user/vehicle');
          const vehData = await vehRes.json();
          if (isActive && vehData.vehicle) {
            setVehicle(vehData.vehicle);
          }
        }
      } catch {
        if (isActive) {
          setUser(null);
        }
      }
    }

    void loadAuth();

    return () => {
      isActive = false;
    };
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav className="bg-vw-blue text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/vwrepo_log_nobg.png"
              alt="VW Repo"
              width={200}
              height={133}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden md:block">
            <div className="flex items-baseline space-x-2">
              <Link href="/" className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>

              <div className="relative group">
                <button className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  Generations
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-0 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="py-1">
                    {generations.map((gen) => (
                      <Link
                        key={gen.id}
                        href={`/generation/${gen.slug}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-vw-gold hover:text-vw-blue"
                      >
                        {gen.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link href="/search" className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium">
                Search
              </Link>

              <Link href="/library" className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium">
                PDFs
              </Link>

              <Link href="/guides" className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium">
                DIY Guides
              </Link>

              {user && (
                <Link href="/my-vw" className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium">
                  My VW
                </Link>
              )}

              <Link href="/feedback" className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium">
                Feedback
              </Link>

              {user?.role === 'admin' && (
                <Link href="/admin" className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium">
                  Admin
                </Link>
              )}

              <Link href="/submit-guide" className="bg-vw-gold text-vw-blue px-3 py-2 rounded-md text-sm font-medium hover:bg-vw-gold-light">
                Submit Guide
              </Link>

              {user ? (
                <div className="relative group">
                  <button className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5">
                    {vehicle && <span title={`${vehicle.nickname || ''} ${vehicle.model}`}>🚗</span>}
                    {user.username}
                    <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-0 w-40 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="py-1">
                      <Link href="/my-vw" className="block px-4 py-2 text-sm text-gray-700 hover:bg-vw-gold hover:text-vw-blue">
                        My VW
                      </Link>
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-vw-gold hover:text-vw-blue">
                        Profile
                      </Link>
                      <Link href="/upload" className="block px-4 py-2 text-sm text-gray-700 hover:bg-vw-gold hover:text-vw-blue">
                        Upload PDF
                      </Link>
                      <Link href="/bookmarks" className="block px-4 py-2 text-sm text-gray-700 hover:bg-vw-gold hover:text-vw-blue">
                        Saved Items
                      </Link>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-vw-gold hover:text-vw-blue">
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login" className="hover:bg-vw-blue-light px-3 py-2 rounded-md text-sm font-medium">
                    Sign In
                  </Link>
                  <Link href="/signup" className="bg-vw-gold text-vw-blue px-3 py-2 rounded-md text-sm font-medium hover:bg-vw-gold-light">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-md hover:bg-vw-blue-light">
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
          <div className="md:hidden border-t border-vw-blue-light pb-4">
            <Link href="/" className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
              Home
            </Link>
            <Link href="/search" className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
              Search
            </Link>
            <Link href="/library" className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
              PDFs
            </Link>
            <Link href="/guides" className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
              DIY Guides
            </Link>
            <Link href="/submit-guide" className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
              Submit Guide
            </Link>
            {user ? (
              <>
                <Link href="/my-vw" className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
                  My VW
                </Link>
                <Link href="/profile" className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
                  Profile
                </Link>
                <Link href="/bookmarks" className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
                  Saved Items
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
                  Sign In
                </Link>
                <Link href="/signup" className="block px-3 py-2 rounded-md text-sm hover:bg-vw-blue-light">
                  Sign Up
                </Link>
              </>
            )}
            <div className="pt-2 border-t border-vw-blue-light mt-2">
              <div className="text-xs text-gray-400 mb-1">Generations</div>
              {generations.map((gen) => (
                <Link
                  key={gen.id}
                  href={`/generation/${gen.slug}`}
                  className="block px-3 py-1 text-sm hover:bg-vw-blue-light"
                >
                  {gen.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
