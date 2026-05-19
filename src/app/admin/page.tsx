'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generations } from '@/data/generations';

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
  description: string;
  generation: string;
  system: string;
  model?: string;
  uploadedBy?: string;
  uploadedAt: string;
}

interface BackfillResult {
  total: number;
  candidates: number;
  processed: number;
  updated: number;
  skipped: number;
  failed: number;
  failures: Array<{
    id: string;
    title: string;
    reason: string;
  }>;
}

const generationOptions = generations.map(g => ({ value: g.id, label: g.name }));
const systemOptions = ['engine', 'transmission', 'suspension', 'brakes', 'electrical', 'body', 'interior', 'cooling', 'fuel', 'exhaust'];

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'pdfs' | 'tools'>('users');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [editingPdf, setEditingPdf] = useState<Pdf | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', generation: '', system: '', model: '' });
  const [forceBackfill, setForceBackfill] = useState(false);
  const [backfillResult, setBackfillResult] = useState<BackfillResult | null>(null);

  async function checkAdmin() {
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
  }

  async function loadData() {
    try {
      const response = await fetch('/api/admin');
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      setUsers(data.users || []);
      setPdfs(data.pdfs || []);
    } catch {
      setError('Failed to load data');
    }
  }

  useEffect(() => {
    checkAdmin();
  }, []);

  const handleAction = async (action: string, id: string, extra?: { role?: string }) => {
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

  const startEditPdf = (pdf: Pdf) => {
    setEditingPdf(pdf);
    setEditForm({
      title: pdf.title,
      description: pdf.description,
      generation: pdf.generation,
      system: pdf.system,
      model: pdf.model || '',
    });
  };

  const handleUpdatePdf = async () => {
    if (!editingPdf) return;
    setActionLoading(editingPdf.id);
    setError('');

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updatePdf',
          pdfId: editingPdf.id,
          ...editForm,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEditingPdf(null);
        loadData();
      } else {
        setError(data.error || 'Update failed');
      }
    } catch {
      setError('Update failed');
    } finally {
      setActionLoading(null);
    }
  };

  const sendTestEmail = async () => {
    setActionLoading('testEmail');
    setError('');
    setTestEmailSent(false);

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'testEmail' }),
      });

      const data = await response.json();

      if (data.success) {
        setTestEmailSent(true);
      } else {
        setError(data.error || 'Failed to send test email');
      }
    } catch {
      setError('Failed to send test email');
    } finally {
      setActionLoading(null);
    }
  };

  const runBackfill = async () => {
    setActionLoading('backfillPdfText');
    setError('');
    setBackfillResult(null);

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'backfillPdfText', force: forceBackfill }),
      });

      const data = await response.json();

      if (data.success) {
        setBackfillResult(data.result);
        loadData();
      } else {
        setError(data.error || 'Backfill failed');
      }
    } catch {
      setError('Backfill failed');
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
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'tools' ? 'bg-vw-dark text-white' : 'text-vw-dark hover:bg-vw-dark hover:text-white'
              }`}
            >
              Tools
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
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => startEditPdf(pdf)}
                          className="text-vw-blue hover:underline text-sm"
                        >
                          Edit
                        </button>
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

          {activeTab === 'tools' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">PDF Search Backfill</h3>
                <p className="text-gray-600 mb-4">
                  Extract searchable text for stored PDFs that do not have an index yet.
                </p>
                <label className="mb-4 flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={forceBackfill}
                    onChange={(e) => setForceBackfill(e.target.checked)}
                  />
                  Reindex PDFs that already have extracted text
                </label>
                <button
                  onClick={runBackfill}
                  disabled={actionLoading === 'backfillPdfText'}
                  className="px-4 py-2 bg-vw-blue text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading === 'backfillPdfText' ? 'Running...' : 'Run Backfill'}
                </button>

                {backfillResult && (
                  <div className="mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                      <div className="rounded-md bg-gray-50 p-3">
                        <div className="text-xs uppercase text-gray-500">Total</div>
                        <div className="text-lg font-bold text-gray-900">{backfillResult.total}</div>
                      </div>
                      <div className="rounded-md bg-gray-50 p-3">
                        <div className="text-xs uppercase text-gray-500">Candidates</div>
                        <div className="text-lg font-bold text-gray-900">{backfillResult.candidates}</div>
                      </div>
                      <div className="rounded-md bg-gray-50 p-3">
                        <div className="text-xs uppercase text-gray-500">Processed</div>
                        <div className="text-lg font-bold text-gray-900">{backfillResult.processed}</div>
                      </div>
                      <div className="rounded-md bg-green-50 p-3">
                        <div className="text-xs uppercase text-green-700">Updated</div>
                        <div className="text-lg font-bold text-green-900">{backfillResult.updated}</div>
                      </div>
                      <div className="rounded-md bg-yellow-50 p-3">
                        <div className="text-xs uppercase text-yellow-700">Skipped</div>
                        <div className="text-lg font-bold text-yellow-900">{backfillResult.skipped}</div>
                      </div>
                      <div className="rounded-md bg-red-50 p-3">
                        <div className="text-xs uppercase text-red-700">Failed</div>
                        <div className="text-lg font-bold text-red-900">{backfillResult.failed}</div>
                      </div>
                    </div>

                    {backfillResult.failures.length > 0 && (
                      <div className="mt-4 overflow-hidden rounded-md border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">PDF</th>
                              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Error / Reason</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {backfillResult.failures.map((failure) => (
                              <tr key={failure.id}>
                                <td className="px-4 py-2 text-sm font-medium text-gray-900">{failure.title}</td>
                                <td className="px-4 py-2 text-sm text-gray-600">{failure.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Email Test</h3>
                <p className="text-gray-600 mb-4">
                  Send a test email to verify your Resend setup is working correctly.
                </p>
                {testEmailSent && (
                  <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
                    Test email sent successfully! Check your inbox.
                  </div>
                )}
                <button
                  onClick={sendTestEmail}
                  disabled={actionLoading === 'testEmail'}
                  className="px-4 py-2 bg-vw-blue text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading === 'testEmail' ? 'Sending...' : 'Send Test Email'}
                </button>
              </div>
            </div>
          )}

          {editingPdf && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
                <h3 className="text-xl font-bold mb-4">Edit PDF</h3>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Generation</label>
                      <select
                        value={editForm.generation}
                        onChange={(e) => setEditForm({ ...editForm, generation: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        {generationOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">System</label>
                      <select
                        value={editForm.system}
                        onChange={(e) => setEditForm({ ...editForm, system: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        {systemOptions.map((sys) => (
                          <option key={sys} value={sys}>{sys.charAt(0).toUpperCase() + sys.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model (optional)</label>
                    <input
                      type="text"
                      value={editForm.model}
                      onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setEditingPdf(null)}
                    className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePdf}
                    disabled={actionLoading === editingPdf.id}
                    className="px-4 py-2 bg-vw-blue text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {actionLoading === editingPdf.id ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
