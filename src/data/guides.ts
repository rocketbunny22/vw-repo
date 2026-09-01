import { DiyGuide } from '@/types';
import { mutateJsonValue, runRedis } from '@/lib/redis';

export async function getUserGuides(): Promise<DiyGuide[]> {
  const guides = await runRedis((redis) => redis.get<DiyGuide[]>('user_guides'));
  return Array.isArray(guides) ? guides : [];
}

export async function mutateUserGuides(updater: (guides: DiyGuide[]) => DiyGuide[]): Promise<DiyGuide[]> {
  return mutateJsonValue('user_guides', () => [], updater);
}
