import type { StyleKey, StyleResult } from '../types';

export const STYLE_KEYS: StyleKey[] = [
  'cartoon',
  'anime',
  'pixel_art',
  'flat_illustration',
  'sketch',
  'comic_book',
];

export const STYLE_LABELS: Record<StyleKey, string> = {
  anime: 'Anime',
  cartoon: 'Cartoon',
  comic_book: 'Comic Book',
  flat_illustration: 'Flat Illustration',
  pixel_art: 'Pixel Art',
  sketch: 'Sketch',
};

export const STYLE_OPTIONS = [
  { key: 'anime', name: STYLE_LABELS.anime, image: require('../assets/images/anime.png') },
  { key: 'cartoon', name: STYLE_LABELS.cartoon, image: require('../assets/images/cartoon.png') },
  { key: 'pixel_art', name: STYLE_LABELS.pixel_art, image: require('../assets/images/pixel_art.png') },
  {
    key: 'flat_illustration',
    name: STYLE_LABELS.flat_illustration,
    image: require('../assets/images/flat_illustration.png'),
  },
  { key: 'sketch', name: STYLE_LABELS.sketch, image: require('../assets/images/sketch.png') },
  {
    key: 'comic_book',
    name: STYLE_LABELS.comic_book,
    image: require('../assets/images/comic_book.png'),
  },
] as const satisfies ReadonlyArray<{ key: StyleKey; name: string; image: number }>;

export function createEmptyStyleResult(style: StyleKey): StyleResult {
  return {
    style,
    status: 'uploading',
    outputUrl: null,
    error: null,
  };
}

export function createInitialResults(): Record<StyleKey, StyleResult> {
  return STYLE_KEYS.reduce<Record<StyleKey, StyleResult>>((acc, style) => {
    acc[style] = createEmptyStyleResult(style);
    return acc;
  }, {} as Record<StyleKey, StyleResult>);
}

export function getStyleLabel(style: StyleKey): string {
  return STYLE_LABELS[style];
}
