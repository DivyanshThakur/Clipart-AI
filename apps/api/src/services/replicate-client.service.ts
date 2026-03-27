import Replicate from 'replicate';
import type { AppBindings } from '../bindings';
import { ApiError, ERROR_CODES } from '../constants/errors';

export function createReplicateClient(env: AppBindings): Replicate {
  if (!env.REPLICATE_API_TOKEN) {
    throw new ApiError(500, ERROR_CODES.INTERNAL_ERROR, 'Replicate API token is not configured.');
  }

  return new Replicate({
    auth: env.REPLICATE_API_TOKEN,
    fetch: globalThis.fetch.bind(globalThis),
  });
}
