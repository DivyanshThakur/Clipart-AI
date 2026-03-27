import { ApiRequestError } from '../services/api';

const NETWORK_REACHABILITY_PREFIX = 'Unable to reach the API at ';

function normalizeMessage(message: string | null | undefined): string {
  return (message ?? '').trim().toLowerCase();
}

export function getFriendlyStyleErrorMessage(message: string | null | undefined): string {
  const normalized = normalizeMessage(message);

  if (!normalized) {
    return 'This style could not be generated. Try again in a moment.';
  }

  if (normalized.includes('too many requests') || normalized.includes('rate limit') || normalized.includes('429')) {
    return 'Too many generations are running right now. Please retry this style in a moment.';
  }

  if (normalized.includes('server error') || normalized.includes('internal server error') || normalized.includes('502')) {
    return 'The image service is having trouble right now. Please retry this style shortly.';
  }

  if (normalized.includes('prediction failed') || normalized.includes('failed') || normalized.includes('canceled')) {
    return 'This style could not be finished. Please retry it.';
  }

  return 'This style could not be generated. Please retry it.';
}

export function getFriendlyGenerationErrorMessage(
  error: unknown,
  fallbackMessage = 'Something went wrong while generating your images. Please try again.'
): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 429 || error.code === 'RATE_LIMIT_EXCEEDED') {
      return 'Too many generations are running right now. Please wait a moment and try again.';
    }

    if (error.status >= 500) {
      return 'Our image service is having trouble right now. Please try again in a moment.';
    }

    if (error.code === 'JOB_NOT_FOUND') {
      return 'We could not find this generation anymore. Please start a new one.';
    }

    if (error.code === 'INVALID_STYLES' || error.code === 'INVALID_JOB_ID') {
      return 'That generation request was not valid. Please try again.';
    }
  }

  if (error instanceof Error) {
    if (error.message.startsWith(NETWORK_REACHABILITY_PREFIX)) {
      return 'We could not connect to the server. Check your connection and try again.';
    }

    return getFriendlyStyleErrorMessage(error.message);
  }

  return fallbackMessage;
}
