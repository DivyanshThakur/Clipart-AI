import { nanoid } from 'nanoid';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppBindings, AppVariables } from '../bindings';
import { ERROR_CODES } from '../constants/errors';
import { apiZodValidator } from '../middleware/zod-validation';
import { createUploadedJob } from '../services/job-state.service';
import { validateAndDecodeUploadImage } from '../services/image-validation.service';
import { uploadImageToReplicate } from '../services/replicate-files.service';
import type { UploadRequestBody, UploadResponseBody } from '../types/api';

const uploadRequestSchema = z.object({
  imageBase64: z.string().min(1, 'imageBase64 is required.'),
});

const uploadRoute = new Hono<{ Bindings: AppBindings; Variables: AppVariables }>();

uploadRoute.post(
  '/',
  apiZodValidator('json', uploadRequestSchema, {
    code: ERROR_CODES.INVALID_IMAGE_BASE64,
    fallbackMessage: 'Invalid upload payload.',
  }),
  async (c) => {
    const body = c.req.valid('json') as UploadRequestBody;
    const imageBytes = validateAndDecodeUploadImage(body.imageBase64);
    const jobId = nanoid();
    const imageUrl = await uploadImageToReplicate(c.env, imageBytes);

    await createUploadedJob(c.env, {
      imageUrl,
      jobId,
    });

    const response: UploadResponseBody = {
      imageUrl,
      jobId,
      status: 'uploaded',
    };

    return c.json(response, 201);
  }
);

export default uploadRoute;
