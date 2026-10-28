# SPEC 76 — Resumen móvil: MobileOverview

> **Status:** Implemented
> **Depends on:** SPEC 41 (AppBar), SPEC 35 (StatCard), SPEC 11 (Skeleton), SPEC 26 (EmptyState), SPEC 55 (`.l-screen`), SPEC 59 (Resumen), SPEC 75 (pantallas móviles, `u-mobile-only`/`u-desktop-only`, `shell-screen.css`)
> **Date:** 2026-10-27
> **Objective:** Adaptar `/resumen` para que, con `.l-shell` por debajo de 48rem, sea la pantalla MobileOverview del DS (`.screen.l-screen` con AppBar «Resumen» y flecha «Volver a Hoy», StatCards en dos columnas, cargando y día libre), y abrirla desde el AppBar de Hoy.

## Scope

**In:**

- `OverviewPage`: host `overview-page screen l-screen`, `div.l-screen__top.u-mobile-only` con `app-app-bar` (back), `app-overview-side` con `u-desktop-only`.
- `OverviewMain`: host `l-screen__main`; breadcrumb y cabecera `u-desktop-only`; StatCards móviles en `l-grid data-cols="2"`; esqueleto móvil; Card «Avance de la semana» y Alert de conflicto `u-mobile-only`; EmptyState móvil de «Agenda de hoy» con «Nueva cita».
- `CalendarDayPage`: IconButton «Resumen» en el AppBar de Hoy.
- Tests de `OverviewPage`, `OverviewMain`, `CalendarDayPage`; `PENDING.md`; marcar el ítem en `TODO.md`.

**Out of scope:**

- Cambios en `shared/components`, CSS nuevo (se reutilizan `shell-screen.css`, `shell-visibility.css`, `grid.css`): sin sección nueva en `/demo`.
- Badge de pendientes en la BottomNav (SPEC 75, `PENDING.md`).
- Ajustes móvil (siguiente ítem de TODO §6).

## Requisitos (EARS)

Página:

- **R1.** El `OverviewPage` deberá tener las clases de host `overview-page screen l-screen` y renderizar `div.l-screen__top.u-mobile-only` > `app-app-bar` con heading «Resumen», subtitle `dayTitle(today)` («Jueves 22 de octubre»), `back` y `backLabel` «Volver a Hoy».
- **R2.** Cuando el usuario pulsa la flecha del AppBar, el `OverviewPage` deberá navegar a `/calendario/dia`.
- **R3.** El `OverviewPage` deberá marcar `app-overview-side` con `u-desktop-only`.
- **R4.** El `OverviewMain` deberá tener en el host la clase `l-screen__main` y marcar el breadcrumb y la cabecera (saludo, lead, «Nueva cita») con `u-desktop-only`.
- **R5.** Mientras el ancho de `.l-shell` sea al menos 48rem, `/resumen` deberá verse como antes de este spec.

Con datos:

- **R6.** Mientras `status` es `ready`, el `OverviewMain` deberá marcar el grid de StatCards de escritorio con `u-desktop-only` y renderizar un `div.l-grid.u-mobile-only[data-cols="2"]` con cuatro StatCards: «Citas» (`event`, botón, hint «Día libre» si no hay citas hoy, si no «Próxima HH:MM» o «Sin más citas»), «Pendientes» (`task_alt`, `accent`, botón, hint «N vence(n) hoy»), «Reservadas» (`schedule`, `info`, hint «De 8 h») y «Hechas» (`check_circle`, `success`, hint «De N»).
- **R7.** Cuando el usuario pulsa «Citas» o «Pendientes» móviles, el `OverviewMain` deberá emitir `dayOpened` o `tasksOpened`, como en escritorio.
- **R8.** Mientras `status` es `ready`, el `OverviewMain` deberá mantener en ambos anchos «Próxima cita», «Tareas que vencen» y «Agenda de hoy».
- **R9.** Mientras `status` es `ready` y hay `progress`, el `OverviewMain` deberá renderizar `app-card.u-mobile-only` «Avance de la semana» con un `app-progress` por lista (tono `success` al 100 %), igual que el panel.
- **R10.** Donde haya `conflict`, el `OverviewMain` deberá renderizar `app-alert.u-mobile-only` «Conflicto de agenda» con el mismo texto que el panel.

Día libre:

- **R11.** Si no hay citas hoy, entonces «Agenda de hoy» deberá mostrar en escritorio el EmptyState actual (`u-desktop-only`) y en móvil `app-empty-state.u-mobile-only` `size="s"` con heading «Hoy no tienes citas», descripción «Aprovecha para adelantar tareas.», icono `event_available` y `app-button` `size="s"` `icon="add"` «Nueva cita»; cuando el usuario lo pulsa, deberá emitir `newEvent`.

Cargando:

- **R12.** Mientras `status` no es `ready` ni `error`, el `OverviewMain` deberá renderizar el esqueleto de escritorio con `u-desktop-only` y un bloque `u-mobile-only` con `div.l-grid[data-cols="2"]` de cuatro `app-skeleton` de alto `7.5rem` y `app-skeleton-list` `variant="card"` `rows="2"` con label «Cargando tu resumen».

Entrada desde Hoy:

- **R13.** El AppBar de Hoy (`CalendarDayPage`) deberá tener, antes del menú «Vista», un `app-icon-button` icono `dashboard` y label «Resumen»; cuando el usuario lo pulsa, deberá navegar a `/resumen`.

## Data model

```ts
// OverviewMain: inputs nuevos
readonly progress = input<ListProgress[]>([]);
readonly conflict = input<AgendaConflict>();

// OverviewPage
protected readonly title = computed(() => dayTitle(this.facade.today()));
```

## Implementation plan

1. `OverviewMain`: inputs `progress`/`conflict`, clases `u-desktop-only`/`u-mobile-only`, StatCards móviles, esqueleto móvil, Avance, conflicto, EmptyState móvil + tests (R4, R6–R12).
2. `OverviewPage`: host, AppBar con back, `u-desktop-only` en el side, pasar `progress`/`conflict` + tests (R1–R3).
3. `CalendarDayPage`: IconButton «Resumen» + test (R13).
4. Playwright en `npm start` a 390 px y 1440 px: con datos, cargando (antes de `load`), día libre, flecha a Hoy, IconButton desde Hoy, scroll solo en `main`, escritorio sin cambios, consola sin errores (R1–R13).
5. `npx ng test --watch=false`, `npm run build`; `PENDING.md`; marcar el ítem en `TODO.md`.

## Acceptance criteria

- [x] `npx ng test --watch=false`: tests de R1–R4, R6–R13 añadidos; todos los specs pasan por grupos (400 tests). La suite completa sigue dando timeouts aleatorios de 5000 ms en tests no tocados, distintos en cada ejecución (ver `PENDING.md`, SPEC 75).
- [x] `npm run build` sin errores ni warnings de budget.
- [x] Playwright a 390 px: AppBar «Resumen» con flecha a Hoy, StatCards en 2 columnas, Próxima cita, Tareas que vencen, Agenda de hoy, Avance; solo `.l-screen__main` hace scroll; BottomNav con «Hoy» activo (R1–R4, R6–R10). Día libre y esqueleto móvil (R11, R12) verificados solo con tests: los datos seed tienen citas hoy y la carga es instantánea.
- [x] Playwright a 390 px: el IconButton «Resumen» de Hoy abre `/resumen` (R13).
- [x] Playwright a 1440 px: `/resumen` como antes (R5).
- [x] Sin CSS nuevo ni `styles`/`styleUrl` en componentes.
- [x] Sin sección nueva en `/demo`: no cambia `shared/components`.
- [x] Ítem marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** adaptar `OverviewPage` con CSS (`u-mobile-only`/`u-desktop-only`), como SPEC 75, sin componente móvil aparte.
- **Sí:** entrada desde Hoy con IconButton «Resumen» (`dashboard`, como el riel) en el AppBar (respuesta del usuario).
- **Sí:** mantener en móvil «Tareas que vencen» y el conflicto, que el DS no pinta (respuesta del usuario).
- **Sí:** StatCards móviles duplicadas con las etiquetas cortas del DS («Citas», «Hechas», «De 8 h») en `data-cols="2"`: el grid de escritorio usa `data-min`, que no se cambia por CSS sin divergencia.
- **Sí:** el día libre del DS (Card sin heading con EmptyState y «Nueva cita») se aplica dentro de «Agenda de hoy»; «Próxima cita» sigue mostrando la siguiente cita aunque sea otro día.
- **Sí:** «Avance de la semana» después de «Agenda de hoy», y el conflicto al final.
- **No:** Fab en Resumen (el DS no lo tiene).

## Risks

- DOM duplicado (StatCards, esqueleto, EmptyState): el lector de pantalla solo ve el visible (`display: none`); los tests deben buscar dentro de `.u-mobile-only`/`.u-desktop-only`.
- jsdom no evalúa container queries: R5 solo con Playwright.

## What is **not** in this spec

Ajustes móvil, Inicio y Semana móviles, badge de la BottomNav, CSS nuevo.
