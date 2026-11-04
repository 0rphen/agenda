# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Angular 21 app (project name `calendar`) with SSR enabled. The CSS foundation (SPEC 01) and the atoms/basic controls are in place; `src/app/app.html` is just `<router-outlet />` and there are no screens yet. Backlog of components and screens in `TODO.md`, specs in `specs/`. All UI must follow the **Agenda** design system (see below).

App layout:
- `src/app/shared/components/<component>/`: reusable UI components (Icon, Spinner, Badge, Avatar, Progress, Skeleton, Button, ButtonLink, Text/Textarea/Select/Date/Time/NumberField). Fields implement `FormValueControl` for Signal Forms (`[formField]`).
- `src/app/shared/types/` and `src/app/shared/interfaces/`: every `type` goes to `types/`, every `interface` to `interfaces/` (none declared in components or `validation/`); one file per component (`ui.ts` holds `Size`, `Tone`, `Category`, `Tint`), re-exported by each folder's `index.ts` (`export *`).
- `src/app/shared/utils/`: module-level functions and constants, one file per domain (`time`, `lanes`, `text`, `avatar`, `alert`, `dom`), re-exported by `index.ts` (`export *`). Components declare no module-level `function`/`const`/`let`, except `let nextId = 0;` in fields. `utils/` may import `@shared/types`/`@shared/interfaces`, never the reverse.
- Path aliases (`tsconfig.json`): `@shared/components/<comp>/<file>`, `@shared/types`, `@shared/interfaces`, `@shared/utils` (barrel only, never a single file). Imports crossing folders use aliases; same directory stays relative (`./skeleton`, `./time`); `shared/validation/` has no alias.
- `src/app/shared/validation/`: custom validators (`phone`, `dniNie`) and `fieldError()` for Spanish error messages.
- `src/app/demo/`: `DemoPage`, the component showcase at `/demo`. The route exists only when `isDevMode()`, so it is not prerendered in production.

CSS layout:
- `src/styles.css` is the single entry point: it declares `@layer reset, tokens, composition, block, utility, exception;` and imports everything under `src/styles/`.
- `src/styles/tokens.css` is generated from `design-system/tokens.json` by `npm run tokens` (`scripts/build-tokens.mjs`): do not edit it by hand. To update it, copy the DS `project/tokens.json` over the local one and re-run the script. Never copy the DS `project/tokens.css` (it is stale).
- Block CSS for each component lives in `src/styles/blocks/` and is imported from `src/styles.css`. It is global, not a component `styleUrl`. Only exception: `DemoPage` keeps its layout in `demo-page.css`, so it does not ship in the global CSS.

## Commands

- `npm start` — dev server at http://localhost:4200 (SSR runs through the dev server via `reqHandler` in `src/server.ts`)
- `npm run build` — production build to `dist/calendar/{browser,server}`
- `npm run watch` — dev build in watch mode
- `npm run tokens` — regenerate `src/styles/tokens.css` from `design-system/tokens.json`
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
- Templates: inline only if it fits on one line (e.g. `'{{ name() }}'`); otherwise `templateUrl: './<basename>.html'`. Test host components in `*.spec.ts` are exempt.

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
- Don't port the DS preview props (`state`, `forceState`, `slotState`, `static`, `data-force`, `data-static`): they only paint states without interaction. Real states use `:hover`, `:active`, `:focus-visible`, `:focus-within` (SPEC 83).

Non-negotiables:
- Copy in Spanish, tuteo, sentence case; 24 h times (`08:30`, range `08:00 – 09:00`); states = word + icon, never color alone; no emojis.
- Tokens only, no literal colors; hover/active derived via OKLCH relative color + `l-step-hover`/`l-step-active`.
- rem/em/%/fr/ch/`cq*` + logical properties; only px is `border-hairline`. Layout via container queries on `.l-shell`, not viewport.
- Font Asap Sharp + Material Icons Outlined (Google Fonts). Single theme, no dark mode.

## Specs

- Antes de empezar `/spec` o `/spec-impl`, comprueba si las skills `caveman` y `ponytail` están cargadas en la sesión. Si falta alguna, cárgala con la herramienta Skill antes de redactar o implementar nada.
- Viven en `specs/NN-slug.md`; el backlog ordenado de componentes y pantallas está en `TODO.md`.
- Requisitos y criterios de aceptación en formato **EARS** (en español), un requisito por línea, verificable:
  - Ubicuo: «El `<componente>` deberá `<respuesta>`.»
  - Por evento: «Cuando `<disparador>`, el `<componente>` deberá `<respuesta>`.»
  - Por estado: «Mientras `<estado>`, el `<componente>` deberá `<respuesta>`.»
  - No deseado: «Si `<condición>`, entonces el `<componente>` deberá `<respuesta>`.»
  - Opcional: «Donde `<característica/input>`, el `<componente>` deberá `<respuesta>`.»
  - Se pueden combinar (p. ej. «Mientras `disabled`, cuando el usuario hace clic, el `app-button` no deberá emitir `clicked`.»).
- Numera los requisitos (`R1`, `R2`…) y referéncialos desde los criterios de aceptación y el plan.
- Todo spec que crea o cambia un componente de `src/app/shared/components/` deberá añadir o actualizar su sección en `src/app/demo/demo-page.html` y listarlo en su plan y criterios de aceptación.

## Tooling

`.vscode/mcp.json` registers the Angular CLI MCP server (`npx @angular/cli mcp`).
