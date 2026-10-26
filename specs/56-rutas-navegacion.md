# SPEC 56 — Rutas y navegación: SidebarNav en escritorio, BottomNav en móvil

> **Status:** Implemented
> **Depends on:** SPEC 26 (EmptyState), SPEC 39 (SidebarNav), SPEC 40 (BottomNav), SPEC 55 (`.l-shell`)
> **Date:** 2026-10-25
> **Objective:** Definir las rutas de NavigationMap con una página provisional común y montar en `App` el riel `SidebarNav` y la `BottomNav`, elegidos por container query de `.l-shell`, con el destino activo según la URL.

## Scope

**In:**

- `src/app/features/{overview,calendar,tasks,settings}/<feature>.routes.ts`: rutas de cada dominio, cargadas en lazy desde `app.routes.ts` con `loadChildren`.
- `src/app/app.routes.ts`: `''` y `**` redirigen a `/calendario/dia`; `/demo` sigue solo en `isDevMode()`.
- `src/app/app.config.ts`: `provideRouter(routes, withComponentInputBinding())`.
- `src/app/shared/components/placeholder-page/`: `PlaceholderPage` (`app-placeholder-page`), `h1.page-title` + `app-empty-state`.
- `src/styles/blocks/placeholder-page.css` (ocupa todas las columnas del grid) importado en `src/styles.css`.
- `src/styles/composition/shell.css`: `.l-shell__bottom` y `.l-shell` a toda la altura (divergencia local del DS).
- `src/app/shared/interfaces/navigation.ts` (`NavDestination`) y `src/app/shared/utils/navigation.ts` (`RAIL_DESTINATIONS`, `BOTTOM_DESTINATIONS`), re-exportados.
- `src/app/app.ts` + `app.html`: SidebarNav `variant="rail"` en `.l-shell__rail`, BottomNav en `.l-shell__bottom`, activo por URL, navegación al pulsar.
- `src/index.html`: `<title>Agenda</title>`.
- Tests: `app.spec.ts`, `placeholder-page.spec.ts`.
- `/demo`: sección PlaceholderPage e índice (`demo-page.html`, `demo-page.ts`, `demo-page.spec.ts`).
- Marcar el ítem en `TODO.md`.

**Out of scope:**

- Pantallas reales (TODO §6): sustituyen a `PlaceholderPage` en cada ruta.
- `data-layout` en `.l-shell__grid` según la ruta: lo añade la pantalla que lo necesite.
- Selector Día · Semana · Mes, AppBar, Fab, hojas y diálogos de NavigationMap.
- Contadores (`badge`) en los destinos: no hay datos.
- Página 404 propia.
- `domain/`, `structure/`, `store/`, facade e `index.ts` de cada feature: llegan con los datos (§6).
- SidebarNav `variant="panel"` y usuario.

## Requisitos (EARS)

- **R1.** El router deberá tener las rutas `/resumen`, `/calendario/dia`, `/calendario/semana`, `/calendario/mes`, `/tareas` y `/configuracion`, cada una con `PlaceholderPage` y `data.heading` «Resumen», «Día», «Semana», «Mes», «Tareas», «Configuración».
- **R2.** Cada ruta de `features/<feature>/` deberá declararse en su `<feature>.routes.ts` y cargarse desde `app.routes.ts` con `loadChildren`.
- **R3.** Cuando se navega a `/` o a `/calendario`, el router deberá redirigir a `/calendario/dia`.
- **R4.** Si la URL no coincide con ninguna ruta, entonces el router deberá redirigir a `/calendario/dia`.
- **R5.** Cada ruta de R1 deberá poner el título del documento «<heading> · Agenda» (p. ej. «Resumen · Agenda»), y `index.html` deberá tener `<title>Agenda</title>`.
- **R6.** El `PlaceholderPage` deberá renderizar un `h1.page-title` con `heading` y un `app-empty-state` con heading «Pantalla en construcción», descripción «Esta vista llegará pronto.» e icono `construction`.
- **R7.** El `PlaceholderPage` deberá tener las clases de host `placeholder-page panel l-stack` y no deberá usar `styleUrl` ni estilos de componente.
- **R8.** `.placeholder-page` deberá ocupar todas las columnas de contenido de `.l-shell__grid`: `grid-column: 1 / -1` y, mientras el ancho de `.l-shell` sea al menos 48rem, `grid-column: 2 / -1` (junto al riel, en la misma fila).
- **R9.** El `App` deberá renderizar `div.l-shell` > (`div.l-shell__grid` > (`div.l-shell__rail` > `app-sidebar-nav[variant="rail"]`, `router-outlet`), `div.l-shell__bottom` > `app-bottom-nav`), en ese orden.
- **R10.** El riel deberá tener, en orden: Resumen `dashboard` `/resumen`; Calendario `calendar_month` `/calendario/dia`; Tareas `task_alt` `/tareas`; Configuración `settings` `/configuracion`.
- **R11.** La BottomNav deberá tener, en orden: Hoy `today` `/calendario/dia`; Mes `calendar_month` `/calendario/mes`; Tareas `task_alt` `/tareas`; Ajustes `settings` `/configuracion`.
- **R12.** Mientras la URL empiece por `/calendario`, el destino Calendario del riel deberá estar activo (`aria-current="page"`); el resto, por coincidencia con su ruta.
- **R13.** Mientras la URL sea `/resumen`, `/calendario/dia` o `/calendario/semana`, Hoy de la BottomNav deberá estar activo; Mes con `/calendario/mes`, Tareas con `/tareas`, Ajustes con `/configuracion`.
- **R14.** Si la URL no corresponde a ningún destino (p. ej. `/demo`), entonces ningún destino deberá estar activo.
- **R15.** Cuando el usuario pulsa un destino del riel o de la BottomNav, el `App` deberá navegar a su URL.
- **R16.** Mientras el ancho de `.l-shell` sea menor que 48rem, `.l-shell__bottom` deberá mostrarse pegado al borde inferior del viewport (`position: sticky; inset-block-end: 0`) y el riel no deberá mostrarse (SPEC 55). `.l-shell` deberá medir al menos `100dvh` (flex en columna, `.l-shell__grid` con `flex: 1`) para que la BottomNav quede al fondo también con poco contenido.
- **R17.** Mientras el ancho de `.l-shell` sea al menos 48rem, `.l-shell__bottom` no deberá mostrarse (`display: none`).
- **R18.** `npm run build` deberá prerenderizar las rutas de R1 con su título (R5) y la navegación en el HTML.

## Data model

```ts
// src/app/shared/interfaces/navigation.ts
export interface NavDestination {
  icon: string;
  label: string;
  url: string; // destino al pulsar
  match: string[]; // prefijos de URL que lo marcan activo
}

// src/app/shared/utils/navigation.ts
export const RAIL_DESTINATIONS: NavDestination[]; // R10, R12
export const BOTTOM_DESTINATIONS: NavDestination[]; // R11, R13

// src/app/shared/components/placeholder-page/placeholder-page.ts
export class PlaceholderPage {
  // inputs: heading (required, desde data de la ruta)
}
```

`App`: `url` = `toSignal` de `NavigationEnd.urlAfterRedirects` (inicial `router.url`); `railItems`/`bottomItems` = `computed` que mapea cada `NavDestination` a `SidebarNavItem`/`BottomNavItem` con `active` = algún `match` es prefijo de `url`; `itemSelected` busca el destino por `label` y llama a `router.navigateByUrl`.

## Implementation plan

1. `NavDestination`, `RAIL_DESTINATIONS`, `BOTTOM_DESTINATIONS` y re-exports (R10–R13).
2. `PlaceholderPage` + `placeholder-page.css` importado en `src/styles.css` (R6–R8). Test.
3. `<feature>.routes.ts` de los cuatro dominios; `app.routes.ts` con `loadChildren`, redirecciones y títulos; `withComponentInputBinding()`; `<title>Agenda</title>` (R1–R5).
4. `.l-shell__bottom` en `shell.css` (R16–R17).
5. `App`: riel, BottomNav, activo por URL, navegación (R9, R12–R15). `app.spec.ts` con `RouterTestingHarness`.
6. `/demo`: sección PlaceholderPage e índice; ajustar `demo-page.spec.ts`.
7. Playwright en `npm start` a 40rem, 56rem y 80rem: qué navegación se ve, BottomNav al fondo del viewport, clics navegan, `aria-current`, `document.title`, consola sin errores (R12–R17).
8. `npm run build`: HTML prerenderizado de las rutas de R1 con título y navegación (R18). Marcar el ítem en `TODO.md`. `npm test -- --watch=false` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa, con tests de R1, R3–R4, R6, R9–R15.
- [x] `npm run build` sin errores ni warnings de budget; `dist/calendar/browser/{resumen,calendario/dia,calendario/semana,calendario/mes,tareas,configuracion}/index.html` existen con su `<title>` y el riel/BottomNav (R5, R18).
- [x] Ninguna ruta de feature se declara en `app.routes.ts` fuera de `loadChildren` (R2).
- [x] `PlaceholderPage` sin `styleUrl` (R7).
- [x] Playwright a 40rem: BottomNav visible y pegada al fondo, riel oculto (R16).
- [x] Playwright a 56rem y 80rem: riel visible, BottomNav oculta, placeholder a todo el ancho (R8, R17).
- [x] Playwright: pulsar cada destino cambia la URL, el `aria-current` y el título (R5, R12–R15).
- [x] `/` y `/no-existe` acaban en `/calendario/dia` (R3–R4).
- [x] `/demo` con sección PlaceholderPage e índice.
- [x] Ítem marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** elección escritorio/móvil solo por CSS (container query de `.l-shell`), con las dos navegaciones en el DOM: funciona en prerender sin parpadeo (respuesta del usuario).
- **No:** `ResizeObserver` con signal: en SSR no se conoce el ancho y parpadea al hidratar.
- **Sí:** URLs compartidas; los destinos móviles apuntan a las mismas rutas (respuesta del usuario).
- **Sí:** `PlaceholderPage` común en `shared/components/` (respuesta del usuario), aunque front-guidelines pide que solo una `page` de la feature monte una ruta; cada pantalla de §6 lo sustituye por su `page`.
- **Sí:** rutas por dominio en `features/<feature>/<feature>.routes.ts` con `loadChildren` (front-guidelines, respuesta del usuario). Sin `index.ts` ni capas vacías hasta que haya algo que exportar.
- **Sí:** `/` y `**` a `/calendario/dia`: Hoy es el primer destino móvil y la agenda del día vale en escritorio (respuesta del usuario).
- **Sí:** BottomNav en `App`, en `.l-shell__bottom` hermano del grid dentro de `.l-shell`, para poder consultar el contenedor `shell` (respuesta del usuario). Divergencia local de `shell.css`.
- **Sí:** activo móvil según NavigationMap: Resumen y Semana cuelgan de Hoy (respuesta del usuario).
- **Sí:** título «<vista> · Agenda» por ruta (respuesta del usuario).
- **Sí:** riel con 4 destinos de NavigationMap; se descartan Reuniones y Analítica del preview de AppShell.
- **Sí:** destino de Calendario en el riel = `/calendario/dia`; Día/Semana/Mes se elige dentro de la pantalla (§6).
- **Sí:** `heading` por `withComponentInputBinding()` desde `data` de la ruta.
- **Sí:** el área segura ya la da `bottom-nav.css` (`env(safe-area-inset-bottom)`).
- **Sí:** placeholder en columnas de contenido (`2 / -1` desde 48rem) y `.l-shell` con `min-block-size: 100dvh`: Playwright mostró el placeholder debajo del riel y la BottomNav a media pantalla con poco contenido (respuesta del usuario).

## Risks

- jsdom no evalúa container queries: R16–R17 solo con Playwright.
- Las dos navegaciones están siempre en el DOM; la oculta usa `display: none`, así que no llega a lectores de pantalla ni al tabulador.
- `/demo` queda dentro del shell con las navegaciones visibles y ninguna activa.
- SidebarNav y BottomNav navegan con `button`, no `a[href]`: sin abrir en pestaña nueva ni enlaces en el HTML prerenderizado. Cambiarlo toca SPEC 39/40.

## What is **not** in this spec

- Pantallas, `data-layout`, selector de vista, AppBar, Fab, diálogos, badges, 404, capas de datos de las features.
