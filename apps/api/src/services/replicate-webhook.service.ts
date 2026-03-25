import { ApiError, ERROR_CODES } from '../constants/errors';
import { verifyWebhookSignature } from '../lib/webhook-signature';
import type { ReplicateWebhookPayload } from '../types/replicate';

export async function assertValidWebhookSignature(params: {
  rawBody: string;
  secret: string;
  webhookId: string | null;
  webhookSignature: string | null;
  webhookTimestamp: string | null;
}): Promise<void> {
  const { rawBody, secret, webhookId, webhookSignature, webhookTimestamp } = params;

  if (!secret) {
    throw new ApiError(500, ERROR_CODES.INTERNAL_ERROR, 'Webhook secret is not configured.');
  }

  if (!webhookId || !webhookSignature || !webhookTimestamp) {
    throw new ApiError(401, ERROR_CODES.INVALID_WEBHOOK_SIGNATURE, 'Webhook signature headers are missing.');
  }

  const isValid = await verifyWebhookSignature({
    rawBody,
    secret,
    webhookId,
    webhookSignature,
    webhookTimestamp,
  });

  if (!isValid) {
    throw new ApiError(401, ERROR_CODES.INVALID_WEBHOOK_SIGNATURE, 'Webhook signature is invalid.');
  }
}

export function parseWebhookPayload(rawBody: string): ReplicateWebhookPayload {
  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw new ApiError(400, ERROR_CODES.INVALID_WEBHOOK_PAYLOAD, 'Webhook payload must be valid JSON.');
  }

  if (!payload || typeof payload !== 'object') {
    throw new ApiError(400, ERROR_CODES.INVALID_WEBHOOK_PAYLOAD, 'Webhook payload is malformed.');
  }

  const record = payload as ReplicateWebhookPayload;

  if (!record.status) {
    throw new ApiError(400, ERROR_CODES.INVALID_WEBHOOK_PAYLOAD, 'Webhook payload is missing a prediction status.');
  }

  return record;
}
