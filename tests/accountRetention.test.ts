import { describe, expect, it } from 'vitest';
import {
  retainCommentsAfterDeletion,
  retainFeedbackAfterDeletion,
  retainGuidesAfterDeletion,
  retainPdfsAfterDeletion,
} from '@/lib/accountRetention';
import type { Comment, DiyGuide, Feedback, PdfDocument } from '@/types';

const user = { id: 'user-1', username: 'owner' };

describe('account deletion retention', () => {
  it('removes pending content, anonymizes retained public content, and is idempotent', () => {
    const guide = (approved: boolean): DiyGuide => ({
      id: `guide-${approved}`, title: 'Guide', slug: `guide-${approved}`, generation: 'mk4', system: 'engine',
      author: user.username, authorId: user.id, content: 'content', difficulty: 'easy', timeEstimate: '1 hour',
      tools: [], parts: [], createdAt: '2026-01-01', updatedAt: '2026-01-01', views: 0, featured: false, approved,
    });
    const pdf = (approved: boolean): PdfDocument => ({
      id: `pdf-${approved}`, filename: 'shared.pdf', originalName: 'manual.pdf', generation: 'mk4', system: 'engine',
      title: 'Manual', description: '', uploadedAt: '2026-01-01', uploadedBy: user.username, uploadedById: user.id,
      fileSize: 100, url: '/api/pdfs/shared.pdf', downloads: 0, approved,
    });
    const comment: Comment = { id: 'comment', guideId: 'guide', authorId: user.id, authorName: user.username, content: 'Useful', createdAt: '2026-01-01' };
    const feedback: Feedback = { id: 'feedback', name: 'Owner', email: 'owner@example.com', category: 'general', message: 'Message', createdAt: '2026-01-01' };

    const guides = retainGuidesAfterDeletion([guide(true), guide(false)], user.id).records;
    const pdfs = retainPdfsAfterDeletion([pdf(true), pdf(false)], user).records;
    const comments = retainCommentsAfterDeletion([comment], user.id).records;
    const feedbackItems = retainFeedbackAfterDeletion([feedback], 'owner@example.com').records;

    expect(guides).toHaveLength(1);
    expect(guides[0].author).toBe('Deleted user');
    expect(pdfs).toHaveLength(1);
    expect(pdfs[0].uploadedById).toBeUndefined();
    expect(comments[0].authorId).toBe('deleted');
    expect(feedbackItems[0].email).toBe('');
    expect(retainGuidesAfterDeletion(guides, user.id).records).toEqual(guides);
    expect(retainPdfsAfterDeletion(pdfs, user).records).toEqual(pdfs);
  });
});
