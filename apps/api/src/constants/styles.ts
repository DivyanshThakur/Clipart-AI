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

export interface StylePreset {
  promptPrefix: string;
  negativePrompt: string;
  guidanceScale: number;
  numInferenceSteps: number;
  promptStrength: number;
}

export const STYLE_PRESETS: Record<StyleKey, StylePreset> = {
  anime: {
    promptPrefix:
      'Transform the photo into polished anime key art with clean linework, expressive eyes, rich cel shading, and vivid cinematic color.',
    negativePrompt:
      'blurry, distorted anatomy, extra limbs, text, watermark, frame, low detail, noisy background',
    guidanceScale: 7,
    numInferenceSteps: 30,
    promptStrength: 0.7,
  },
  cartoon: {
    promptPrefix:
      'Transform the photo into bright modern cartoon clipart with rounded shapes, playful forms, and crisp outlines.',
    negativePrompt:
      'photorealistic, dark lighting, text, watermark, cluttered background, low quality',
    guidanceScale: 6.5,
    numInferenceSteps: 28,
    promptStrength: 0.72,
  },
  comic_book: {
    promptPrefix:
      'Transform the photo into bold comic book illustration with dynamic inking, halftone texture, punchy shadows, and dramatic contrast.',
    negativePrompt:
      'photo, watercolor, blurry, text, watermark, muddy shadows, low detail',
    guidanceScale: 7.2,
    numInferenceSteps: 32,
    promptStrength: 0.72,
  },
  flat_illustration: {
    promptPrefix:
      'Transform the photo into clean flat illustration clipart with simple geometric shapes, minimal shading, and balanced color blocks.',
    negativePrompt:
      'photorealistic, gradient overload, texture-heavy, text, watermark, low quality',
    guidanceScale: 6,
    numInferenceSteps: 26,
    promptStrength: 0.68,
  },
  pixel_art: {
    promptPrefix:
      'Transform the photo into detailed pixel art sprite-style illustration with deliberate chunky pixels and a cohesive limited palette.',
    negativePrompt:
      'blurry, anti-aliased, photorealistic, text, watermark, messy composition',
    guidanceScale: 7.5,
    numInferenceSteps: 30,
    promptStrength: 0.74,
  },
  sketch: {
    promptPrefix:
      'Transform the photo into refined sketch illustration with hand-drawn linework, subtle shading, and paper-like softness.',
    negativePrompt:
      'photorealistic, oversaturated, text, watermark, messy lines, low quality',
    guidanceScale: 6.8,
    numInferenceSteps: 28,
    promptStrength: 0.7,
  },
};
