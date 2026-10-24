# SPEC 39 — Componente SidebarNav

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 02, SPEC 06, SPEC 07, SPEC 15
> **Date:** 2026-10-24
> **Objective:** Crear `app-sidebar-nav` como navegación lateral tonta que refleja el SidebarNav del DS Agenda en sus dos variantes: `panel` (ícono + etiqueta + contador, cabeceras de sección y usuario al pie) y `rail` (solo íconos, con nombre accesible). El ítem activo lleva `aria-current="page"`; el clic se emite al consumidor.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/sidebar-nav.css`: copia literal del DS (`project/assets/Code/styles/blocks/sidebar-nav.css`). Importado en `src/styles.css` tras `calendar.css`.
- `src/app/shared/sidebar-nav/sidebar-nav.ts` — componente `SidebarNav` (selector `app-sidebar-nav`, template externo `sidebar-nav.html`). Reutiliza `app-icon`, `app-badge` (`tone="count"`) y `app-avatar` (`size="l"`).
- Tests Vitest `sidebar-nav.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts`: sección SidebarNav e índice.
- Marcar «SidebarNav» en `TODO.md`.

**Out of scope:**

- Enlaces de router (`routerLink`/`href`): el DS usa `button` + `onClick`; las rutas llegan con el ítem «Rutas y navegación» de `TODO.md`.
- `.l-shell` y el contenedor `rail` (la regla `@container rail` del bloque se copia, pero solo actúa cuando exista `.l-shell__rail`).
- Navegación con flechas entre ítems (el DS no la define).

## Requisitos (EARS)

- **R1.** El `app-sidebar-nav` deberá renderizar un `nav.sidebar-nav` con `aria-label` = `label` (por defecto «Principal»).
- **R2.** El `SidebarNav` deberá renderizar cada ítem `{ icon, label }` de `items` como `button.sidebar-nav__item` (`type="button"`) con un `app-icon` del ícono.
- **R3.** Mientras `variant` sea `panel` (por defecto), el `SidebarNav` deberá mostrar la etiqueta en `span.sidebar-nav__label`, las entradas `{ section }` como `div.sidebar-nav__section` y, donde el ítem tenga `badge`, un `app-badge` `tone="count"` con el número.
- **R4.** Mientras `variant` sea `rail`, el `SidebarNav` deberá poner `data-variant="rail"` en el `nav`, omitir secciones, etiquetas visibles, contadores y usuario, y dar a cada botón `aria-label` y `title` con la etiqueta.
- **R5.** Donde un ítem tenga `active`, el `SidebarNav` deberá marcar su botón con `aria-current="page"`; en `rail` su ícono deberá ir relleno (`data-filled`).
- **R6.** Donde un ítem tenga `disabled`, el `SidebarNav` deberá deshabilitar su botón.
- **R7.** Cuando el usuario hace clic en un ítem habilitado, el `SidebarNav` deberá emitir `itemSelected` con ese ítem.
- **R8.** Donde `user` esté definido y `variant` sea `panel`, el `SidebarNav` deberá mostrar al pie `div.sidebar-nav__user` con `app-avatar` `size="l"` del nombre, `strong` con el nombre y `span` con el rol.
- **R9.** Donde un ítem tenga `state` (`hover` | `active` | `focus`), el `SidebarNav` deberá ponerlo en `data-force` de su botón (solo demo, como `state` en Card).
- **R10.** El `SidebarNav` no deberá usar `styleUrl` ni estilos de componente; el aspecto viene de `sidebar-nav.css`, `icon.css`, `badge.css` y `avatar.css`.

## Data model

```ts
// src/app/shared/sidebar-nav/sidebar-nav.ts
export type SidebarNavItem = {
  icon: string;
  label: string;
  active?: boolean;
  badge?: number;
  disabled?: boolean;
  state?: 'hover' | 'active' | 'focus';
};
export type SidebarNavEntry = SidebarNavItem | { section: string };

export class SidebarNav {
  // inputs: items (required) · variant: 'panel' | 'rail' = 'panel'
  //         user?: { name: string; role: string } · label = 'Principal'
  // output: itemSelected: SidebarNavItem
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `sidebar-nav.css` del DS sin cambios; `@import` en `src/styles.css` tras `calendar.css` (R10).
2. `sidebar-nav.spec.ts` con host de test: al menos un test por R1–R9.
3. Crear `SidebarNav` siguiendo el patrón de `Menu` (`asItem()` para separar ítems de secciones). El componente envuelve el `nav` en su template (el host no lleva clase, para no partir la regla `.sidebar-nav[data-variant='rail'] .sidebar-nav__item`). Template: `@for` de entradas; botón con `aria-current`, `disabled`, `data-force`, `aria-label`/`title` solo en `rail`; `app-icon [filled]="active && rail"`; label y badge solo en `panel`; bloque de usuario al final.
4. Demo: sección `sidebar-nav` tras MiniCalendar, `{ id: 'sidebar-nav', name: 'SidebarNav' }` en `SECTIONS` e `IDS`. Dos ejemplos del preview DS: `panel` con las secciones «Menú principal» y «Ajustes y noticias», contadores 5 y 2, hover en Reuniones, focus en Analítica, Reportes deshabilitado y usuario «Amir Baqian» (Organizador); `rail` con los mismos estados dentro de un contenedor con esquinas redondeadas. Clic en el `panel` mueve el activo y muestra «Seleccionado: {{ label }}».
5. Comprobación en `/demo`: Playwright si está disponible; si no, SSR de `/demo` con los dos `nav`.
6. Marcar «SidebarNav» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R9.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/sidebar-nav.css` y su original del DS no muestra diferencias.
- [x] `src/app/shared/sidebar-nav/` no declara `styles` ni `styleUrl` (R10).
- [x] `nav` con nombre accesible, ítems con ícono, activo con `aria-current="page"`, deshabilitado y clic emitido (R1, R2, R5–R7).
- [x] Variante `panel` con secciones, etiquetas, contadores y usuario (R3, R8).
- [x] Variante `rail` solo íconos con `aria-label`/`title` e ícono relleno en el activo (R4, R5).
- [x] Estados forzados en la demo (R9).
- [x] `/demo` muestra la sección SidebarNav del paso 4 y aparece en el índice.
- [x] Ítem «SidebarNav» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** `output` `itemSelected` con el ítem en lugar de `onClick` por ítem, como `Menu`. El consumidor decide qué ítem es `active`.
- **Sí:** `nav` dentro del template, no en el host: `.sidebar-nav[data-variant='rail'] .sidebar-nav__item` y `@container rail` funcionan igual que en el DS.
- **Sí:** `title` en los botones del `rail`, fiel al DS (tooltip nativo para íconos sin etiqueta).
- **Sí:** en `panel`, el contador forma parte del nombre accesible del botón («Tareas 5»), fiel al DS.
- **No:** `routerLink`, teclado con flechas.

## What is **not** in this spec

- `.l-shell`, rutas y la elección entre SidebarNav y BottomNav según el ancho.
