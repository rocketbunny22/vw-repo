import { Redis } from '@upstash/redis';
import { User } from '@/types';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export async function getUsers(): Promise<User[]> {
  if (!redis) return [];

  const users = await redis.get<User[]>('users');
  return Array.isArray(users) ? users : [];
}
