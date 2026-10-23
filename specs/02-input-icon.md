# SPEC 02 — Componentes Icon e Input

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-10-22
> **Nota:** `app-input` reemplazado por `app-text-field`, `app-textarea`, `app-select`, `app-date-field` y `app-time-field` (SPEC 04).
> **Objective:** Crear `app-icon` y `app-input` (texto, búsqueda, fecha, hora, select y textarea) como componentes Angular tontos que reflejan el DS Agenda y se integran con Signal Forms.

## Scope

**In:**

- Bloques CSS literales del DS: `src/styles/blocks/icon.css` y `src/styles/blocks/field.css`, importados en `src/styles.css` (sin `layer()`: ya traen `@layer block`).
- `src/app/shared/icon/icon.ts` — componente `Icon`, selector `app-icon`.
- `src/app/shared/input/input.ts` + `input.html` — componente `InputField`, selector `app-input`, implementa `FormValueControl<string>`.
- Tests Vitest: `icon.spec.ts`, `input.spec.ts`.
- Marcar «Input + Icon» en `TODO.md`.

**Out of scope (para specs futuros):**

- Checkbox, Switch, SegmentedControl (formularios, nivel 2 de `TODO.md`).
- Input `state` (forzar hover/focus de vitrina) y `grow` (`data-grow`).
- Lectura automática de `errors()` de Signal Forms para el mensaje.
- Ruta o página demo.
- Composition (`.l-stack`…).

## Requisitos (EARS)

Icon:

- **R1.** El `app-icon` deberá renderizar `name` como texto de ligadura con clase `icon`.
- **R2.** Donde `size` sea `s`, `l` o `xl`, el `app-icon` deberá exponer `data-size` con ese valor; con `m` (por defecto) no deberá exponer `data-size`.
- **R3.** Donde `filled` sea `true`, el `app-icon` deberá exponer `data-filled`.
- **R4.** Donde haya `label`, el `app-icon` deberá exponer `role="img"` y `aria-label`; si no hay `label`, deberá exponer `aria-hidden="true"`.

Input:

- **R5.** El `app-input` deberá ser el elemento `.field` y contener `label.field__label` asociado al control por `for`/`id`.
- **R6.** Donde no se pase `id`, el `app-input` deberá generar `app-input-N` con un contador de módulo.
- **R7.** Donde `type` sea `text` (por defecto), `search`, `date` o `time`, el `app-input` deberá renderizar `<input class="input__control">` con ese `type`.
- **R8.** Donde haya `options` (`{ value, label }[]`), el `app-input` deberá renderizar `<select>` con una `<option>` por elemento, `data-select` en `.input` y el ícono `expand_more` al final.
- **R9.** Donde `multiline` sea `true`, el `app-input` deberá renderizar `<textarea>` con `rows` (por defecto 3) y `data-multiline` en `.input`.
- **R10.** Donde haya `icon` y no sea `multiline`, el `app-input` deberá mostrar un `app-icon` antes del control.
- **R11.** Donde haya `hint` o `error`, el `app-input` deberá renderizar `.field__hint` con id `<id>-hint` y referenciarlo desde el control con `aria-describedby`.
- **R12.** Mientras `error` no esté vacío, el `app-input` deberá exponer `data-invalid` en `.field` y en `.input`, `aria-invalid="true"` en el control, el ícono `error_outline` (`s`) y el texto de `error` en lugar de `hint`.
- **R13.** Mientras `disabled` sea `true`, el `app-input` deberá deshabilitar el control y exponer `data-disabled` en `.input`.
- **R14.** Cuando el usuario escriba o elija una opción, el `app-input` deberá actualizar el modelo `value`.
- **R15.** Cuando el control pierda el foco, el `app-input` deberá poner `touched` en `true`.
- **R16.** Donde se enlace con `[formField]` de Signal Forms, el `app-input` deberá reflejar `value` y `disabled` del campo en ambos sentidos.
- **R17.** El `app-input` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `field.css` e `icon.css`.

## Data model

```ts
// src/app/shared/icon/icon.ts
type IconSize = 's' | 'm' | 'l' | 'xl';
// inputs: name (required) · size: IconSize = 'm' · filled = false · label?: string

// src/app/shared/input/input.ts
type InputType = 'text' | 'search' | 'date' | 'time';
interface InputOption { value: string; label: string; }
// class InputField implements FormValueControl<string>
// model:  value = '' · touched = false
// inputs: label (required) · id? · name? · type: InputType = 'text' · placeholder?
//         icon? · options?: InputOption[] · multiline = false · rows = 3
//         hint? · error? · disabled = false
```

## Implementation plan

1. Copiar literal `icon.css` y `field.css` del DS a `src/styles/blocks/`. Añadir sus `@import` en `src/styles.css` tras los de reset/context. `npm run build` sin errores.
2. Crear `Icon` (R1–R4) con host `span.icon` vía `host` bindings. `icon.spec.ts` cubre R1–R4.
3. Crear `InputField` con `input.html`: host `.field`, label, `<input>` de texto, id generado, `value`/`touched` (R5–R7, R14, R15, R17). Tests de esos requisitos.
4. Añadir variantes `select`, `textarea` e ícono inicial (R8–R10). Tests.
5. Añadir hint, error, disabled y `aria-*` (R11–R13). Tests.
6. Test con Signal Forms: host de prueba con `form()` + `[formField]` (R16). Marcar el ítem en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [ ] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R16.
- [ ] `npm run build` termina sin errores ni warnings de budget.
- [ ] `src/styles/blocks/icon.css` y `field.css` son idénticos a los del DS (`diff` vacío).
- [ ] Ningún archivo de `src/app/shared/` declara `styles` ni `styleUrl` (R17).
- [ ] Enlazado con `[formField]`, escribir en el control actualiza el campo, y `disabled` del campo deshabilita el control (R16).
- [ ] Dos `app-input` sin `id` en la misma vista tienen ids distintos y cada `label` apunta a su control (R5, R6).
- [ ] Copy y nombres accesibles por defecto en español; sin emojis.

## Decisions

- **Sí:** `src/app/shared/<comp>/<comp>.ts`. UI genérica sin dominio va en `shared/` (front-guidelines); archivos sin sufijo, como `app.ts`.
- **Sí:** clases `Icon` e `InputField`. `Input` choca con el decorador `Input` de `@angular/core`.
- **Sí:** Signal Forms con `FormValueControl<string>`. **No:** `ControlValueAccessor`.
- **Sí:** el mensaje de error llega por el input `error` (string), como en el DS. **No:** derivarlo de `errors()`; acopla el componente a los mensajes de los validadores.
- **Sí:** el host es `.field` (host binding). Sin div extra; los selectores `.field[data-invalid] > .field__hint` funcionan tal cual.
- **Sí:** CSS del DS copiado literal, `[data-force]` incluido. Se puede resincronizar con `diff`. El selector queda sin uso.
- **Sí:** `id` opcional con contador por defecto. **No:** slug del label como en el DS, que colisiona cuando se repite un label.
- **Sí:** `size` de Icon como `'s' | 'm' | 'l' | 'xl'` (README y `icon.css`). **No:** `number`, aunque lo diga `api/components/Icon.md`.
- **No:** input `state` ni ruta demo. Se verifica solo con Vitest.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| La API de Signal Forms (experimental en 21) cambia | Solo se usa `FormValueControl` y `[formField]`; el test R16 lo detecta. |
| El contador de ids difiere entre SSR y el cliente | Los componentes se crean en el mismo orden en ambos; si la hidratación avisa de un desajuste, pasar `id` explícito. |

## What is **not** in this spec

- Checkbox, Switch, SegmentedControl.
- `state`, `grow`, errores automáticos desde Signal Forms.
- Página demo.

Cada uno, si llega, va en su propio spec.
