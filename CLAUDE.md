# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Fresh Angular 21 CLI scaffold (project name `calendar`) with SSR enabled. `src/app/app.html` is still the CLI placeholder and `routes` is empty — no calendar features exist yet. All UI must follow the **Agenda** design system (see below).

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

## Design system: Agenda

Source of truth for UI (tokens, components, layout, copy): Design System artifact **Agenda** — https://claude.ai/artifact/MdcHTrC5TjmKLyr6EiJbxe (namespace `Agenda`, one theme, Spanish UI).

How to consult it (Artifact tool, `action: "read"`, `url` above, `path`/`paths`):
- `project/README.md` first: brand book, layout, states, CSS rules, usage rules.
- `project/api/tokens.md` for token values; `project/api/components/<Comp>.md` for props/parts. Components without a card (DayView, WeekView, MonthView, EventForm, TaskForm, BottomNav, AppBar, Fab, Menu, StatCard, SettingRow, pages like OverviewPage/WeekPage/SettingsPage/NavigationMap…) → `project/components/<Comp>/README.md` + `preview.html`.
- CSS source per block: `project/assets/Code/styles/{reset,tokens,composition,blocks,utilities}/`, entry `main.css`; generated tokens in `project/tokens.css`.
- Read the card/file before using a token or component; never guess values.

Angular adaptation:
- The artifact's `components/bundle.js` is React — don't use it. Build Angular standalone components that mirror its component names, props (as inputs), BEM-ish class names (`.block__element`) and `data-*` variant attributes (`data-variant`, `data-size`, `data-tone`…).
- Reuse its `tokens.css` and block CSS (CUBE CSS, `@layer reset, tokens, composition, block, utility, exception;`, tokens imported into `layer(tokens)`) instead of inventing styles.

Non-negotiables:
- Copy in Spanish, tuteo, sentence case; 24 h times (`08:30`, range `08:00 – 09:00`); states = word + icon, never color alone; no emojis.
- Tokens only, no literal colors; hover/active derived via OKLCH relative color + `l-step-hover`/`l-step-active`.
- rem/em/%/fr/ch/`cq*` + logical properties; only px is `border-hairline`. Layout via container queries on `.l-shell`, not viewport.
- Font Asap Sharp + Material Icons Outlined (Google Fonts). Single theme, no dark mode.

## Tooling

`.vscode/mcp.json` registers the Angular CLI MCP server (`npx @angular/cli mcp`).
