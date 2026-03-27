import type { AppBindings } from '../bindings';
import { ApiError, ERROR_CODES } from '../constants/errors';
import { STYLE_MODEL_CONFIGS } from '../constants/styles';
import {
  markStyleFailure,
  markStylePredictionCreated,
} from './job-state.service';
import { createReplicateClient } from './replicate-client.service';
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
    throw new ApiError(
      500,
      ERROR_CODES.INVALID_REPLICATE_CONFIG,
      'REPLICATE_MODEL_REF must look like owner/name or owner/name:version.',
    );
  }

  return { name, owner, version };
}

function buildPredictionInput(imageUrl: string, style: StyleKey) {
  const config = STYLE_MODEL_CONFIGS[style];
  return config.inputBuilder({ imageUrl }, config);
}

function buildWebhookUrl(
  baseUrl: string,
  jobId: string,
  style: StyleKey,
): string {
  return `${baseUrl.replace(/\/$/, '')}/webhook/replicate/${jobId}/${style}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createPrediction(
  env: AppBindings,
  params: {
    imageUrl: string;
    jobId: string;
    style: StyleKey;
  },
): Promise<ReplicatePredictionResponse> {
  if (!env.PUBLIC_API_BASE_URL) {
    throw new ApiError(
      500,
      ERROR_CODES.INVALID_REPLICATE_CONFIG,
      'Replicate environment variables are incomplete.',
    );
  }

  const styleConfig = STYLE_MODEL_CONFIGS[params.style];
  const { name, owner, version } = parseModelRef(styleConfig.modelRef);
  const replicate = createReplicateClient(env);
  const model = `${owner}/${name}`;
  const input = buildPredictionInput(params.imageUrl, params.style);
  const webhook = buildWebhookUrl(
    env.PUBLIC_API_BASE_URL,
    params.jobId,
    params.style,
  );

  const prediction = await replicate.predictions.create({
    input,
    ...(version ? { version } : { model }),
    webhook,
    webhook_events_filter: ['completed'],
  });

  return {
    id: prediction.id,
    status: prediction.status,
  };
}

export async function enqueuePredictions(
  env: AppBindings,
  job: JobRecord,
  styles: StyleKey[],
): Promise<void> {
  // await Promise.allSettled(
  //   styles.map(async (style) => {
  //     try {
  //       const prediction = await createPrediction(env, {
  //         imageUrl: job.imageUrl,
  //         jobId: job.jobId,
  //         style,
  //       });
  //       await markStylePredictionCreated(env, {
  //         jobId: job.jobId,
  //         predictionId: prediction.id,
  //         style,
  //       });
  //     } catch (error) {
  //       const message =
  //         error instanceof Error ? error.message : 'Prediction request failed.';
  //       console.error('[replicate.prediction] failed', {
  //         error: message,
  //         jobId: job.jobId,
  //         style,
  //       });
  //       await markStyleFailure(env, {
  //         error: message,
  //         jobId: job.jobId,
  //         style,
  //       });
  //     }
  //   }),
  // );

  for (const [index, style] of styles.entries()) {
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
      const message =
        error instanceof Error ? error.message : 'Prediction request failed.';
      console.error('[replicate.prediction] failed', {
        error: message,
        jobId: job.jobId,
        style,
      });
      await markStyleFailure(env, {
        error: message,
        jobId: job.jobId,
        style,
      });
    }

    if (index < styles.length - 1) {
      await delay(1000);
    }
  }
}
