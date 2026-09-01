import 'server-only';

import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import { optimisticMutation } from '@/lib/optimisticMutation';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

const JSON_CAS_SCRIPT = `
local currentVersion = tonumber(redis.call('GET', KEYS[2]) or '0')
if currentVersion ~= tonumber(ARGV[1]) then
  return 0
end
redis.call('SET', KEYS[1], ARGV[2])
redis.call('SET', KEYS[2], currentVersion + 1)
return 1
`;

const JSON_READ_SNAPSHOT_SCRIPT = `
local value = redis.call('GET', KEYS[1])
if not value then
  value = '__VW_REDIS_NULL__'
end
local version = redis.call('GET', KEYS[2]) or '0'
return {value, version}
`;

const RATE_LIMIT_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('TTL', KEYS[1])
return {count, ttl}
`;

export class RedisUnavailableError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'RedisUnavailableError';
  }
}

export async function runRedis<T>(operation: (client: Redis) => Promise<T>): Promise<T> {
  if (!redis) {
    throw new RedisUnavailableError('Redis is not configured');
  }

  try {
    return await operation(redis);
  } catch (error) {
    if (error instanceof RedisUnavailableError) throw error;
    throw new RedisUnavailableError('Redis operation failed', { cause: error });
  }
}

/**
 * Optimistically updates a JSON value without allowing a stale read to replace
 * a concurrent writer. The updater is rerun against the latest value after a
 * conflict, so it must not perform external side effects.
 */
export async function mutateJsonValue<T>(
  key: string,
  fallback: () => T,
  updater: (current: T) => T,
  maxAttempts = 32,
): Promise<T> {
  const versionKey = `${key}:version`;

  try {
    return await optimisticMutation({
      maxAttempts,
      read: async () => {
        const [stored, storedVersion] = await runRedis((client) => client.eval<[], [T | string, number | string]>(
          JSON_READ_SNAPSHOT_SCRIPT,
          [key, versionKey],
          [],
        ));
        return {
          value: stored === '__VW_REDIS_NULL__' ? fallback() : stored as T,
          version: Number(storedVersion ?? 0),
        };
      },
      compareAndSet: async (expectedVersion, updated) => {
        const applied = await runRedis((client) => client.eval<string[], number>(
          JSON_CAS_SCRIPT,
          [key, versionKey],
          [String(expectedVersion), JSON.stringify(updated)],
        ));
        return Number(applied) === 1;
      },
      update: updater,
    });
  } catch (error) {
    if (isRedisUnavailableError(error)) throw error;
    throw new RedisUnavailableError(`Concurrent updates did not settle for ${key}`, { cause: error });
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const [count, ttl] = await runRedis((client) => client.eval<string[], [number, number]>(
    RATE_LIMIT_SCRIPT,
    [`rate_limit:${key}`],
    [String(windowSeconds)],
  ));

  return {
    allowed: Number(count) <= limit,
    remaining: Math.max(0, limit - Number(count)),
    retryAfter: Math.max(1, Number(ttl)),
  };
}

export async function clearRateLimit(key: string): Promise<void> {
  await runRedis((client) => client.del(`rate_limit:${key}`));
}

export function isRedisUnavailableError(error: unknown): error is RedisUnavailableError {
  return error instanceof RedisUnavailableError;
}

export function redisUnavailableResponse(): NextResponse {
  return NextResponse.json(
    {
      error: 'Data service temporarily unavailable',
      code: 'REDIS_UNAVAILABLE',
    },
    {
      status: 503,
      headers: { 'Retry-After': '30' },
    },
  );
}
