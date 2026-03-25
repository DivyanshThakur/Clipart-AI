export function isJpegBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 4) {
    return false;
  }

  return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9;
}
