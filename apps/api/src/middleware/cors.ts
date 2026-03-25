import { cors } from 'hono/cors';

function getAllowedOrigins(value?: string): string[] {
  return value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];
}

export const corsMiddleware = cors({
  allowHeaders: ['Content-Type'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  origin: (origin, c) => {
    const allowedOrigins = getAllowedOrigins(c.env.ALLOWED_ORIGINS);

    if (allowedOrigins.length === 0) {
      return origin || '*';
    }

    if (!origin) {
      return allowedOrigins[0] ?? '*';
    }

    return allowedOrigins.includes(origin) ? origin : allowedOrigins[0] ?? '*';
  },
});
