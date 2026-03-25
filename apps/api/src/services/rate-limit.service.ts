import type { AppBindings } from '../bindings';
import { RATE_LIMIT_TTL_SECONDS } from '../constants/kv';

export type RateLimitScope = 'generate' | 'upload';

function getHourBucket(date: Date): string {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
    String(date.getUTCHours()).padStart(2, '0'),
  ].join('');
}

function getRateLimitKey(scope: RateLimitScope, ip: string): string {
  return `ratelimit:${scope}:${ip}:${getHourBucket(new Date())}`;
}

export async function getRateLimitCount(env: AppBindings, scope: RateLimitScope, ip: string): Promise<number> {
  const key = getRateLimitKey(scope, ip);
  const currentValue = await env.RATE_LIMIT_KV.get(key);

  return currentValue ? Number(currentValue) : 0;
}

export async function incrementRateLimitCount(env: AppBindings, scope: RateLimitScope, ip: string): Promise<number> {
  const key = getRateLimitKey(scope, ip);
  const nextValue = (await getRateLimitCount(env, scope, ip)) + 1;

  await env.RATE_LIMIT_KV.put(key, String(nextValue), {
    expirationTtl: RATE_LIMIT_TTL_SECONDS,
  });

  return nextValue;
}
