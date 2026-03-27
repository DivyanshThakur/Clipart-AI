export interface AppBindings {
  JOB_KV: KVNamespace;
  RATE_LIMIT_KV: KVNamespace;
  REPLICATE_API_TOKEN: string;
  PUBLIC_API_BASE_URL: string;
  REPLICATE_WEBHOOK_SECRET: string;
  ALLOWED_ORIGINS?: string;
  ENVIRONMENT?: string;
}

export interface AppVariables {
  requestId: string;
}
