import { User } from '@/types';
import { mutateJsonValue, runRedis } from '@/lib/redis';

export async function getUsers(): Promise<User[]> {
  const users = await runRedis((redis) => redis.get<User[]>('users'));
  return Array.isArray(users) ? users : [];
}

export async function mutateUsers(updater: (users: User[]) => User[]): Promise<User[]> {
  return mutateJsonValue('users', () => [], updater);
}
