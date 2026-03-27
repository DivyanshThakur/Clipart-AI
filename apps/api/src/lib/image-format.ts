export type SupportedImageMimeType = 'image/jpeg' | 'image/png';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function isJpegBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 4) {
    return false;
  }

  return (
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[bytes.length - 2] === 0xff &&
    bytes[bytes.length - 1] === 0xd9
  );
}

export function isPngBytes(bytes: Uint8Array): boolean {
  if (bytes.length < PNG_SIGNATURE.length) {
    return false;
  }

  return PNG_SIGNATURE.every((value, index) => bytes[index] === value);
}

function readUint16(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readUint32(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3]) >>>
    0
  );
}

function getPngDimensions(
  bytes: Uint8Array,
): { width: number; height: number } | null {
  if (!isPngBytes(bytes) || bytes.length < 24) {
    return null;
  }

  return {
    width: readUint32(bytes, 16),
    height: readUint32(bytes, 20),
  };
}

function getJpegDimensions(
  bytes: Uint8Array,
): { width: number; height: number } | null {
  if (!isJpegBytes(bytes)) {
    return null;
  }

  let offset = 2;

  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];

    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }

    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }

    const segmentLength = readUint16(bytes, offset + 2);
    if (segmentLength < 2 || offset + 2 + segmentLength > bytes.length) {
      return null;
    }

    const isStartOfFrame =
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3 ||
      marker === 0xc5 ||
      marker === 0xc6 ||
      marker === 0xc7 ||
      marker === 0xc9 ||
      marker === 0xca ||
      marker === 0xcb ||
      marker === 0xcd ||
      marker === 0xce ||
      marker === 0xcf;

    if (isStartOfFrame) {
      return {
        height: readUint16(bytes, offset + 5),
        width: readUint16(bytes, offset + 7),
      };
    }

    offset += 2 + segmentLength;
  }

  return null;
}

export function getSupportedImageMetadata(
  bytes: Uint8Array,
): { mimeType: SupportedImageMimeType; width: number; height: number } | null {
  const jpeg = getJpegDimensions(bytes);
  if (jpeg) {
    return { mimeType: 'image/jpeg', ...jpeg };
  }

  const png = getPngDimensions(bytes);
  if (png) {
    return { mimeType: 'image/png', ...png };
  }

  return null;
}
