# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Fresh Angular 21 CLI scaffold (project name `calendar`) with SSR enabled. `src/app/app.html` is still the CLI placeholder and `routes` is empty — no calendar features exist yet.

## Commands

- `npm start` — dev server at http://localhost:4200 (SSR runs through the dev server via `reqHandler` in `src/server.ts`)
- `npm run build` — production build to `dist/calendar/{browser,server}`
- `npm run watch` — dev build in watch mode
- `npm run serve:ssr:calendar` — run the built Express SSR server (port `PORT` or 4000)
- `npm test` — Vitest via `@angular/build:unit-test` (jsdom), watch mode by default
- Single spec: `npx ng test --include src/app/app.spec.ts`; one-shot run: add `--watch=false`
- No linter configured. Formatting via Prettier config in `package.json` (printWidth 100, single quotes, Angular parser for `.html`).

## Architecture

- **Standalone, zoneless-era Angular**: no NgModules; components use `signal()`; bootstrapped with `bootstrapApplication`.
- **Two app configs**: `app.config.ts` (browser: router + `provideClientHydration(withEventReplay())`) is merged into `app.config.server.ts` (adds `provideServerRendering(withRoutes(serverRoutes))`). Add shared providers to `app.config.ts`; server-only ones to the server config.
- **Two route tables**: `app.routes.ts` defines client routes; `app.routes.server.ts` defines per-route render mode. Currently `'**'` → `RenderMode.Prerender`, so all routes are prerendered at build time — routes with params or request-dependent data need an explicit `RenderMode.Server`/`Client` entry (or `getPrerenderParams`).
- **Express server** (`src/server.ts`): serves static `browser/` files, then delegates to `AngularNodeAppEngine`. Custom API endpoints go before the Angular handler.
- Code runs on both server and browser — guard browser-only APIs (`window`, `localStorage`, etc.) with `afterNextRender`/`isPlatformBrowser`.
- Build budgets (production): initial bundle warn 500kB / error 1MB; per-component styles warn 4kB / error 8kB.
- TypeScript strict mode + Angular `strictTemplates`; `noPropertyAccessFromIndexSignature` means use `process.env['X']` bracket access.
- Component selector prefix: `app`.

## Tooling

`.vscode/mcp.json` registers the Angular CLI MCP server (`npx @angular/cli mcp`).
