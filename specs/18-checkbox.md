# SPEC 18 — Componente Checkbox

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 02, SPEC 05, SPEC 15, SPEC 16
> **Date:** 2026-10-23
> **Objective:** Crear `app-checkbox` como control tonto que refleja el Checkbox del DS Agenda (`<label class="check">` con input nativo oculto, caja con ícono y texto), integrado en Signal Forms como `FormCheckboxControl`, con `indeterminate`, `required`, `hint` y `error`.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/check.css`: copia del DS (`project/assets/Code/styles/blocks/check.css`) + reglas propias: `indeterminate` (igual que marcado, también en hover y disabled) e inválido (`.field[data-invalid] .check__box` con borde `--color-danger`). Importado en `src/styles.css` tras `icon-button.css`.
- `src/app/shared/checkbox/checkbox.ts` — componente `Checkbox`, selector `app-checkbox`, template externo `checkbox.html`.
- Test Vitest: `checkbox.spec.ts` (incluye integración `[formField]` + `required`).
- `src/app/demo/demo-page.html` + `demo-page.ts`: sección Checkbox.
- Marcar «Checkbox» en `TODO.md`.

**Out of scope:**

- Switch: su propio spec (comparte patrón, no bloque).
- Prop `state` / `data-force` (solo vitrinas del DS).
- Grupo de casillas (`fieldset`/`legend`) y «seleccionar todo» que gestione `indeterminate` automáticamente.
- Mensaje específico de `required` para casillas en `fieldError`.
- TaskItem (usa este componente en su spec).

## Requisitos (EARS)

- **R1.** El `app-checkbox` deberá tener `class="field"` en el host y renderizar dentro un `<label class="check">` con, en orden, `<input type="checkbox" class="check__input u-visually-hidden">`, `<span class="check__box">` con un `app-icon` `size="s"`, y —donde haya `label`— un `<span>` con el texto.
- **R2.** El `<input>` deberá exponer `id` = input `id` (por defecto único `app-checkbox-N`) y el host no deberá exponer `id`.
- **R3.** Donde no haya `label` y haya `ariaLabel`, el `<input>` deberá exponer `aria-label` = `ariaLabel`; donde haya `label`, no deberá exponerlo.
- **R4.** El `<input>` deberá reflejar `checked` en su propiedad `checked`.
- **R5.** Cuando el usuario alterna el `<input>` (clic en caja o texto, o `Espacio`), el `app-checkbox` deberá actualizar el model `checked` con el nuevo estado y poner `indeterminate` a `false`.
- **R6.** Cuando el `<input>` pierde el foco, el `app-checkbox` deberá poner `touched` a `true`.
- **R7.** Mientras `indeterminate` sea `true`, el `<input>` deberá tener la propiedad `indeterminate` a `true` y la caja deberá mostrar `app-icon` `remove`; si no, `check`.
- **R8.** Mientras `indeterminate` sea `true`, `.check__box` deberá verse como marcado (fondo `--color-brand`, ícono `--color-on-brand`), también en hover (paso `l-step-hover`) y en disabled (como marcado disabled).
- **R9.** Mientras `disabled` sea `true`, el `<input>` deberá tener `disabled` nativo y el `<label>` deberá exponer `data-disabled` vacío.
- **R10.** Donde `name` no esté vacío, el `<input>` deberá exponer `name`.
- **R11.** Mientras `required` sea `true`, el `<input>` deberá tener `required` nativo.
- **R17.** Donde `disabled` o `required` se pasen como atributo suelto (`<app-checkbox disabled />`), el `app-checkbox` deberá tratarlos como `true` (`booleanAttribute`).
- **R12.** Donde haya `hint` o `error`, el `app-checkbox` deberá renderizar tras el `<label>` un `<div class="field__hint" id="{id}-hint">` y el `<input>` deberá exponer `aria-describedby` con ese id; si no hay ninguno, ni el div ni `aria-describedby`.
- **R13.** Donde haya `error`, el host deberá exponer `data-invalid` vacío, el `<input>` `aria-invalid="true"`, y `.field__hint` deberá mostrar `app-icon` `error_outline` `size="s"` + el texto de `error` (que tiene prioridad sobre `hint`).
- **R14.** Mientras el host tenga `data-invalid`, `.check__box` deberá tener borde `--color-danger` (sin marcar y sin hover).
- **R15.** Cuando se enlaza con `[formField]` a un campo `boolean`, el `app-checkbox` deberá sincronizar `checked`, `touched`, `disabled`, `required` y `name` con el campo.
- **R16.** El `app-checkbox` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `check.css` y `field.css`.

## Data model

```ts
// src/app/shared/checkbox/checkbox.ts
export class Checkbox implements FormCheckboxControl {
  // models: checked = model(false) · touched = model(false) · indeterminate = model(false)
  // inputs: label?: string · ariaLabel?: string · id = `app-checkbox-${nextId++}` · name = ''
  //         hint?: string · error?: string
  //         disabled = false · required = false (ambos con transform booleanAttribute)
  // computed hintId: `${id}-hint` | null (como TextField)
  // imports: Icon
}
```

Sin `value` (lo prohíbe `FormCheckboxControl`). `checked` e `indeterminate` son `model()` y no admiten transform: se enlazan con `[checked]="true"`/`[indeterminate]="true"`; `disabled` y `required` aceptan atributo suelto. `error` es `string` alimentado por `fieldError()` (SPEC 05), igual que los Field.

## Implementation plan

1. Copiar `check.css` del DS a `src/styles/blocks/`. Añadir: `.check__input:indeterminate + .check__box` con las mismas declaraciones que `:checked` (normal, hover, disabled) y `.field[data-invalid] .check__input:not(:checked, :indeterminate) + .check__box { border-color: var(--color-danger); }`. `@import` en `src/styles.css` tras `icon-button.css`. `npm run build` sin errores (R8, R14, R16).
2. `checkbox.spec.ts` con helper `render()` y host de test (como `text-field.spec.ts`): un test por R1–R13, R15 y R17 (`form()` con `required(path.ok)` + `[formField]`: clic actualiza el modelo, blur marca touched, `disabled()` del form pone `disabled` nativo). Fallan.
3. Crear `Checkbox` (`templateUrl: './checkbox.html'`, import `Icon`, host `class: 'field'`, `[attr.id]: null`, `[attr.data-invalid]`). Template: `<label class="check" [attr.data-disabled]>` + `<input #control type="checkbox" class="check__input u-visually-hidden" [id] [checked] [indeterminate] [disabled] [required] [attr.name] [attr.aria-label] [attr.aria-invalid] [attr.aria-describedby] (change)="checked.set(control.checked); indeterminate.set(false)" (blur)="touched.set(true)">` + `<span class="check__box"><app-icon [name]="indeterminate() ? 'remove' : 'check'" size="s" /></span>` + `@if (label())` `<span>`; `@if (hintId())` `.field__hint` como `text-field.html`. Tests en verde.
4. Demo: sección `checkbox` en `demo-page.html` (tras IconButton) y entrada en `sections` de `demo-page.ts`: sin marcar, marcado, indeterminate, disabled (sin marcar/marcado), con `hint`, sin texto con `ariaLabel`; y una casilla «Acepto las condiciones» enlazada al form demo con `required` + `[error]="fieldError(...)"`.
5. Playwright en `/demo`: clic en texto alterna, `Espacio` alterna, foco visible, indeterminate pasa a marcado al clic, error tras blur, consola limpia.
6. Marcar «Checkbox» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [ ] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R13, R15 y R17.
- [ ] `npm run build` termina sin errores ni warnings de budget.
- [ ] `diff` entre `src/styles/blocks/check.css` y el del DS solo muestra las reglas `indeterminate` e inválido (R8, R14).
- [ ] `src/app/shared/checkbox/` no declara `styles` ni `styleUrl` (R16).
- [ ] `<app-checkbox label="Recordarme" />` renderiza host `.field` sin `id`, `<label class="check">` con input oculto sin `aria-label`, `.check__box` con `app-icon` `check` y `<span>Recordarme</span>`; sin `.field__hint`.
- [ ] `<app-checkbox ariaLabel="Marcar como hecha" />` no renderiza `<span>` de texto y el input tiene `aria-label`.
- [ ] `<app-checkbox [indeterminate]="true" label="Todas" />` muestra `remove` sobre fondo marca; tras clic, `checked` = `true`, `indeterminate` = `false`, ícono `check`.
- [ ] `<app-checkbox disabled />` (atributo suelto, R17) tiene `disabled` nativo y `data-disabled` en el label; clic no cambia `checked`.
- [ ] Con `[formField]` + `required` y `[error]="fieldError(...)"`: tras blur sin marcar, host `data-invalid`, input `aria-invalid="true"` + `aria-describedby`, mensaje «Completa este campo» con `error_outline`, caja con borde peligro.
- [ ] `/demo` muestra la sección Checkbox (estados, indeterminate, hint, sin texto, error) y aparece en el índice.
- [ ] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** `FormCheckboxControl` (`checked` model) para `[formField]`; paralelo a los Field con `FormValueControl`. **No:** solo input + output.
- **Sí:** `<label class="check">` interno (bundle): clic en el texto alterna sin JS. Host = `.field` para reusar `.field__hint` y `data-invalid`. **No:** host = `.check`.
- **Sí:** `label` opcional + `ariaLabel` (README DS: «`label` o `aria-label`»); TaskItem lo necesita.
- **Sí:** `indeterminate` como `model` (el clic nativo lo limpia; el model lo refleja). Visual: caja marcada + `remove`. Desviación del DS documentada.
- **Sí:** `hint`/`error` en `.field__hint` como TextField; `error` gana a `hint`. Regla de borde peligro propia en `check.css`.
- **Sí:** `required` nativo (Signal Forms lo enlaza). Copy genérico de `fieldError`; el consumidor puede pasar `message`. **No:** tocar `fieldError`.
- **Sí:** `name`, como TextField.
- **Sí:** `booleanAttribute` en `disabled` y `required` (como Button/IconButton). **No:** en `checked`/`indeterminate`: `model()` no admite transform; se usa `[x]="true"`.
- **No:** `state`/`data-force`, grupos/`fieldset`, «seleccionar todo» automático.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `required()` de Signal Forms podría no tratar `false` como vacío | Test R15 lo verifica; si falla, el consumidor usa `validate()` propio y se documenta en Decisions. |
| `[indeterminate]` en SSR: es propiedad, no atributo; el HTML prerenderizado no la refleja hasta hidratar | El ícono `remove` y la clase vienen del model, pero el fondo depende de `:indeterminate`; aceptable (parpadeo breve). Revisar en Playwright tras recarga. |
| Resincronizar `check.css` desde el DS borra las reglas propias | Criterio de `diff` documentado; demo cubre indeterminate e inválido. |
| Host `.field` (flex column) estira el `<label>` a todo el ancho y amplía la zona de clic | `.check` es `inline-flex`; revisar en demo, si estira añadir `align-items: start` en spec aparte. |

## What is **not** in this spec

- Switch; `state`/`data-force`; grupos/`fieldset`; «seleccionar todo»; copy específico en `fieldError`; TaskItem.
