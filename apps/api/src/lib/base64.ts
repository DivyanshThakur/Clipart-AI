import { ApiError, ERROR_CODES } from '../constants/errors';

function normalizeBase64Input(input: string): string {
  const trimmed = input.trim();
  const dataUrlMatch = trimmed.match(/^data:.*?;base64,(.+)$/);
  return dataUrlMatch?.[1] ?? trimmed;
}

export function decodeBase64ToBytes(input: string): Uint8Array {
  const normalized = normalizeBase64Input(input);

  try {
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  } catch {
    throw new ApiError(400, ERROR_CODES.INVALID_IMAGE_BASE64, 'Image must be valid base64.');
  }
}
