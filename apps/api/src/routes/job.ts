import { Hono } from 'hono';
import { z } from 'zod';
import type { AppBindings, AppVariables } from '../bindings';
import { ApiError, ERROR_CODES } from '../constants/errors';
import { apiZodValidator } from '../middleware/zod-validation';
import { getJob } from '../services/job-state.service';
import type { JobStatusResponseBody } from '../types/api';

const jobParamsSchema = z.object({
  jobId: z.string().min(1, 'jobId is required.'),
});

const jobRoute = new Hono<{ Bindings: AppBindings; Variables: AppVariables }>();

jobRoute.get(
  '/:jobId/status',
  apiZodValidator('param', jobParamsSchema, {
    code: ERROR_CODES.INVALID_JOB_ID,
    fallbackMessage: 'jobId is required.',
  }),
  async (c) => {
    const { jobId } = c.req.valid('param');
    const job = await getJob(c.env, jobId);

    if (!job) {
      throw new ApiError(404, ERROR_CODES.JOB_NOT_FOUND, 'Job not found.');
    }

    const response: JobStatusResponseBody = {
      createdAt: job.createdAt,
      imageUrl: job.imageUrl,
      jobId: job.jobId,
      styles: job.styles,
    };

    return c.json(response);
  }
);

export default jobRoute;
