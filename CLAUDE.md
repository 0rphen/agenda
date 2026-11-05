# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Angular 21 app (project name `calendar`) with SSR enabled. Specs 01–84 are done: all DS components and every screen (desktop and mobile) exist. Backlog in `TODO.md`, specs in `specs/`. All UI must follow the **Agenda** design system (see below).

Routes (`app.routes.ts`, lazy `loadChildren` per feature): `/inicio` (default), `/resumen`, `/calendario` → `/calendario/{dia,semana,mes}?fecha=`, `/tareas?filtro=`, `/configuracion/{perfil,seguridad,calendario,notificaciones,apariencia}`, `/demo` (dev only), `**` → `/inicio`.

App shell (`app.ts` / `app.html`): `.l-shell` with `app-sidebar-nav variant="rail"` (desktop) and `app-bottom-nav` (mobile); grid layout from the deepest route's `data.layout` (`'week' | 'settings'`); pending-tasks badge on «Tareas»; loads settings and agenda in `afterNextRender`; applies Apariencia as `data-density` / `data-text-size` / `data-reduce-motion` on `<html>`. Destinations: `RAIL_DESTINATIONS` / `BOTTOM_DESTINATIONS` in `@shared/utils`.

App layout:

- `src/app/shared/components/<component>/`: reusable UI components. **Read `src/app/shared/components/COMPONENTS.md` before using or creating one** (selector, inputs/models/outputs, slots, CSS block, example). Fields implement `FormValueControl` (Checkbox/Switch `FormCheckboxControl`) for Signal Forms (`[formField]`).
- `src/app/features/<feature>/` (feature-first): `home`, `overview`, `calendar`, `tasks`, `settings`, plus `agenda` (shared data layer). Per feature: `domain/` (models, abstract repository, errors), `structure/` (localStorage repository, DTO, mapper, seed), `store/` (signal store), `<feature>.facade.ts` (pages inject only their facade, plus `Router`), `pages/` (smart, routed), `components/` (dumb, screen-specific), `<feature>.routes.ts`. `agenda/` holds `AgendaStore` (state), `AgendaCommands` (load/create/update/delete), `AgendaDialogs` (dialog state, rendered by `app-agenda-dialogs`), `Clock` (live `now`/`today`, aligned to the minute), pure helpers in `agenda-queries.ts` / `agenda-forms.ts`, and `provideAgenda()`.
- `src/app/shared/types/` and `src/app/shared/interfaces/`: every `type` goes to `types/`, every `interface` to `interfaces/` (none declared in components or `validation/`); one file per component (`ui.ts` holds `Size`, `Tone`, `Category`, `Tint`), re-exported by each folder's `index.ts` (`export *`).
- `src/app/shared/utils/`: module-level functions and constants, one file per domain (`time`, `lanes`, `text`, `avatar`, `alert`, `dom`, `navigation`, `event-form`, `task-form`), re-exported by `index.ts` (`export *`). Components declare no module-level `function`/`const`/`let`, except `let nextId = 0;` in fields. `utils/` may import `@shared/types`/`@shared/interfaces`, never the reverse.
- Path aliases (`tsconfig.json`): `@shared/components/<comp>/<file>`, `@shared/types`, `@shared/interfaces`, `@shared/utils` (barrel only, never a single file). Imports crossing folders use aliases; same directory stays relative (`./skeleton`, `./time`); `shared/validation/` has no alias.
- `src/app/shared/validation/`: custom validators (`phone`, `dniNie`) and `fieldError()` for Spanish error messages.
- `src/app/demo/`: `DemoPage`, the component showcase at `/demo`. The route exists only when `isDevMode()`, so it is not prerendered in production.

CSS layout:

- `src/styles.css` is the single entry point: it declares `@layer reset, tokens, composition, block, utility, exception;` and imports everything under `src/styles/`.
- `src/styles/tokens.css` is generated from `design-system/tokens.json` by `npm run tokens` (`scripts/build-tokens.mjs`): do not edit it by hand. To update it, copy the DS `project/tokens.json` over the local one and re-run the script. Never copy the DS `project/tokens.css` (it is stale).
- Block CSS for each component and page lives in `src/styles/blocks/` and is imported from `src/styles.css`. It is global, not a component `styleUrl`. Only exception: `DemoPage` keeps its layout in `demo-page.css`, so it does not ship in the global CSS.
- Other folders: `composition/` (`.l-cluster`, `.l-grid`, `.l-stack`, `.l-shell`, `.l-screen`), `utilities/` (`u-category`, `u-visually-hidden`, shell visibility, reduced motion), `exceptions/` (`user-preferences.css` for density/text size, `weekdays-only.css`), `tokens/context.css`, `reset/`.

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
- **Two app configs**: `app.config.ts` (browser: router with `withComponentInputBinding()` + `provideClientHydration(withEventReplay())` + repositories) is merged into `app.config.server.ts` (adds `provideServerRendering(withRoutes(serverRoutes))`). Add shared providers to `app.config.ts`; server-only ones to the server config.
- **Data**: no backend. `AgendaRepository` → `AgendaLocalRepository` and `SettingsRepository` → `SettingsLocalRepository` (provided app-wide in `app.config.ts`) persist to `localStorage`. The server renders empty/skeleton states; data loads in the browser (`afterNextRender`).
- **Two route tables**: `app.routes.ts` defines client routes; `app.routes.server.ts` defines per-route render mode: `RenderMode.Server` for data screens (`inicio`, `resumen`, `calendario/*`, `tareas`, `configuracion/**`), `RenderMode.Client` for `/calendario` (its redirect depends on the saved default view), `'**'` → `RenderMode.Prerender`. New routes need an explicit entry if they depend on request or stored data.
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

- Before starting `/spec` or `/spec-impl`, check whether the `caveman` and `ponytail` skills are loaded in the session. If either is missing, load it with the Skill tool before drafting or implementing anything.
- Specs live in `specs/NN-slug.md`; the ordered backlog of components and screens is in `TODO.md`.
- Specs are written in Spanish. Requirements and acceptance criteria use **EARS** format (in Spanish), one verifiable requirement per line:
  - Ubiquitous: «El `<componente>` deberá `<respuesta>`.»
  - Event-driven: «Cuando `<disparador>`, el `<componente>` deberá `<respuesta>`.»
  - State-driven: «Mientras `<estado>`, el `<componente>` deberá `<respuesta>`.»
  - Unwanted behavior: «Si `<condición>`, entonces el `<componente>` deberá `<respuesta>`.»
  - Optional feature: «Donde `<característica/input>`, el `<componente>` deberá `<respuesta>`.»
  - Patterns can be combined (e.g. «Mientras `disabled`, cuando el usuario hace clic, el `app-button` no deberá emitir `clicked`.»).
- Number requirements (`R1`, `R2`…) and reference them from the acceptance criteria and the plan.
- Every spec that creates or changes a component in `src/app/shared/components/` must add or update its section in `src/app/demo/demo-page.html` and in `src/app/shared/components/COMPONENTS.md`, and list both in its plan and acceptance criteria.

## Tooling

`.vscode/mcp.json` registers the Angular CLI MCP server (`npx @angular/cli mcp`).
