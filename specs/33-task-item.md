# SPEC 33 — Componente TaskItem

> **Status:** Implemented
> **Depends on:** SPEC 06, SPEC 14, SPEC 15, SPEC 18
> **Date:** 2026-10-24
> **Objective:** Crear `app-task-item` como fila de tarea tonta (checkbox, título en el input `heading`, metadatos fecha/subtareas/lista) que refleja el TaskItem del DS Agenda (completada, deshabilitada), con `done` enlazable en dos sentidos.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/task-item.css`: copia literal del DS (`project/assets/Code/styles/blocks/task-item.css`). Importado en `src/styles.css` tras `agenda-item.css`.
- `src/app/shared/task-item/task-item.ts` — componente `TaskItem` (selector `app-task-item`, template externo `task-item.html`), reutiliza `app-checkbox` y `app-icon`.
- Test Vitest `task-item.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts`: sección TaskItem e índice.
- Marcar «TaskItem» en `TODO.md`.

**Out of scope:**

- Estados forzados `data-force` (prop `state` del DS). La regla viene en el CSS copiado, pero el componente no la expone.
- Clic en la fila para abrir el detalle: el DS no lo define; el chevron es decorativo.
- Formatear la fecha: el consumidor pasa `due` como texto («22 oct»).
- Lista de tareas, agrupado u orden.

## Requisitos (EARS)

- **R1.** El `app-task-item` deberá tener la clase `task-item` en el host y renderizar, en orden: un `app-checkbox` sin `label`, un `<div class="task-item__main">` con `<span class="task-item__title">` = `heading`, y `app-icon` `chevron_right` con clase `task-item__chevron`. `heading` es obligatorio; el host no deberá tener atributo `title`.
- **R2.** El checkbox deberá tener `aria-label` «Completar: `heading`».
- **R3.** El `TaskItem` deberá reflejar `done` (por defecto `false`) en el checkbox y, mientras `done`, poner `data-done` en el host.
- **R4.** Cuando el usuario marca o desmarca el checkbox, el `TaskItem` deberá actualizar `done` (model, enlazable con `[(done)]`) y `data-done`.
- **R5.** Donde `due`, `subtasks` o `list` tengan valor, el `TaskItem` deberá renderizar `<span class="task-item__meta">` dentro de `.task-item__main`; si ninguno tiene valor, no.
- **R6.** Donde `due` tenga valor, `.task-item__meta` deberá incluir un `<span>` con `app-icon` `event` tamaño `s` y el texto `due`.
- **R7.** Donde `subtasks` sea mayor que 0, `.task-item__meta` deberá incluir un `<span>` con `app-icon` `checklist` tamaño `s` y «`N` subtareas» («1 subtarea» si `N` es 1).
- **R8.** Donde `list` tenga valor, `.task-item__meta` deberá incluir `<span class="task-item__list u-category" data-category="listColor">` (por defecto `blue`) con `<span class="badge__dot" data-category-dot>` y el texto `list`.
- **R9.** Mientras `disabled`, el `TaskItem` deberá poner `data-disabled` en el host, deshabilitar el checkbox y no renderizar el chevron.
- **R10.** El `TaskItem` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `task-item.css`, `check.css`, `badge.css` y `category.css`.

## Data model

```ts
// src/app/shared/task-item/task-item.ts
export class TaskItem {
  // inputs: heading: string (required) · due?: string · subtasks?: number
  //         list?: string · listColor: Category = 'blue'
  //         disabled: boolean = false (booleanAttribute)
  // model:  done: boolean = false
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `task-item.css` del DS a `src/styles/blocks/`, sin cambios; `@import` en `src/styles.css` tras `agenda-item.css` (R10).
2. `task-item.spec.ts` con host de test (`[(done)]`, `disabled` suelto): un test por R1–R9. Fallan.
3. Crear `TaskItem` (`templateUrl: './task-item.html'`): host `class: 'task-item'`, `[attr.data-done]`, `[attr.data-disabled]`, `[attr.title]: null`; `app-checkbox` con `[(checked)]="done"`, `[ariaLabel]`, `[disabled]`; spans del markup DS con `@if`. `Category` de `shared/types/ui.ts`. Tests en verde.
4. Demo: sección `task-item` en `demo-page.html` (tras AgendaItem), `{ id: 'task-item', name: 'TaskItem' }` en `SECTIONS` y `'task-item'` en `IDS`. Copy del preview DS: columna «Hoy · 5» (`h3.agenda-group__title`, `.demo__narrow`) con las 5 tareas («Investigar ideas de contenido» Trabajo cyan… «Imprimir tarjetas de presentación» completada), `done` enlazado a un signal de la demo. Segunda columna «Estados»: completada («Enviar propuesta al cliente») y disabled («Tarea bloqueada por otra», `25 oct`).
5. Playwright en `/demo`: hover `color-surface-sunken`, anillo focus-within, tachado al marcar, disabled sin chevron, punto con color de lista, consola limpia.
6. Marcar «TaskItem» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R9.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/task-item.css` y el original del DS no muestra diferencias.
- [x] `src/app/shared/task-item/` no declara `styles` ni `styleUrl` (R10).
- [x] Host `.task-item` con checkbox, título de `heading` y chevron; sin `title` en el host (R1).
- [x] Checkbox con `aria-label` «Completar: …» (R2).
- [x] `done` se refleja en checkbox y `data-done`, y marcar lo actualiza (R3, R4).
- [x] Meta con fecha, subtareas (singular/plural) y lista con punto de categoría, solo si hay datos (R5–R8).
- [x] `disabled` da `data-disabled`, checkbox deshabilitado y sin chevron (R9).
- [x] `/demo` muestra la sección TaskItem del paso 4 y aparece en el índice.
- [x] Ítem «TaskItem» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** input `heading` en lugar de `title` del DS, como Card (SPEC 23) y AgendaItem (SPEC 32): evita el tooltip nativo en el host. La clase `.task-item__title` se mantiene.
- **Sí:** un solo `done` como `model()` en lugar de `done` + `checked` + `onToggle` del DS: en Angular `[(done)]` cubre controlado y no controlado.
- **Sí:** `listColor` tipado como `Category`, por defecto `blue` (igual que el DS).
- **Sí:** «1 subtarea» en singular; el DS siempre escribe «subtareas».
- **Sí:** host `div`-like (`app-task-item.task-item`), sin elemento interno extra; el DS es un `div`.
- **No:** `data-force` / `state`; salida de clic en la fila.
- **Sí:** CSS copiado literal (incluye reglas `data-force` y `@container style(--density: compact)`).

## Risks

- El host de `app-checkbox` es `.field` (flex column): comprobar en `/demo` que no descuadra la fila.

## What is **not** in this spec

- `data-force`; clic en la fila; formato de fecha; listas de tareas.
