import type { AppBindings } from '../bindings';
import { ApiError, ERROR_CODES } from '../constants/errors';
import { createReplicateClient } from './replicate-client.service';

export async function uploadImageToReplicate(
  env: AppBindings,
  imageBytes: Uint8Array,
  mimeType: 'image/jpeg' | 'image/png',
): Promise<string> {
  const replicate = createReplicateClient(env);
  const imageFile = new Blob([imageBytes], { type: mimeType });
  const payload = await replicate.files.create(imageFile);
  const imageUrl = payload.urls?.get ?? null;

  if (!imageUrl) {
    throw new ApiError(
      502,
      ERROR_CODES.INTERNAL_ERROR,
      'Replicate file upload did not return a public image URL.',
    );
  }

  return imageUrl;
}
