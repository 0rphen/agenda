# SPEC 21 — Componente SegmentedControl

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 05, SPEC 15
> **Date:** 2026-10-23
> **Objective:** Crear `app-segmented-control` como control tonto que refleja el SegmentedControl del DS Agenda (`role="group"` con botones `aria-pressed` en una pista de píldora), integrado en Signal Forms como `FormValueControl<string>`.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/segmented.css`: copia literal del DS (`project/assets/Code/styles/blocks/segmented.css`), sin reglas propias. Importado en `src/styles.css` tras `switch.css`.
- `src/app/shared/segmented-control/segmented-control.ts` — componente `SegmentedControl`, selector `app-segmented-control`, template externo `segmented-control.html`, y tipo exportado `SegmentedOption`.
- Test Vitest: `segmented-control.spec.ts` (incluye integración `[formField]`).
- `src/app/demo/demo-page.html` + `demo-page.ts`: sección SegmentedControl y campo `priority` en el form demo.
- Marcar «SegmentedControl» en `TODO.md`.

**Out of scope:**

- `role="radiogroup"` y navegación con flechas (tabindex itinerante).
- Opciones como cadenas sueltas (`string[]`).
- Etiqueta visible, `hint`, `error`, `required`, `data-invalid` (host no es `.field`).
- Seleccionar la primera opción por defecto.
- Prop `state` / `data-force` (solo vitrinas del DS).
- Input `name` (los botones no envían valor en un `<form>` nativo).
- Íconos dentro de las opciones.
- SettingRow y TaskForm (usan este componente en sus specs).

## Requisitos (EARS)

- **R1.** El `app-segmented-control` deberá tener en el host `class="segmented"`, `role="group"` y `aria-label` = input `label` (obligatorio).
- **R2.** El `app-segmented-control` deberá renderizar, por cada elemento de `options` y en su orden, un `<button type="button" class="segmented__option">` con el texto `label` de la opción.
- **R3.** El botón cuya opción tenga `value` igual al model `value` deberá exponer `aria-pressed="true"`; el resto, `aria-pressed="false"`.
- **R4.** Si `value` no coincide con ninguna opción (o está vacío), entonces ningún botón deberá exponer `aria-pressed="true"` y el `app-segmented-control` no deberá escribir en `value`.
- **R5.** Cuando el usuario activa un botón (clic, `Espacio` o `Enter`), el `app-segmented-control` deberá poner el model `value` al `value` de esa opción.
- **R6.** Donde una opción tenga `disabled: true`, su botón deberá tener `disabled` nativo y su activación no deberá cambiar `value`.
- **R7.** Mientras el input `disabled` sea `true`, todos los botones deberán tener `disabled` nativo.
- **R8.** Donde `disabled` se pase como atributo suelto (`<app-segmented-control disabled />`), el `app-segmented-control` deberá tratarlo como `true` (`booleanAttribute`).
- **R9.** Cuando el foco sale del host hacia un elemento que no está dentro del host, el `app-segmented-control` deberá poner `touched` a `true`; si el foco pasa a otro botón del mismo grupo, no deberá cambiarlo.
- **R10.** Cuando se enlaza con `[formField]` a un campo `string`, el `app-segmented-control` deberá sincronizar `value`, `touched` y `disabled` con el campo.
- **R11.** El `app-segmented-control` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `segmented.css`.

## Data model

```ts
// src/app/shared/segmented-control/segmented-control.ts
export interface SegmentedOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export class SegmentedControl implements FormValueControl<string> {
  // models: value = model('') · touched = model(false)
  // inputs: label = input.required<string>() · options = input.required<SegmentedOption[]>()
  //         disabled = false (transform booleanAttribute)
  // host: class 'segmented', role 'group', [attr.aria-label]="label()", (focusout)
}
```

```ts
// src/app/demo/demo-page.ts — modelo del form demo
priority: string; // valor inicial 'media', sin validadores
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `segmented.css` del DS a `src/styles/blocks/` sin cambios. `@import` en `src/styles.css` tras `switch.css`. `npm run build` sin errores (R11).
2. `segmented-control.spec.ts` con helper `render()` y host de test (como `switch.spec.ts`): un test por R1–R10 (`form()` + `[formField]`: clic actualiza el modelo, focusout fuera marca touched, focus a otro botón no, `disabled()` del form pone `disabled` en todos los botones). Fallan.
3. Crear `SegmentedControl` (`templateUrl: './segmented-control.html'`, host `class`/`role`/`aria-label`, `(focusout)` que compara `relatedTarget` con el host vía `ElementRef`). Template: `@for (option of options(); track option.value)` `<button type="button" class="segmented__option" [attr.aria-pressed]="option.value === value()" [disabled]="disabled() || !!option.disabled" (click)="value.set(option.value)">{{ option.label }}</button>`. Tests en verde.
4. Demo: campo `priority: string` (inicial `'media'`) en el modelo del form demo. Sección `segmented-control` en `demo-page.html` (tras Switch) y entrada en `sections` de `demo-page.ts`: «Vista» con Hoy · Esta semana · Próxima semana; «Vista» con Día · Semana · Mes · Año (Año `disabled`); grupo `disabled`; y «Prioridad» con Baja · Media · Alta enlazado a `priority` con el valor actual mostrado al lado.
5. Playwright en `/demo`: clic selecciona y cambia `aria-pressed`, Tab recorre opciones habilitadas, `Espacio` selecciona, foco visible, opción disabled no seleccionable, con `dir="rtl"` el orden se invierte, consola limpia.
6. Marcar «SegmentedControl» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R10.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/segmented.css` y el del DS no muestra diferencias.
- [x] `src/app/shared/segmented-control/` no declara `styles` ni `styleUrl` (R11).
- [x] `<app-segmented-control label="Vista" [options]="…" value="sem" />` renderiza host `.segmented` con `role="group"` y `aria-label="Vista"`, un `<button type="button" class="segmented__option">` por opción, y solo «Esta semana» con `aria-pressed="true"` (R1–R3).
- [x] Con `value=""`, ningún botón tiene `aria-pressed="true"` y `value` sigue vacío (R4).
- [x] Clic en «Hoy» pone `value` = `'hoy'` y `aria-pressed="true"` pasa a ese botón (R5).
- [x] Opción `disabled: true` tiene `disabled` nativo; clic no cambia `value` (R6).
- [x] `<app-segmented-control disabled />` (atributo suelto) deshabilita todos los botones (R7, R8).
- [x] Con `[formField]`: clic actualiza el campo, Tab fuera del grupo marca `touched`, Tab entre opciones no (R9, R10).
- [x] `/demo` muestra la sección SegmentedControl (tres opciones, opción disabled, grupo disabled, «Prioridad» enlazado) y aparece en el índice.
- [x] Ítem «SegmentedControl» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** `FormValueControl<string>` (`value` model + `touched`, `disabled`): TaskForm lo usa para la prioridad; mismo patrón que los Field. **No:** solo model sin contrato.
- **Sí:** `role="group"` + `<button aria-pressed>` como el bundle DS; el CSS ya estiliza `[aria-pressed='true']`. Tab recorre opciones, sin JS de teclado. **No:** `radiogroup` con flechas (más código, se desvía del CSS).
- **Sí:** host = `.segmented` con `aria-label` = `label` obligatorio. **No:** host `.field` con `hint`/`error`/`required`: un selector de vista casi siempre tiene valor.
- **Sí:** sin valor coincidente, ninguna marcada y sin escribir el model. **No:** marcar la primera como el DS (efecto oculto sobre el model).
- **Sí:** `options` solo objetos `SegmentedOption`. **No:** cadenas sueltas (dos caminos para lo mismo).
- **Sí:** `touched` al salir el foco del grupo entero (`focusout` + `relatedTarget`). **No:** blur por botón (marcaría al moverse con Tab dentro).
- **Sí:** CSS copiado literal; las reglas `data-force` quedan inertes. Flex + logical properties ya cubren RTL.
- **Sí:** campo `priority` en el form demo para probar `[formField]` en vivo.
- **No:** `name`, íconos en opciones, `state`/`data-force`.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `relatedTarget` es `null` al hacer clic fuera en algunos navegadores (Safari no enfoca botones al clic) | `null` cuenta como «fuera»: marca `touched`. Aceptable. |
| Safari no da foco al botón al hacer clic, así que `focusout` no se dispara tras clic solo | `touched` se marca al salir con teclado o al enfocar otro control; aceptable para un control que siempre tiene valor. |
| Opciones con `value` duplicado rompen `track option.value` | Contrato del consumidor; no se valida. |

## What is **not** in this spec

- `radiogroup`/flechas; opciones `string`; etiqueta visible, `hint`, `error`, `required`; primera opción por defecto; `state`/`data-force`; `name`; íconos; SettingRow; TaskForm.
