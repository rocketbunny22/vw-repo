'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
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
  const [saving, setSaving] = useState(false);
  
  // Password change states
  const [passwordMode, setPasswordMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth');
      const data = await response.json();
      
      if (!data.authenticated) {
        router.push('/login');
        return;
      }
      
      setUser(data.user);
      setEditUsername(data.user.username);
      setEditEmail(data.user.email);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
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
          newEmail: editEmail 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
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
                  <p className="text-gray-500">Click "Change" to update your password</p>
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