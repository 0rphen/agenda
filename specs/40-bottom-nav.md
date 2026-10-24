# SPEC 40 — Componente BottomNav

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 02, SPEC 15
> **Date:** 2026-10-24
> **Objective:** Crear `app-bottom-nav` como barra de navegación inferior móvil tonta que refleja el BottomNav del DS Agenda: de 3 a 5 destinos con ícono, etiqueta y contador opcional; el activo lleva `aria-current="page"`, ícono relleno y pastilla `color-brand-soft`. El clic se emite al consumidor.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/bottom-nav.css`: copia literal del DS (`project/assets/Code/styles/blocks/bottom-nav.css`). Importado en `src/styles.css` tras `sidebar-nav.css`.
- `src/app/shared/bottom-nav/bottom-nav.ts` — componente `BottomNav` (selector `app-bottom-nav`, template externo `bottom-nav.html`). Reutiliza `app-icon`.
- Tests Vitest `bottom-nav.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts`: sección BottomNav e índice.
- Marcar «BottomNav» en `TODO.md`.

**Out of scope:**

- Enlaces de router y `.l-screen__bottom` (llegan con «Layout de aplicación» y «Rutas y navegación»).
- Limitar el número de destinos (el DS lo recomienda, no lo impone).
- `app-badge`: el DS pinta el contador con su propio `span.bottom-nav__badge` sobre el ícono, no con Badge.

## Requisitos (EARS)

- **R1.** El `app-bottom-nav` deberá renderizar un `nav.bottom-nav` con `aria-label` = `label` (por defecto «Navegación principal»).
- **R2.** El `BottomNav` deberá renderizar cada ítem de `items` como `button.bottom-nav__item` (`type="button"`) con `span.bottom-nav__icon` que contiene un `app-icon` del ícono, seguido de un `span` con la etiqueta.
- **R3.** Donde un ítem tenga `active`, el `BottomNav` deberá marcar su botón con `aria-current="page"` y su ícono relleno (`data-filled`).
- **R4.** Donde un ítem tenga `badge` distinto de 0, el `BottomNav` deberá mostrar el número en `span.bottom-nav__badge` dentro de `.bottom-nav__icon`.
- **R5.** Donde un ítem tenga `disabled`, el `BottomNav` deberá deshabilitar su botón.
- **R6.** Cuando el usuario hace clic en un ítem habilitado, el `BottomNav` deberá emitir `itemSelected` con ese ítem.
- **R7.** Donde un ítem tenga `state` (`hover` | `active` | `focus`), el `BottomNav` deberá ponerlo en `data-force` de su botón (solo demo).
- **R8.** El `BottomNav` no deberá usar `styleUrl` ni estilos de componente; el aspecto viene de `bottom-nav.css` e `icon.css`.

## Data model

```ts
// src/app/shared/bottom-nav/bottom-nav.ts
export type BottomNavItem = {
  icon: string;
  label: string;
  active?: boolean;
  badge?: number;
  disabled?: boolean;
  state?: 'hover' | 'active' | 'focus';
};

export class BottomNav {
  // inputs: items (required) · label = 'Navegación principal'
  // output: itemSelected: BottomNavItem
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `bottom-nav.css` del DS sin cambios; `@import` en `src/styles.css` tras `sidebar-nav.css` (R8).
2. `bottom-nav.spec.ts` con host de test: al menos un test por R1–R7.
3. Crear `BottomNav` con el mismo patrón que `SidebarNav` (`nav` dentro del template, `output` `itemSelected`). Template: `@for` de ítems; botón con `aria-current`, `disabled`, `data-force`; `.bottom-nav__icon` con `app-icon [filled]="!!item.active"` y el contador si `badge`; `span` con la etiqueta.
4. Demo: sección `bottom-nav` tras SidebarNav, `{ id: 'bottom-nav', name: 'BottomNav' }` en `SECTIONS` e `IDS`. Tres ejemplos del preview DS (Hoy, Mes, Tareas con contador 5, Ajustes) en `.demo__narrow`: «Activo: Hoy» interactivo (clic mueve el activo y muestra «Seleccionado: {{ label }}»); «Activo: Tareas (con contador)»; «Hover · active · focus · deshabilitado».
5. Comprobación en `/demo`: Playwright si está disponible; si no, SSR de `/demo` con los tres `nav`.
6. Marcar «BottomNav» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R7.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/bottom-nav.css` y su original del DS no muestra diferencias.
- [x] `src/app/shared/bottom-nav/` no declara `styles` ni `styleUrl` (R8).
- [x] `nav` con nombre accesible y destinos con ícono y etiqueta (R1, R2).
- [x] Activo con `aria-current="page"` e ícono relleno; contador; deshabilitado; clic emitido (R3–R6).
- [x] Estados forzados en la demo (R7).
- [x] `/demo` muestra la sección BottomNav del paso 4 y aparece en el índice.
- [x] Ítem «BottomNav» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** `output` `itemSelected` con el ítem, como `SidebarNav` y `Menu`. El consumidor decide qué ítem es `active`.
- **Sí:** contador con `span.bottom-nav__badge` del DS en vez de `app-badge` (el bloque lo posiciona sobre el ícono); `badge: 0` no se muestra, como el DS.
- **Sí:** `nav` dentro del template, como `SidebarNav`.
- **No:** `routerLink`, máximo de destinos.

## What is **not** in this spec

- `.l-screen`, rutas y la elección entre SidebarNav y BottomNav según el ancho.
