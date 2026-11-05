# Agenda

Calendar and task manager built with Angular 21 and server-side rendering. The UI is in Spanish and follows the **Agenda** design system (tokens, CUBE CSS blocks, Asap Sharp + Material Icons Outlined).

There is no backend: appointments, tasks and settings are stored in the browser's `localStorage`. The server renders the shell and loading states; data loads on the client.

## Screens

| Route                                | Screen                                                            |
| ------------------------------------ | ----------------------------------------------------------------- |
| `/inicio`                            | Home: mini calendar, agenda for the day/week (with search), tasks |
| `/resumen`                           | Overview: stats, upcoming appointments, weekly progress           |
| `/calendario/dia`, `/semana`, `/mes` | Calendar day, week and month views (`?fecha=YYYY-MM-DD`)          |
| `/tareas`                            | Tasks: filter (`?filtro=`), quick add, groups by due date, detail |
| `/configuracion/<section>`           | Settings: profile, security, calendar, notifications, appearance  |
| `/demo`                              | Component showcase (development only)                             |

Desktop uses a side rail (`SidebarNav`); narrow containers switch to a bottom tab bar (`BottomNav`).

## Stack

- Angular 21: standalone components, signals, Signal Forms, zoneless-era APIs
- `@angular/ssr` with Express (`src/server.ts`), per-route render modes
- Plain global CSS with cascade layers (`reset, tokens, composition, block, utility, exception`); tokens generated from `design-system/tokens.json`
- Vitest (jsdom) through `@angular/build:unit-test`

## Commands

```bash
npm install
npm start                    # dev server at http://localhost:4200 (with SSR)
npm run build                # production build to dist/calendar/{browser,server}
npm run serve:ssr:calendar   # run the built SSR server (PORT or 4000)
npm test                     # unit tests in watch mode
npx ng test --watch=false    # single run
npm run tokens               # regenerate src/styles/tokens.css from design-system/tokens.json
```

Formatting: Prettier (config in `package.json`). No linter.

## Project structure

```
src/
  app/
    app.ts, app.html          app shell (rail + bottom nav + router outlet)
    app.routes*.ts            client routes and server render modes
    features/                 home, overview, calendar, tasks, settings, agenda (data layer)
    shared/
      components/             reusable UI components (see COMPONENTS.md)
      types/, interfaces/     shared types and interfaces
      utils/                  pure helpers and constants
      validation/             custom validators and Spanish error messages
    demo/                     /demo showcase
  styles.css                  single CSS entry point
  styles/                     reset, tokens, composition, blocks, utilities, exceptions
design-system/tokens.json     design tokens source
specs/                        numbered specs (EARS requirements, Spanish)
```

## Documentation

- [`CLAUDE.md`](CLAUDE.md): architecture, conventions and design-system rules
- [`src/app/shared/components/COMPONENTS.md`](src/app/shared/components/COMPONENTS.md): component API reference
- [`TODO.md`](TODO.md): implementation backlog
- [`specs/`](specs/): one spec per change
