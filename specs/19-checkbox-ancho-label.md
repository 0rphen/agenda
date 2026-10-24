# SPEC 19 — Ancho del label de Checkbox

> **Status:** Implemented
> **Depends on:** SPEC 18
> **Date:** 2026-10-23
> **Objective:** Hacer que `label.check` ocupe solo el ancho de su contenido dentro del host `.field`, para que la zona de clic de una casilla sola no abarque toda la fila.

## Why

- El host `app-checkbox` es `.field`: `display: flex; flex-direction: column` con `align-items` por defecto (`stretch`).
- `label.check` es `inline-flex`, pero como hijo flex se blockifica y se estira a todo el ancho de `.field`.
- Resultado: clic en el hueco vacío a la derecha del texto alterna la casilla (riesgo anotado en SPEC 18).

## Scope

**In:**

- `src/styles/blocks/check.css`: `align-self: start;` en la regla `.check` (regla copiada del DS; desviación documentada con comentario de una línea).
- Marcar el ítem en `TODO.md`.

**Out of scope:**

- `src/styles/blocks/field.css` y `.field__hint`.
- Template, TS y tests Vitest de `app-checkbox` (jsdom no calcula layout).
- Cambios en `src/app/demo/demo-page.html`: ya hay casillas solas («Recordarme» con `hint`, «Acepto las condiciones» con `error`).
- Switch, TaskItem.

## Requisitos (EARS)

- **R1.** El `label.check` dentro de `app-checkbox` deberá medir en inline el ancho de su contenido (caja + gap + texto), no el de `.field`.
- **R2.** Cuando el usuario hace clic dentro de `.field` fuera del `label.check` (a la derecha del texto), el `app-checkbox` no deberá alternar `checked`.
- **R3.** Cuando el usuario hace clic en la caja o en el texto, el `app-checkbox` deberá seguir alternando `checked` (R5 de SPEC 18).
- **R4.** El `.field__hint` deberá seguir ocupando todo el ancho de `.field` y envolver el texto igual que hoy.
- **R5.** El `label.check` deberá mantener `min-block-size: var(--touch-target)` y alinearse al inicio lógico de `.field`, también con `dir="rtl"`.
- **R6.** Mientras `app-checkbox` esté en una fila flex (`.demo__row`), su aspecto deberá ser igual que hoy.
- **R7.** El CSS añadido deberá usar solo propiedades lógicas, sin `px` ni valores literales (`css-guidelines`).

## Data model

Sin datos nuevos. Sin cambios de inputs, DOM ni atributos.

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Captura Playwright «antes» de `#checkbox` en `/demo`.
2. `check.css`: añadir `align-self: start;` en `.check` con comentario de una línea (el host `.field` es flex column y lo estiraría) (R1, R5, R7).
3. Playwright en `/demo`: ancho de `label.check` de «Recordarme» menor que el de su `.field`; ancho de `.field__hint` igual al de `.field`; clic en una coordenada a la derecha del label no alterna; clic en el texto alterna; captura de `.demo__row` igual a la de antes; con `dir="rtl"` en `<html>` el label queda a la derecha; consola limpia (R1–R6).
4. Marcar el ítem en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] En `/demo`, `label.check` de «Recordarme» y de «Acepto las condiciones» es más estrecho que su `.field` (R1).
- [x] Clic a la derecha del texto de «Recordarme», dentro de `.field`, no cambia `checked` (R2).
- [x] Clic en la caja y en el texto alternan `checked` (R3).
- [x] `.field__hint` mide lo mismo que su `.field` (R4).
- [x] `label.check` mide al menos `--touch-target` en bloque; con `dir="rtl"` se alinea a la derecha (R5).
- [x] Captura de `.demo__row` de Checkbox sin diferencias antes/después (R6).
- [x] La línea añadida usa solo propiedades lógicas, sin `px` (R7).
- [x] `diff` entre `src/styles/blocks/check.css` y el del DS solo muestra las reglas propias de SPEC 18 + `align-self: start`.
- [x] Demo sin cambios: casos de casilla sola ya presentes en la sección Checkbox.
- [x] Ítem marcado en `TODO.md`.
- [x] `npm test -- --watch=false` y `npm run build` en verde.

## Decisions

- **Sí:** `align-self: start` en `.check`. Una línea; el label se ajusta en cualquier contenedor flex column. Desviación del DS documentada con comentario.
- **No:** `.field:has(> .check) { align-items: start; }` en `field.css`: encogería también `.field__hint`.
- **No:** regla propia `.field > .check` aparte: descartada a favor de tocar `.check` directamente.
- **No:** test Vitest: jsdom no calcula layout; verificación con Playwright.
- **No:** cambios en la demo: los casos ya están.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Resincronizar `check.css` desde el DS borra la línea | Comentario en la regla + criterio de `diff`. |
| En un contenedor grid futuro (p. ej. TaskItem), `align-self: start` actúa en el eje de bloque y desalinea en vertical | Revisar en el spec de TaskItem; sobrescribir allí si hace falta. |

## What is **not** in this spec

- `field.css`, `.field__hint`, Switch, TaskItem, tests Vitest, demo.
