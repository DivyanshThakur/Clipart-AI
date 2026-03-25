import type { AppBindings } from '../bindings';
import { ApiError, ERROR_CODES } from '../constants/errors';
import { JOB_TTL_SECONDS } from '../constants/kv';
import type { JobRecord, StyleKey, StyleState } from '../types/job';

function createProcessingStyleState(): StyleState {
  return {
    error: null,
    outputUrl: null,
    predictionId: null,
    status: 'processing',
  };
}

async function persistJob(env: AppBindings, job: JobRecord): Promise<void> {
  await env.JOB_KV.put(`job:${job.jobId}`, JSON.stringify(job), {
    expirationTtl: JOB_TTL_SECONDS,
  });
}

export async function getJob(env: AppBindings, jobId: string): Promise<JobRecord | null> {
  return env.JOB_KV.get<JobRecord>(`job:${jobId}`, 'json');
}

export async function createUploadedJob(
  env: AppBindings,
  params: {
    jobId: string;
    imageUrl: string;
  }
): Promise<JobRecord> {
  const job: JobRecord = {
    createdAt: new Date().toISOString(),
    generationStartedAt: null,
    imageUrl: params.imageUrl,
    jobId: params.jobId,
    styles: {},
    uploadStatus: 'uploaded',
  };

  await persistJob(env, job);

  return job;
}

export async function startGeneration(
  env: AppBindings,
  params: {
    jobId: string;
    styles: StyleKey[];
  }
): Promise<JobRecord> {
  const job = await getJob(env, params.jobId);

  if (!job) {
    throw new ApiError(404, ERROR_CODES.JOB_NOT_FOUND, 'Job not found.');
  }

  if (!job.imageUrl) {
    throw new ApiError(400, ERROR_CODES.INVALID_JOB_ID, 'Job does not have an uploaded image.');
  }

  if (job.generationStartedAt) {
    throw new ApiError(409, ERROR_CODES.GENERATION_ALREADY_STARTED, 'Generation already started for this job.');
  }

  job.generationStartedAt = new Date().toISOString();

  for (const style of params.styles) {
    job.styles[style] = createProcessingStyleState();
  }

  await persistJob(env, job);

  return job;
}

export async function markStylePredictionCreated(
  env: AppBindings,
  params: {
    jobId: string;
    predictionId: string;
    style: StyleKey;
  }
): Promise<void> {
  const job = await getJob(env, params.jobId);

  if (!job) {
    return;
  }

  const styleState = job.styles[params.style];

  if (!styleState || styleState.status !== 'processing') {
    return;
  }

  styleState.predictionId = params.predictionId;
  await persistJob(env, job);
}

export async function markStyleFailure(
  env: AppBindings,
  params: {
    jobId: string;
    style: StyleKey;
    error: string;
  }
): Promise<void> {
  const job = await getJob(env, params.jobId);

  if (!job) {
    return;
  }

  const styleState = job.styles[params.style];

  if (!styleState || styleState.status === 'success' || styleState.status === 'failure') {
    return;
  }

  styleState.error = params.error;
  styleState.outputUrl = null;
  styleState.status = 'failure';

  await persistJob(env, job);
}
