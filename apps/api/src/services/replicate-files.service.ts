import type { AppBindings } from '../bindings';
import { ApiError, ERROR_CODES } from '../constants/errors';
import type { ReplicateFileUploadResponse } from '../types/replicate';

const REPLICATE_FILES_URL = 'https://api.replicate.com/v1/files';

function getReplicateHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function extractImageUrl(payload: ReplicateFileUploadResponse): string | null {
  return payload.urls?.get ?? payload.urls?.download ?? payload.url ?? null;
}

export async function uploadImageToReplicate(
  env: AppBindings,
  imageBytes: Uint8Array
): Promise<string> {
  if (!env.REPLICATE_API_TOKEN) {
    throw new ApiError(500, ERROR_CODES.INTERNAL_ERROR, 'Replicate API token is not configured.');
  }

  const formData = new FormData();
  const imageFile = new File([imageBytes], 'upload.jpg', { type: 'image/jpeg' });
  formData.append('content', imageFile);

  const response = await fetch(REPLICATE_FILES_URL, {
    body: formData,
    headers: getReplicateHeaders(env.REPLICATE_API_TOKEN),
    method: 'POST',
  });

  if (!response.ok) {
    throw new ApiError(502, ERROR_CODES.INTERNAL_ERROR, 'Replicate file upload failed.');
  }

  const payload = (await response.json()) as ReplicateFileUploadResponse;
  const imageUrl = extractImageUrl(payload);

  if (!imageUrl) {
    throw new ApiError(502, ERROR_CODES.INTERNAL_ERROR, 'Replicate file upload did not return a public image URL.');
  }

  return imageUrl;
}
