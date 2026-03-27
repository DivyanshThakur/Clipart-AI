export type StyleKey =
  | 'cartoon'
  | 'anime'
  | 'pixel_art'
  | 'flat_illustration'
  | 'sketch'
  | 'comic_book';

export type StyleStatus = 'uploading' | 'processing' | 'success' | 'failure';

export type StyleResult = {
  style: StyleKey;
  status: StyleStatus;
  outputUrl: string | null;
  error: string | null;
};

export type Job = {
  jobId: string;
  imageUrl: string;
  createdAt: string;
  styles: Record<StyleKey, StyleResult>;
};

export type HistoryJob = {
  jobId: string;
  imageUrl: string;
  uploadedImageUrl: string | null;
  styles: Record<StyleKey, StyleResult>;
  selectedStyles: StyleKey[];
  completedAt: string;
};

export type BackendStyleStatus = Exclude<StyleStatus, 'uploading'>;

export type GenerationPhase = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
