function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a[index] ^ b[index];
  }

  return mismatch === 0;
}

function decodeSecret(secret: string): Uint8Array {
  const normalized = secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret;
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function encodeBase64(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary);
}

function parseExpectedSignatures(headerValue: string): string[] {
  return headerValue
    .split(' ')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const [version, signature] = segment.split(',');
      return version === 'v1' ? signature : undefined;
    })
    .filter((signature): signature is string => Boolean(signature));
}

export async function verifyWebhookSignature(options: {
  secret: string;
  webhookId: string;
  webhookTimestamp: string;
  webhookSignature: string;
  rawBody: string;
}): Promise<boolean> {
  const { rawBody, secret, webhookId, webhookSignature, webhookTimestamp } = options;
  const expectedSignatures = parseExpectedSignatures(webhookSignature);

  if (expectedSignatures.length === 0) {
    return false;
  }

  const signingKey = await crypto.subtle.importKey(
    'raw',
    decodeSecret(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const payload = new TextEncoder().encode(`${webhookId}.${webhookTimestamp}.${rawBody}`);
  const signatureBuffer = await crypto.subtle.sign('HMAC', signingKey, payload);
  const signatureBytes = new TextEncoder().encode(encodeBase64(signatureBuffer));

  return expectedSignatures.some((expectedSignature) =>
    timingSafeEqual(signatureBytes, new TextEncoder().encode(expectedSignature))
  );
}
