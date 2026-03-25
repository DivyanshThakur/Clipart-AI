# Clipart AI

This is a monorepo powered by [Turborepo](https://turborepo.org/), containing our React Native mobile application and our Hono backend.

## What's inside?

This repository includes the following apps and packages:

### Apps

- `mobile`: a [React Native Expo](https://expo.dev/) application.
- `api`: a [Hono](https://hono.dev/) backend application designed to run on [Cloudflare Workers](https://workers.cloudflare.com/).

### Packages

- `@repo/eslint-config`: shared `eslint` configurations.
- `@repo/typescript-config`: shared `tsconfig.json`s used throughout the monorepo.

## Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or newer recommended)
- [pnpm](https://pnpm.io/) (used for package management)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) (for Cloudflare Workers local development and deployment)

## Getting Started

First, install all dependencies at the root of the repository:

```sh
pnpm install
```

### Developing

To start the development servers for all applications and packages simultaneously, run:

```sh
pnpm dev
```

This will run:
- The Hono API locally via Wrangler (typically on `http://localhost:8787`).
- The Expo bundler for the mobile app, allowing you to run the app on an iOS simulator, Android emulator, or via the Expo Go app.

### Building

To build all apps and packages:

```sh
pnpm build
```

### Other Commands

- `pnpm lint`: Lint all apps and packages.
- `pnpm check-types`: Check types across the monorepo.

You can also run commands for specific apps using Turborepo filters. For example:
```sh
pnpm turbo dev --filter=mobile
```

## Useful Links

- [Turborepo Documentation](https://turborepo.dev/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [Hono Documentation](https://hono.dev/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
