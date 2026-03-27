import type { JobRecord, StyleKey, StyleState } from './job';

export interface UploadRequestBody {
  imageBase64: string;
}

export interface UploadResponseBody {
  jobId: string;
  imageUrl: string;
  status: 'uploaded';
}

export interface GenerateRequestBody {
  jobId: string;
  styles: StyleKey[];
}

export interface GenerateResponseBody {
  jobId: string;
  status: 'processing';
  queuedStyles?: StyleKey[];
}

export interface ErrorResponseBody {
  error: string;
  code: string;
}

export interface JobStatusResponseBody
  extends Pick<JobRecord, 'jobId' | 'createdAt' | 'imageUrl'> {
  styles: Partial<Record<StyleKey, StyleState>>;
}
