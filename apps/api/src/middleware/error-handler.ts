import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { StatusCode } from 'hono/utils/http-status';
import { ApiError, ERROR_CODES } from '../constants/errors';

export function createErrorResponse(
  c: Parameters<MiddlewareHandler>[0],
  error: unknown,
): Response {
  const requestId = c.get('requestId');

  if (error instanceof ApiError) {
    c.status(error.status as StatusCode);
    return c.json({
      code: error.code,
      error: error.message,
      ...(requestId ? { requestId } : {}),
    });
  }

  if (error instanceof HTTPException) {
    c.status(error.status as StatusCode);
    return c.json({
      code:
        error.status === 400 &&
        error.message === 'Malformed JSON in request body'
          ? ERROR_CODES.INVALID_JSON
          : ERROR_CODES.INTERNAL_ERROR,
      error:
        error.status === 400 &&
        error.message === 'Malformed JSON in request body'
          ? 'Request body must be valid JSON.'
          : error.message,
      ...(requestId ? { requestId } : {}),
    });
  }

  console.error('Unhandled API error', error);

  c.status(500);
  return c.json({
    code: ERROR_CODES.INTERNAL_ERROR,
    error: 'Internal server error.',
    ...(requestId ? { requestId } : {}),
  });
}

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (error) {
    return createErrorResponse(c, error);
  }
};
