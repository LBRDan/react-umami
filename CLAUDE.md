# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is `@lbrdan/react-umami` - a zero-dependency React library for integrating with Umami analytics. It provides a React Context + Hooks based approach without requiring the external Umami SDK to be loaded at runtime.

## Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Build the library (outputs to dist/)
pnpm build

# Run tests in watch mode
pnpm test

# Run tests once (CI mode)
pnpm test:ci

# Generate coverage report
pnpm coverage
```

## Architecture

The library is structured around React Context for dependency injection:

### Core Files

- **src/provider.tsx** - `UmamiProvider` component that initializes the context with tracking configuration
  - Handles Do Not Track detection via `doNotTrack()` utility
  - Manages domain allowlisting
  - Creates the `track()` function that posts to Umami API endpoint

- **src/context.ts** - Defines `UmamiContext` with default empty values

- **src/hooks.ts** - Two main hooks:
  - `useUmamiEventTrack()` - Track custom events with optional data
  - `useUmamiPageTrack()` - Track pageviews

- **src/utils.ts** - Core utilities:
  - `doNotTrack()` - Cross-browser Do Not Track detection
  - `post()` - HTTP request with fetch/XHR fallback
  - `removeTrailingSlash()` - URL normalization

- **src/types.ts** - TypeScript interfaces for `UmamiContextValue`, `UmamiTrackEvent`, `UmamiTrackEventPayload`

- **src/components.tsx** - `PageTracker` component for automatic pageview tracking

- **src/const.ts** - Constants including Umami API path (`/api/send`), cache keys

### Data Flow

1. User wraps app in `UmamiProvider` with config (host URL, website ID, domains)
2. Provider computes common payload fields (hostname, screen size, language, etc.)
3. Hooks consume context to get `track()` function and payload fields
4. Events are POSTed to `{hostUrl}/api/send` with payload format matching Umami v2 API

### Build System

- **Vite** with `vite-plugin-dts` for TypeScript declaration generation
- Outputs ESM (`react-umami.js`), CJS (`react-umami.umd.cjs`), and UMD formats
- Entry point: `src/index.ts`
- React is externalized (peer dependency)

### Testing

- **Vitest** with jsdom environment
- **MSW (Mock Service Worker)** for API mocking in `src/test/msw.test.utils.ts`
- `@testing-library/react-hooks` for hook testing
- Test utilities in `src/test/` directory

## Important Constraints

- No external runtime dependencies - zero dependencies
- Side effects free (`sideEffect: false` in package.json)
- Supports SSR (checks for `typeof window == "undefined"`)
- Respects user privacy via Do Not Track and domain allowlisting
