# SPEC 20 — Componente Switch

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 02, SPEC 05, SPEC 15, SPEC 16, SPEC 18, SPEC 19
> **Date:** 2026-10-23
> **Objective:** Crear `app-switch` como control tonto que refleja el Switch del DS Agenda (`<label class="switch">` con input `role="switch"` oculto, pista y texto), integrado en Signal Forms como `FormCheckboxControl`, con la misma API que `app-checkbox` salvo `indeterminate`.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/switch.css`: copia del DS (`project/assets/Code/styles/blocks/switch.css`) + reglas propias:
  - `align-self: start;` en `.switch` (lección de SPEC 19).
  - RTL: `.switch__input:checked:dir(rtl) + .switch__track::after` con la traslación en negativo.
  - Inválido: `.field[data-invalid] .switch__input:not(:checked) + .switch__track` con fondo `--color-danger`, y su hover derivado con OKLCH + `--l-step-hover`.
- Importado en `src/styles.css` tras `check.css`.
- `src/app/shared/switch/switch.ts` — componente `Switch`, selector `app-switch`, template externo `switch.html`.
- Test Vitest: `switch.spec.ts` (incluye integración `[formField]` + `required`).
- `src/app/demo/demo-page.html` + `demo-page.ts`: sección Switch y campo `notify` en el form demo.
- Marcar «Switch» en `TODO.md`.

**Out of scope:**

- `indeterminate` (un interruptor no tiene estado mixto).
- Prop `state` / `data-force` (solo vitrinas del DS).
- Texto «Sí/No» o ícono dentro de la pista.
- Mensaje específico de `required` para interruptores en `fieldError`.
- SettingRow y EventForm (usan este componente en sus specs).
- Extraer una base común con `Checkbox`.

## Requisitos (EARS)

- **R1.** El `app-switch` deberá tener `class="field"` en el host y renderizar dentro un `<label class="switch">` con, en orden, `<input type="checkbox" role="switch" class="switch__input u-visually-hidden">`, `<span class="switch__track">` vacío, y —donde haya `label`— un `<span>` con el texto.
- **R2.** El `<input>` deberá exponer `id` = input `id` (por defecto único `app-switch-N`) y el host no deberá exponer `id`.
- **R3.** Donde no haya `label` y haya `ariaLabel`, el `<input>` deberá exponer `aria-label` = `ariaLabel`; donde haya `label`, no deberá exponerlo.
- **R4.** El `<input>` deberá reflejar `checked` en su propiedad `checked`.
- **R5.** Cuando el usuario alterna el `<input>` (clic en pista o texto, o `Espacio`), el `app-switch` deberá actualizar el model `checked` con el nuevo estado.
- **R6.** Cuando el `<input>` pierde el foco, el `app-switch` deberá poner `touched` a `true`.
- **R7.** Mientras `disabled` sea `true`, el `<input>` deberá tener `disabled` nativo y el `<label>` deberá exponer `data-disabled` vacío.
- **R8.** Donde `name` no esté vacío, el `<input>` deberá exponer `name`.
- **R9.** Mientras `required` sea `true`, el `<input>` deberá tener `required` nativo.
- **R10.** Donde `disabled` o `required` se pasen como atributo suelto (`<app-switch disabled />`), el `app-switch` deberá tratarlos como `true` (`booleanAttribute`).
- **R11.** Donde haya `hint` o `error`, el `app-switch` deberá renderizar tras el `<label>` un `<div class="field__hint" id="{id}-hint">` y el `<input>` deberá exponer `aria-describedby` con ese id; si no hay ninguno, ni el div ni `aria-describedby`.
- **R12.** Donde haya `error`, el host deberá exponer `data-invalid` vacío, el `<input>` `aria-invalid="true"`, y `.field__hint` deberá mostrar `app-icon` `error_outline` `size="s"` + el texto de `error` (que tiene prioridad sobre `hint`).
- **R13.** Mientras el host tenga `data-invalid` y el switch esté apagado, `.switch__track` deberá tener fondo `--color-danger`; en hover, ese color con el paso `l-step-hover` en OKLCH.
- **R14.** Cuando se enlaza con `[formField]` a un campo `boolean`, el `app-switch` deberá sincronizar `checked`, `touched`, `disabled`, `required` y `name` con el campo.
- **R15.** Mientras `dir="rtl"`, el pulgar del switch encendido deberá quedar en el extremo inline-end (izquierda) de la pista.
- **R16.** El `label.switch` deberá medir en inline el ancho de su contenido, no el de `.field`.
- **R17.** El `app-switch` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `switch.css` y `field.css`.

## Data model

```ts
// src/app/shared/switch/switch.ts
export class Switch implements FormCheckboxControl {
  // models: checked = model(false) · touched = model(false)
  // inputs: label?: string · ariaLabel?: string · id = `app-switch-${nextId++}` · name = ''
  //         hint?: string · error?: string
  //         disabled = false · required = false (ambos con transform booleanAttribute)
  // computed hintId: `${id}-hint` | null (como Checkbox)
  // imports: Icon (solo para error_outline)
}
```

```ts
// src/app/demo/demo-page.ts — modelo del form demo
notify: boolean; // valor inicial false, required(path.notify)
```

Sin `value` (lo prohíbe `FormCheckboxControl`). `checked` es `model()` sin transform: se enlaza con `[checked]="true"`.

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `switch.css` del DS a `src/styles/blocks/`. Añadir las tres reglas propias (alineación, RTL, inválido + hover), cada una con comentario de una línea. `@import` en `src/styles.css` tras `check.css`. `npm run build` sin errores (R13, R15, R16, R17).
2. `switch.spec.ts` con helper `render()` y host de test (como `checkbox.spec.ts`): un test por R1–R12 y R14 (`form()` con `required(path.on)` + `[formField]`: clic actualiza el modelo, blur marca touched, `disabled()` del form pone `disabled` nativo). Fallan.
3. Crear `Switch` (`templateUrl: './switch.html'`, import `Icon`, host `class: 'field'`, `[attr.id]: null`, `[attr.data-invalid]`). Template como `checkbox.html` sin `indeterminate`: `<label class="switch">` + `<input #control type="checkbox" role="switch" class="switch__input u-visually-hidden" … (change)="checked.set(control.checked)" (blur)="touched.set(true)">` + `<span class="switch__track"></span>` + `@if (label())` `<span>`; `@if (hintId())` `.field__hint`. Tests en verde.
4. Demo: campo `notify: boolean` en el modelo del form demo con `required(path.notify)`. Sección `switch` en `demo-page.html` (tras Checkbox) y entrada en `sections` de `demo-page.ts`: apagado, encendido, disabled apagado/encendido, con `hint`, sin texto con `ariaLabel`; y «Recibir avisos» enlazado a `notify` con `[error]="fieldError(...)"`.
5. Playwright en `/demo`: clic en texto alterna, `Espacio` alterna, foco visible, error tras blur con pista en peligro, ancho del label menor que `.field`, con `dir="rtl"` en `<html>` el pulgar encendido queda a la izquierda, consola limpia.
6. Marcar «Switch» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R12 y R14.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/switch.css` y el del DS solo muestra las reglas de alineación, RTL e inválido (R13, R15, R16).
- [x] `src/app/shared/switch/` no declara `styles` ni `styleUrl` (R17).
- [x] `<app-switch label="Todo el día" />` renderiza host `.field` sin `id`, `<label class="switch">` con input `role="switch"` oculto sin `aria-label`, `.switch__track` vacío y `<span>Todo el día</span>`; sin `.field__hint`.
- [x] `<app-switch ariaLabel="Avisos" />` no renderiza `<span>` de texto y el input tiene `aria-label`.
- [x] `<app-switch disabled />` (atributo suelto, R10) tiene `disabled` nativo y `data-disabled` en el label; clic no cambia `checked`.
- [x] Con `[formField]` + `required` y `[error]="fieldError(...)"`: tras blur apagado, host `data-invalid`, input `aria-invalid="true"` + `aria-describedby`, mensaje «Completa este campo» con `error_outline`, pista con fondo peligro (R13).
- [x] En `/demo`, `label.switch` es más estrecho que su `.field` (R16).
- [x] Con `dir="rtl"`, el pulgar del switch encendido queda en el lado izquierdo de la pista (R15).
- [x] `/demo` muestra la sección Switch (estados, disabled, hint, sin texto, error) y aparece en el índice.
- [x] Ítem «Switch» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** misma API que `Checkbox` menos `indeterminate` (`FormCheckboxControl`, host `.field`, `label`/`ariaLabel`, `id`, `name`, `hint`, `error`, `disabled`, `required`). Consistencia entre controles booleanos. **No:** API mínima del DS (sin `hint`/`name`): SettingRow y EventForm la necesitarían luego.
- **Sí:** `required` + `error` aunque un switch suele aplicar al instante: elección explícita del usuario.
- **Sí:** inválido = pista `--color-danger` apagada (+ hover OKLCH). La pista no tiene borde; palabra + ícono vienen de `.field__hint`. **No:** anillo `box-shadow` inset; **No:** sin cambio visual.
- **Sí:** `role="switch"` en el input (bundle DS): lectores anuncian «activado/desactivado».
- **Sí:** regla `:dir(rtl)` propia: el DS usa `translateX` físico. **No:** copiar tal cual ignorando RTL.
- **Sí:** `align-self: start` desde el inicio (SPEC 19). **No:** esperar a que moleste.
- **Sí:** campo `notify` nuevo en el form demo para el caso `required`. **No:** reusar `terms` (ya lo usa Checkbox).
- **No:** clase base común con `Checkbox`: dos componentes pequeños, duplicación aceptable.
- **No:** `indeterminate`, `state`/`data-force`, texto o ícono en la pista.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Resincronizar `switch.css` desde el DS borra las reglas propias | Comentario en cada regla + criterio de `diff`. |
| Especificidad: la regla inválida gana al hover del DS | Regla de hover inválido propia con OKLCH (R13); revisar en Playwright. |
| `:dir()` no soportado en navegadores antiguos | Soporte Baseline 2023; sin él, el pulgar queda como en el DS (degradación aceptable). |
| En contenedor grid futuro (SettingRow), `align-self: start` desalinea en vertical | Revisar en el spec de SettingRow; sobrescribir allí si hace falta. |

## What is **not** in this spec

- `indeterminate`; `state`/`data-force`; texto o ícono en la pista; copy específico en `fieldError`; SettingRow; EventForm; base común con Checkbox.
