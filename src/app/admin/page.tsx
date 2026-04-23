'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
  lastLogin: string;
}

interface Pdf {
  id: string;
  title: string;
  generation: string;
  system: string;
  uploadedBy?: string;
  uploadedAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'pdfs'>('users');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const response = await fetch('/api/auth');
      const data = await response.json();
      
      if (!data.authenticated) {
        router.push('/login');
        return;
      }
      
      if (data.user.role !== 'admin') {
        router.push('/');
        return;
      }
      
      loadData();
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const response = await fetch('/api/admin');
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      setUsers(data.users || []);
      setPdfs(data.pdfs || []);
    } catch (e) {
      setError('Failed to load data');
    }
  };

  const handleAction = async (action: string, id: string, extra?: any) => {
    setActionLoading(id);
    setError('');
    
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra, [action === 'deletePdf' ? 'pdfId' : 'userId']: id }),
      });

      const data = await response.json();

      if (data.success) {
        loadData();
      } else {
        setError(data.error || 'Action failed');
      }
    } catch {
      setError('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <section className="bg-vw-dark py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
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
      <section className="bg-vw-dark py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-4">Admin Dashboard</h1>
          <p className="text-xl text-gray-300">Manage users and content</p>
        </div>
      </section>

      <section className="bg-vw-gold py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'users' ? 'bg-vw-dark text-white' : 'text-vw-dark hover:bg-vw-dark hover:text-white'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('pdfs')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'pdfs' ? 'bg-vw-dark text-white' : 'text-vw-dark hover:bg-vw-dark hover:text-white'
              }`}
            >
              PDFs ({pdfs.length})
            </button>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md">
              {error}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-vw-gold text-vw-blue' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(user.lastLogin)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {user.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => handleAction('changeRole', user.id, { role: 'admin' })}
                              disabled={actionLoading === user.id}
                              className="text-vw-blue hover:underline text-sm"
                            >
                              Make Admin
                            </button>
                            <button
                              onClick={() => handleAction('deleteUser', user.id)}
                              disabled={actionLoading === user.id}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'pdfs' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pdfs.map((pdf) => (
                    <tr key={pdf.id}>
                      <td className="px-6 py-4 font-medium text-gray-900">{pdf.title}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{pdf.generation}</span>
                        <span className="text-gray-300"> / </span>
                        <span className="text-sm text-gray-500">{pdf.system}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {pdf.uploadedBy || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(pdf.uploadedAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleAction('deletePdf', pdf.id)}
                          disabled={actionLoading === pdf.id}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}