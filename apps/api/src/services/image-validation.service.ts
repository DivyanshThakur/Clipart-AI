import { ApiError, ERROR_CODES } from '../constants/errors';
import { decodeBase64ToBytes } from '../lib/base64';
import {
  getSupportedImageMetadata,
  type SupportedImageMimeType,
} from '../lib/image-format';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MIN_IMAGE_EDGE = 512;

export interface ValidatedUploadImage {
  bytes: Uint8Array;
  mimeType: SupportedImageMimeType;
  width: number;
  height: number;
}

export function validateAndDecodeUploadImage(
  imageBase64: string,
): ValidatedUploadImage {
  const bytes = decodeBase64ToBytes(imageBase64);

  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new ApiError(
      400,
      ERROR_CODES.IMAGE_TOO_LARGE,
      'Image must be smaller than 5 MB after decoding.',
    );
  }

  const metadata = getSupportedImageMetadata(bytes);

  if (!metadata) {
    throw new ApiError(
      400,
      ERROR_CODES.INVALID_IMAGE_FORMAT,
      'Image must be a JPG or PNG.',
    );
  }

  if (metadata.width < MIN_IMAGE_EDGE || metadata.height < MIN_IMAGE_EDGE) {
    throw new ApiError(
      400,
      ERROR_CODES.INVALID_IMAGE_FORMAT,
      'Image must be at least 512x512 pixels for accurate face generation.',
    );
  }

  return {
    bytes,
    mimeType: metadata.mimeType,
    width: metadata.width,
    height: metadata.height,
  };
}
