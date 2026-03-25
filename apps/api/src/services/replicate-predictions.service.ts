import type { AppBindings } from '../bindings';
import { ApiError, ERROR_CODES } from '../constants/errors';
import { STYLE_PRESETS } from '../constants/styles';
import { markStyleFailure, markStylePredictionCreated } from './job-state.service';
import type { JobRecord, StyleKey } from '../types/job';
import type { ReplicatePredictionResponse } from '../types/replicate';

interface ParsedModelRef {
  owner: string;
  version?: string;
  name: string;
}

function parseModelRef(modelRef: string): ParsedModelRef {
  const [modelPath, version] = modelRef.split(':');
  const [owner, name] = modelPath.split('/');

  if (!owner || !name) {
    throw new ApiError(500, ERROR_CODES.INVALID_REPLICATE_CONFIG, 'REPLICATE_MODEL_REF must look like owner/name or owner/name:version.');
  }

  return { name, owner, version };
}

function buildPredictionInput(imageUrl: string, style: StyleKey) {
  const preset = STYLE_PRESETS[style];

  return {
    guidance_scale: preset.guidanceScale,
    image: imageUrl,
    negative_prompt: preset.negativePrompt,
    num_inference_steps: preset.numInferenceSteps,
    prompt: preset.promptPrefix,
    prompt_strength: preset.promptStrength,
  };
}

function buildWebhookUrl(baseUrl: string, jobId: string, style: StyleKey): string {
  return `${baseUrl.replace(/\/$/, '')}/webhook/replicate/${jobId}/${style}`;
}

async function createPrediction(
  env: AppBindings,
  params: {
    imageUrl: string;
    jobId: string;
    style: StyleKey;
  }
): Promise<ReplicatePredictionResponse> {
  if (!env.REPLICATE_API_TOKEN || !env.REPLICATE_MODEL_REF || !env.PUBLIC_API_BASE_URL) {
    throw new ApiError(500, ERROR_CODES.INVALID_REPLICATE_CONFIG, 'Replicate environment variables are incomplete.');
  }

  const { name, owner, version } = parseModelRef(env.REPLICATE_MODEL_REF);
  const endpoint = `https://api.replicate.com/v1/models/${owner}/${name}/predictions`;
  const body = {
    ...(version ? { version } : {}),
    input: buildPredictionInput(params.imageUrl, params.style),
    webhook: buildWebhookUrl(env.PUBLIC_API_BASE_URL, params.jobId, params.style),
    webhook_events_filter: ['completed'],
  };
  const response = await fetch(endpoint, {
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new ApiError(502, ERROR_CODES.INTERNAL_ERROR, `Replicate prediction request failed for ${params.style}.`);
  }

  return (await response.json()) as ReplicatePredictionResponse;
}

export async function enqueuePredictions(
  env: AppBindings,
  job: JobRecord,
  styles: StyleKey[]
): Promise<void> {
  await Promise.allSettled(
    styles.map(async (style) => {
      try {
        const prediction = await createPrediction(env, {
          imageUrl: job.imageUrl,
          jobId: job.jobId,
          style,
        });
        await markStylePredictionCreated(env, {
          jobId: job.jobId,
          predictionId: prediction.id,
          style,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Prediction request failed.';
        await markStyleFailure(env, {
          error: message,
          jobId: job.jobId,
          style,
        });
      }
    })
  );
}
