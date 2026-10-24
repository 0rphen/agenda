# SPEC 41 — Componente AppBar

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 15, SPEC 17, SPEC 30
> **Date:** 2026-10-24
> **Objective:** Crear `app-app-bar` como barra superior móvil tonta que refleja el AppBar del DS Agenda: título de una línea, subtítulo opcional, botón «Volver» opcional, hueco de acciones (`IconButton` o `Menu`) y variante de título grande para pantallas raíz.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/app-bar.css`: copia literal del DS (`project/assets/Code/styles/blocks/app-bar.css`). Importado en `src/styles.css` tras `bottom-nav.css`.
- `src/app/shared/app-bar/app-bar.ts` — componente `AppBar` (selector `app-app-bar`, template externo `app-bar.html`) y directiva `AppBarActions` (`[appBarActions]`). Reutiliza `app-icon-button`.
- Tests Vitest `app-bar.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts`: sección AppBar e índice.
- Marcar «AppBar» en `TODO.md`.

**Out of scope:**

- `.l-screen` / `.l-screen__top` (llega con «Layout de aplicación»).
- Limitar el número de acciones (el DS lo recomienda, no lo impone).
- Navegación real al pulsar «Volver» (la decide el consumidor).

## Requisitos (EARS)

- **R1.** El `app-app-bar` deberá renderizar un `header.app-bar` con `div.app-bar__heading` que contiene `h1.app-bar__title` con `heading`.
- **R2.** Donde haya `subtitle`, el `AppBar` deberá mostrarlo en `p.app-bar__subtitle` tras el título; si no hay, no deberá renderizar el `p`.
- **R3.** Donde `back` sea verdadero, el `AppBar` deberá mostrar antes del encabezado un `app-icon-button` con ícono `chevron_left` y nombre accesible `backLabel` (por defecto «Volver»).
- **R4.** Cuando el usuario hace clic en el botón volver, el `AppBar` deberá emitir `backClicked`.
- **R5.** Donde el consumidor proyecte contenido marcado con `appBarActions`, el `AppBar` deberá colocarlo en `div.app-bar__actions` tras el encabezado; si no hay, no deberá renderizar ese `div`.
- **R6.** Donde `large` sea verdadero, el `AppBar` deberá poner `data-size="l"` en el `header`.
- **R7.** El `AppBar` no deberá usar `styleUrl` ni estilos de componente; el aspecto viene de `app-bar.css`.

## Data model

```ts
// src/app/shared/app-bar/app-bar.ts
@Directive({ selector: '[appBarActions]' })
export class AppBarActions {}

export class AppBar {
  // inputs: heading (required) · subtitle · back = false · backLabel = 'Volver' · large = false
  // output: backClicked: MouseEvent
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `app-bar.css` del DS sin cambios; `@import` en `src/styles.css` tras `bottom-nav.css` (R7).
2. `app-bar.spec.ts` con host de test: al menos un test por R1–R6.
3. Crear `AppBar` + `AppBarActions` con el patrón de `Card`/`CardActions` (`contentChild` para renderizar el contenedor de acciones solo si hay contenido). Template: `header` con `data-size`, `app-icon-button` volver si `back()`, encabezado, `<ng-content select="[appBarActions]" />`.
4. Demo: sección `app-bar` tras BottomNav, `{ id: 'app-bar', name: 'AppBar' }` en `SECTIONS` e `IDS`. Tres ejemplos del preview DS en `.demo__narrow`: «Raíz» (Hoy · Jueves 22 de octubre · Buscar + `app-menu` «Más acciones»), «Con volver» (Lanzamiento de Bestbuy · Editar; clic en volver muestra «Volver pulsado»), «Título grande» (Octubre 2026 · Mes anterior / Mes siguiente).
5. Comprobación en `/demo`: Playwright si está disponible; si no, SSR de `/demo`.
6. Marcar «AppBar» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R6.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/app-bar.css` y su original del DS no muestra diferencias.
- [x] `src/app/shared/app-bar/` no declara `styles` ni `styleUrl` (R7).
- [x] Título, subtítulo opcional y título grande (R1, R2, R6).
- [x] Botón volver con nombre accesible y salida `backClicked` (R3, R4).
- [x] Acciones proyectadas, incluido un `app-menu` (R5).
- [x] `/demo` muestra la sección AppBar del paso 4 y aparece en el índice.
- [x] Ítem «AppBar» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** input `heading` en vez de `title` (choca con el atributo global HTML; mismo criterio que `Card`).
- **Sí:** input booleano `back` + output `backClicked` en vez de `onBack` (Angular no detecta oyentes de una salida). Elegido por el usuario.
- **Sí:** acciones por proyección con `[appBarActions]`, como `[cardActions]` en `Card`.
- **Sí:** `header` dentro del template (host `app-app-bar` sin clase), como `nav` en `SidebarNav`/`BottomNav`.
- **No:** `routerLink` en volver, máximo de acciones.

## What is **not** in this spec

- `.l-screen`, rutas y conmutación con la barra de escritorio.
