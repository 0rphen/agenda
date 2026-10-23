# SPEC 05 — Validaciones de texto y campo numérico

> **Status:** Implemented
> **Depends on:** SPEC 04
> **Date:** 2026-10-23
> **Objective:** Añadir validadores de Signal Forms para teléfono y DNI/NIE, mensajes de error por defecto en español con el helper `fieldError` y el componente `app-number-field`.

## Scope

**In:**

- `src/app/shared/validation/validators.ts` + `validators.spec.ts` — validadores `phone` y `dniNie`.
- `src/app/shared/validation/field-error.ts` + `field-error.spec.ts` — helper `fieldError` y mapa de mensajes por defecto.
- `src/app/shared/number-field/number-field.ts` + `.html` + `.spec.ts` — clase `NumberField`, selector `app-number-field`, `FormValueControl<number | null>`.
- Correo y rangos numéricos con los validadores nativos de Signal Forms (`email`, `min`, `max`, `required`); no se reescriben.
- Marcar el ítem en `TODO.md`.

**Out of scope:**

- Máscaras o autoformato mientras se escribe.
- Teléfonos o documentos de otros países (solo DNI/NIE español; teléfono laxo internacional).
- Validación asíncrona (p. ej. comprobar en servidor).
- Radio, slider.
- Ruta o página demo.

## Requisitos (EARS)

Validadores:

- **R1.** El validador `phone` deberá aceptar un `+` inicial opcional seguido solo de dígitos y espacios, con entre 7 y 15 dígitos en total.
- **R2.** Si el valor no cumple R1, entonces `phone` deberá producir un error `kind: 'phone'`.
- **R3.** El validador `dniNie` deberá aceptar DNI (`8 dígitos + letra`) y NIE (`X|Y|Z + 7 dígitos + letra`), sin distinguir mayúsculas e ignorando espacios al principio y al final.
- **R4.** El `dniNie` deberá comprobar la letra de control: `TRWAGMYFPDXBNJZSQVHLCKE[número % 23]`, con `X`, `Y`, `Z` sustituidos por `0`, `1`, `2` en el NIE.
- **R5.** Si el valor no cumple R3 o R4, entonces `dniNie` deberá producir un error `kind: 'dniNie'`.
- **R6.** Si el valor está vacío, entonces `phone` y `dniNie` no deberán producir error (lo cubre `required`).
- **R7.** Donde se pase `config.message`, `phone` y `dniNie` deberán usarlo como `message` del error.

Helper `fieldError`:

- **R8.** Mientras el campo no esté `touched` o no tenga errores, `fieldError(field)` deberá devolver `undefined`.
- **R9.** Mientras el campo esté `touched` y tenga errores, `fieldError(field)` deberá devolver el `message` del primer error.
- **R10.** Si el primer error no trae `message`, entonces `fieldError` deberá devolver el mensaje por defecto de su `kind`:
  - `required` — «Completa este campo»
  - `email` — «Escribe un correo válido, p. ej. nombre@dominio.es»
  - `min` — «Escribe un número igual o mayor que {min}»
  - `max` — «Escribe un número igual o menor que {max}»
  - `phone` — «Escribe un teléfono válido, p. ej. +34 600 123 456»
  - `dniNie` — «Escribe un DNI o NIE válido, p. ej. 12345678Z»
- **R11.** Si el `kind` no está en el mapa, entonces `fieldError` deberá devolver «Revisa este campo».

NumberField:

- **R12.** El `app-number-field` deberá cumplir los requisitos comunes R1–R10 de SPEC 04 (con prefijo de id `app-number-field-`).
- **R13.** El `app-number-field` deberá renderizar `<input type="number" inputmode="decimal" class="input__control">`.
- **R14.** Donde haya `min`, `max` o `step`, el `app-number-field` deberá exponerlos como atributos del control.
- **R15.** Cuando el usuario escriba un número, el `app-number-field` deberá actualizar `value` con ese `number`.
- **R16.** Si el control queda vacío o su valor no es numérico, entonces el `app-number-field` deberá poner `value` en `null`.
- **R17.** Mientras `value` sea `null`, el `app-number-field` deberá mostrar el control vacío.
- **R18.** Donde haya `icon` o `placeholder`, el `app-number-field` deberá mostrarlos como en `app-text-field`.

Integración:

- **R19.** Donde un formulario enlace un campo con `[formField]` y `[error]="fieldError(f.x)"`, el campo deberá mostrar el mensaje tras perder el foco con un valor inválido y ocultarlo al corregirlo.

## Data model

```ts
// src/app/shared/validation/validators.ts
// phone(path: SchemaPath<string>, config?: { message?: string }): void   — error { kind: 'phone', message? }
// dniNie(path: SchemaPath<string>, config?: { message?: string }): void  — error { kind: 'dniNie', message? }

// src/app/shared/validation/field-error.ts
// const DEFAULT_MESSAGES: Record<string, string | ((error) => string)>   — R10
// fieldError(field: FieldTree<unknown>): string | undefined              — R8–R11

// src/app/shared/number-field/number-field.ts
// class NumberField implements FormValueControl<number | null>
// model:  value: number | null = null · touched = false
// inputs: label (required) · id? · name? · placeholder? · icon? · min?: number · max?: number
//         step?: number · hint? · error? · disabled = false
```

Los validadores usan `validate()` de `@angular/forms/signals`. Firma exacta de `FieldTree`/`SchemaPath` según la versión instalada (21.1.x).

## Implementation plan

1. `validators.ts`: `phone` y `dniNie` con `validate()`. `validators.spec.ts` con `form()` sobre un modelo `{ tel, doc }`: casos válidos, inválidos, vacío, letra de control errónea, NIE X/Y/Z, minúsculas, `config.message` (R1–R7).
2. `field-error.ts`: `fieldError` + `DEFAULT_MESSAGES`. Tests con `required`, `email`, `min`, `max`, `phone`, `dniNie`, `kind` desconocido, `touched` false/true (R8–R11).
3. `NumberField` copiando la estructura de `app-text-field` (SPEC 04) con `type="number"`, `valueAsNumber` y `NaN → null`. Spec cubre R12–R18, incluido `[formField]` con `min`/`max` nativos.
4. Test de integración en `field-error.spec.ts`: host con `form()`, `app-text-field type="email"` + `email()` y `app-number-field` + `min()`, `[error]="fieldError(...)"`; blur con valor inválido muestra el mensaje, corregirlo lo quita (R19).
5. Marcar el ítem en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R19.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `dniNie` acepta `12345678Z` y `X1234567L`, y rechaza `12345678A` (R3–R5).
- [x] `phone` acepta `+34 600 123 456` y `600123456`, y rechaza `12-34` y `+34abc` (R1, R2).
- [x] Ningún componente de `src/app/shared/` importa de `validation/` (los componentes siguen tontos).
- [x] Todos los mensajes por defecto en español, tuteo, como instrucción y con ejemplo cuando aplica; sin emojis.
- [x] `src/app/shared/number-field/` no declara `styles` ni `styleUrl`.

## Decisions

- **Sí:** validadores fuera de los componentes, como funciones de esquema de Signal Forms. Mantiene la decisión de SPEC 02: el componente recibe `error` como string.
- **Sí:** `fieldError(field)` en el formulario: `[error]="fieldError(f.email)"`. **No:** que el componente lea `errors()`; lo acoplaría a los validadores.
- **Sí:** reutilizar `email`, `min`, `max`, `required` nativos y solo dar su mensaje por defecto en `fieldError`. **No:** reescribirlos.
- **Sí:** teléfono laxo (`+` opcional, dígitos y espacios, 7–15 dígitos). **No:** E.164 estricto; rechaza formatos que la gente escribe.
- **Sí:** DNI/NIE con letra de control. **No:** id genérico por patrón; no detecta erratas.
- **Sí:** `app-number-field` propio con `number | null`. **No:** `app-text-field` con string; el modelo tendría el tipo equivocado.
- **Sí:** mensaje mostrado solo tras `touched`, para no marcar error mientras se escribe por primera vez.
- **No:** radio ni slider (fuera del DS).

## Risks

| Riesgo | Mitigación |
| --- | --- |
| La API de Signal Forms (experimental en 21) cambia la forma de `errors()` o `kind` de los nativos | Tests de R10 con cada validador nativo lo detectan. |
| `type="number"` acepta `e`, `-`, `.` sueltos y el navegador da valor vacío | `valueAsNumber` NaN → `null` (R16); `required`/`min` lo marcan. |
| El separador decimal depende del idioma del navegador | Se usa el input nativo; no se parsea texto a mano. |

## What is **not** in this spec

- Máscaras, autoformato, otros países, validación asíncrona.
- Radio, slider, página demo.

Cada uno, si llega, va en su propio spec.
