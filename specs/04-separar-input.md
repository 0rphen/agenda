# SPEC 04 — Separar Input en componentes por tipo

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-10-23
> **Objective:** Reemplazar `app-input` por `app-text-field`, `app-textarea`, `app-select`, `app-date-field` y `app-time-field`, cada uno host `.field` e integrado con Signal Forms.

## Scope

**In:**

- `src/app/shared/text-field/text-field.ts` + `.html` + `.spec.ts` — clase `TextField`, selector `app-text-field`.
- `src/app/shared/textarea/textarea.ts` + `.html` + `.spec.ts` — clase `TextareaField`, selector `app-textarea`.
- `src/app/shared/select/select.ts` + `.html` + `.spec.ts` — clase `SelectField`, selector `app-select`.
- `src/app/shared/date-field/date-field.ts` + `.html` + `.spec.ts` — clase `DateField`, selector `app-date-field`.
- `src/app/shared/time-field/time-field.ts` + `.html` + `.spec.ts` — clase `TimeField`, selector `app-time-field`.
- Los cinco implementan `FormValueControl<string>`.
- Borrar `src/app/shared/input/` (`InputField` no tiene consumidores).
- Nota en el header de SPEC 02: Input reemplazado por SPEC 04.
- Marcar el ítem en `TODO.md`.

**Out of scope (para specs futuros):**

- Validadores, mensajes por defecto y `app-number-field` (SPEC 05).
- Radio y slider (no existen en el DS; ver `TODO.md`).
- Checkbox, Switch, SegmentedControl (TODO nivel 2).
- `state` (`data-force`) y `grow` (`data-grow`).
- Ruta o página demo.

## Requisitos (EARS)

Comunes a los cinco componentes (en adelante «el campo»):

- **R1.** El campo deberá ser el elemento `.field` (host binding) y contener `label.field__label` asociado al control por `for`/`id`; el host no deberá exponer `id`.
- **R2.** Donde no se pase `id`, el campo deberá generar `<selector>-N` con un contador de módulo propio (p. ej. `app-text-field-0`, `app-select-0`).
- **R3.** Donde haya `hint` o `error`, el campo deberá renderizar `.field__hint` con id `<id>-hint` y referenciarlo desde el control con `aria-describedby`.
- **R4.** Mientras `error` no esté vacío, el campo deberá exponer `data-invalid` en `.field` y en `.input`, `aria-invalid="true"` en el control, el ícono `error_outline` (`s`) y el texto de `error` en lugar de `hint`.
- **R5.** Mientras `disabled` sea `true`, el campo deberá deshabilitar el control y exponer `data-disabled` en `.input`.
- **R6.** Cuando el usuario escriba o elija un valor, el campo deberá actualizar el modelo `value`.
- **R7.** Cuando el control pierda el foco, el campo deberá poner `touched` en `true`.
- **R8.** Donde se enlace con `[formField]` de Signal Forms, el campo deberá reflejar `value` y `disabled` del campo en ambos sentidos.
- **R9.** El campo no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `field.css` e `icon.css`.
- **R10.** Donde haya `name`, el campo deberá exponerlo en el control; si no, no deberá exponer `name`.

TextField:

- **R11.** El `app-text-field` deberá renderizar `<input class="input__control">` con `type` `text` (por defecto), `search`, `email` o `tel`.
- **R12.** Donde haya `placeholder`, el `app-text-field` deberá exponerlo en el control.
- **R13.** Donde haya `icon`, el `app-text-field` deberá mostrar un `app-icon` antes del control.

TextareaField:

- **R14.** El `app-textarea` deberá renderizar `<textarea class="input__control">` con `rows` (por defecto 3) y `data-multiline` en `.input`.
- **R15.** Donde haya `placeholder`, el `app-textarea` deberá exponerlo en el control.
- **R16.** El `app-textarea` no deberá mostrar ícono.

SelectField:

- **R17.** El `app-select` deberá renderizar `<select class="input__control">` con una `<option>` por elemento de `options` (`{ value, label }[]`), marcando como `selected` la que coincide con `value`.
- **R18.** El `app-select` deberá exponer `data-select` en `.input` y el ícono `expand_more` después del control.
- **R19.** Donde haya `icon`, el `app-select` deberá mostrar un `app-icon` antes del control.

DateField:

- **R20.** El `app-date-field` deberá renderizar `<input type="date" class="input__control">` con valor en formato `YYYY-MM-DD`.
- **R21.** Donde haya `minDate` o `maxDate`, el `app-date-field` deberá exponerlos como atributos `min`/`max` del control.
- **R22.** Donde haya `icon`, el `app-date-field` deberá mostrar un `app-icon` antes del control.

TimeField:

- **R23.** El `app-time-field` deberá renderizar `<input type="time" class="input__control">` con valor en formato `HH:mm` (24 h).
- **R24.** Donde haya `minTime`, `maxTime` o `step`, el `app-time-field` deberá exponerlos como atributos `min`/`max`/`step` del control.
- **R25.** Donde haya `icon`, el `app-time-field` deberá mostrar un `app-icon` antes del control.

## Data model

```ts
// Comunes a los cinco (implements FormValueControl<string>)
// model:  value = '' · touched = false
// inputs: label (required) · id? (contador por defecto) · name? · hint? · error? · disabled = false

// src/app/shared/text-field/text-field.ts
type TextFieldType = 'text' | 'search' | 'email' | 'tel';
// inputs: type: TextFieldType = 'text' · placeholder? · icon?

// src/app/shared/textarea/textarea.ts
// inputs: rows = 3 · placeholder?

// src/app/shared/select/select.ts
export interface SelectOption { value: string; label: string; }
// inputs: options: SelectOption[] (required) · icon?

// src/app/shared/date-field/date-field.ts
// inputs: minDate?: string (YYYY-MM-DD) · maxDate?: string · icon?

// src/app/shared/time-field/time-field.ts
// inputs: minTime?: string (HH:mm) · maxTime?: string · step?: number (segundos) · icon?
```

`InputOption` pasa a llamarse `SelectOption` y vive en `select.ts`.

## Implementation plan

1. Crear `TextField` a partir de la rama `<input>` de `input.html`/`input.ts`: host `.field`, label, `.input`, ícono, hint/error, `value`/`touched`. `text-field.spec.ts` cubre R1–R13 (portar los tests de `input.spec.ts` que apliquen, incluido el de `[formField]`).
2. Crear `TextareaField` desde la rama `<textarea>`. Spec cubre R1–R10, R14–R16.
3. Crear `SelectField` desde la rama `<select>`. Spec cubre R1–R10, R17–R19.
4. Crear `DateField` y `TimeField` (rama `<input>` con `type` fijo + `minDate`/`maxDate`, `minTime`/`maxTime`/`step`). Specs cubren R1–R10, R20–R25.
5. Borrar `src/app/shared/input/`. Añadir nota en el header de SPEC 02. Marcar el ítem en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa; cada componente tiene al menos un test por cada requisito común R1–R10 y por cada uno de sus requisitos específicos (R11–R25).
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `src/app/shared/input/` no existe y `grep -r "app-input\|InputField" src` no devuelve nada.
- [x] `src/styles/blocks/field.css` no cambia (`git diff` vacío en ese archivo).
- [x] Ningún archivo nuevo de `src/app/shared/` declara `styles` ni `styleUrl` (R9).
- [x] Dos campos de distinto tipo sin `id` en la misma vista tienen ids distintos y cada `label` apunta a su control (R1, R2).
- [x] Enlazado con `[formField]`, escribir/elegir actualiza el campo y `disabled` del campo deshabilita el control, en los cinco (R8).
- [x] Copy y nombres accesibles por defecto en español; horas en 24 h; sin emojis.

## Decisions

- **Sí:** cinco componentes: texto, textarea, select, fecha, hora. **No:** mantener `app-input` como fachada; no tiene consumidores y duplicaría la API.
- **Sí:** label + hint + error duplicados en cada plantilla (~10 líneas). **No:** componente envoltorio `app-field` con `ng-content` ni clase base abstracta; añaden DOM o herencia por poco ahorro.
- **Sí:** convenciones de SPEC 02: `src/app/shared/<comp>/`, host = bloque `.field` vía `host` bindings, `FormValueControl`, `error` como string, contador de ids.
- **Sí:** clases con sufijo `Field` (`TextareaField`, `SelectField`) por consistencia y para no chocar con nombres del DOM.
- **Sí:** fecha y hora como string nativo (`YYYY-MM-DD`, `HH:mm`) con límites (y `step` en hora). **No:** `Date`; añade conversión y riesgos de zona horaria.
- **Sí:** límites como `minDate`/`maxDate` y `minTime`/`maxTime`. **No:** `min`/`max`; `FormUiControl` los reserva como `number` y `[formField]` los sobrescribe con sus validadores.
- **Sí:** `email` y `tel` en `app-text-field` solo cambian `type` (teclado móvil). **No:** validación aquí; llega en SPEC 05.
- **Sí:** `options` obligatorio en `app-select`.
- **No:** radio ni slider; el DS no los define. Para elegir 1 de pocas, SegmentedControl.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Las plantillas duplicadas divergen con el tiempo | Cada componente testea los requisitos comunes R1–R10. |
| La API de Signal Forms (experimental en 21) cambia | Solo se usa `FormValueControl` y `[formField]`; el test R8 lo detecta. |
| El contador de ids difiere entre SSR y el cliente | Igual que SPEC 02: pasar `id` explícito si la hidratación avisa. |

## What is **not** in this spec

- Validadores, mensajes, `app-number-field` (SPEC 05).
- Radio, slider, Checkbox, Switch, SegmentedControl.
- `state`, `grow`, página demo.

Cada uno, si llega, va en su propio spec.
