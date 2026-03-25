export type StyleKey =
  | 'cartoon'
  | 'anime'
  | 'pixel_art'
  | 'flat_illustration'
  | 'sketch'
  | 'comic_book';

export type StyleStatus = 'processing' | 'success' | 'failure';

export interface StyleState {
  status: StyleStatus;
  outputUrl: string | null;
  error: string | null;
  predictionId: string | null;
}

export interface JobRecord {
  jobId: string;
  createdAt: string;
  imageUrl: string;
  uploadStatus: 'uploaded';
  generationStartedAt: string | null;
  styles: Partial<Record<StyleKey, StyleState>>;
}
