'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VehicleProfile } from '@/types';
import { generations } from '@/data/generations';

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Edit profile states
  const [editMode, setEditMode] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editVwVortex, setEditVwVortex] = useState('');
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
  const [savingVehicle, setSavingVehicle] = useState(false);

  // Messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadAuth() {
      try {
        const response = await fetch('/api/auth');
        const data = await response.json();

        if (!data.authenticated) {
          router.push('/login');
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
        router.push('/login');
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
  }, [router]);

  useEffect(() => {
    if (!user) return;

    async function loadVehicle() {
      try {
        const response = await fetch('/api/user/vehicle');
        const data = await response.json();
        if (data.vehicle) {
          setVehicle(data.vehicle);
        }
      } catch {
        // vehicle data is optional
      } finally {
        setVehicleLoading(false);
      }
    }

    void loadVehicle();
  }, [user]);

  const openGarage = () => {
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
        }),
      });

      const data = await response.json();
      if (data.success) {
        setVehicle(data.vehicle);
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
      router.push('/');
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
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setEditInstagram(data.user.profileLinks?.instagram || '');
        setEditVwVortex(data.user.profileLinks?.vwVortex || '');
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
    
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
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
        setMessage({ type: 'success', text: 'Password changed!' });
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
        body: JSON.stringify({ action: 'delete' }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/');
      } else {
        alert(data.error || 'Failed to delete account');
      }
    } catch {
      alert('Something went wrong');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <section className="bg-vw-blue py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-white">Profile</h1>
          </div>
        </section>
        <section className="py-12 bg-gray-50 flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p>Loading...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="bg-vw-blue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-4">Profile</h1>
          <p className="text-xl text-gray-300">
            Manage your account settings.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50 flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message.text}
            </div>
          )}
          
          {user && (
            <div className="space-y-6">
              {/* Profile Info Card */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-vw-blue">Account Information</h2>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="text-vw-blue hover:underline text-sm"
                    >
                      Edit
                    </button>
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">Email</label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">Instagram</label>
                        <input
                          type="text"
                          value={editInstagram}
                          onChange={(e) => setEditInstagram(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
                          placeholder="instagram.com/yourname"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">VWVortex Profile</label>
                        <input
                          type="text"
                          value={editVwVortex}
                          onChange={(e) => setEditVwVortex(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
                          placeholder="vwvortex.com/members/yourname"
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
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500">Username</label>
                      <p className="text-lg font-medium">{user.username}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <p className="text-lg font-medium">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Role</label>
                      <p className="text-lg font-medium capitalize">{user.role}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Social Links</label>
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
              </div>

              {/* Password Change Card */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-vw-blue">Change Password</h2>
                  {!passwordMode && (
                    <button
                      onClick={() => setPasswordMode(true)}
                      className="text-vw-blue hover:underline text-sm"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
                          required
                          minLength={6}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
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
                          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <p className="text-gray-500">Click &quot;Change&quot; to update your password</p>
                )}
              </div>

              {/* My Garage Card */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-vw-blue">My Garage</h2>
                  {!garageMode && !vehicleLoading && (
                    <button onClick={openGarage} className="text-vw-blue hover:underline text-sm">
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
                            placeholder="e.g. 2003"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500">Engine Code</label>
                          <input
                            type="text"
                            value={vEngineCode}
                            onChange={(e) => setVEngineCode(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
                            placeholder="e.g. Reflex Silver"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500">Nickname</label>
                          <input
                            type="text"
                            value={vNickname}
                            onChange={(e) => setVNickname(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-vw-blue"
                            placeholder="e.g. Betty"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" disabled={savingVehicle} className="btn-primary">
                          {savingVehicle ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" onClick={() => setGarageMode(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : vehicle ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🚗</span>
                      <div>
                        <p className="text-lg font-medium">
                          {vehicle.nickname && `${vehicle.nickname} - `}{getGenerationName(vehicle.generation)} {vehicle.model}
                        </p>
                        <p className="text-sm text-gray-500">
                          {[vehicle.year, vehicle.engineCode, vehicle.color].filter(Boolean).join(' • ')}
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
              </div>

              {/* Actions Card */}
              <div className="bg-white rounded-lg shadow-md p-8">
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
                    className="w-full bg-red-600 text-white px-4 py-3 rounded-md font-medium hover:bg-red-700 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>

              {showDeleteConfirm && (
                <div className="bg-white rounded-lg shadow-md p-8 border-2 border-red-600">
                  <h2 className="text-xl font-bold text-red-600 mb-4">Delete Account</h2>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete your account? This action cannot be undone. 
                    All your uploads and guides will be removed.
                  </p>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 btn-primary"
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 bg-red-600 text-white px-4 py-3 rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
