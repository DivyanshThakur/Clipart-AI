import { Hono } from 'hono';
import { z } from 'zod';
import type { AppBindings, AppVariables } from '../bindings';
import { ERROR_CODES } from '../constants/errors';
import { STYLE_KEYS } from '../constants/styles';
import { apiZodValidator } from '../middleware/zod-validation';
import { startGeneration } from '../services/job-state.service';
import { enqueuePredictions } from '../services/replicate-predictions.service';
import type { GenerateRequestBody, GenerateResponseBody } from '../types/api';
import type { StyleKey } from '../types/job';

const generateRequestSchema = z.object({
  jobId: z.string().min(1, 'jobId is required.'),
  styles: z
    .array(z.enum(STYLE_KEYS))
    .min(1, 'Select at least one style.')
    .max(STYLE_KEYS.length, `Select no more than ${STYLE_KEYS.length} styles.`)
    .refine((styles) => new Set(styles).size === styles.length, 'Styles must be unique.'),
});

const generateRoute = new Hono<{ Bindings: AppBindings; Variables: AppVariables }>();

generateRoute.post(
  '/',
  apiZodValidator('json', generateRequestSchema, {
    code: ERROR_CODES.INVALID_STYLES,
    fallbackMessage: 'Invalid generate payload.',
  }),
  async (c) => {
    const body = c.req.valid('json');
    const styles = body.styles;
    const job = await startGeneration(c.env, {
      jobId: body.jobId,
      styles,
    });

    c.executionCtx.waitUntil(enqueuePredictions(c.env, job, styles));

    const response: GenerateResponseBody = {
      jobId: job.jobId,
      status: 'processing',
    };

    return c.json(response, 202);
  }
);

export default generateRoute;
