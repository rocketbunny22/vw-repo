import type { Comment, Feedback } from '@/types';
import { mutateJsonValue, runRedis } from '@/lib/redis';

export async function getComments(): Promise<Comment[]> {
  const comments = await runRedis((redis) => redis.get<Comment[]>('comments'));
  return Array.isArray(comments) ? comments : [];
}

export async function mutateComments(updater: (comments: Comment[]) => Comment[]): Promise<Comment[]> {
  return mutateJsonValue('comments', () => [], updater);
}

export async function getFeedback(): Promise<Feedback[]> {
  const feedback = await runRedis((redis) => redis.get<Feedback[]>('feedback'));
  return Array.isArray(feedback) ? feedback : [];
}

export async function mutateFeedback(updater: (feedback: Feedback[]) => Feedback[]): Promise<Feedback[]> {
  return mutateJsonValue('feedback', () => [], updater);
}
