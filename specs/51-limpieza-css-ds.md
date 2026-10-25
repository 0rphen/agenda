# SPEC 51 — Limpieza de CSS copiado del DS y formato

> **Status:** Implemented
> **Depends on:** SPEC 33 (TaskItem/`check.css`), SPEC 36, SPEC 38, SPEC 39, SPEC 40, SPEC 44, SPEC 45
> **Date:** 2026-10-24
> **Objective:** Corregir en local los defectos del CSS copiado del DS anotados en `PENDING.md` (zona táctil sin `pointer: coarse`, `outline-offset` duplicado o mal indentado) y dejar `prettier --check` limpio en `src/app`.

## Scope

**In:**

- Zona táctil solo con `@media (pointer: coarse)` en: `src/styles/blocks/check.css` (`min-block-size` de `label.check`), `calendar.css` (`min-block-size` de `.calendar__day`), `sidebar-nav.css` (`::after` de los ítems).
- `outline-offset` duplicado: dejar una sola declaración con el valor que gana hoy (`calc(-1 * var(--border-thick))`) en `setting-row.css`, `bottom-nav.css` y `day-view.css` (`.day-view__slot:focus-visible`).
- `outline-offset` mal indentado: reindentar en `calendar.css`, `sidebar-nav.css`, `day-view.css` (`.day-view__event:focus-visible`) y `week-view.css`.
- `npx prettier --write` en los ficheros de `src/app` que hoy fallan `--check`: `app.config.server.ts`, `app.config.ts`, `app.routes.server.ts`, `app.ts`, `agenda-item.spec.ts`, `checkbox.html`, `checkbox.spec.ts`, `progress.spec.ts`, `spinner.spec.ts`.
- `PENDING.md`: marcar `[hecho]` los ítems resueltos y la comprobación Playwright de `/demo#sidebar-nav`.

**Out of scope:**

- Otras zonas táctiles sin condición no anotadas en `PENDING.md` (`setting-row.css`, `switch.css`, `menu.css`, `bottom-nav.css`): `setting-row` y `bottom-nav` usan `--touch-target` como alto de diseño; `menu` y `switch` no se han reportado.
- Pedir los cambios al DS (sigue en `PENDING.md` como sugerencia).
- Cambios de markup, TS o secciones de la demo.

## Requisitos (EARS)

- **R1.** Mientras el puntero principal es fino (`pointer: fine`), `label.check`, `.calendar__day` y el `::after` de los ítems de `.sidebar-nav` no deberán ampliar su caja a `--touch-target`.
- **R2.** Mientras el puntero principal es grueso (`pointer: coarse`), esos tres elementos deberán medir al menos `--touch-target` como hoy.
- **R3.** Cada regla `:focus-visible` de `setting-row.css`, `bottom-nav.css` y `day-view.css` deberá declarar `outline-offset` una sola vez, con el valor que gana hoy.
- **R4.** Ninguna declaración `outline-offset` de los bloques tocados deberá tener indentación distinta de sus hermanas.
- **R5.** El anillo de foco de todos los bloques tocados deberá verse igual que antes.
- **R6.** `npx prettier --check "src/app/**/*.{ts,html}"` deberá terminar sin avisos.

## Implementation plan

1. `check.css`, `calendar.css`, `sidebar-nav.css`: mover la declaración de zona táctil a un `@media (pointer: coarse) { … }` anidado en la misma regla (patrón ya usado en `field.css`) (R1, R2).
2. `setting-row.css`, `bottom-nav.css`, `day-view.css`: borrar la primera `outline-offset` duplicada (R3, R5).
3. Reindentar las `outline-offset` sueltas (R4).
4. `npx prettier --write` en los 9 ficheros (R6); revisar el diff (solo formato).
5. `PENDING.md`: `[hecho]` en las dudas de `check`/TaskItem (SPEC 33), `calendar.css` (SPEC 38), `sidebar-nav.css` (SPEC 39), `setting-row.css` (SPEC 36), `bottom-nav.css` (SPEC 40), `day-view.css` (SPEC 44), `week-view.css` (SPEC 45) y en la comprobación Playwright de `/demo#sidebar-nav`.

## Acceptance criteria

- [x] `grep -c "outline-offset" src/styles/blocks/{setting-row,bottom-nav}.css` devuelve 1 cada uno; en `day-view.css`, 2 (R3).
- [x] Revisión del diff: `outline-offset` alineada con sus hermanas en los 6 bloques (R4).
- [x] Playwright en `/demo#task-item`, `/demo#mini-calendar` y `/demo#sidebar-nav` con puntero fino: fila de TaskItem ~48 px (`control-l`), días del calendario sin crecer a `--touch-target`; con `emulateMedia`/móvil táctil, mismos altos que antes (R1, R2).
- [x] Playwright: anillo de foco con Tab igual en `#setting-row`, `#bottom-nav`, `#day-view`, `#week-view`, `#mini-calendar`, `#sidebar-nav` (R5); consola sin errores.
- [x] `npx prettier --check "src/app/**/*.{ts,html}"` limpio (R6).
- [x] `npx ng test --watch=false` y `npm run build` verdes.

## Decisions

- **Sí:** divergir del DS en local y dejar la petición en `PENDING.md`. **No:** seguir con copia literal: el usuario eligió corregir ahora.
- **Sí:** solo los tres bloques anotados. **No:** auditar todas las zonas táctiles: fuera de lo pedido.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Playwright de escritorio no emula `pointer: coarse` | Usar un contexto con `hasTouch`/`isMobile` o comprobar la regla en el CSS servido. |
| `prettier --write` en `app.config*.ts` mueve imports y rompe algo | Solo formato; build y tests lo confirman. |
