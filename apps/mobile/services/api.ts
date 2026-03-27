import type { BackendStyleStatus, StyleKey } from '../types';

type UploadResponse = {
  jobId: string;
  imageUrl: string;
  status: 'uploaded';
};

type GenerateResponse = {
  jobId: string;
  queuedStyles?: StyleKey[];
  status: 'processing';
};

type JobStatusResponse = {
  jobId: string;
  imageUrl: string;
  createdAt: string;
  styles: Partial<
    Record<
      StyleKey,
      {
        status: BackendStyleStatus;
        outputUrl: string | null;
        error: string | null;
      }
    >
  >;
};

type ApiErrorPayload = {
  code?: string;
  error?: string;
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

function getApiBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url) throw new Error('Missing EXPO_PUBLIC_API_URL');
  return url.replace(/\/+$/, '');
}


function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Unable to read the selected image.'));
    reader.onloadend = () => {
      const result = reader.result;

      if (typeof result !== 'string') {
        reject(new Error('Unable to encode the selected image.'));
        return;
      }

      const [, base64 = ''] = result.split(',');
      resolve(base64);
    };

    reader.readAsDataURL(blob);
  });
}

async function parseError(response: Response): Promise<never> {
  let message = `Request failed with status ${response.status}.`;
  let code: string | undefined;

  try {
    const payload = (await response.json()) as ApiErrorPayload;
    code = payload.code;
    if (payload.error) {
      message = payload.error;
    }
  } catch {
    message = response.status >= 500 ? 'Server error. Please try again.' : message;
  }

  throw new ApiRequestError(message, response.status, code);
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const requestUrl = `${getApiBaseUrl()}${path}`;
  let response: Response;


  try {
    response = await fetch(requestUrl, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new Error(`Unable to reach the API at ${requestUrl}. Make sure the local Worker is running.`);
  }

  if (!response.ok) {
    await parseError(response);
  }

  const payload = (await response.json()) as T;
  return payload;
}

export async function uploadImage(imageUri: string): Promise<{ jobId: string; imageUrl: string }> {
  const imageResponse = await fetch(imageUri);

  if (!imageResponse.ok) {
    throw new Error('Unable to read the selected image file.');
  }

  const imageBlob = await imageResponse.blob();
  const imageBase64 = await blobToBase64(imageBlob);
  const response = await requestJson<UploadResponse>('/upload', {
    method: 'POST',
    body: JSON.stringify({ imageBase64 }),
  });

  return {
    jobId: response.jobId,
    imageUrl: response.imageUrl,
  };
}

export async function startGeneration(jobId: string, styles: StyleKey[]): Promise<GenerateResponse> {
  return requestJson<GenerateResponse>('/generate', {
    method: 'POST',
    body: JSON.stringify({ jobId, styles }),
  });
}

export async function pollJobStatus(jobId: string): Promise<JobStatusResponse> {
  return requestJson<JobStatusResponse>(`/job/${jobId}/status`);
}
