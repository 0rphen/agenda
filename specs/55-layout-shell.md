# SPEC 55 — Layout de aplicación: `.l-shell` y `.l-screen`

> **Status:** Implemented
> **Depends on:** SPEC 01 (fundación CSS, `reset.css`, tokens `--size-*`), SPEC 51 (criterio de copia del CSS del DS)
> **Date:** 2026-10-25
> **Objective:** Añadir la composición `.l-shell` / `.l-screen` y los bloques `.app`, `.screen` y `.panel` del DS Agenda, y montar en `App` el esqueleto `.l-shell` con el riel vacío y el `router-outlet`, con la página a alto completo.

## Scope

**In:**

- `src/styles/composition/shell.css` y `src/styles/composition/screen.css`: copia literal del DS (`project/assets/Code/styles/composition/`).
- `src/styles/blocks/app.css`, `src/styles/blocks/screen.css`, `src/styles/blocks/panel.css` (`.panel`, `.page-title`, `.page-lead`, `.section-title`): copia literal del DS.
- Imports en `src/styles.css` (composición: `screen` y `shell` entre `grid` y `stack`, como `main.css` del DS; bloques: `app`, `panel`, `screen` al final de los bloques).
- `src/styles/reset/reset.css`: alto completo (`html`, `body`, `app-root`), `body` sin margen, `router-outlet` sin caja.
- `src/app/app.html`: esqueleto `.l-shell > .l-shell__grid > .l-shell__rail` + `<router-outlet />`.
- `src/app/app.ts`: quitar `styleUrl`; borrar `src/app/app.css` (vacío).
- `src/app/app.spec.ts`: tests del esqueleto.
- `src/app/demo/demo-page.css`: `:host { grid-column: 1 / -1; }` para que `/demo` no caiga en una sola zona del grid.
- Marcar el ítem `.l-shell`/`.l-screen` en `TODO.md`.
- Actualizar la nota de composición de `TODO.md` (línea 5).

**Out of scope:**

- Contenido del riel (`SidebarNav`), `BottomNav`, rutas de NavigationMap y elección escritorio/móvil: ítem 2 de TODO §5.
- Montar `.screen.l-screen` en la app (lo hace la navegación móvil) y áreas seguras (`env(safe-area-inset-bottom)`).
- Pantallas (`calendar`/`agenda`/`tasks`, `data-layout="week"|"settings"`): TODO §6.
- Secciones en `/demo`.
- Alto mínimo del `.l-shell__grid` para que el riel llegue al fondo: llega con el riel con contenido.

## Requisitos (EARS)

- **R1.** `shell.css` y `screen.css` de `src/styles/composition/` deberán ser idénticos a los del DS.
- **R2.** `app.css`, `screen.css` y `panel.css` de `src/styles/blocks/` deberán ser idénticos a los del DS.
- **R3.** `src/styles.css` deberá importar `composition/screen.css` y `composition/shell.css` tras `composition/grid.css` y antes de `composition/stack.css`, y `blocks/app.css`, `blocks/panel.css` y `blocks/screen.css` tras el último bloque actual.
- **R4.** El reset deberá dar `block-size: 100%` a `html`, `body` y `app-root` (este con `display: block`) y `margin: 0` a `body`.
- **R5.** El reset deberá dar `display: none` a `router-outlet`, para que no ocupe una celda del grid.
- **R6.** El `App` deberá renderizar `div.l-shell` > `div.l-shell__grid` > (`div.l-shell__rail`, `router-outlet`), en ese orden.
- **R7.** El `App` no deberá usar `styleUrl` ni estilos de componente.
- **R8.** Mientras el ancho de `.l-shell` sea menor que 48rem, `.l-shell__rail` no deberá mostrarse (`display: none`) y `.l-shell__grid` deberá tener una sola columna.
- **R9.** Mientras el ancho de `.l-shell` esté entre 48rem y 64rem, `.l-shell__grid` deberá tener columnas `--size-rail` + flexible y `.l-shell__rail` deberá ser `display: grid`.
- **R10.** Mientras el ancho de `.l-shell` sea al menos 64rem, `.l-shell__grid` deberá tener columnas `--size-rail`, `--size-calendar`, flexible, `--size-panel`.
- **R11.** La página `/demo` deberá ocupar todas las columnas de `.l-shell__grid` en cualquier ancho.

## Data model

No introduce datos.

## Implementation plan

1. Copiar `composition/shell.css`, `composition/screen.css`, `blocks/app.css`, `blocks/screen.css`, `blocks/panel.css` del DS a `src/styles/` e importarlos en `src/styles.css` (R1–R3). `npm run build` pasa.
2. `reset.css`: alto completo, `body` sin margen, `router-outlet { display: none }` (R4–R5).
3. `app.html` con el esqueleto; `app.ts` sin `styleUrl`; borrar `app.css` (R6–R7).
4. `demo-page.css`: `:host { grid-column: 1 / -1; }` (R11).
5. `app.spec.ts`: estructura y orden (R6), sin `styleUrl` comprobado por lectura (R7).
6. Comprobación con Playwright en `npm start` (`/demo`) a 40rem, 56rem y 80rem de ancho: `display` del riel, `grid-template-columns` del grid, `/demo` a todo el ancho, alto de `html`/`body`/`app-root` = viewport y `body` sin margen; consola sin errores (R4–R5, R8–R11).
7. Marcar el ítem en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa, con test de R6.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` de los cinco ficheros CSS copiados contra el DS sin diferencias (R1–R2).
- [x] Orden de imports en `src/styles.css` (R3).
- [x] `src/app/app.ts` sin `styleUrl` y `src/app/app.css` borrado (R7).
- [x] Playwright: riel oculto y una columna a 40rem; riel `grid` y dos columnas a 56rem; cuatro columnas a 80rem (R8–R10).
- [x] Playwright: `html`, `body`, `app-root` al alto del viewport, `body` sin margen, `router-outlet` sin caja (R4–R5).
- [x] Playwright: `/demo` ocupa todo el ancho en los tres anchos y se ve como antes (R11).
- [x] Ítem `.l-shell`/`.l-screen` marcado en `TODO.md`.
- [x] Nota de composición de `TODO.md` actualizada.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** solo el ítem 1 de TODO §5; rutas y navegación en el spec siguiente (respuesta del usuario).
- **Sí:** bloques `app`, `screen` y `panel` en este spec: los usan todas las pantallas del DS (respuesta del usuario).
- **No:** sección en `/demo`: el layout ya es la página real (respuesta del usuario).
- **Sí:** esqueleto `.l-shell` en `App` con riel vacío (respuesta del usuario).
- **Sí:** alto completo y `body` sin margen en `reset.css` (respuesta del usuario). Divergencia local: el `reset.css` del DS no lo trae; `.l-screen` (`block-size: 100%`) lo necesita.
- **Sí:** `router-outlet { display: none }` en el reset: Angular inserta la página como hermana del `router-outlet`, que si no ocuparía una celda del grid.
- **Sí:** `/demo` con `grid-column: 1 / -1` en `demo-page.css`: sin área asignada caería en la primera celda libre (la columna `calendar`, `--size-calendar`, a ≥ 64rem).
- **Sí:** `.app` ya está en `<body>` (`index.html`); el bloque `.app` del DS le da tipografía base.
- **No:** alto mínimo del grid: con el riel vacío no se nota; llega con `SidebarNav`.

## Risks

- jsdom no evalúa container queries: R8–R10 solo se verifican con Playwright.
- `.app` baja el texto de `/demo` a `--font-size-m`/`--leading-m`; `h1`/`h2` de la demo quedan con `line-height` 20px, pero no parten ni a 320px (medido con Playwright). Si un título futuro parte, usar `.page-title`/`.section-title`, ya disponibles en `panel.css`.
- `router-outlet { display: none }` es global: correcto mientras ningún `router-outlet` necesite caja.

## What is **not** in this spec

- SidebarNav en el riel, BottomNav, rutas, elección por ancho, `.l-screen` montada, pantallas, demo.
