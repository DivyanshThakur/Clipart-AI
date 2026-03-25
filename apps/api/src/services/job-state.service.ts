import type { AppBindings } from '../bindings';
import { JOB_TTL_SECONDS } from '../constants/kv';
import type { JobRecord } from '../types/job';

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
