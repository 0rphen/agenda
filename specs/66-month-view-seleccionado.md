# SPEC 66 — MonthView: día seleccionado distinguible

> **Status:** Implemented
> **Depends on:** SPEC 52 (MonthView), SPEC 64 (MonthPage)
> **Date:** 2026-10-27
> **Objective:** Que el día seleccionado de MonthView no se confunda con las celdas fuera de mes, pintando su número con `--color-brand` / `--color-on-brand`, como MiniCalendar y DayPill.

## Contexto

`month-view.css` es copia literal del DS: la celda `[data-selected]` usa `--color-brand-soft` y la de fuera de mes `--color-surface-sunken`. En la paleta (`design-system/tokens.json`, igual al del DS) son casi iguales: `oklch(0.91 0.008 241.7)` frente a `oklch(0.917 0.005 247.9)`. No es un desfase local, es el propio DS.

## Scope

**In:**

- Una regla en `src/styles/blocks/month-view.css`: el `.month-view__num` de la celda seleccionada con fondo `--color-brand` y texto `--color-on-brand`.
- `PENDING.md`: sugerencia al DS y comprobación Playwright.

**Out of scope:**

- TS y HTML de MonthView (ya marca `data-selected` y `aria-pressed`).
- Tokens: no se cambia `--color-brand-soft`.
- Sección de `/demo`: ya existe `#month-view` con día seleccionado; sin cambios de API.
- Pedir el cambio al DS (queda en `PENDING.md`).

## Requisitos (EARS)

- **R1.** Mientras un día está seleccionado, el `.month-view__num` de su celda deberá pintarse con fondo `--color-brand` y texto `--color-on-brand`.
- **R2.** Mientras el día seleccionado es también hoy, el número deberá usar el estilo de seleccionado (como MiniCalendar).
- **R3.** Mientras el día seleccionado está fuera de mes, el número deberá usar el estilo de seleccionado, no `--color-ink-subtle`.
- **R4.** Cuando el puntero pasa sobre el número seleccionado, este deberá mantener el estilo de seleccionado.
- **R5.** La celda seleccionada deberá mantener el fondo `--color-brand-soft` del DS.
- **R6.** El resto de reglas de `month-view.css` no deberán cambiar.

## Implementation plan

1. `month-view.css`, dentro de `.month-view__num`, tras la línea de `[data-today]`: `.month-view__cell[data-selected] & { --_bg: var(--color-brand); --_fg: var(--color-on-brand); }`. Especificidad 0,3,0, mayor que `:hover` (0,2,0) (R4); va después de `[data-out]` y `[data-today]` (R2, R3) (R1, R5, R6).
2. Playwright en `/demo#month-view`: color calculado del número seleccionado, de hoy, de un seleccionado fuera de mes y en hover (R1–R5).
3. `PENDING.md`, `TODO.md`, tests y build.

## Acceptance criteria

- [x] `git diff` de `month-view.css` = 1 línea añadida (R1, R6).
- [x] Playwright `/demo#month-view`: número seleccionado brand/on-brand (R1); hoy seleccionado brand (R2); seleccionado fuera de mes brand (R3); hover mantiene brand (R4); celda brand-soft (R5); consola sin errores.
- [x] Tests existentes de `month-view.spec.ts` (R4/R5: `data-selected` y `aria-pressed`) en verde.
- [x] `npx ng test --watch=false` y `npm run build` sin errores ni warnings de budget.
- [x] Sin `styles`/`styleUrl` en el componente; sin emojis ni copy en inglés.
- [x] `TODO.md`: ítem marcado; `PENDING.md` con la sugerencia al DS.

## Decisions

- **Sí:** número brand (respuesta del usuario), patrón de `calendar.css` y `day-pill.css` con `aria-pressed`. **No:** contorno en la celda ni cerrar sin tocar código.
- **Sí:** seleccionado gana a hoy, como `calendar.css`. **No:** `font-weight` bold extra: no pedido.
- **Sí:** divergir del DS en local con la petición en `PENDING.md`, como SPEC 51.
- **Sin test Vitest nuevo:** cambio CSS puro y jsdom no aplica capas ni nesting; se verifica con Playwright, como SPEC 51.

## What is not in this spec

- Ajustar el token `--color-brand-soft` ni otros usos de `[data-selected]` (TaskItem, AgendaItem).
