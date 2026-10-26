# SPEC 58 — Ajustes: riel SidebarNav a toda la altura y TaskItem según el DS actualizado

> **Status:** Implemented
> **Depends on:** SPEC 33 (TaskItem), SPEC 55 (`.l-shell`), SPEC 56 (rutas y navegación), SPEC 57 (Inicio)
> **Date:** 2026-10-26
> **Objective:** Que el `nav.sidebar-nav` del riel ocupe todo el alto de `.l-shell__rail`, y alinear `app-task-item` con la actualización del DS (chevron «Abrir detalle» como botón, fila clicable, `selected`, `overdue`), mostrando las tareas vencidas en Inicio.

## Scope

**In:**

- `src/styles/composition/shell.css`: el hijo de `.l-shell__rail` estira el `<nav>` interno.
- `src/styles/blocks/task-item.css`: reglas nuevas del DS (`data-interactive`, `data-selected`, `data-overdue`, `.task-item__due`, `.task-item__open`, desplazamiento del chevron).
- `src/app/shared/components/task-item/task-item.{ts,html,spec.ts}`: inputs `selected` y `overdue`, output `opened`, chevron como botón.
- `src/app/features/home/components/tasks-panel/tasks-panel.{ts,html,spec.ts}`: `overdue` y fecha corta en tareas pendientes vencidas.
- `src/app/demo/demo-page.html` (y su `.ts` si hace falta estado): sección `#task-item` con los casos selected, overdue y `(opened)`.

## Contexto

**Riel.** Medido con Playwright en `/inicio` a 1440×900: `.l-shell__rail` mide 900 px, el host `app-sidebar-nav` 900 px (block) y `nav.sidebar-nav` **216 px**. `shell.css` aplica `.l-shell__rail > * { min-block-size: 100% }`. En el DS el hijo directo es el `<nav>`; en Angular es el host, así que el `<nav>` (fondo `color-surface-nav`) no se estira.

**TaskItem.** DS versión `1793052956-0c70` (`project/components/TaskItem/README.md`, `preview.html`, `assets/Code/styles/blocks/task-item.css`, `components/bundle.js`):

- El chevron pasa a ser `button.task-item__open` con `aria-label` «Abrir detalle: título», tamaño `control-s`, zona táctil `touch-target`, hover `color-brand-soft`/`color-brand`, active por OKLCH `l-step-active`, focus-visible con anillo.
- Un clic en la fila abre el detalle salvo que venga de `.check`; el botón hace `stopPropagation`.
- `data-interactive`: cursor pointer. Con hover sobre la fila, el ícono del chevron se desplaza `space-3xs` y pasa a `color-ink`.
- `selected` añade `data-selected` (fondo `color-brand-soft`).
- `overdue` añade `data-overdue`. La fecha va en `span.task-item__due`, en `color-danger` con peso medium, y lleva el ícono `error_outline`.
- Tokens sin cambios (`tokens.json` del DS = local).

## Requisitos (EARS)

Riel:

- **R1.** Mientras `.l-shell` mida ≥ 48 rem, el `nav.sidebar-nav` de `.l-shell__rail` deberá ocupar el alto completo de `.l-shell__rail`.
- **R2.** Mientras `.l-shell` mida < 48 rem, el riel deberá seguir oculto y la BottomNav visible, como hasta ahora.

TaskItem:

- **R3.** Mientras no esté `disabled`, el `app-task-item` deberá mostrar `button.task-item__open` (`type="button"`) con `aria-label` «Abrir detalle: `heading`» y el ícono `chevron_right`.
- **R4.** Mientras no esté `disabled`, el host deberá llevar `data-interactive`.
- **R5.** Cuando el usuario haga clic en `.task-item__open`, el `app-task-item` deberá emitir `opened` una sola vez.
- **R6.** Cuando el usuario haga clic en la fila fuera de `.check` y de `.task-item__open`, el `app-task-item` deberá emitir `opened`.
- **R7.** Cuando el usuario haga clic en el checkbox, el `app-task-item` no deberá emitir `opened` y deberá seguir alternando `done`.
- **R8.** Mientras esté `disabled`, el `app-task-item` no deberá mostrar `.task-item__open` ni emitir `opened` al hacer clic en la fila.
- **R9.** Donde `selected` sea verdadero, el host deberá llevar `data-selected`.
- **R10.** Donde `overdue` sea verdadero, el host deberá llevar `data-overdue` y la fecha deberá usar el ícono `error_outline` en vez de `event`.
- **R11.** Donde haya `due`, la fecha deberá ir en `span.task-item__due` dentro de `.task-item__meta`.
- **R12.** Con el teclado, Tab deberá pasar del checkbox a `.task-item__open`, y Enter o Espacio sobre el botón deberán emitir `opened`.

Inicio:

- **R13.** Mientras una tarea esté pendiente y su `due` sea anterior a hoy, el `app-tasks-panel` deberá pasarle `overdue` y como `due` la fecha corta (`SHORT_DAY`).
- **R14.** Si la tarea está hecha o su `due` es hoy o posterior, entonces el `app-tasks-panel` no deberá pasar ni `overdue` ni `due`, como hasta ahora.

## Implementation plan

1. `shell.css`: en `.l-shell__rail`, cambiar `& > * { min-block-size: 100%; }` por `& > * { display: grid; }`. El host ya está estirado y el `<nav>` se estira como item de grid. Añadir un comentario «Divergencia local del DS: el hijo es el host Angular». Plan B, si Playwright no da 100 %: `& > *, & .sidebar-nav { min-block-size: 100%; }` y `display: grid` en el host (R1, R2).
2. `task-item.css`: copiar del DS `[data-interactive]`, `[data-selected]`, `[data-overdue] .task-item__due`, el bloque `.task-item__open` y la regla del desplazamiento. Se conserva `.task-item__chevron`, que el DS mantiene (R3, R4, R9, R10).
3. `task-item.ts`: añadir `selected` y `overdue` (`booleanAttribute`) y `opened = output<void>()`. En el host: `data-interactive` (cuando no está `disabled`), `data-selected`, `data-overdue` y `(click)` que ignora `disabled` y los clics desde `.check` (R4–R9).
4. `task-item.html`: fecha en `span.task-item__due` con ícono según `overdue`. Chevron como `button.task-item__open` que emite `opened` y hace `stopPropagation`, dentro de `@if (!disabled())` (R3, R5, R10–R12).
5. `task-item.spec.ts`: actualizar R1 de SPEC 33 (el chevron ahora es un botón) y añadir tests para R3–R11.
6. `tasks-panel`: `isOverdue(task)` = `!task.done && !!task.due && task.due < today()`. Pasar `[overdue]` y `[due]` con `SHORT_DAY`, igual que hace `heading`. Añadir test (R13, R14).
7. Demo `#task-item`: añadir casos selected y overdue, y `(opened)` que muestre «Abierto: …» (como `navActive` en SidebarNav).
8. Playwright y build (ver criterios).

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa con tests de R3–R11, R13 y R14.
- [x] Playwright en `/inicio` a 1440×900: el alto de `.sidebar-nav` es igual al de `.l-shell__rail` (R1).
- [x] Playwright a 1024 y 800 px: el riel ocupa toda la altura. A 600 px el riel está oculto y se ve la BottomNav (R1, R2).
- [x] Playwright en `/demo#task-item`: hover sobre la fila desplaza el chevron; hover y focus del botón; Tab va del checkbox al chevron; un clic en el checkbox no emite y uno en la fila sí (R5–R7, R12).
- [x] La demo muestra los casos selected y overdue y el texto «Abierto: …» (R9, R10).
- [x] `/inicio` con un día pasado y tareas pendientes: la fecha sale en rojo con `error_outline` (R13).
- [x] `npm run build` sin errores ni warnings de budget.
- [x] Sin `styleUrl`, sin valores literales, copy en español.

## Decisions

- **Sí:** solo el output `opened` y chevron siempre como botón (salvo `disabled`) (respuesta del usuario). **No:** un input `interactive`. Diverge del DS, donde sin `onClick` el chevron es decorativo, porque Angular no puede saber si alguien escucha un output.
- **Sí:** conectar `overdue` en Inicio (respuesta del usuario). **No:** `opened` ni `selected` en Inicio, porque aún no hay destino de detalle.
- **Sí:** arreglar el riel en `shell.css` (composición) y no en el bloque `sidebar-nav`: el problema es la relación entre rail y host, no el componente.
- **Sí:** se mantiene el texto singular/plural de subtareas (SPEC 33). El DS siempre dice «subtareas».

## Risks

- Las subtareas de TaskForm muestran un chevron como botón que no hace nada hasta que exista un detalle de subtarea.
- Botón dentro de una fila clicable. La fila no tiene `role` y el teclado llega solo por el botón, como en el DS.
- jsdom no calcula el layout: R1 y R2 solo se verifican con Playwright.

## What is **not** in this spec

- Panel de detalle de tarea (TaskForm lateral o pantalla completa en móvil), `selected` en Inicio, SidebarNav en variante panel en Configuración, cambios en tokens.
