import type { MiddlewareHandler } from 'hono';
import { ApiError, ERROR_CODES } from '../constants/errors';
import { MAX_GENERATIONS_PER_HOUR, MAX_UPLOADS_PER_HOUR } from '../constants/kv';
import { getRateLimitCount, incrementRateLimitCount, type RateLimitScope } from '../services/rate-limit.service';

function getClientIp(headers: Headers): string {
  return headers.get('CF-Connecting-IP') ?? 'unknown';
}

function createRateLimitMiddleware(scope: RateLimitScope, maxRequestsPerHour: number): MiddlewareHandler {
  return async (c, next) => {
    const ip = getClientIp(c.req.raw.headers);
    const currentCount = await getRateLimitCount(c.env, scope, ip);

    if (currentCount >= maxRequestsPerHour) {
      throw new ApiError(429, ERROR_CODES.RATE_LIMIT_EXCEEDED, 'Rate limit exceeded.');
    }

    await incrementRateLimitCount(c.env, scope, ip);
    await next();
  };
}

export const uploadRateLimitMiddleware = createRateLimitMiddleware('upload', MAX_UPLOADS_PER_HOUR);
export const generateRateLimitMiddleware = createRateLimitMiddleware('generate', MAX_GENERATIONS_PER_HOUR);
