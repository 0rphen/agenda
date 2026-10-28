# SPEC 81 — Quitar subtarea dentro de TaskItem

> **Status:** Implemented
> **Depends on:** SPEC 33 (TaskItem), SPEC 80 (Subtareas sin editar)
> **Date:** 2026-10-28
> **Objective:** Que en las subtareas del `app-task-form` el botón final de `app-task-item` (hoy chevron `task-item__open` sin acción) pase a ser «Quitar subtarea», eliminando el `app-icon-button` externo.

## Scope

**In:**

- `app-task-item`: input `action: TaskItemAction` (`'open'` por defecto, `'remove'`) y output `removed`.
  - `'open'`: igual que hoy (chevron, «Abrir detalle: <título>», fila interactiva, emite `opened`).
  - `'remove'`: mismo botón `.task-item__open` con icono `close` y `aria-label` «Quitar subtarea: <título>»; al pulsar emite `removed`; fila no interactiva (sin `data-interactive`, clic en fila no emite nada).
- `src/app/shared/types/task-item.ts`: `type TaskItemAction = 'open' | 'remove'`, re-exportado en `types/index.ts`.
- `task-form.html`: `app-task-item` directo en el `@for` con `action="remove"` y `(removed)="removeSubtask($index)"`; fuera wrapper `.task-form__subtask` y `app-icon-button` externo.
- `src/styles/blocks/task-form.css`: borrar archivo y su `@import` en `src/styles.css`.
- `task-form.ts`: quitar `IconButton` de `imports` si queda sin uso en la plantilla.
- Tests: `task-item.spec.ts` (modo `remove`) y `task-form.spec.ts` (SPEC 70 R6 y SPEC 80 adaptados).
- Demo `/demo#task-item`: ejemplo `action="remove"` en columna «Estados» con texto «Quitada: <título>» al pulsar.
- `PENDING.md`: sección SPEC 81; cerrar sugerencia SPEC 70 del chevron sin acción y actualizar la duda del grid `.task-form__subtask`.
- `TODO.md`: ítem SPEC 81.

**Out of scope:**

- Cambiar comportamiento de `app-task-item` en Tareas, Inicio, Resumen, Calendario (siguen en `'open'`).
- Estilo danger para la X (usa el mismo hover brand que `.task-item__open`).
- Confirmación, deshacer, reordenar, foco tras quitar.
- Copy genérico («Quitar: …») o input de label.

## Requisitos (EARS)

- **R1.** El `app-task-item` deberá aceptar input `action` de tipo `TaskItemAction` con valor por defecto `'open'`.
- **R2.** Mientras `action` sea `'open'`, el `app-task-item` deberá comportarse como hoy (chevron `chevron_right`, «Abrir detalle: <título>», `data-interactive`, emitir `opened` al pulsar botón o fila).
- **R3.** Mientras `action` sea `'remove'` y no `disabled`, el `app-task-item` deberá mostrar el botón `.task-item__open` con icono `close` y `aria-label` «Quitar subtarea: <título>».
- **R4.** Mientras `action` sea `'remove'`, cuando el usuario pulsa ese botón, el `app-task-item` deberá emitir `removed` y no `opened`.
- **R5.** Mientras `action` sea `'remove'`, el `app-task-item` no deberá tener `data-interactive` y, cuando el usuario pulsa la fila fuera del checkbox y del botón, no deberá emitir `opened` ni `removed`.
- **R6.** Mientras `action` sea `'remove'`, el checkbox deberá seguir alternando `done` (SPEC 70 R4–R5, SPEC 54 R6–R8 sin cambios).
- **R7.** Cada subtarea del `app-task-form` deberá ser un `app-task-item` con `action="remove"`, sin `app-icon-button` externo ni wrapper `.task-form__subtask`.
- **R8.** Cuando el usuario pulsa «Quitar subtarea: <título>», el `app-task-form` deberá quitarla de `value().subtasks` sin emitir `saved`.
- **R9.** Cada subtarea deberá ocupar el ancho completo del campo «Subtareas».

## Data model

- `src/app/shared/types/task-item.ts`: `export type TaskItemAction = 'open' | 'remove';`
- `TaskItem`: `readonly action = input<TaskItemAction>('open');` y `readonly removed = output<void>();`
- Se elimina `.task-form__subtask` (CSS y marcado).

## Implementation plan

1. `types/task-item.ts` + export en `types/index.ts` (R1).
2. `task-item.ts`/`task-item.html`: input `action`, output `removed`, botón según modo, `data-interactive` y `onRowClick` sin acción en `'remove'` (R1–R6). Tests en `task-item.spec.ts`.
3. `task-form.html`/`task-form.ts`: `app-task-item` con `action="remove"` y `(removed)`; fuera wrapper e `app-icon-button`; quitar `IconButton` de `imports` si no se usa (R7, R8).
4. Borrar `src/styles/blocks/task-form.css` y su `@import` en `src/styles.css` (R9). Leer `~/.claude/skills/css-guidelines/SKILL.md` antes.
5. `task-form.spec.ts`: adaptar SPEC 70 R6 y `describe('SPEC 80')` al nuevo marcado; añadir `describe('SPEC 81')` con R7/R8 (R6 cubierto por tests existentes de marcar).
6. Demo `/demo#task-item`: ejemplo `action="remove"` con «Quitada: <título>» (signal en `demo-page.ts`).
7. `PENDING.md`, `TODO.md`; Playwright `/demo#task-item` y `/demo#task-form`; `npx ng test --watch=false`; `npm run build`.

## Acceptance criteria

- [x] `npx ng test --watch=false` pasa, con ≥1 test para R1–R5 (`task-item.spec.ts`) y R7–R8 (`task-form.spec.ts`); tests existentes de `.task-item__open` en features siguen verdes (R2).
- [x] `npm run build` sin errores ni warnings de budget.
- [x] `grep -rn "task-form__subtask" src` sin resultados; `src/styles/blocks/task-form.css` no existe.
- [x] Playwright `/demo#task-form`: cada subtarea muestra solo X dentro de la fila (sin chevron ni X externa); X quita; clic en título no hace nada; checkbox marca; añadir funciona; fila al ancho del campo (R9).
- [x] Playwright `/demo#task-item`: ejemplo `remove` muestra «Quitada: <título>»; ejemplos `open` siguen mostrando «Abierto: <título>».
- [x] `PENDING.md` actualizado; `TODO.md` ítem SPEC 81 marcado. Copy en español, sin emojis.

## Decisions

- **Sí:** input `action: 'open' | 'remove'` (usuario) en vez de booleano `removable`.
- **Sí:** fila no interactiva en `'remove'` (usuario): evita quitar o abrir por error.
- **Sí:** mismo estilo y clase `.task-item__open` para la X (usuario); sin CSS nuevo: la animación del icono solo aplica con `data-interactive`.
- **Sí:** copy fijo «Quitar subtarea: <título>» (usuario): `'remove'` solo se usa en subtareas.
- **Sí:** borrar wrapper `.task-form__subtask` y `task-form.css` (usuario).
- **Sí:** output `removed` y tipo `TaskItemAction` en `types/task-item.ts` (usuario, convención CLAUDE.md).
- **No:** hover danger (más CSS, divergencia mayor con el DS).
- **No:** reabrir SPEC 80: queda como histórico; este spec revierte su R1 (X externa) y R5 (grid dos columnas).

## Risks

- Sin wrapper, `app-task-item` podría no ocupar el ancho del campo (motivo original del grid en SPEC 70): se verifica en Playwright (R9); si falla, parar y decidir.
- Divergencia con el DS (el DS no quita subtareas): se registra en `PENDING.md`.

## What is not in this spec

Cambios de `app-task-item` fuera del TaskForm, estilo danger, confirmación/deshacer, reordenar, copy genérico.
