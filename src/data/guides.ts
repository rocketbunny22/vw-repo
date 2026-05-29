import { Redis } from '@upstash/redis';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { DiyGuide } from '@/types';

const guidesFile = path.resolve(process.cwd(), 'user-guides.json');
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

async function getLocalUserGuides(): Promise<DiyGuide[]> {
  try {
    if (!existsSync(guidesFile)) return [];
    const data = await readFile(guidesFile, 'utf-8');
    const guides = JSON.parse(data) as DiyGuide[];
    return Array.isArray(guides) ? guides : [];
  } catch {
    return [];
  }
}

async function saveLocalUserGuides(guides: DiyGuide[]): Promise<void> {
  await writeFile(guidesFile, JSON.stringify(guides, null, 2));
}

export async function getUserGuides(): Promise<DiyGuide[]> {
  if (!redis) {
    return getLocalUserGuides();
  }

  const guides = await redis.get<DiyGuide[]>('user_guides');
  return Array.isArray(guides) ? guides : getLocalUserGuides();
}

export async function saveUserGuides(guides: DiyGuide[]): Promise<void> {
  if (!redis) {
    await saveLocalUserGuides(guides);
    return;
  }

  await redis.set('user_guides', guides);
}
