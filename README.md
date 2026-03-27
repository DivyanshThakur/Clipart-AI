# Clipart AI

This monorepo contains:

- `apps/mobile`: an Expo mobile app
- `apps/api`: a Hono API running on Cloudflare Workers

## Install

```sh
pnpm install
```

## How The App Connects

There are two different URLs in this project, and they serve different jobs:

- `EXPO_PUBLIC_API_URL`: used by the mobile app for normal API requests like `/upload`, `/generate`, and `/job/:id/status`
- `PUBLIC_API_BASE_URL`: used by the API when it tells Replicate where to send webhooks back

That split matters in local development:

- the mobile app can call a local Worker URL such as `http://localhost:8787`
- Replicate cannot call your localhost, so the API must use a public tunnel URL for webhooks

## Local Setup

### 1. Mobile env

Copy [apps/mobile/.env.example](/Users/divyanshthakur/Documents/GitHub/clipart-ai/apps/mobile/.env.example) to `apps/mobile/.env.local`.

Use one of these values for `EXPO_PUBLIC_API_URL`:

- iOS simulator on the same Mac: `http://localhost:8787`
- Android emulator: usually `http://10.0.2.2:8787`
- Physical phone on the same Wi-Fi: `http://YOUR_COMPUTER_LAN_IP:8787`

If you use a physical device, start the Worker with `--ip 0.0.0.0` so your phone can reach it:

```sh
pnpm --filter @clipart-ai/api exec wrangler dev --ip 0.0.0.0 --port 8787
```

### 2. API secrets for local dev

Copy [apps/api/.dev.vars.example](/Users/divyanshthakur/Documents/GitHub/clipart-ai/apps/api/.dev.vars.example) to `apps/api/.dev.vars` and fill in:

- `REPLICATE_API_TOKEN`
- `REPLICATE_WEBHOOK_SECRET`

`PUBLIC_API_BASE_URL` for local dev already comes from [apps/api/wrangler.jsonc](/Users/divyanshthakur/Documents/GitHub/clipart-ai/apps/api/wrangler.jsonc), and should be set to your public tunnel URL.

### 3. Start the apps

API:

```sh
pnpm --filter @clipart-ai/api dev
```

Mobile:

```sh
pnpm --filter @clipart-ai/mobile dev
```

## Production Setup

For deployed Workers, set Replicate secrets with Wrangler:

```sh
pnpm --filter @clipart-ai/api exec wrangler secret put REPLICATE_API_TOKEN --env production
pnpm --filter @clipart-ai/api exec wrangler secret put REPLICATE_WEBHOOK_SECRET --env production
```

Production `PUBLIC_API_BASE_URL` is configured in [apps/api/wrangler.jsonc](/Users/divyanshthakur/Documents/GitHub/clipart-ai/apps/api/wrangler.jsonc) and should match the deployed API domain.

For production mobile builds, set:

```txt
EXPO_PUBLIC_API_URL=https://clipart-api.divyanshthakur.com
```

## Useful Commands

```sh
pnpm dev
pnpm build
pnpm lint
pnpm check-types
```
