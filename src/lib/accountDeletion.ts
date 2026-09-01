import crypto from 'crypto';
import { getAllPdfs, deletePdfDownloadCounter, deletePdfFile, mutatePdfs } from '@/data/pdfs';
import { mutateUserGuides } from '@/data/guides';
import { mutateComments, mutateFeedback } from '@/data/moderation';
import { mutateUsers } from '@/data/users';
import { runRedis } from '@/lib/redis';
import type { User } from '@/types';
import {
  retainCommentsAfterDeletion,
  retainFeedbackAfterDeletion,
  retainGuidesAfterDeletion,
  retainPdfsAfterDeletion,
} from '@/lib/accountRetention';

export interface AccountDeletionResult {
  alreadyDeleted: boolean;
  removedPendingGuides: number;
  removedPendingPdfs: number;
  anonymizedGuides: number;
  anonymizedPdfs: number;
  anonymizedComments: number;
  anonymizedFeedback: number;
}

export async function deleteUserAccount(
  user: Pick<User, 'id' | 'username' | 'email'>,
  actorId: string,
): Promise<AccountDeletionResult> {
  const result: AccountDeletionResult = {
    alreadyDeleted: false,
    removedPendingGuides: 0,
    removedPendingPdfs: 0,
    anonymizedGuides: 0,
    anonymizedPdfs: 0,
    anonymizedComments: 0,
    anonymizedFeedback: 0,
  };
  const pendingPdfFiles = new Set<string>();
  const pendingPdfIds = new Set<string>();

  const pdfSnapshot = await getAllPdfs();
  const ownedPendingPdfs = pdfSnapshot.filter((pdf) => (
    (pdf.uploadedById === user.id || pdf.uploadedBy === user.username) && pdf.approved === false
  ));
  ownedPendingPdfs.forEach((pdf) => {
    pendingPdfFiles.add(pdf.filename);
    pendingPdfIds.add(pdf.id);
  });
  for (const filename of pendingPdfFiles) {
    const retainedReference = pdfSnapshot.some((pdf) => (
      pdf.filename === filename && !pendingPdfIds.has(pdf.id)
    ));
    if (!retainedReference) await deletePdfFile(filename);
  }
  for (const id of pendingPdfIds) await deletePdfDownloadCounter(id);

  await mutateUserGuides((guides) => {
    const retention = retainGuidesAfterDeletion(guides, user.id);
    result.removedPendingGuides = retention.removed;
    result.anonymizedGuides = retention.anonymized;
    return retention.records;
  });

  await mutatePdfs((pdfs) => {
    const retention = retainPdfsAfterDeletion(pdfs, user);
    result.removedPendingPdfs = retention.removed;
    result.anonymizedPdfs = retention.anonymized;
    return retention.records;
  });

  await mutateComments((comments) => {
    const retention = retainCommentsAfterDeletion(comments, user.id);
    result.anonymizedComments = retention.anonymized;
    return retention.records;
  });

  await mutateFeedback((feedback) => {
    const retention = retainFeedbackAfterDeletion(feedback, user.email);
    result.anonymizedFeedback = retention.anonymized;
    return retention.records;
  });

  const emailHash = crypto.createHash('sha256').update(user.email.trim().toLowerCase()).digest('hex');
  const tokenHashes = await runRedis((redis) => redis.smembers<string[]>(`reset_tokens_by_email:${emailHash}`));
  if (tokenHashes.length > 0) {
    await runRedis((redis) => redis.del(...tokenHashes.map((hash) => `reset_token:${hash}`)));
  }
  await runRedis((redis) => redis.del(`reset_tokens_by_email:${emailHash}`));

  const auditEntry = JSON.stringify({
    userId: user.id,
    actorId,
    deletedAt: new Date().toISOString(),
    result,
  });
  await runRedis(async (redis) => {
    await redis.lpush('account_deletion_audit', auditEntry);
    await redis.ltrim('account_deletion_audit', 0, 999);
  });

  let removed = false;
  await mutateUsers((users) => {
    removed = users.some((item) => item.id === user.id);
    return users.filter((item) => item.id !== user.id);
  });
  result.alreadyDeleted = !removed;

  return result;
}
