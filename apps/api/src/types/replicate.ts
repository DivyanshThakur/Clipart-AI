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
