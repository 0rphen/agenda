# SPEC 09 — NumberField conserva el texto intermedio no numérico

> **Status:** Implemented
> **Depends on:** SPEC 05
> **Date:** 2026-10-23
> **Objective:** Evitar que `app-number-field` borre lo que el usuario escribe cuando el texto intermedio no es un número (p. ej. `1e`), escribiendo en el DOM solo si el control no coincide con el modelo y sin perder el valor en el HTML de SSR.

## Scope

**In:**

- `src/app/shared/number-field/number-field.ts` + `.html`: quitar el binding `[value]`; sincronizar modelo y DOM con `afterRenderEffect` + `[attr.value]`.
- `src/app/shared/number-field/number-field.spec.ts`: tests nuevos R1–R5.
- Marcar el ítem en `TODO.md`.

**Out of scope:**

- Mensaje propio de «no es un número» (`validity.badInput`): el componente sigue tonto, el error llega como input.
- Limpiar el texto inválido cuando el formulario se resetea a `null` y el modelo ya era `null` (ver Risks).
- Cambios en `app-text-field` u otros campos.

## Requisitos (EARS)

- **R1.** Cuando el usuario escriba un texto que el navegador no puede convertir en número (p. ej. `1e`, `-`), el `app-number-field` deberá poner `value` en `null` (SPEC 05 R16) sin modificar el texto del control.
- **R2.** Cuando `value` cambie desde fuera (formulario, `[(value)]`) a un número distinto de `valueAsNumber` del control, el `app-number-field` deberá escribir ese número en el control.
- **R3.** Cuando `value` cambie desde fuera a `null` y el control tenga un número válido, el `app-number-field` deberá vaciar el control.
- **R4.** Mientras `valueAsNumber` del control coincida con `value` (incluido `null` con `NaN`), el `app-number-field` no deberá escribir en el control.
- **R5.** El `app-number-field` deberá exponer `value` como atributo `value` del `<input>` (vacío si es `null`, sin atributo), para que el HTML de SSR muestre el valor antes de hidratar.
- **R6.** Los tests existentes de SPEC 05 (R12–R18) deberán seguir pasando sin cambios de comportamiento.

## Data model

Sin datos nuevos. Cambios internos de `NumberField`:

```ts
// src/app/shared/number-field/number-field.ts
// private readonly control = viewChild.required<ElementRef<HTMLInputElement>>('control');
// constructor: afterRenderEffect(() => {
//   const v = this.value(); const el = this.control().nativeElement;
//   const dom = el.valueAsNumber;            // NaN si vacío o texto no numérico
//   if (v === null ? Number.isNaN(dom) : dom === v) return;  // R4
//   el.value = v === null ? '' : String(v);  // R2, R3
// });
// template: [value] fuera; [attr.value]="value() ?? null" (R5)
```

## Implementation plan

1. Test rojo de R1 en `number-field.spec.ts`: tras escribir un número, simular entrada no numérica redefiniendo en la instancia `valueAsNumber` (→ `NaN`) y el setter de `value` (espía), disparar `input`; esperar `value` `null` y ningún `set` de `value`. (jsdom sanea `1e` a `''`, por eso se simula.)
2. En `number-field.html`: quitar `[value]="value() ?? ''"`, añadir `[attr.value]="value() ?? null"`. En `number-field.ts`: `viewChild.required('control')` + `afterRenderEffect` del Data model (R1–R4). Solo corre en navegador: no hace falta guardar plataforma.
3. Tests R2–R5: `value` desde fuera a número distinto escribe; a `null` vacía; mismo número no escribe (espía); atributo `value` presente con número y ausente con `null`.
4. Pasar todo el spec de SPEC 05 sin tocar sus tests (R6). Si alguno dependía de `[value]` síncrono, esperar `fixture.whenStable()` en el nuevo test, no cambiar el viejo.
5. Comprobación manual en navegador (`npm start`, host temporal no commiteado o Playwright): escribir `1e5` carácter a carácter queda `1e5` y `value` = `100000`.
6. Marcar el ítem en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa, con al menos un test por R1–R5 y los tests previos de `number-field.spec.ts` sin modificar (R6).
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] En navegador, escribir `1`, `e`, `5` deja `1e5` en el control y `value` = `100000`; tras `1e` el control muestra `1e` y `value` es `null`.
- [x] En navegador, `-` suelto se mantiene en el control mientras se escribe `-3`.
- [x] El HTML prerenderizado/SSR de un `app-number-field` con `value` `5` contiene `value="5"` en el `<input>`.
- [x] `number-field.html` no contiene `[value]`.
- [x] Ítem del bug marcado en `TODO.md`.

## Decisions

- **Sí:** `afterRenderEffect` que escribe en el DOM solo si `valueAsNumber` no coincide con el modelo. Corrige la causa (Angular reescribe en cuanto cambia la expresión) y cubre `1e`, `-`, `1.` a la vez.
- **Sí:** `[attr.value]` para SSR: el atributo es el valor por defecto; en cliente, tras escribir, el navegador lo ignora (dirty flag) y manda el effect.
- **No:** mantener `[value]` con una señal `badInput`; cualquier cambio de la expresión vuelve a escribir el DOM.
- **No:** `type="text"` con parseo propio; pierde teclado numérico, `min`/`max`/`step` nativos y el separador decimal del navegador.
- **No:** mensaje propio para `badInput`; se mantiene SPEC 05 R16 (`null`) y el error lo da el formulario.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Con `1e` en el control (`value` ya `null`), un reset del formulario a `null` no cambia la señal y el texto inválido se queda | Aceptado; caso raro. Si molesta, spec propio con reset explícito. |
| jsdom sanea `type="number"` y no reproduce `1e` | Simular `valueAsNumber`/setter en la instancia (paso 1) + comprobación manual en navegador. |
| Coma decimal (`1,5` en `es-ES`) da `valueAsNumber` distinto del texto | Igual que antes: el effect compara números, no texto; no se reescribe si coinciden. |
| `afterRenderEffect` corre tras el render: un frame con DOM desfasado al cambiar `value` desde fuera | Imperceptible; los tests esperan `whenStable()`. |

## What is **not** in this spec

- Mensaje de `badInput`, reset de texto inválido, cambios en otros campos.

Cada uno, si llega, va en su propio spec.
