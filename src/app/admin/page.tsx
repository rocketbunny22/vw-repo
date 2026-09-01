'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generations } from '@/data/generations';
import { useLanguage } from '@/components/LanguageProvider';
import { localizedPath } from '@/lib/localization';

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
  approved?: boolean;
}

interface ModerationGuide {
  id: string;
  slug: string;
  title: string;
  generation: string;
  system: string;
  author: string;
  createdAt: string;
  difficulty: string;
  content: string;
  approved?: boolean;
}

interface ModerationFeedback {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  createdAt: string;
}

interface ModerationComment {
  id: string;
  guideId: string;
  authorName: string;
  content: string;
  createdAt: string;
  reportedAt?: string;
}

interface ModerationQueue {
  pendingPdfs: Pdf[];
  pendingGuides: ModerationGuide[];
  feedback: ModerationFeedback[];
  comments: ModerationComment[];
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
  const { locale } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [moderation, setModeration] = useState<ModerationQueue>({
    pendingPdfs: [],
    pendingGuides: [],
    feedback: [],
    comments: [],
  });
  const [guides, setGuides] = useState<ModerationGuide[]>([]);
  const [activeTab, setActiveTab] = useState<'moderation' | 'users' | 'pdfs' | 'guides' | 'tools'>('moderation');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [editingPdf, setEditingPdf] = useState<Pdf | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', generation: '', system: '', model: '' });
  const [forceBackfill, setForceBackfill] = useState(false);
  const [backfillResult, setBackfillResult] = useState<BackfillResult | null>(null);

  const loadData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin');
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setUsers(data.users || []);
      setPdfs(data.pdfs || []);
      setGuides(data.guides || []);
      setModeration(data.moderation || { pendingPdfs: [], pendingGuides: [], feedback: [], comments: [] });
    } catch {
      setError('Failed to load data');
    }
  }, []);

  const checkAdmin = useCallback(async () => {
    try {
      const response = await fetch('/api/auth');
      const data = await response.json();
      if (response.status === 503 || data.code === 'REDIS_UNAVAILABLE') {
        setError('Account data is temporarily unavailable. Please retry shortly.');
        return;
      }
      
      if (!data.authenticated) {
        router.push(localizedPath('/login', locale));
        return;
      }
      
      if (data.user.role !== 'admin') {
        router.push(localizedPath('/', locale));
        return;
      }
      
      await loadData();
    } catch {
      router.push(localizedPath('/login', locale));
    } finally {
      setLoading(false);
    }
  }, [loadData, locale, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => void checkAdmin(), 0);
    return () => window.clearTimeout(timer);
  }, [checkAdmin]);

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

  const handleModerationAction = async (
    action: string,
    payload: { pdfId?: string; guideId?: string; feedbackId?: string; commentId?: string },
  ) => {
    const id = payload.pdfId || payload.guideId || payload.feedbackId || payload.commentId || action;
    setActionLoading(id);
    setError('');

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });

      const data = await response.json();

      if (data.success) {
        loadData();
      } else {
        setError(data.error || 'Moderation action failed');
      }
    } catch {
      setError('Moderation action failed');
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
    return new Date(dateStr).toLocaleDateString(locale === 'es-MX' ? 'es-MX' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const pendingCount = moderation.pendingPdfs.length
    + moderation.pendingGuides.length
    + moderation.feedback.length
    + moderation.comments.length;

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
              onClick={() => setActiveTab('moderation')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'moderation' ? 'bg-vw-dark text-white' : 'text-vw-dark hover:bg-vw-dark hover:text-white'
              }`}
            >
              Moderation ({pendingCount})
            </button>
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
              onClick={() => setActiveTab('guides')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'guides' ? 'bg-vw-dark text-white' : 'text-vw-dark hover:bg-vw-dark hover:text-white'
              }`}
            >
              Guides ({guides.length})
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

          {activeTab === 'moderation' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="text-sm text-gray-500">Pending PDFs</div>
                  <div className="text-3xl font-bold text-vw-blue">{moderation.pendingPdfs.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="text-sm text-gray-500">Pending Guides</div>
                  <div className="text-3xl font-bold text-vw-blue">{moderation.pendingGuides.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="text-sm text-gray-500">Feedback</div>
                  <div className="text-3xl font-bold text-vw-blue">{moderation.feedback.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="text-sm text-gray-500">Reported Comments</div>
                  <div className="text-3xl font-bold text-vw-blue">{moderation.comments.length}</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b px-6 py-4">
                  <h2 className="text-xl font-bold text-vw-blue">Pending PDFs</h2>
                </div>
                {moderation.pendingPdfs.length === 0 ? (
                  <p className="px-6 py-6 text-gray-500">No PDFs are waiting for review.</p>
                ) : (
                  <div className="divide-y">
                    {moderation.pendingPdfs.map((pdf) => (
                      <div key={pdf.id} className="p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{pdf.title}</h3>
                            <p className="mt-1 text-sm text-gray-600">{pdf.description || 'No description provided.'}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                              <span>{pdf.generation}</span>
                              <span>/</span>
                              <span>{pdf.system}</span>
                              {pdf.model && <span>/ {pdf.model}</span>}
                              <span>Uploaded by {pdf.uploadedBy || 'Unknown'}</span>
                              <span>{formatDate(pdf.uploadedAt)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleModerationAction('approvePdf', { pdfId: pdf.id })}
                              disabled={actionLoading === pdf.id}
                              className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleModerationAction('deletePdf', { pdfId: pdf.id })}
                              disabled={actionLoading === pdf.id}
                              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b px-6 py-4">
                  <h2 className="text-xl font-bold text-vw-blue">Pending Guides</h2>
                </div>
                {moderation.pendingGuides.length === 0 ? (
                  <p className="px-6 py-6 text-gray-500">No guides are waiting for review.</p>
                ) : (
                  <div className="divide-y">
                    {moderation.pendingGuides.map((guide) => (
                      <div key={guide.id} className="p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{guide.title}</h3>
                            <p className="mt-1 line-clamp-3 text-sm text-gray-600">{guide.content}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                              <span>{guide.generation}</span>
                              <span>/</span>
                              <span>{guide.system}</span>
                              <span>{guide.difficulty}</span>
                              <span>By {guide.author}</span>
                              <span>{formatDate(guide.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleModerationAction('approveGuide', { guideId: guide.id })}
                              disabled={actionLoading === guide.id}
                              className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleModerationAction('rejectGuide', { guideId: guide.id })}
                              disabled={actionLoading === guide.id}
                              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="border-b px-6 py-4">
                    <h2 className="text-xl font-bold text-vw-blue">Feedback</h2>
                  </div>
                  {moderation.feedback.length === 0 ? (
                    <p className="px-6 py-6 text-gray-500">No feedback needs review.</p>
                  ) : (
                    <div className="divide-y">
                      {moderation.feedback.map((item) => (
                        <div key={item.id} className="p-6">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{item.category}</span>
                            <span className="text-xs text-gray-500">{formatDate(item.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-800">{item.message}</p>
                          <p className="mt-2 text-xs text-gray-500">
                            From {item.name || 'Anonymous'}{item.email ? ` (${item.email})` : ''}
                          </p>
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => handleModerationAction('reviewFeedback', { feedbackId: item.id })}
                              disabled={actionLoading === item.id}
                              className="rounded-md bg-vw-blue px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              Mark Reviewed
                            </button>
                            <button
                              onClick={() => handleModerationAction('deleteFeedback', { feedbackId: item.id })}
                              disabled={actionLoading === item.id}
                              className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="border-b px-6 py-4">
                    <h2 className="text-xl font-bold text-vw-blue">Reported Comments</h2>
                  </div>
                  {moderation.comments.length === 0 ? (
                    <p className="px-6 py-6 text-gray-500">No comments have been reported.</p>
                  ) : (
                    <div className="divide-y">
                      {moderation.comments.map((comment) => (
                        <div key={comment.id} className="p-6">
                          <p className="text-sm text-gray-800">{comment.content}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                            <span>By {comment.authorName}</span>
                            <span>{formatDate(comment.createdAt)}</span>
                            <span>Guide: {comment.guideId}</span>
                            {comment.reportedAt && <span>Reported {formatDate(comment.reportedAt)}</span>}
                          </div>
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => handleModerationAction('reviewComment', { commentId: comment.id })}
                              disabled={actionLoading === comment.id}
                              className="rounded-md bg-vw-blue px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              Dismiss Report
                            </button>
                            <button
                              onClick={() => handleModerationAction('deleteComment', { commentId: comment.id })}
                              disabled={actionLoading === comment.id}
                              className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
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
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pdf.approved === false ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {pdf.approved === false ? 'Pending' : 'Approved'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(pdf.uploadedAt)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {pdf.approved === false && (
                          <button
                            onClick={() => handleModerationAction('approvePdf', { pdfId: pdf.id })}
                            disabled={actionLoading === pdf.id}
                            className="text-green-700 hover:underline text-sm"
                          >
                            Approve
                          </button>
                        )}
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

          {activeTab === 'guides' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {guides.map((guide) => (
                    <tr key={guide.id}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{guide.title}</div>
                        {guide.approved && (
                          <a
                            href={`/guides/${guide.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-vw-blue hover:underline"
                          >
                            View
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{guide.generation}</span>
                        <span className="text-gray-300"> / </span>
                        <span className="text-sm text-gray-500">{guide.system}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{guide.author}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          guide.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {guide.approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(guide.createdAt)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {!guide.approved && (
                          <button
                            onClick={() => handleModerationAction('approveGuide', { guideId: guide.id })}
                            disabled={actionLoading === guide.id}
                            className="text-green-700 hover:underline text-sm"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleModerationAction('deleteGuide', { guideId: guide.id })}
                          disabled={actionLoading === guide.id}
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
