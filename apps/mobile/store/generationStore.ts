import { create } from 'zustand';
import { createInitialResults } from '../constants/styles';
import type { GenerationPhase, StyleKey, StyleResult } from '../types';

type GenerationStore = {
  jobId: string | null;
  imageUri: string | null;
  imageUrl: string | null;
  selectedStyles: StyleKey[];
  results: Record<StyleKey, StyleResult>;
  phase: GenerationPhase;
  error: string | null;
  setImage: (imageUri: string | null) => void;
  setSelectedStyles: (styles: StyleKey[] | ((previous: StyleKey[]) => StyleKey[])) => void;
  setJobId: (jobId: string | null) => void;
  setImageUrl: (imageUrl: string | null) => void;
  setPhase: (phase: GenerationPhase) => void;
  setError: (error: string | null) => void;
  updateStyleResult: (style: StyleKey, patch: Partial<StyleResult>) => void;
  setAllStylesStatus: (styles: StyleKey[], status: StyleResult['status'], error?: string | null) => void;
  reset: () => void;
};

export const useGenerationStore = create<GenerationStore>((set) => ({
  jobId: null,
  imageUri: null,
  imageUrl: null,
  selectedStyles: [],
  results: createInitialResults(),
  phase: 'idle',
  error: null,
  setImage: (imageUri) =>
    set(() => ({
      imageUri,
      ...(imageUri
        ? {}
        : {
            jobId: null,
            imageUrl: null,
            selectedStyles: [],
            results: createInitialResults(),
            phase: 'idle',
            error: null,
          }),
    })),
  setSelectedStyles: (styles) =>
    set((state) => ({
      selectedStyles: typeof styles === 'function' ? styles(state.selectedStyles) : styles,
    })),
  setJobId: (jobId) => set({ jobId }),
  setImageUrl: (imageUrl) => set({ imageUrl }),
  setPhase: (phase) => set({ phase }),
  setError: (error) => set({ error }),
  updateStyleResult: (style, patch) =>
    set((state) => ({
      results: {
        ...state.results,
        [style]: {
          ...state.results[style],
          ...patch,
        },
      },
    })),
  setAllStylesStatus: (styles, status, error = null) =>
    set((state) => ({
      results: styles.reduce<Record<StyleKey, StyleResult>>((acc, style) => {
        const current = acc[style];
        acc[style] = {
          ...current,
          status,
          error,
          outputUrl: status === 'success' ? current.outputUrl : status === 'failure' ? current.outputUrl : null,
        };
        return acc;
      }, { ...state.results }),
    })),
  reset: () => set(() => ({
    jobId: null,
    imageUri: null,
    imageUrl: null,
    selectedStyles: [],
    results: createInitialResults(),
    phase: 'idle',
    error: null,
  })),
}));
