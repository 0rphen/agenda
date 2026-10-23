# SPEC 03 — Componente Spinner

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-10-22
> **Objective:** Crear `app-spinner` como componente Angular tonto que refleja el Spinner del DS Agenda (tamaños `s`/`m`/`l`, nombre accesible) y sigue girando despacio con `prefers-reduced-motion`.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/spinner.css`: copia literal del DS más un bloque `@layer exception` añadido al final para reduced-motion. Importado en `src/styles.css` tras `field.css`.
- `src/app/shared/spinner/spinner.ts` — componente `Spinner`, selector `app-spinner`.
- Test Vitest: `spinner.spec.ts`.
- Marcar «Spinner» en `TODO.md`.

**Out of scope (para specs futuros):**

- `Button loading` (`aria-busy`, bloqueo de clic, tamaño del spinner según botón): spec de Button.
- SkeletonList para cargas de zona.
- Ruta o página demo.

## Requisitos (EARS)

- **R1.** El `app-spinner` deberá ser el elemento `.spinner` (host binding), sin contenido.
- **R2.** Donde `size` sea `s` o `l`, el `app-spinner` deberá exponer `data-size` con ese valor; con `m` (por defecto) no deberá exponer `data-size`.
- **R3.** El `app-spinner` deberá exponer `role="status"`.
- **R4.** El `app-spinner` deberá exponer `aria-label` con `label`; donde no se pase `label`, deberá usar «Cargando».
- **R5.** El `app-spinner` deberá heredar el color del texto (`currentColor`), sin input de color.
- **R6.** Mientras `prefers-reduced-motion: reduce`, el `.spinner` dentro de `.app` deberá girar con `spinner-spin` a `calc(var(--duration-loop) * 2)`, `linear infinite`, en `@layer exception`.
- **R7.** El `app-spinner` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `spinner.css`.

## Data model

```ts
// src/app/shared/spinner/spinner.ts
type SpinnerSize = 's' | 'm' | 'l';
// inputs: size: SpinnerSize = 'm' · label = 'Cargando'
```

## Implementation plan

1. Copiar literal `spinner.css` del DS a `src/styles/blocks/`. Añadir al final:
   ```css
   @layer exception {
     @media (prefers-reduced-motion: reduce) {
       .app .spinner {
         animation: spinner-spin calc(var(--duration-loop) * 2) linear infinite;
       }
     }
   }
   ```
   (`.app .spinner` 0,2,0 gana a `.app *` 0,1,0 en la misma capa; shorthand completo porque `animation: none` borra el nombre.) Añadir `@import` en `src/styles.css` tras `field.css`. `npm run build` sin errores (R5, R6).
2. Crear `Spinner` con host bindings igual que `Icon` (`src/app/shared/icon/icon.ts`): `class: 'spinner'`, `data-size`, `role`, `aria-label` (R1–R4, R7). `spinner.spec.ts` cubre R1–R4 con el helper `render()` de `icon.spec.ts`.
3. Marcar «Spinner» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R4.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/spinner.css` y el del DS solo muestra el bloque `@layer exception` añadido al final (R6).
- [x] Con reduced-motion emulado en el navegador (DevTools), el spinner gira a 2400ms por vuelta; sin él, a 1200ms (R6).
- [x] `src/app/shared/spinner/` no declara `styles` ni `styleUrl` (R7).
- [x] Copy por defecto en español («Cargando»); sin emojis.

## Decisions

- **Sí:** convenciones de SPEC 02: `src/app/shared/spinner/spinner.ts`, clase `Spinner`, host = bloque vía `host` bindings, CSS del DS en `src/styles/blocks/`.
- **Sí:** `role="status"` + `aria-label` como el bundle del DS. **No:** texto `u-visually-hidden` dentro; diverge del DS.
- **Sí:** excepción de reduced-motion con giro lento. **No:** aceptar el anillo estático que deja `reduced-motion.css`; un anillo quieto con hueco no comunica actividad.
- **Sí:** duración `calc(var(--duration-loop) * 2)`. **No:** token nuevo; obligaría a divergir de `tokens.json` del DS.
- **Sí:** la excepción vive al final de `spinner.css`. **No:** en `reduced-motion.css`; la utilidad no debe conocer bloques. Coste: el `diff` con el DS deja de ser vacío (solo el bloque añadido).
- **No:** ruta demo. Se verifica con Vitest y build; R6 a mano en el navegador.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| jsdom no evalúa `@media` ni animaciones: R6 no tiene test automático | Verificación manual con emulación de reduced-motion; criterio de aceptación explícito. |
| Si se resincroniza `spinner.css` copiando el del DS, se pierde la excepción | El `diff` esperado está documentado en los criterios; reaplicar el bloque final. |

## What is **not** in this spec

- `Button loading`, SkeletonList, página demo.

Cada uno, si llega, va en su propio spec.
