import type { StyleKey } from '../types/job';

export const STYLE_KEYS = [
  'cartoon',
  'anime',
  'pixel_art',
  'flat_illustration',
  'sketch',
  'comic_book',
] as const satisfies readonly StyleKey[];

export const STYLE_SET = new Set<StyleKey>(STYLE_KEYS);

const INSTANT_ID_MODEL_REF =
  'zsxkib/instant-id:2e4785a4d80dadf580077b2244c8d7c05d8e3faac04a04c02d8e099dd2876789';

const COMMON_NEGATIVE_PROMPT =
  'multiple people, two people, extra person, duplicate face, extra face, crowd, group photo, asymmetrical face, deformed eyes, bad anatomy, blurry, low quality, watermark, text, random background, outdoor scene, jungle, road, street, changed location';

export interface StyleGenerationContext {
  imageUrl: string;
}

export interface StyleModelConfig {
  modelRef: string;
  promptTemplate: string;
  negativePrompt: string;
  guidanceScale: number;
  numInferenceSteps: number;
  controlnetConditioningScale: number;
  ipAdapterScale: number;
  imageWidth: number;
  imageHeight: number;
  inputBuilder: (
    context: StyleGenerationContext,
    config: StyleModelConfig,
  ) => Record<string, unknown>;
}

function buildInstantIDInput(
  context: StyleGenerationContext,
  config: StyleModelConfig,
): Record<string, unknown> {
  return {
    image: context.imageUrl,
    prompt: config.promptTemplate,
    negative_prompt: config.negativePrompt,
    width: config.imageWidth,
    height: config.imageHeight,
    num_inference_steps: config.numInferenceSteps,
    guidance_scale: config.guidanceScale,
    controlnet_conditioning_scale: config.controlnetConditioningScale,
    ip_adapter_scale: config.ipAdapterScale,
    output_format: 'png',
    output_quality: 100,
    num_outputs: 1,
    disable_safety_checker: true,
  };
}

export const STYLE_MODEL_CONFIGS: Record<StyleKey, StyleModelConfig> = {
  cartoon: {
    modelRef: INSTANT_ID_MODEL_REF,
    promptTemplate:
      'analog film photo of a person, Pixar cartoon style, single person, bright vibrant colors, bold clean outlines, rounded shapes, smooth color fills, white studio background, high quality clipart illustration',
    negativePrompt: `${COMMON_NEGATIVE_PROMPT}, sketch, realistic, photoreal, dark background`,
    guidanceScale: 5,
    numInferenceSteps: 25,
    controlnetConditioningScale: 0.8,
    ipAdapterScale: 0.8,
    imageWidth: 1024,
    imageHeight: 1024,
    inputBuilder: buildInstantIDInput,
  },
  anime: {
    modelRef: INSTANT_ID_MODEL_REF,
    promptTemplate:
      'analog film photo of a person, anime illustration style, single person, Studio Ghibli quality, crisp linework, cel shading, vivid colors, white studio background, high quality clipart',
    negativePrompt: `${COMMON_NEGATIVE_PROMPT}, photoreal skin, washed-out color, realistic`,
    guidanceScale: 5,
    numInferenceSteps: 25,
    controlnetConditioningScale: 0.8,
    ipAdapterScale: 0.8,
    imageWidth: 1024,
    imageHeight: 1024,
    inputBuilder: buildInstantIDInput,
  },
  pixel_art: {
    modelRef: INSTANT_ID_MODEL_REF,
    promptTemplate:
      'analog film photo of a person, pixel art style, single person, 16-bit retro game character, chunky deliberate pixels, limited color palette, white studio background, high quality clipart',
    negativePrompt: `${COMMON_NEGATIVE_PROMPT}, anti-aliased, smooth edges, realistic, high resolution`,
    guidanceScale: 5,
    numInferenceSteps: 25,
    controlnetConditioningScale: 0.75,
    ipAdapterScale: 0.75,
    imageWidth: 1024,
    imageHeight: 1024,
    inputBuilder: buildInstantIDInput,
  },
  flat_illustration: {
    modelRef: INSTANT_ID_MODEL_REF,
    promptTemplate:
      'analog film photo of a person, flat vector illustration style, single person, geometric forms, minimal shading, balanced color blocks, simplified clean edges, white studio background, high quality clipart',
    negativePrompt: `${COMMON_NEGATIVE_PROMPT}, texture-heavy, excessive gradients, sketch lines, realistic skin`,
    guidanceScale: 4.5,
    numInferenceSteps: 25,
    controlnetConditioningScale: 0.75,
    ipAdapterScale: 0.75,
    imageWidth: 1024,
    imageHeight: 1024,
    inputBuilder: buildInstantIDInput,
  },
  sketch: {
    modelRef: INSTANT_ID_MODEL_REF,
    promptTemplate:
      'analog film photo of a person, graphite pencil sketch style, single person, hand-drawn linework, subtle pencil shading, paper texture, black and white, white background, high quality clipart',
    negativePrompt: `${COMMON_NEGATIVE_PROMPT}, comic inks, cel shading, saturated color, photoreal`,
    guidanceScale: 5,
    numInferenceSteps: 25,
    controlnetConditioningScale: 0.8,
    ipAdapterScale: 0.8,
    imageWidth: 1024,
    imageHeight: 1024,
    inputBuilder: buildInstantIDInput,
  },
  comic_book: {
    modelRef: INSTANT_ID_MODEL_REF,
    promptTemplate:
      'analog film photo of a person, Marvel comic book style, single person, heavy black ink outlines, halftone texture, dramatic shadows, punchy contrast, vivid colors, white studio background, high quality clipart',
    negativePrompt: `${COMMON_NEGATIVE_PROMPT}, pencil sketch, muddy shadows, realistic photo shading`,
    guidanceScale: 5.5,
    numInferenceSteps: 25,
    controlnetConditioningScale: 0.85,
    ipAdapterScale: 0.85,
    imageWidth: 1024,
    imageHeight: 1024,
    inputBuilder: buildInstantIDInput,
  },
};
