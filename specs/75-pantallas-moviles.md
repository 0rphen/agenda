# SPEC 75 — Pantallas móviles: Hoy, Mes, Tareas y hoja «Nueva cita»

> **Status:** Implemented
> **Depends on:** SPEC 37 (WeekStrip), SPEC 38 (MiniCalendar), SPEC 41 (AppBar), SPEC 29 (Fab), SPEC 30 (Menu), SPEC 42 (Dialog), SPEC 55 (`.l-screen`), SPEC 56 (BottomNav), SPEC 62–64 (Calendario), SPEC 67 (Tareas)
> **Date:** 2026-10-27
> **Objective:** Adaptar con CSS las páginas `/calendario/dia`, `/calendario/mes` y `/tareas` para que, con `.l-shell` por debajo de 48rem, sean las pantallas Hoy, Mes y Tareas de MobileScreens (`.screen.l-screen` con AppBar, contenido con scroll propio y Fab), y abrir «Nueva cita» como hoja y el detalle de tarea a pantalla completa.

## Scope

**In:**

- `src/styles/utilities/shell-visibility.css`: `.u-mobile-only` / `.u-desktop-only` por container query `shell` (48rem).
- `src/styles/blocks/shell-screen.css` (divergencia local): página `.l-screen` dentro de `.l-shell__grid` a alto fijo bajo 48rem, padding móvil del `main`, Fab sobre el borde inferior del `.l-screen` (la BottomNav está fuera, en `App`).
- `CalendarDayPage`, `CalendarMonthPage`, `TasksPage`: host `screen l-screen`, `div.l-screen__top` con `app-app-bar`, `div.l-screen__fab` con `app-fab` (solo día y mes), panel lateral `u-desktop-only`.
- `DayMain`: cabecera de escritorio `u-desktop-only`; `app-week-strip` `u-mobile-only`; host `l-screen__main`.
- `MonthMain`: cabecera y MonthView `u-desktop-only`; Card con MiniCalendar + lista de AgendaItem del día `u-mobile-only`; host `l-screen__main`.
- `TasksMain`: breadcrumb y título `u-desktop-only`; lista plana `u-mobile-only` y Cards por grupo `u-desktop-only`; Card «Progreso» `u-mobile-only`; host `l-screen__main`.
- `TasksPage`: Dialog `variant="full"` «Detalle de la tarea» en móvil.
- `AgendaDialogs`: `variant` `sheet` («Nueva cita») y `full` («Detalle de tarea») en móvil.
- `CalendarFacade`: `weekStart`/`weekDays` (con `hasEvents`) suben desde `CalendarWeekFacade`; `CalendarMonthFacade.dayEvents`.
- `@shared/utils`: `dayTitle(iso)`, `monthTitle(iso)` (`time.ts`), `isNarrow()` (`dom.ts`).
- Tests de páginas, componentes, facades y utils; `PENDING.md`; marcar el ítem en `TODO.md`.

**Out of scope:**

- Resumen móvil y Ajustes móvil (siguientes ítems de TODO §6); Inicio, Semana, Resumen y Configuración siguen con su maquetación de escritorio apilada bajo 48rem.
- Buscar (IconButton «Buscar» del DS) y «Citas canceladas» en el menú de Hoy: no hay búsqueda ni filtro de canceladas (SPEC 73).
- Badge de pendientes en «Tareas» de la BottomNav: `App` no tiene datos.
- Cambios en `shared/components` (sin sección nueva en `/demo`).
- Gestos (arrastrar la hoja para cerrarla).

## Requisitos (EARS)

Composición:

- **R1.** Mientras el ancho de `.l-shell` sea al menos 48rem, los elementos `.u-mobile-only` no deberán mostrarse; mientras sea menor, los `.u-desktop-only` no deberán mostrarse.
- **R2.** Mientras el ancho de `.l-shell` sea menor que 48rem, una página `.l-screen` hija de `.l-shell__grid` deberá mostrarse como grid `top` / `main` / `bottom` que ocupa todo el alto entre el borde superior del viewport y la BottomNav, con scroll solo dentro de `.l-screen__main` (el documento no deberá hacer scroll).
- **R3.** Mientras el ancho de `.l-shell` sea menor que 48rem, el `.panel.l-screen__main` de esas páginas deberá tener padding `--space-xs` arriba, `--space-s` a los lados y `--space-l` abajo.
- **R4.** Mientras el ancho de `.l-shell` sea menor que 48rem, `.l-screen__fab` deberá quedar a `--space-s` del borde inferior y del lado final del `.l-screen` (justo encima de la BottomNav).
- **R5.** Mientras el ancho de `.l-shell` sea al menos 48rem, `/calendario/dia`, `/calendario/mes` y `/tareas` deberán verse como antes de este spec (página `display: contents`, sin AppBar, Fab ni WeekStrip).

Hoy (`/calendario/dia`):

- **R6.** El `CalendarDayPage` deberá tener las clases de host `calendar-day-page screen l-screen` y renderizar `div.l-screen__top.u-mobile-only` > `app-app-bar` con heading «Hoy» y subtitle `dayTitle(day)` («Jueves 22 de octubre») si el día es hoy; si no, heading `dayTitle(day)` sin subtitle.
- **R7.** El AppBar de Hoy deberá tener un `app-menu` (icono `more_vert`, disparador «Cambiar vista», label «Vista») con la sección «Vista» y los ítems Día (`today`, seleccionado), Semana (`view_week`) y Mes (`calendar_view_month`); cuando el usuario elige Semana o Mes, la página deberá navegar a `/calendario/semana` o `/calendario/mes` con la misma `?fecha=`.
- **R8.** El `DayMain` deberá marcar el breadcrumb y la cabecera (título, flechas, «Hoy», vista) con `u-desktop-only` y renderizar un `app-week-strip.u-mobile-only` con los 7 días de la semana del día (`weekDays`), `selected` = día; cuando el usuario elige un día, deberá emitir `dayChanged` con ese día.
- **R9.** `CalendarFacade.weekDays` deberá devolver lunes a domingo de la semana del día, con `today` y `hasEvents` (hay algún evento ese día).
- **R10.** El `CalendarDayPage` y el `CalendarMonthPage` deberán marcar `app-day-side` con `u-desktop-only` y renderizar `div.l-screen__fab.u-mobile-only` > `app-fab` «Nueva cita»; cuando el usuario lo pulsa, deberán abrir el Dialog «Nueva cita» con la fecha del día.

Mes (`/calendario/mes`):

- **R11.** El `CalendarMonthPage` deberá tener las clases de host `calendar-month-page screen l-screen` y renderizar `div.l-screen__top.u-mobile-only` > `app-app-bar` con heading `monthTitle(day)` («Octubre 2026») y los IconButton «Mes anterior» y «Mes siguiente», que navegan a `/calendario/mes?fecha=` un mes antes o después (`addMonths`).
- **R12.** El `MonthMain` deberá marcar el breadcrumb, la cabecera y el `app-month-view` con `u-desktop-only` y, mientras `status` es `ready`, renderizar un bloque `u-mobile-only` con `app-card` > `app-mini-calendar` (`today`, `selected` = día, `events` = `eventDays`); cuando el usuario elige un día, deberá emitir `dayChanged`.
- **R13.** Debajo, el bloque móvil deberá renderizar `h2.section-title` con `dayTitle(day)` y un `app-agenda-item` por evento del día (`dayEvents`, todo el día primero y luego por hora): `start` (o «Todo el día»), `end`, `heading`, `category`, `categoryLabel`; cuando el usuario pulsa uno, deberá emitir `dayOpened` con el día.
- **R14.** Si el día no tiene eventos, entonces el bloque móvil deberá mostrar `app-empty-state` `size="s"` con heading «Sin citas», descripción «No tienes nada este día.» e icono `event_available`.

Tareas (`/tareas`):

- **R15.** El `TasksPage` deberá tener las clases de host `tasks-page screen l-screen` y renderizar `div.l-screen__top.u-mobile-only` > `app-app-bar` heading «Tareas» con subtitle «N pendiente(s)» mientras `status` es `ready`; no deberá renderizar Fab.
- **R16.** El `TasksMain` deberá marcar el breadcrumb y el bloque de título con `u-desktop-only`; el filtro y el campo «Agregar nueva tarea» se mantienen en ambos anchos.
- **R17.** Mientras haya tareas con el filtro, el `TasksMain` deberá renderizar las Cards por grupo con `u-desktop-only` y una lista `u-mobile-only` con un `app-task-item` por tarea en el orden de los grupos (mismos `due`, `overdue`, `selected`, `doneChange`, `opened`).
- **R18.** Mientras `status` es `ready`, el `TasksMain` deberá renderizar al final `app-card.u-mobile-only` «Progreso» con el `app-progress` del panel («X de Y completadas», tono `success`); el `app-tasks-side` deberá llevar `u-desktop-only`.
- **R19.** Cuando el usuario abre una tarea con `isNarrow()` verdadero, el `TasksPage` deberá abrir `app-dialog` `variant="full"` «Detalle de la tarea» con el `app-task-form` de la tarea (y el Alert de error si falla); cuando se guarda sin error o se cierra, el Dialog deberá cerrarse. Con `isNarrow()` falso no deberá abrirse (el detalle sigue en el panel).

Diálogos:

- **R20.** Mientras `isNarrow()` es verdadero al abrirse, el Dialog «Nueva cita» de `app-agenda-dialogs` deberá tener `variant="sheet"` y el «Detalle de tarea» `variant="full"`; si no, sin `variant`.
- **R21.** `isNarrow()` deberá devolver `matchMedia('(width < 48rem)').matches`, y `false` si `matchMedia` no existe (servidor, jsdom).

## Data model

```ts
// src/app/shared/utils/time.ts
export function dayTitle(iso: string): string; // «Jueves 22 de octubre» (lo que hoy calcula DayMain)
export function monthTitle(iso: string): string; // «Octubre 2026» (lo que hoy calcula MonthMain)

// src/app/shared/utils/dom.ts
export const isNarrow: () => boolean; // R21

// CalendarFacade (sube desde CalendarWeekFacade)
readonly weekStart: Signal<string>;
readonly weekDays: Signal<WeekDay[]>; // + hasEvents (R9)

// CalendarMonthFacade
readonly dayEvents: Signal<CalendarEvent[]>; // eventos del día, todo el día primero, luego por start

// DayMain: input weekDays: WeekDay[]
// MonthMain: inputs eventDays: string[], dayEvents: CalendarEvent[]
// TasksMain: input progress: TasksProgress
// TasksPage: detailOpen = signal(false)
```

## Implementation plan

1. Utils `dayTitle`, `monthTitle`, `isNarrow` + tests; `DayMain`/`MonthMain` usan `dayTitle`/`monthTitle` (R21).
2. `CalendarFacade.weekStart`/`weekDays` con `hasEvents`; ajustar `CalendarWeekFacade` y su spec; `CalendarMonthFacade.dayEvents` + tests (R9, R13).
3. CSS: `utilities/shell-visibility.css` y `blocks/shell-screen.css` (leer antes `~/.claude/skills/css-guidelines/SKILL.md`), importados en `src/styles.css` (R1–R5).
4. Hoy: `DayMain` (WeekStrip, clases) y `CalendarDayPage` (host, AppBar, Menu, Fab, `u-desktop-only` en DaySide) + tests (R6–R8, R10).
5. Mes: `MonthMain` (bloque móvil) y `CalendarMonthPage` (host, AppBar, Fab) + tests (R10–R14).
6. Tareas: `TasksMain` (lista plana, Progreso, clases) y `TasksPage` (host, AppBar, Dialog full) + tests (R15–R19).
7. `AgendaDialogs`: `variant` según `isNarrow()` al abrirse + test con `matchMedia` simulado (R20).
8. Playwright en `npm start` a 390 px y 1440 px: Hoy, Mes, Tareas, hoja «Nueva cita», detalle de tarea full, scroll solo en `main`, Fab encima de la BottomNav, escritorio sin cambios, consola sin errores (R1–R5).
9. `npx ng test --watch=false`, `npm run build`; `PENDING.md`; marcar el ítem en `TODO.md`.

## Acceptance criteria

- [x] `npx ng test --watch=false`: tests de R6–R21 añadidos; los 11 specs tocados pasan (121 tests). La suite completa da timeouts aleatorios de 5000 ms en tests no tocados con la máquina cargada, también en `master` (ver `PENDING.md`).
- [x] `npm run build` sin errores ni warnings de budget.
- [x] Playwright a 390 px: Hoy (AppBar, WeekStrip, DayView, Fab), Mes (AppBar, MiniCalendar en Card, AgendaItem del día), Tareas (AppBar, filtro, campo, lista plana, Progreso); solo `.l-screen__main` hace scroll; Fab a `--space-s` sobre la BottomNav (R1–R4, R6–R18).
- [x] Playwright a 390 px: Fab abre «Nueva cita» como hoja (`data-variant="sheet"`); tocar una tarea abre «Detalle de la tarea» a pantalla completa (R19–R20).
- [x] Playwright a 1440 px: día, mes y tareas como antes; «Nueva cita» centrado (R5, R20).
- [x] CSS solo tokens y logical properties; sin `styles`/`styleUrl` en componentes; divergencias anotadas en `PENDING.md`.
- [x] Sin sección nueva en `/demo`: no cambia `shared/components`.
- [x] Ítem marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** adaptar las páginas de escritorio con CSS (container query de `.l-shell`), sin componentes móviles aparte (respuesta del usuario).
- **Sí:** `.l-screen` real con scroll propio en `main` y la BottomNav en `App` fuera del `.l-screen`; ajuste local del Fab (respuesta del usuario).
- **Sí:** Tareas fiel al DS: lista plana, Card de progreso y detalle en Dialog full (respuesta del usuario). Se marcan con `u-mobile-only`/`u-desktop-only` los bloques que cambian, aunque el DOM duplique la lista de tareas.
- **Sí:** `variant` del Dialog por `matchMedia` al abrirse (respuesta del usuario): los diálogos solo se abren en el navegador, sin efecto en SSR.
- **Sí:** el filtro de Tareas queda encima del campo en móvil (orden del DOM de escritorio); el DS pone el campo primero. Sin `order` en CSS para no separar orden visual y de tabulación.
- **Sí:** heading del AppBar de Hoy = «Hoy» solo si el día es hoy; si no, la fecha.
- **Sí:** «Progreso» como heading de la Card móvil (la del panel), no «Avance de la semana» del DS: los datos son de todas las tareas.
- **Sí:** `weekDays` con `hasEvents` en la base `CalendarFacade`; la cabecera de WeekView ignora el campo.
- **No:** «Buscar» y «Citas canceladas» del DS (sin función detrás); badge de la BottomNav.

## Risks

- jsdom no evalúa container queries ni `:has()` en layout: R1–R5 solo con Playwright.
- `isNarrow()` mide el viewport y la container query el ancho de `.l-shell`; difieren solo por la barra de scroll cerca de 48rem.
- DOM duplicado en `/tareas` (lista y Cards): el lector de pantalla solo ve la visible (`display: none`).
- `l-screen__main` en el host también aplica en escritorio `overflow-y: auto` y `min-block-size: 0`: comprobar en Playwright que no aparece scroll interno.

## What is **not** in this spec

Resumen y Ajustes móviles, Inicio y Semana móviles, búsqueda, citas canceladas, badge de pendientes en la BottomNav, gestos de la hoja.
