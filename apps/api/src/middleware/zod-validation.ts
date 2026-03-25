import { zValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import type { ZodSchema } from 'zod';
import { ApiError } from '../constants/errors';

type ValidationErrorConfig =
  | {
      code: string;
      fallbackMessage: string;
    }
  | ((issuePath: string[]) => {
      code: string;
      fallbackMessage: string;
    });

export const apiZodValidator = <
  TSchema extends ZodSchema,
  TTarget extends keyof ValidationTargets,
>(
  target: TTarget,
  schema: TSchema,
  errorConfig: ValidationErrorConfig
) =>
  zValidator(target, schema, (result) => {
    if (!result.success) {
      const issue = result.error.issues[0];
      const resolvedError =
        typeof errorConfig === 'function'
          ? errorConfig(issue?.path.map((segment) => String(segment)) ?? [])
          : errorConfig;

      throw new ApiError(
        400,
        resolvedError.code,
        issue?.message ?? resolvedError.fallbackMessage
      );
    }
  });
