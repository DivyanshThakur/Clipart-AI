## API Environments

- Local Worker URL: `http://localhost:8787`
- Development public webhook URL: `https://earthbound-irritatedly-alethea.ngrok-free.dev`
- Production API URL: `https://clipart-api.divyanshthakur.com`

In development, mobile clients should call the local Worker URL while Replicate webhooks should target the ngrok URL through `PUBLIC_API_BASE_URL`.

## KV Setup

Create the KV namespaces first:

```txt
pnpm --filter @clipart-ai/api exec wrangler kv namespace create JOB_KV
pnpm --filter @clipart-ai/api exec wrangler kv namespace create RATE_LIMIT_KV
pnpm --filter @clipart-ai/api exec wrangler kv namespace create JOB_KV --env production
pnpm --filter @clipart-ai/api exec wrangler kv namespace create RATE_LIMIT_KV --env production
```

Then copy the returned namespace IDs into [wrangler.jsonc](/Users/divyanshthakur/Documents/GitHub/clipart-ai/apps/api/wrangler.jsonc):

- default env:
  - `replace-with-job-kv-id`
  - `replace-with-rate-limit-kv-id`
- production env:
  - `replace-with-production-job-kv-id`
  - `replace-with-production-rate-limit-kv-id`

You can verify the namespaces later with:

```txt
pnpm --filter @clipart-ai/api exec wrangler kv namespace list
pnpm --filter @clipart-ai/api exec wrangler kv namespace list --env production
```

## Commands

```txt
pnpm install
pnpm --filter @clipart-ai/api dev
```

```txt
pnpm --filter @clipart-ai/api deploy
pnpm --filter @clipart-ai/api deploy --env production
```

## Secrets

Set secrets for both the default environment and production:

```txt
pnpm --filter @clipart-ai/api exec wrangler secret put REPLICATE_API_TOKEN
pnpm --filter @clipart-ai/api exec wrangler secret put REPLICATE_MODEL_REF
pnpm --filter @clipart-ai/api exec wrangler secret put REPLICATE_WEBHOOK_SECRET
```

```txt
pnpm --filter @clipart-ai/api exec wrangler secret put REPLICATE_API_TOKEN --env production
pnpm --filter @clipart-ai/api exec wrangler secret put REPLICATE_MODEL_REF --env production
pnpm --filter @clipart-ai/api exec wrangler secret put REPLICATE_WEBHOOK_SECRET --env production
```

## Worker Types

After changing `wrangler.jsonc`, regenerate runtime types:

```txt
pnpm --filter @clipart-ai/api cf-typegen
```

## Deploy Notes

- Development webhooks use `PUBLIC_API_BASE_URL=https://earthbound-irritatedly-alethea.ngrok-free.dev`
- Production webhooks use `PUBLIC_API_BASE_URL=https://clipart-api.divyanshthakur.com`
- Mobile should call `http://localhost:8787` in local development and `https://clipart-api.divyanshthakur.com` in production
