export interface ReplicateFileUploadResponse {
  id?: string;
  url?: string;
  urls?: {
    get?: string;
    download?: string;
  };
}

export interface ReplicatePredictionResponse {
  id: string;
  status?: string;
}

export interface ReplicateWebhookPayload {
  id?: string;
  status?: string;
  output?: string | string[] | null;
  error?: string | null;
}
