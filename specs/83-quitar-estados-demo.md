# SPEC 83 — Quitar estados forzados y modo estático de solo demo

> **Status:** Implemented
> **Depends on:** SPEC 15 (Página demo), SPEC 51 (Limpieza CSS del DS)
> **Date:** 2026-10-29
> **Objective:** Quitar de `src/app/shared/` y `src/styles/` el código que solo usa la demo (estados forzados `data-force` y modo `static`), porque la demo se eliminará y ese código quedará muerto.

## Why

El DS Agenda trae props de preview (`state`, `forceState`, `slotState`, `static`) para pintar estados sin interacción. Ninguna pantalla real los usa: solo `demo-page` y los specs. Cuando se elimine la demo, serán ruido. Esta spec los quita ya.

## Scope

**In:**

- Estados forzados, inputs y campos:
  - `state` en `app-card`, `app-setting-row` y `app-stat-card` (input + `'[attr.data-force]'` en `host`).
  - `forceState` en `app-mini-calendar` y type `MiniCalendarForcedState` (`src/app/shared/types/mini-calendar.ts`, también su export en el barrel si va solo).
  - `slotState` en `app-day-view`.
  - Campo `state?` de `DayViewEvent`, `WeekViewEvent`, `MonthViewEvent` (`src/app/shared/interfaces/`) y de los ítems de `bottom-nav` y `sidebar-nav` (`src/app/shared/types/`).
  - `[attr.data-force]` en los templates de `day-view`, `week-view`, `month-view`, `mini-calendar`, `bottom-nav` y `sidebar-nav`.
- Estados forzados en CSS: quitar todos los selectores `[data-force=…]` de `src/styles/blocks/` (82 apariciones en 22 blocks, también en los de componentes sin input: `button`, `check`, `field`, `fab`, `menu`, `breadcrumb`, `icon-button`, `segmented`, `day-pill`, `agenda-item`, `task-item`, `switch`, `event-card`, `calendar`…).
  - `:is(:hover, [data-force='hover'])` queda `:hover`; `:is(:active, [data-force='active'])` queda `:active`; `:is(:active, [data-force='active'], [data-selected])` queda `:is(:active, [data-selected])`.
  - Las reglas `&:focus-visible, &[data-force='focus'] { … }` se quedan solo con `&:focus-visible`. `:is(:focus-within, [data-force='focus'])` queda `:focus-within`.
  - Las reglas que solo tienen el selector forzado (p. ej. `&[data-force='focus'] { outline-color: … }` en `sidebar-nav.css`) pasan a la pseudoclase real que les corresponde (`:focus-visible`) si no está ya cubierta; si ya lo está, se borran.
- Modo estático:
  - Input `isStatic` (alias `static`) en `app-dialog`, `app-menu` y `app-save-bar`, con todas sus ramas en ts/html.
  - `'[attr.data-static]'` en `menu.ts` y `:not([data-static])` en `src/styles/blocks/menu.css`.
- `src/app/demo/`:
  - Quitar `<button app-card state=…>`, los `state=` de `app-stat-card` y `app-setting-row`, `[forceState]` + `calendarForce`, `[slotState]` y los `state:` de los datos de demo (`demo-page.ts`).
  - Quitar las muestras `static` de Menu, Dialog y SaveBar; se quedan las interactivas que ya existen (menú con disparador, dialog con `[(open)]`, save-bar «Interactivo»).
  - En cada sección que perdió muestras forzadas, poner `<p>Pasa el ratón o usa Tab para ver los estados.</p>`.
- Specs (`*.spec.ts`): borrar o adaptar los tests de `data-force`, `forceState`, `slotState` y `static` (`card`, `setting-row`, `stat-card`, `mini-calendar`, `day-view`, `week-view`, `month-view`, `bottom-nav`, `sidebar-nav`, `dialog`, `menu`, `save-bar`).
- `CLAUDE.md`, «Angular adaptation»: una línea: no se portan props de preview del DS (`state`, `forceState`, `slotState`, `static`, `data-force`, `data-static`).
- `PENDING.md`, sección SPEC 83; `TODO.md`, ítem SPEC 83.

**Out of scope (for future specs):**

- Borrar la demo (`src/app/demo/`, ruta `/demo`, `demo-page.css`).
- Borrar componentes que hoy solo usa la demo (`app-placeholder-page`, `app-number-field`): son API del DS, no preview.
- Quitar inputs normales que aún no usa ninguna pantalla (`disabled`, `block`, `extended`, `minDate`…).
- Cambios visuales en los estados reales (`:hover`, `:active`, `:focus-visible`).

## Requisitos (EARS)

- **R1.** Ningún componente de `src/app/shared/components/` deberá declarar los inputs `state`, `forceState`, `slotState` ni `isStatic`.
- **R2.** Ninguna interface ni type de `src/app/shared/` deberá declarar el campo `state` de estado forzado ni el type `MiniCalendarForcedState`.
- **R3.** Ningún template ni `host` de `src/app/shared/` deberá escribir `data-force` ni `data-static`.
- **R4.** Ningún archivo de `src/styles/` deberá contener `data-force` ni `data-static`.
- **R5.** Cuando el usuario pasa el ratón, pulsa o enfoca con teclado un componente interactivo, ese componente deberá mostrar el mismo estilo de hover, active y focus que antes de esta spec.
- **R6.** Cuando el `app-menu` se abre, su panel deberá posicionarse como antes de esta spec.
- **R7.** Cuando el `app-dialog` tiene `open`, deberá abrirse como `<dialog>` modal, como antes de esta spec.
- **R8.** Mientras `dirty`, `saving` o `saved` estén activos, la `app-save-bar` deberá mostrarse como antes de esta spec.
- **R9.** La `demo-page` deberá compilar sin muestras forzadas ni estáticas, y mostrar «Pasa el ratón o usa Tab para ver los estados.» en cada sección que perdió muestras forzadas.

## Data model

Esta spec no añade datos; solo quita:

- `card.ts`, `setting-row.ts`, `stat-card.ts`: `readonly state = input<'hover' | 'active' | 'focus'>();`
- `mini-calendar.ts`: `readonly forceState = input<Record<string, MiniCalendarForcedState>>();`
- `types/mini-calendar.ts`: `export type MiniCalendarForcedState = 'hover' | 'active' | 'focus';`
- `day-view.ts`: `readonly slotState = input<number>();`
- `interfaces/{day-view,week-view,month-view}.ts`: `state?: 'hover' | 'focus';`
- `types/{bottom-nav,sidebar-nav}.ts`: `state?: 'hover' | 'active' | 'focus';`
- `dialog.ts`, `menu.ts`, `save-bar.ts`: `readonly isStatic = input(false, { alias: 'static', transform: booleanAttribute });`

## Implementation plan

Cada paso deja `npx ng test --watch=false` y `npm run build` en verde. Antes de tocar CSS, leer `~/.claude/skills/css-guidelines/SKILL.md`.

1. Estados forzados en componentes con input: `card`, `setting-row`, `stat-card`, `mini-calendar` (+ type), `day-view` (`slotState`). Ajustar demo (nota R9) y specs (R1–R3).
2. Campo `state?` de los datos: interfaces `day/week/month-view`, types `bottom-nav`/`sidebar-nav`, sus templates, `demo-page.ts` y specs (R2, R3).
3. Modo `static`: `dialog`, `menu` (+ `menu.css`), `save-bar`; quitar las muestras estáticas de la demo; adaptar `dialog.spec.ts`, `menu.spec.ts` (host sin `staticMenu`) y `save-bar.spec.ts` (R1, R3, R4, R6–R8).
4. CSS: quitar `[data-force]` de los 22 blocks de `src/styles/blocks/` con las reglas de reescritura de Scope (R4, R5).
5. `CLAUDE.md` (línea en «Angular adaptation»), `PENDING.md`, `TODO.md`. Playwright en `/demo` y en `/`, `/calendario`, `/ajustes`; `npx ng test --watch=false`; `npm run build`.

## Acceptance criteria

- [x] `grep -rnE "data-force|data-static|forceState|slotState|isStatic|MiniCalendarForcedState" src` no encuentra nada (R1–R4).
- [x] `grep -rnE "state = input|state\?:" src/app/shared` no encuentra estados forzados (R1, R2).
- [x] `npx ng test --watch=false` pasa; ya no quedan tests de `data-force` ni de `static` (R1–R3).
- [x] `npm run build` sin errores ni warnings de budget.
- [x] Playwright `/demo`: hover y Tab en button, card, setting-row, mini-calendar, month-view chip y sidebar-nav muestran fondo/outline como antes (R5).
- [x] Playwright `/demo`: el menú con disparador abre el panel en su sitio; el dialog interactivo abre como modal; la save-bar «Interactivo» muestra sus estados (R6–R8).
- [x] Playwright `/demo`: las secciones Card, StatCard, SettingRow, MiniCalendar, SidebarNav, BottomNav, DayView, WeekView y MonthView muestran «Pasa el ratón o usa Tab para ver los estados.» (R9).
- [x] Playwright `/`, `/calendario`, `/ajustes`: sin cambios visuales ni errores en consola (R5–R8).
- [x] `CLAUDE.md` con la línea de props de preview; `PENDING.md` con sección SPEC 83; `TODO.md` ítem SPEC 83 marcado.

## Decisions

- **Yes:** quitar también los `[data-force]` de blocks sin input (`button`, `check`, `field`…). Ya hoy son CSS muerto, copiado del DS.
- **Yes:** quitar `static` de `dialog`/`menu`/`save-bar`. Solo lo usa la demo, y la demo ya tiene ejemplos interactivos de los tres.
- **Yes:** nota «Pasa el ratón o usa Tab para ver los estados.» en vez de recrear los forzados en `demo-page.css`. Recrearlos sería el mismo ruido, y la demo se eliminará.
- **Yes:** desviarse del DS en estos props y anotarlo en `CLAUDE.md`. Así una futura copia de CSS o props del DS no los vuelve a meter.
- **No:** borrar `app-placeholder-page` y `app-number-field`. Son componentes del DS sin uso todavía, no preview.
- **No:** quitar inputs normales que aún no usa ninguna pantalla. Son API legítima de cada componente.
- **No:** borrar la demo ahora. Va en otra spec.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Al reescribir un selector se pierde un estado real (p. ej. una regla que solo tenía `[data-force='focus']`) | Regla de Scope: pasarla a `:focus-visible` si no está cubierta. Playwright hover/Tab en R5. |
| `menu.css` `:not([data-static])` envuelve el posicionamiento del panel; si se quita mal, el panel deja de flotar | Quitar solo el `:not(...)` y conservar la regla. Playwright R6. |
| Un spec de feature (`agenda-dialogs.spec.ts`…) usa `state:` en datos | El build/test de cada paso lo detecta; quitar el campo. |

## What is **not** in this spec

- Borrar la demo.
- Borrar `app-placeholder-page` o `app-number-field`.
- Recortar inputs normales sin uso.
- Cambiar estilos de estados reales.
