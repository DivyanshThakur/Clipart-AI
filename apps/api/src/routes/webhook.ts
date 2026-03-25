import { Hono } from 'hono';
import { z } from 'zod';
import type { AppBindings, AppVariables } from '../bindings';
import { ERROR_CODES } from '../constants/errors';
import { STYLE_SET } from '../constants/styles';
import { apiZodValidator } from '../middleware/zod-validation';
import { applyWebhookUpdate } from '../services/job-state.service';
import { assertValidWebhookSignature, parseWebhookPayload } from '../services/replicate-webhook.service';
import type { StyleKey } from '../types/job';

const webhookParamsSchema = z.object({
  jobId: z.string().min(1, 'jobId is required.'),
  style: z
    .string()
    .refine((value): value is StyleKey => STYLE_SET.has(value as StyleKey), 'style is invalid.'),
});

const webhookRoute = new Hono<{ Bindings: AppBindings; Variables: AppVariables }>();

webhookRoute.post(
  '/replicate/:jobId/:style',
  apiZodValidator('param', webhookParamsSchema, (issuePath) =>
    issuePath[0] === 'jobId'
      ? {
          code: ERROR_CODES.INVALID_JOB_ID,
          fallbackMessage: 'jobId is required.',
        }
      : {
          code: ERROR_CODES.INVALID_STYLES,
          fallbackMessage: 'style is invalid.',
        }
  ),
  async (c) => {
    const { jobId, style } = c.req.valid('param');
    const rawBody = await c.req.text();

    await assertValidWebhookSignature({
      rawBody,
      secret: c.env.REPLICATE_WEBHOOK_SECRET,
      webhookId: c.req.header('webhook-id') ?? null,
      webhookSignature: c.req.header('webhook-signature') ?? null,
      webhookTimestamp: c.req.header('webhook-timestamp') ?? null,
    });

    const payload = parseWebhookPayload(rawBody);

    await applyWebhookUpdate(c.env, {
      jobId,
      payload,
      style,
    });

    return c.body(null, 204);
  }
);

export default webhookRoute;
