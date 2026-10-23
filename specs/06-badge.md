# SPEC 06 — Componente Badge

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-10-23
> **Objective:** Crear `app-badge` como componente Angular tonto que refleja el Badge del DS Agenda (tonos, ícono, punto, categoría y contador) con el texto proyectado y nombre accesible opcional.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/badge.css`: copia literal del DS. Importado en `src/styles.css` tras `spinner.css`.
- `src/app/shared/badge/badge.ts` — componente `Badge`, selector `app-badge`.
- Test Vitest: `badge.spec.ts`.
- Marcar «Badge» en `TODO.md`.

**Out of scope (para specs futuros):**

- Uso de Badge en SidebarNav, BottomNav, DayView, EventCard: cada uno en su spec.
- Fondos `color-tint-*` para `glass` (llegan con Card/EventCard).
- Ruta o página demo.

## Requisitos (EARS)

- **R1.** El `app-badge` deberá ser el elemento `.badge` (host binding) y proyectar su contenido (`ng-content`) como texto.
- **R2.** Donde `tone` sea `brand`, `success`, `warning`, `danger`, `info`, `inverse`, `glass` o `count`, el `app-badge` deberá exponer `data-tone` con ese valor; con `neutral` (por defecto) no deberá exponer `data-tone`.
- **R3.** Donde haya `icon`, el `app-badge` deberá renderizar `<app-icon>` con ese `name` y `size="s"`, antes del texto.
- **R4.** Donde `dot` sea `true`, el `app-badge` deberá renderizar `<span class="badge__dot">` antes del ícono y del texto.
- **R5.** Donde haya `category`, el `app-badge` deberá añadir la clase `u-category`, exponer `data-category` con ese valor y renderizar `<span class="badge__dot" data-category-dot>` tras el punto de R4 y antes del ícono.
- **R6.** Donde no haya `category`, el `app-badge` no deberá tener la clase `u-category` ni `data-category`.
- **R7.** Donde haya `label`, el `app-badge` deberá exponer `aria-label` con ese valor; sin `label`, no deberá exponer `aria-label`.
- **R8.** El ícono y los puntos del `app-badge` deberán quedar ocultos a tecnologías de apoyo (`aria-hidden="true"`).
- **R9.** El `app-badge` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `badge.css`.

## Data model

```ts
// src/app/shared/badge/badge.ts
type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'inverse' | 'glass' | 'count';
type BadgeCategory = 'orange' | 'violet' | 'red' | 'blue' | 'green' | 'mustard' | 'cyan';
// inputs: tone: BadgeTone = 'neutral' · icon?: string · dot = false · category?: BadgeCategory · label?: string
```

## Implementation plan

1. Copiar literal `badge.css` del DS (`project/assets/Code/styles/blocks/badge.css`) a `src/styles/blocks/`. Añadir `@import` en `src/styles.css` tras `spinner.css`. `npm run build` sin errores (R9).
2. Crear `Badge` con host bindings igual que `Spinner` (`src/app/shared/spinner/spinner.ts`): `class: 'badge'`, `[class.u-category]`, `data-tone`, `data-category`, `aria-label`. Template inline: `@if (dot())` punto, `@if (category())` punto de categoría, `@if (icon())` `<app-icon size="s">`, `<ng-content />`. Puntos con `aria-hidden="true"`; `app-icon` ya lo pone sin `label` (R1–R8).
3. `badge.spec.ts` con el helper `render()` de `icon.spec.ts`: un test por requisito R1–R8, incluido el orden punto → punto de categoría → ícono → texto y `dot` + `category` a la vez (dos puntos).
4. Marcar «Badge» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R8.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/badge.css` y el del DS es vacío.
- [x] `src/app/shared/badge/` no declara `styles` ni `styleUrl` (R9).
- [x] `<app-badge tone="success" icon="check_circle">Confirmada</app-badge>` renderiza `<app-badge class="badge" data-tone="success"><app-icon class="icon" data-size="s" aria-hidden="true">check_circle</app-icon>Confirmada</app-badge>`.
- [x] `<app-badge tone="count" label="2 sin leer">2</app-badge>` expone `aria-label="2 sin leer"` (R7).
- [x] Sin emojis ni copy por defecto en inglés.

## Decisions

- **Sí:** convenciones de SPEC 02/03: `src/app/shared/badge/badge.ts`, clase `Badge`, host = bloque vía `host` bindings, CSS literal del DS en `src/styles/blocks/`. **No:** `<span class="badge">` interno.
- **Sí:** texto por `ng-content`, como `children` del DS. **No:** input `text`; impide marcado dentro.
- **Sí:** `label` opcional que va a `aria-label`, para contadores como `2` en SidebarNav/BottomNav. **No:** dejarlo al consumidor con `u-visually-hidden`; cada uso lo repetiría.
- **Sí:** `dot` y `category` a la vez pintan dos puntos, igual que el bundle del DS. **No:** que `category` anule `dot`; diverge del DS por un caso raro.
- **Sí:** `tone="neutral"` no expone `data-tone` (bundle del DS). El README del DS lista tonos `color-*`; el bundle y `badge.css` usan nombres sin prefijo, que son los que se siguen.
- **No:** validar que los estados lleven ícono; es regla de uso del DS (palabra + ícono), responsabilidad del consumidor.
- **No:** ruta demo. Se verifica con Vitest y build.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `aria-label` en un `<span>` sin rol lo ignoran algunos lectores de pantalla | Aceptado para este spec; si falla en SidebarNav/BottomNav se revisa allí (rol o texto oculto). |
| Si se resincroniza `badge.css` desde el DS y cambia la API de clases | `diff` vacío documentado; tests de R2–R5 detectan nombres de atributos cambiados. |

## What is **not** in this spec

- Uso en SidebarNav, BottomNav, DayView, EventCard; fondos tint; página demo.

Cada uno, si llega, va en su propio spec.
