import type { Comment, DiyGuide, Feedback, PdfDocument } from '@/types';

export function retainGuidesAfterDeletion(guides: DiyGuide[], userId: string) {
  let removed = 0;
  let anonymized = 0;
  const records = guides.flatMap((guide) => {
    if (guide.authorId !== userId) return [guide];
    if (!guide.approved) {
      removed += 1;
      return [];
    }
    anonymized += 1;
    return [{ ...guide, author: 'Deleted user', authorId: undefined }];
  });
  return { records, removed, anonymized };
}

export function retainPdfsAfterDeletion(pdfs: PdfDocument[], user: { id: string; username: string }) {
  let removed = 0;
  let anonymized = 0;
  const records = pdfs.flatMap((pdf) => {
    if (pdf.uploadedById !== user.id && pdf.uploadedBy !== user.username) return [pdf];
    if (pdf.approved === false) {
      removed += 1;
      return [];
    }
    anonymized += 1;
    return [{ ...pdf, uploadedBy: 'Deleted user', uploadedById: undefined }];
  });
  return { records, removed, anonymized };
}

export function retainCommentsAfterDeletion(comments: Comment[], userId: string) {
  let anonymized = 0;
  const records = comments.map((comment) => {
    if (comment.authorId !== userId) return comment;
    anonymized += 1;
    return { ...comment, authorId: 'deleted', authorName: 'Deleted user' };
  });
  return { records, anonymized };
}

export function retainFeedbackAfterDeletion(feedback: Feedback[], email: string) {
  let anonymized = 0;
  const records = feedback.map((item) => {
    if (item.email.toLowerCase() !== email.toLowerCase()) return item;
    anonymized += 1;
    return { ...item, name: 'Deleted user', email: '' };
  });
  return { records, anonymized };
}
