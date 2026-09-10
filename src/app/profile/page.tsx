'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VehicleProfile } from '@/types';
import { generations } from '@/data/generations';
import UiIcon from '@/components/UiIcon';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/components/LanguageProvider';
import { localizedPath } from '@/lib/localization';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  profileLinks?: {
    instagram?: string;
    vwVortex?: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  
  // Edit profile states
  const [editMode, setEditMode] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editVwVortex, setEditVwVortex] = useState('');
  const [profileCurrentPassword, setProfileCurrentPassword] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Password change states
  const [passwordMode, setPasswordMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Garage / vehicle states
  const [vehicle, setVehicle] = useState<VehicleProfile | null>(null);
  const [vehicleLoading, setVehicleLoading] = useState(true);
  const [garageMode, setGarageMode] = useState(false);
  const [vGeneration, setVGeneration] = useState('');
  const [vModel, setVModel] = useState('');
  const [vYear, setVYear] = useState('');
  const [vEngineCode, setVEngineCode] = useState('');
  const [vColor, setVColor] = useState('');
  const [vNickname, setVNickname] = useState('');
  const [vehiclePublic, setVehiclePublic] = useState(false);
  const [savedVehiclePublic, setSavedVehiclePublic] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);

  // Messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadAuth() {
      try {
        const response = await fetch('/api/auth');
        const data = await response.json();

        if (response.status === 503 || data.code === 'REDIS_UNAVAILABLE') {
          if (isActive) setMessage({ type: 'error', text: 'Account data is temporarily unavailable. Please retry shortly.' });
          return;
        }

        if (!data.authenticated) {
          router.push(localizedPath('/login', locale));
          return;
        }

        if (!isActive) {
          return;
        }

        setUser(data.user);
        setEditUsername(data.user.username);
        setEditEmail(data.user.email);
        setEditInstagram(data.user.profileLinks?.instagram || '');
        setEditVwVortex(data.user.profileLinks?.vwVortex || '');
      } catch {
        if (isActive) setMessage({ type: 'error', text: 'Account data is temporarily unavailable. Please retry shortly.' });
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadAuth();

    return () => {
      isActive = false;
    };
  }, [router, locale]);

  useEffect(() => {
    if (!user) return;

    async function loadVehicle() {
      try {
        const response = await fetch('/api/user/vehicle');
        const data = await response.json();
        if (data.vehicle) {
          setVehicle(data.vehicle);
        }
        setVehiclePublic(data.vehiclePublic === true);
        setSavedVehiclePublic(data.vehiclePublic === true);
      } catch {
        // vehicle data is optional
      } finally {
        setVehicleLoading(false);
      }
    }

    void loadVehicle();
  }, [user]);

  const openGarage = () => {
    setVehiclePublic(savedVehiclePublic);
    if (!vehicle) {
      setVGeneration('');
      setVModel('');
      setVYear('');
      setVEngineCode('');
      setVColor('');
      setVNickname('');
    } else {
      setVGeneration(vehicle.generation);
      setVModel(vehicle.model);
      setVYear(vehicle.year?.toString() || '');
      setVEngineCode(vehicle.engineCode || '');
      setVColor(vehicle.color || '');
      setVNickname(vehicle.nickname || '');
    }
    setGarageMode(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingVehicle(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/vehicle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generation: vGeneration,
          model: vModel,
          year: vYear || undefined,
          engineCode: vEngineCode || undefined,
          color: vColor || undefined,
          nickname: vNickname || undefined,
          vehiclePublic,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setVehicle(data.vehicle);
        setVehiclePublic(data.vehiclePublic === true);
        setSavedVehiclePublic(data.vehiclePublic === true);
        setGarageMode(false);
        setMessage({ type: 'success', text: 'Garage updated!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleRemoveVehicle = async () => {
    try {
      const response = await fetch('/api/user/vehicle', { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setVehicle(null);
        setVehiclePublic(false);
        setSavedVehiclePublic(false);
        setMessage({ type: 'success', text: 'Vehicle removed from garage' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to remove vehicle' });
    }
  };

  const currentModels = vGeneration
    ? generations.find(g => g.id === vGeneration)?.models || []
    : [];

  const getGenerationName = (id: string) => {
    const gen = generations.find(g => g.id === id);
    return gen?.name || id;
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      router.push(localizedPath('/', locale));
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'updateProfile', 
          newUsername: editUsername, 
          newEmail: editEmail,
          instagram: editInstagram,
          vwVortex: editVwVortex,
          currentPassword: profileCurrentPassword,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setEditInstagram(data.user.profileLinks?.instagram || '');
        setEditVwVortex(data.user.profileLinks?.vwVortex || '');
        setProfileCurrentPassword('');
        setEditMode(false);
        setMessage({ type: 'success', text: 'Profile updated!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Update failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setMessage(null);
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setChangingPassword(false);
      return;
    }
    
    if (newPassword.length < 10 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setMessage({ type: 'error', text: 'Password must be at least 10 characters and include a letter and number' });
      setChangingPassword(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'changePassword', 
          currentPassword, 
          newPassword 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPasswordMode(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        router.push(localizedPath('/login', locale));
      } else {
        setMessage({ type: 'error', text: data.error || 'Change failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          confirm: deleteConfirmation,
          currentPassword: deletePassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(localizedPath('/', locale));
      } else {
        alert(data.error || 'Failed to delete account');
      }
    } catch {
      alert('Something went wrong');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmation('');
      setDeletePassword('');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <section className="border-b border-vw-blue-light/40 bg-vw-blue py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-vw-gold-light">Your workshop</p>
            <h1 className="text-4xl font-bold text-white">Profile</h1>
          </div>
        </section>
        <section className="flex-1 bg-vw-surface/70 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-vw-muted">Loading your account…</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <header className="border-b border-vw-blue-light/40 bg-vw-blue py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-vw-gold-light">Your workshop</p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Profile</h1>
          <p className="mt-3 text-lg text-white/75">
            Keep your account, garage, and preferences in order.
          </p>
        </div>
      </header>

      <section className="flex-1 bg-vw-surface/70 py-10 sm:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {message && (
            <div role="status" className={`mb-6 rounded-lg border p-4 text-sm font-medium ${
              message.type === 'success'
                ? 'border-[#55745d]/30 bg-[#55745d]/10 text-[#35513c]'
                : 'border-vw-red/30 bg-vw-red/10 text-vw-red'
            }`}>
              {message.text}
            </div>
          )}
          
          {user && (
            <div className="space-y-6">
              {/* Profile Info Card */}
              <article className="rounded-xl border border-vw-line bg-vw-paper p-6 shadow-[0_12px_32px_rgba(55,42,28,0.06)] sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-vw-blue">Account Information</h2>
                  {!editMode && (
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/users/${encodeURIComponent(user.username)}`}
                        className="text-sm font-semibold text-vw-link-blue hover:underline"
                      >
                        View Public Profile
                      </Link>
                      <button
                        onClick={() => setEditMode(true)}
                        className="text-sm font-semibold text-vw-link-blue hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
                
                {editMode ? (
                  <form onSubmit={handleUpdateProfile}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-500">Username</label>
                        <input
                          type="text"
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-2.5 text-vw-dark shadow-inner outline-none transition-colors focus:border-vw-gold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">Email</label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-2.5 text-vw-dark shadow-inner outline-none transition-colors focus:border-vw-gold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">Instagram</label>
                        <input
                          type="text"
                          value={editInstagram}
                          onChange={(e) => setEditInstagram(e.target.value)}
                          className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-2.5 text-vw-dark shadow-inner outline-none transition-colors focus:border-vw-gold"
                          placeholder="instagram.com/yourname"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">VWVortex Profile</label>
                        <input
                          type="text"
                          value={editVwVortex}
                          onChange={(e) => setEditVwVortex(e.target.value)}
                          className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-2.5 text-vw-dark shadow-inner outline-none transition-colors focus:border-vw-gold"
                          placeholder="vwvortex.com/members/yourname"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">Current password</label>
                        <input
                          type="password"
                          value={profileCurrentPassword}
                          onChange={(event) => setProfileCurrentPassword(event.target.value)}
                          className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-2.5 text-vw-dark shadow-inner outline-none transition-colors focus:border-vw-gold"
                          autoComplete="current-password"
                          placeholder="Required when changing username or email"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="btn-primary"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditMode(false);
                            setEditUsername(user.username);
                            setEditEmail(user.email);
                            setEditInstagram(user.profileLinks?.instagram || '');
                            setEditVwVortex(user.profileLinks?.vwVortex || '');
                            setProfileCurrentPassword('');
                          }}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-vw-muted">Username</p>
                      <p className="text-lg font-medium">{user.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-vw-muted">Email</p>
                      <p className="text-lg font-medium">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-vw-muted">Role</p>
                      <p className="text-lg font-medium capitalize">{user.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-vw-muted">Social Links</p>
                      {user.profileLinks?.instagram || user.profileLinks?.vwVortex ? (
                        <div className="mt-1 flex flex-wrap gap-3">
                          {user.profileLinks?.instagram && (
                            <a
                              href={user.profileLinks.instagram}
                              target="_blank"
                              rel="noreferrer"
                              className="text-vw-blue hover:underline font-medium"
                            >
                              Instagram
                            </a>
                          )}
                          {user.profileLinks?.vwVortex && (
                            <a
                              href={user.profileLinks.vwVortex}
                              target="_blank"
                              rel="noreferrer"
                              className="text-vw-blue hover:underline font-medium"
                            >
                              VWVortex
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-lg text-gray-500">No social links added</p>
                      )}
                    </div>
                  </div>
                )}
              </article>

              <article className="rounded-xl border border-vw-line bg-vw-paper p-6 shadow-[0_12px_32px_rgba(55,42,28,0.06)] sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-vw-blue">Language</h2>
                    <p className="mt-1 text-sm text-vw-muted">Display language</p>
                  </div>
                  <LanguageToggle variant="settings" />
                </div>
              </article>

              {/* Password Change Card */}
              <article className="rounded-xl border border-vw-line bg-vw-paper p-6 shadow-[0_12px_32px_rgba(55,42,28,0.06)] sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-vw-blue">Change Password</h2>
                  {!passwordMode && (
                    <button
                      onClick={() => setPasswordMode(true)}
                      className="text-sm font-semibold text-vw-link-blue hover:underline"
                    >
                      Change
                    </button>
                  )}
                </div>
                
                {passwordMode ? (
                  <form onSubmit={handleChangePassword}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-500">Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-2.5 text-vw-dark shadow-inner outline-none transition-colors focus:border-vw-gold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-2.5 text-vw-dark shadow-inner outline-none transition-colors focus:border-vw-gold"
                          required
                          minLength={10}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-2.5 text-vw-dark shadow-inner outline-none transition-colors focus:border-vw-gold"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={changingPassword}
                          className="btn-primary"
                        >
                          {changingPassword ? 'Changing...' : 'Change Password'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordMode(false);
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                          }}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <p className="text-vw-muted">Click &quot;Change&quot; to update your password.</p>
                )}
              </article>

              {/* My Garage Card */}
              <article className="rounded-xl border border-vw-line bg-vw-paper p-6 shadow-[0_12px_32px_rgba(55,42,28,0.06)] sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-vw-blue">My Garage</h2>
                  {!garageMode && !vehicleLoading && (
                    <button onClick={openGarage} className="text-sm font-semibold text-vw-link-blue hover:underline">
                      {vehicle ? 'Edit' : 'Add Your Car'}
                    </button>
                  )}
                </div>

                {vehicleLoading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : garageMode ? (
                  <form onSubmit={handleSaveVehicle}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-500">Generation *</label>
                        <select
                          value={vGeneration}
                          onChange={(e) => { setVGeneration(e.target.value); setVModel(''); }}
                          className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-2.5 text-vw-dark shadow-inner outline-none transition-colors focus:border-vw-gold"
                          required
                        >
                          <option value="">Select generation</option>
                          {generations.map(gen => (
                            <option key={gen.id} value={gen.id}>{gen.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">Model *</label>
                        <select
                          value={vModel}
                          onChange={(e) => setVModel(e.target.value)}
                          className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-2.5 text-vw-dark shadow-inner outline-none transition-colors focus:border-vw-gold"
                          required
                          disabled={!currentModels.length}
                        >
                          <option value="">Select model</option>
                          {currentModels.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-500">Year</label>
                          <input
                            type="number"
                            value={vYear}
                            onChange={(e) => setVYear(e.target.value)}
                          className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-2.5 text-vw-dark shadow-inner outline-none transition-colors focus:border-vw-gold"
                            placeholder="e.g. 2003"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500">Engine Code</label>
                          <input
                            type="text"
                            value={vEngineCode}
                            onChange={(e) => setVEngineCode(e.target.value)}
                          className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-2.5 text-vw-dark shadow-inner outline-none transition-colors focus:border-vw-gold"
                            placeholder="e.g. AWU"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-500">Color</label>
                          <input
                            type="text"
                            value={vColor}
                            onChange={(e) => setVColor(e.target.value)}
                          className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-2.5 text-vw-dark shadow-inner outline-none transition-colors focus:border-vw-gold"
                            placeholder="e.g. Reflex Silver"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500">Nickname</label>
                          <input
                            type="text"
                            value={vNickname}
                            onChange={(e) => setVNickname(e.target.value)}
                            className="w-full rounded-md border border-vw-line bg-vw-cream px-4 py-2.5 text-vw-dark shadow-inner outline-none transition-colors focus:border-vw-gold"
                            placeholder="e.g. Betty"
                          />
                        </div>
                      </div>
                      <label className="flex items-start gap-3 rounded-lg border border-vw-line bg-vw-cream p-4">
                        <input
                          type="checkbox"
                          checked={vehiclePublic}
                          onChange={(event) => setVehiclePublic(event.target.checked)}
                          className="mt-1 h-4 w-4"
                        />
                        <span>
                          <span className="block text-sm font-medium text-gray-800">Show this vehicle on my public profile</span>
                          <span className="block text-sm text-gray-500">Off by default. Your garage still powers private recommendations.</span>
                        </span>
                      </label>
                      <div className="flex gap-2">
                        <button type="submit" disabled={savingVehicle} className="btn-primary">
                          {savingVehicle ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" onClick={() => {
                          setVehiclePublic(savedVehiclePublic);
                          setGarageMode(false);
                        }}
                          className="btn-secondary">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : vehicle ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-vw-blue/10 bg-vw-blue/5 text-vw-blue">
                        <UiIcon name="vehicle" className="h-6 w-6" />
                      </span>
                      <div>
                        <p className="text-lg font-medium">
                          {vehicle.nickname && `${vehicle.nickname} - `}{getGenerationName(vehicle.generation)} {vehicle.model}
                        </p>
                        <p className="text-sm text-gray-500">
                          {[vehicle.year, vehicle.engineCode, vehicle.color].filter(Boolean).join(' • ')}
                        </p>
                        <p className="mt-1 text-xs font-medium text-gray-500">
                          {savedVehiclePublic ? 'Visible on your public profile' : 'Private to your account'}
                        </p>
                      </div>
                    </div>
                    <button onClick={handleRemoveVehicle} className="text-sm text-red-600 hover:underline mt-2">
                      Remove from garage
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500">No vehicle set. Add your VW to get personalized content.</p>
                )}
              </article>

              {/* Actions Card */}
              <article className="rounded-xl border border-vw-line bg-vw-paper p-6 shadow-[0_12px_32px_rgba(55,42,28,0.06)] sm:p-8">
                <h2 className="text-xl font-bold text-vw-blue mb-6">Actions</h2>
                
                <div className="space-y-4">
                  <button
                    onClick={handleLogout}
                    className="w-full btn-primary py-3"
                  >
                    Sign Out
                  </button>
                  
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full rounded-md border border-vw-red bg-vw-red px-4 py-3 font-semibold text-white transition-colors hover:bg-[#8f3f31]"
                  >
                    Delete Account
                  </button>
                </div>
              </article>

              {showDeleteConfirm && (
                <aside className="rounded-xl border-2 border-vw-red/70 bg-vw-paper p-6 shadow-[0_12px_32px_rgba(55,42,28,0.08)] sm:p-8">
                  <h2 className="mb-4 text-xl font-bold text-vw-red">Delete Account</h2>
                  <p className="mb-6 text-vw-muted">
                    This removes your account and private profile data. Pending submissions are deleted;
                    approved community resources and comments remain with attribution changed to “Deleted user.”
                  </p>
                  <label className="mb-6 block text-sm font-medium text-gray-700">
                    Type DELETE to confirm
                    <input
                      value={deleteConfirmation}
                      onChange={(event) => setDeleteConfirmation(event.target.value)}
                      className="mt-2 w-full rounded-md border border-vw-red/40 bg-vw-cream px-3 py-2.5 outline-none focus:border-vw-red"
                      autoComplete="off"
                    />
                  </label>
                  <label className="mb-6 block text-sm font-medium text-gray-700">
                    Current password
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(event) => setDeletePassword(event.target.value)}
                      className="mt-2 w-full rounded-md border border-vw-red/40 bg-vw-cream px-3 py-2.5 outline-none focus:border-vw-red"
                      autoComplete="current-password"
                    />
                  </label>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmation('');
                        setDeletePassword('');
                      }}
                      className="flex-1 btn-primary"
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 rounded-md border border-vw-red bg-vw-red px-4 py-3 font-semibold text-white transition-colors hover:bg-[#8f3f31] disabled:opacity-50"
                      disabled={deleting || deleteConfirmation !== 'DELETE' || !deletePassword}
                    >
                      {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                    </button>
                  </div>
                </aside>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
