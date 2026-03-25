import { ApiError, ERROR_CODES } from '../constants/errors';
import { decodeBase64ToBytes } from '../lib/base64';
import { isJpegBytes } from '../lib/jpeg';

const ONE_MEGABYTE = 1024 * 1024;

export function validateAndDecodeUploadImage(imageBase64: string): Uint8Array {
  const bytes = decodeBase64ToBytes(imageBase64);

  if (bytes.byteLength > ONE_MEGABYTE) {
    throw new ApiError(400, ERROR_CODES.IMAGE_TOO_LARGE, 'Image must be smaller than 1 MB after decoding.');
  }

  if (!isJpegBytes(bytes)) {
    throw new ApiError(400, ERROR_CODES.INVALID_IMAGE_FORMAT, 'Image must be a JPEG.');
  }

  return bytes;
}
