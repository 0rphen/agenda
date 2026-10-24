# SPEC 10 — Componente Progress

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-10-23
> **Objective:** Crear `app-progress` como componente Angular tonto que refleja el Progress del DS Agenda (barra de avance 0–100 con título, tono y porcentaje visibles, y `role="progressbar"` con nombre accesible siempre presente).

## Scope

**In:**

- Bloque CSS `src/styles/blocks/progress.css`: copia literal del DS. Importado en `src/styles.css` tras `avatar.css`.
- `src/app/shared/progress/progress.ts` — componente `Progress`, selector `app-progress`.
- Template externo `src/app/shared/progress/progress.html` (multilínea, regla de SPEC 08).
- Test Vitest: `progress.spec.ts`.
- Marcar «Progress» en `TODO.md`.

**Out of scope (para specs futuros):**

- Uso en TaskItem, StatCard, OverviewPage: cada uno en su spec.
- Estado indeterminado (carga sin porcentaje): para eso están Spinner y Skeleton.
- Ruta o página demo.

## Requisitos (EARS)

- **R1.** El `app-progress` deberá ser el elemento `.progress` (host binding) y contener `.progress__row` con `.progress__track` > `.progress__fill`.
- **R2.** El `app-progress` deberá normalizar `value`: si no es un número finito, `0`; si no, limitado a `0–100` y redondeado al entero más cercano (`Math.round`). En adelante, «valor» es el normalizado.
- **R3.** El `.progress__track` deberá exponer `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"` y `aria-valuenow` con el valor.
- **R4.** El `.progress__fill` deberá exponer la propiedad CSS `--value` con el valor (sin unidad); el ancho lo calcula `progress.css`.
- **R5.** El `.progress__track` deberá exponer `aria-label` con `label`; si no hay `label`, con `title`; si no hay ninguno, con `Progreso`.
- **R6.** Donde haya `title`, el `app-progress` deberá renderizar `<span class="progress__title">` con ese texto antes de `.progress__row`; sin `title`, no deberá renderizarlo.
- **R7.** Mientras `showLabel` sea `true` (por defecto), el `app-progress` deberá renderizar `<span class="progress__label">` tras el track con el valor seguido de espacio fino no separable (U+202F) y `%` (p. ej. `72 %`).
- **R8.** Mientras `showLabel` sea `false`, el `app-progress` no deberá renderizar `.progress__label`.
- **R9.** Donde `tone` sea `success` o `accent`, el `app-progress` deberá exponer `data-tone` con ese valor; donde sea `brand`, no deberá exponer `data-tone`.
- **R10.** Mientras no se indique `tone` y el valor sea `100`, el `app-progress` deberá exponer `data-tone="success"`.
- **R11.** Mientras no se indique `tone` y el valor sea menor que `100`, el `app-progress` no deberá exponer `data-tone`.
- **R12.** El `app-progress` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `progress.css`.

## Data model

```ts
// src/app/shared/progress/progress.ts
type ProgressTone = 'brand' | 'success' | 'accent';
// inputs: value: number (required) · title?: string · label?: string
//         tone?: ProgressTone (sin valor por defecto: undefined activa R10) · showLabel = true
// computed: pct = Number.isFinite(value) ? Math.round(clamp(value, 0, 100)) : 0
//           dataTone = tone ?? (pct === 100 ? 'success' : undefined), y 'brand' → null
//           name = label ?? title ?? 'Progreso'
```

## Implementation plan

1. Copiar literal `progress.css` del DS (`project/assets/Code/styles/blocks/progress.css`) a `src/styles/blocks/`. Añadir `@import` en `src/styles.css` tras `avatar.css`. `npm run build` sin errores (R12).
2. Crear `Progress` con host bindings igual que `Spinner` (`src/app/shared/spinner/spinner.ts`): `class: 'progress'`, `[attr.data-tone]`. `templateUrl: './progress.html'`: `@if (title())` título; fila con track (`role`, `aria-value*`, `[attr.aria-label]="name()"`), fill con `[style.--value]="pct()"`, `@if (showLabel())` etiqueta `{{ pct() }} %` con U+202F (R1–R11).
3. `progress.spec.ts` con el helper `render()` de `icon.spec.ts`: un test por R1–R11, incluidos `value` `33.4`/`33.6`/`-5`/`140`/`NaN`, tono explícito `brand` con valor 100 (sin `data-tone`) y `accent` con valor 100 (`accent`).
4. Marcar «Progress» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R11.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/progress.css` y el del DS es vacío.
- [x] `src/app/shared/progress/` no declara `styles` ni `styleUrl` (R12).
- [x] `<app-progress [value]="72" title="Market Research" />` renderiza `class="progress"` sin `data-tone`, título `Market Research`, track con `role="progressbar"`, `aria-valuenow="72"`, `aria-label="Market Research"`, fill con `--value: 72` y etiqueta `72 %`.
- [x] `<app-progress [value]="100" />` expone `data-tone="success"` y `aria-label="Progreso"`.
- [x] `<app-progress [value]="140" tone="brand" [showLabel]="false" />` da `aria-valuenow="100"`, sin `data-tone` y sin `.progress__label`.
- [x] Sin emojis ni copy por defecto en inglés.

## Decisions

- **Sí:** convenciones de SPEC 02/03/06/07: `src/app/shared/progress/`, clase `Progress`, host = bloque vía `host` bindings, CSS literal del DS. Template externo por ser multilínea (SPEC 08).
- **Sí:** `role="progressbar"` en `.progress__track`, no en el host, como el bundle DS; así el título visible queda fuera de la barra.
- **Sí:** nombre accesible `label ?? title ?? 'Progreso'`. **No:** igual que el bundle (barra sin nombre si faltan ambos). **No:** `aria-labelledby` al título; añade ids sin ganar nada sobre repetir el texto.
- **Sí:** normalizar a entero 0–100 (`NaN` → 0) para texto, `aria-valuenow` y `--value`. **No:** valor crudo como el bundle (saldría `33.333%`).
- **Sí:** `showLabel` `true` por defecto (bundle y preview DS).
- **Sí:** `tone` sin valor por defecto; sin `tone` y al 100 % sale `success` (regla «Hazlo» del README DS). `tone` explícito siempre gana, incluido `brand`. `brand` no expone `data-tone` (bundle).
- **Sí:** `72 %` con U+202F (norma española, README DS escribe `100 %`). **No:** `72%` del bundle.
- **No:** estado indeterminado; lo cubren Spinner y Skeleton.
- **No:** ruta demo. Se verifica con Vitest y build.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `[style.--value]` no se serializa en SSR o jsdom | Test de R4 lo comprueba con `style.getPropertyValue('--value')`; si falla, `[attr.style]="'--value: ' + pct()"`. |
| U+202F invisible en el código fuente, fácil de borrar por error | Escribirlo como entidad `&#8239;` en el template y comprobarlo en el test de R7. |
| Resincronizar `progress.css` desde el DS con otra API de atributos | `diff` vacío documentado; tests de R1, R4, R9 detectan nombres cambiados. |

## What is **not** in this spec

- Uso en TaskItem, StatCard, OverviewPage; estado indeterminado; página demo.

Cada uno, si llega, va en su propio spec.
