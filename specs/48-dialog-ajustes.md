# SPEC 48 — Dialog: bloqueo de scroll, cierre por scrim y Escape en Menu

> **Status:** Implemented
> **Depends on:** SPEC 30 (Menu), SPEC 42 (Dialog)
> **Date:** 2026-10-24
> **Objective:** Resolver tres pendientes de `PENDING.md` (SPEC 42): bloquear el scroll del documento con un diálogo modal abierto, cerrar el diálogo al pulsar el scrim y que Escape dentro de un `app-menu` abierto en el diálogo cierre solo el menú.

## Scope

**In:**

- `src/styles/blocks/dialog.css`: regla de bloqueo de scroll con `:has(:modal)` (sin JS).
- `src/app/shared/components/dialog/dialog.html`: `(click)` en el `<dialog>` que cierra cuando el clic cae en el scrim.
- `src/app/shared/components/menu/menu.ts`: rama `Escape` de `onKeydown` corta la propagación y la acción por defecto.
- Tests en `dialog.spec.ts` y `menu.spec.ts`.
- `src/app/demo/demo-page.html` (+ `demo-page.ts` si hace falta): `app-menu` dentro del cuerpo del diálogo modal de `#dialog`; nota «Pulsa fuera para cerrar».
- `PENDING.md`: marcar `[hecho]` los ítems de SPEC 42 resueltos.

**Out of scope:**

- `closedby="any"` (sin soporte en Safari): se usa el clic en el `<dialog>`.
- Bloqueo de scroll para `contained` (no modal: no tapa la página).
- Cambiar el foco inicial del diálogo (duda de SPEC 42, comportamiento nativo).

## Requisitos (EARS)

- **R1.** Mientras un `dialog.scrim` está abierto en modo modal (`:modal`), el documento no deberá hacer scroll (`overflow: hidden` en `html`).
- **R2.** Mientras el `app-dialog` está cerrado o es `contained`, el scroll del documento no deberá cambiar.
- **R3.** Donde `closable` sea verdadero, cuando el usuario pulsa el scrim (el `target` del clic es el propio `<dialog>`, fuera de `.dialog`), el `app-dialog` deberá poner `open` a `false`.
- **R4.** Si el clic cae dentro de `.dialog` (incluidos sus hijos), entonces el `app-dialog` no deberá cerrarse.
- **R5.** Donde `closable` sea falso, cuando el usuario pulsa el scrim, el `app-dialog` no deberá cerrarse.
- **R6.** Mientras un `app-menu` no `static` está abierto, cuando el usuario pulsa Escape dentro de él, el `app-menu` deberá cerrarse, devolver el foco al disparador, y llamar a `preventDefault()` y `stopPropagation()` del evento.
- **R7.** Mientras un `app-menu` abierto está dentro de un `app-dialog` abierto, cuando el usuario pulsa Escape, el `app-dialog` deberá seguir abierto.
- **R8.** La sección `#dialog` de `/demo` deberá incluir un `app-menu` dentro del diálogo modal.

## Implementation plan

1. `dialog.css`: dentro de la capa del bloque, `html:has(.scrim:modal) { overflow: hidden; }` (R1, R2).
2. `dialog.html`: en el `<dialog>`, `(click)="$event.target === $event.currentTarget && closable() && open.set(false)"` o método `onScrimClick(event)` en `Dialog` si no cabe legible en el template (R3–R5). Comprobar que `.scrim` no tiene `padding` que deje zonas del `<dialog>` dentro de la caja visible; si `.dialog` ocupa todo (`full`), el scrim no es pulsable y es correcto.
3. `menu.ts`: rama `event.key === 'Escape'` → `event.preventDefault(); event.stopPropagation(); this.close();` (R6, R7).
4. Tests: clic en `<dialog>` cierra; clic en `.dialog__body` no cierra; `closable=false` no cierra; Escape en menú emite `preventDefault`/`stopPropagation` y el diálogo host sigue `open` (R3–R7). R1 se verifica en Playwright (jsdom no soporta `:modal`).
5. Demo `#dialog`: menú dentro del modal (R8).
6. `PENDING.md`: marcar `[hecho]` «Bloquear el scroll…», «Cerrar al pulsar el scrim…» y la duda «Escape dentro de un Menu…».

## Acceptance criteria

- [x] Playwright `/demo#dialog`: con el modal abierto, `getComputedStyle(document.documentElement).overflow === 'hidden'`; al cerrar vuelve a `visible` (R1, R2).
- [x] Playwright: clic en el scrim cierra el modal y la hoja; clic dentro del cuerpo no (R3, R4).
- [x] Test: `closable=false` + clic en scrim, `open` sigue `true` (R5).
- [x] Test y Playwright: Escape en el menú dentro del diálogo cierra el menú, el diálogo sigue abierto y el foco vuelve al disparador del menú (R6, R7).
- [x] `demo-page.html` sección `#dialog` con `app-menu` en el modal (R8).
- [x] `npx ng test --watch=false` y `npm run build` verdes; `npx prettier --check "src/app/**/*.{ts,html}"` sin ficheros nuevos con avisos; consola de `/demo` sin errores.

## Decisions

- **Sí:** bloqueo de scroll solo con CSS `:has(:modal)`. **No:** JS en `afterRenderEffect` tocando `document.body.style`: más código y hay que restaurar al destruir.
- **Sí:** clic con `target === currentTarget`. **No:** `closedby="any"`: Safari no lo soporta.
- **Sí:** cortar Escape en `Menu`. **No:** que `Dialog` mire si el foco está en un menú: acopla Dialog a Menu.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Arrastrar texto del cuerpo y soltar en el scrim cierra el diálogo | `click` exige `mousedown` y `mouseup` sobre el mismo elemento; si molesta, comprobar también el `mousedown`. |
| `:has()` en `html` re-evalúa en cada cambio del DOM | Selector acotado a `.scrim:modal`; coste despreciable en esta app. |
