# SPEC 80 — Subtareas sin editar

> **Status:** Implemented
> **Depends on:** SPEC 54 (TaskForm), SPEC 70 (Ajustes componentes)
> **Date:** 2026-10-28
> **Objective:** Que cada subtarea del `app-task-form` tenga solo el botón «Quitar subtarea» (icono `close`), eliminando el botón «Editar subtarea» y la edición inline.

## Scope

**In:**

- `task-form.html`: quitar `app-icon-button` «Editar subtarea» y la rama `@if (editingIndex() === $index)` con `app-text-field` de edición; cada fila queda `app-task-item` + «Quitar subtarea: <título>».
- `task-form.ts`: borrar `editingIndex`, `refocusIndex`, `host`, `afterRenderEffect` del constructor, `renameSubtask`, `endEdit` e imports sin uso (`afterRenderEffect`, `ElementRef`, `inject`).
- `task-form.css`: `.task-form__subtask` pasa a dos columnas (`minmax(0, 1fr) auto`); comentario «el DS no quita subtareas».
- Tests de `task-form.spec.ts`: borrar R7/R8 de SPEC 70 (edición) y añadir test de ausencia de editar.
- Demo `/demo#task-form`: sin cambios de plantilla; verificar que «Editando con subtareas» solo muestra X.
- `TODO.md`: ítem SPEC 80.

**Out of scope:**

- Cambiar copy «Quitar subtarea» (se mantiene).
- Gestión de foco tras quitar (sigue como hoy).
- Confirmación al quitar, deshacer, reordenar.
- Cambios en `app-task-item` o bloques CSS del DS.

## Requisitos (EARS)

- **R1.** Cada subtarea del `app-task-form` deberá mostrar `app-task-item` y un único `app-icon-button` «Quitar subtarea: <título>» (icono `close`, `size="s"`).
- **R2.** El `app-task-form` no deberá mostrar ningún botón «Editar subtarea» ni `[data-subtask-edit]`.
- **R3.** Cuando el usuario pulsa «Quitar subtarea: <título>», el `app-task-form` deberá quitarla de `value().subtasks` sin emitir `saved` (comportamiento SPEC 70 R6, se mantiene).
- **R4.** Añadir subtarea (botón y Enter) y marcar `done` deberán seguir funcionando igual (SPEC 54 R6–R8, SPEC 70 R4–R5).
- **R5.** El bloque `.task-form__subtask` deberá tener dos columnas (`minmax(0, 1fr) auto`).

## Data model

Sin estructuras nuevas. Se elimina estado interno de `TaskForm`: `editingIndex`, `refocusIndex`, `host`.

## Implementation plan

1. `task-form.html`: quitar rama de edición y botón editar (R1, R2).
2. `task-form.ts`: borrar `editingIndex`, `refocusIndex`, `host`, constructor con `afterRenderEffect`, `renameSubtask`, `endEdit`, imports sin uso.
3. `src/styles/blocks/task-form.css`: dos columnas + comentario (R5). Leer `~/.claude/skills/css-guidelines/SKILL.md` antes.
4. `task-form.spec.ts`: borrar tests R7/R8 de «SPEC 70 subtareas» y helper `editInput`; añadir `describe('SPEC 80')` con test R1/R2 (una X por fila, sin «Editar subtarea», sin `[data-subtask-edit]`); mantener R6 (R3).
5. `TODO.md`; Playwright `/demo#task-form`; `npx ng test --watch=false`; `npm run build`.

## Acceptance criteria

- [x] `npx ng test --watch=false` pasa, con ≥1 test para R1–R3; tests existentes de añadir/marcar siguen verdes (R4).
- [x] `npm run build` sin errores ni warnings de budget.
- [x] `grep -rn "editingIndex\|renameSubtask\|endEdit\|subtask-edit\|Editar subtarea" src --exclude=*.spec.ts` sin resultados (en `task-form.spec.ts` solo el test de ausencia de R2).
- [x] Playwright `/demo#task-form`: «Editando con subtareas» muestra solo X por fila; X quita la subtarea; añadir sigue funcionando; layout fila sin hueco extra (R5).
- [x] Demo `/demo` revisada (sin cambios de plantilla necesarios).
- [x] `TODO.md`: ítem SPEC 80 marcado. Copy en español, sin emojis.

## Decisions

- **Sí:** para cambiar una subtarea, quitar y crear otra (usuario).
- **Sí:** mantener etiqueta «Quitar subtarea: <título>» (usuario): quitar es local al formulario hasta «Guardar cambios».
- **Sí:** sin gestión de foco tras quitar (usuario), igual que hoy.
- **No:** dejar código de edición sin usar «por si acaso» (YAGNI).
- **No:** reabrir SPEC 70: queda como histórico; este spec revierte su R7/R8.

## Risks

- Quitar por error sin deshacer: mitigado porque nada se persiste hasta «Guardar cambios» (Cancelar descarta).

## What is not in this spec

Copy nuevo, foco tras quitar, confirmación/deshacer, reordenar subtareas, cambios en TaskItem o DS.
