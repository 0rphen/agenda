# SPEC 11 — Componentes Skeleton y SkeletonList

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-10-23
> **Objective:** Crear `app-skeleton` y `app-skeleton-list` como componentes Angular tontos que reflejan el Skeleton del DS Agenda (marcador con forma texto, círculo o bloque, y lista de filas de agenda, tareas o tarjetas con `role="status"`).

## Scope

**In:**

- Bloque CSS `src/styles/blocks/skeleton.css`: copia literal del DS. Importado en `src/styles.css` tras `progress.css`.
- `src/app/shared/skeleton/skeleton.ts` — componente `Skeleton`, selector `app-skeleton`.
- `src/app/shared/skeleton/skeleton-list.ts` — componente `SkeletonList`, selector `app-skeleton-list`, con template externo `skeleton-list.html` (multilínea, regla de SPEC 08).
- Tests Vitest: `skeleton.spec.ts`, `skeleton-list.spec.ts`.
- Marcar «Skeleton + SkeletonList» en `TODO.md`.

**Out of scope (para specs futuros):**

- Uso en MobileOverview, AppShell, DayView…: cada uno en su spec.
- Nombre accesible o `role` en el Skeleton suelto: siempre `aria-hidden`.
- Variantes de lista distintas de `agenda`, `task`, `card`.
- Cambios en `reduced-motion.css`: ya anula `animation` dentro de `.app`.
- Ruta o página demo.

## Requisitos (EARS)

Skeleton:

- **R1.** El `app-skeleton` deberá ser el elemento `.skeleton` (host binding) con `aria-hidden="true"`.
- **R2.** Donde haya `width`, el `app-skeleton` deberá exponer la propiedad CSS `--w` con ese valor tal cual; sin `width`, no deberá exponerla.
- **R3.** Donde haya `height`, el `app-skeleton` deberá exponer la propiedad CSS `--h` con ese valor tal cual; sin `height`, no deberá exponerla.
- **R4.** Donde `shape` sea `circle` o `block`, el `app-skeleton` deberá exponer `data-shape` con ese valor; sin `shape` (texto), no deberá exponer `data-shape`.

SkeletonList:

- **R5.** El `app-skeleton-list` deberá ser el elemento `.skeleton-list` (host binding) con `role="status"`, `aria-busy="true"` y `data-variant` con la variante.
- **R6.** El `app-skeleton-list` deberá exponer `aria-label` con `label`; sin `label`, con `Cargando`.
- **R7.** Donde no se indique, `variant` deberá valer `agenda`.
- **R8.** El `app-skeleton-list` deberá normalizar `rows`: `Math.floor`; si el resultado no es finito o es menor que `1`, `4`. Donde no se indique, `4`.
- **R9.** El `app-skeleton-list` deberá renderizar tantos `<div class="skeleton-list__row">` como filas normalizadas (R8), con índice `i` desde `0`.
- **R10.** Mientras `variant` sea `agenda`, cada fila deberá contener, en orden:
  1. `<span class="skeleton-list__col" data-fixed>` con `app-skeleton` `width="3rem" height="1.25em"` y `app-skeleton` `width="2rem" height="0.75em"`;
  2. `app-skeleton` `shape="block" width="var(--space-3xs)" height="var(--control-m)"`;
  3. `<span class="skeleton-list__col">` con `app-skeleton` `width="30%" height="0.75em"` y `app-skeleton` `width` `80%` (i par) o `60%` (i impar).
- **R11.** Mientras `variant` sea `task`, cada fila deberá contener, en orden:
  1. `app-skeleton` `shape="block" width="var(--icon-l)" height="var(--icon-l)"`;
  2. `<span class="skeleton-list__col">` con `app-skeleton` `width` `75%` (i par) o `55%` (i impar) y `app-skeleton` `width="35%" height="0.75em"`.
- **R12.** Mientras `variant` sea `card`, cada fila deberá contener un `<span class="skeleton-list__col">` con, en orden: `app-skeleton` `width="40%" height="0.75em"`, `app-skeleton` `width="70%"`, `app-skeleton` `width="50%" height="0.75em"` y `<span class="skeleton-list__line">` con dos `app-skeleton` `shape="circle" width="var(--icon-xl)"`.

Común:

- **R13.** `app-skeleton` y `app-skeleton-list` no deberán usar `styleUrl` ni estilos de componente; todo el aspecto viene de `skeleton.css`.

## Data model

```ts
// src/app/shared/skeleton/skeleton.ts
type SkeletonShape = 'circle' | 'block';
// inputs: width?: string · height?: string · shape?: SkeletonShape
// host: class 'skeleton', aria-hidden 'true', [style.--w], [style.--h], [attr.data-shape]

// src/app/shared/skeleton/skeleton-list.ts
type SkeletonListVariant = 'agenda' | 'task' | 'card';
// inputs: variant: SkeletonListVariant = 'agenda' · rows = 4 · label?: string
// computed: count = n = Math.floor(rows); Number.isFinite(n) && n >= 1 ? n : 4
//           indexes = Array.from({ length: count() }, (_, i) => i)
```

## Implementation plan

1. Copiar literal `skeleton.css` del DS (`project/assets/Code/styles/blocks/skeleton.css`) a `src/styles/blocks/`. Añadir `@import` en `src/styles.css` tras `progress.css`. `npm run build` sin errores (R13).
2. Crear `Skeleton` con host bindings igual que `Progress` (`src/app/shared/progress/progress.ts`): `class: 'skeleton'`, `'aria-hidden': 'true'`, `[style.--w]`, `[style.--h]`, `[attr.data-shape]`. Template vacío inline (`''`) (R1–R4).
3. `skeleton.spec.ts` con el helper `render()` de `icon.spec.ts`: un test por R1–R4, incluido `width` con `var(--icon-xl)` y sin inputs (sin `--w`, `--h` ni `data-shape`).
4. Crear `SkeletonList`: host `class: 'skeleton-list'`, `role`, `aria-busy`, `[attr.data-variant]`, `[attr.aria-label]`. `skeleton-list.html` con `@for (i of indexes())` y `@switch (variant())` con las tres filas literales de R10–R12 usando `<app-skeleton>` (R5–R12).
5. `skeleton-list.spec.ts`: un test por R5–R12: atributos del host, `label` por defecto y propio, `rows` `2`/`2.7`/`0`/`-3`/`NaN`, y por variante número de piezas, orden y anchos de filas 0 y 1.
6. Marcar ítem en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [ ] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R12.
- [ ] `npm run build` termina sin errores ni warnings de budget.
- [ ] `diff` entre `src/styles/blocks/skeleton.css` y el del DS es vacío.
- [ ] `src/app/shared/skeleton/` no declara `styles` ni `styleUrl` (R13).
- [ ] `<app-skeleton width="12rem" />` renderiza `class="skeleton"`, `aria-hidden="true"`, `--w: 12rem`, sin `--h` ni `data-shape`.
- [ ] `<app-skeleton shape="circle" />` expone `data-shape="circle"` sin `--w`.
- [ ] `<app-skeleton-list />` renderiza `data-variant="agenda"`, `role="status"`, `aria-busy="true"`, `aria-label="Cargando"` y 4 filas.
- [ ] `<app-skeleton-list variant="task" [rows]="0" label="Cargando tareas" />` renderiza 4 filas y `aria-label="Cargando tareas"`.
- [ ] `<app-skeleton-list variant="card" [rows]="2" />` renderiza 2 filas con 5 `app-skeleton` cada una (2 de ellos `circle`).
- [ ] Sin emojis ni copy por defecto en inglés.

## Decisions

- **Sí:** convenciones de SPEC 02/03/06/07/10: `src/app/shared/skeleton/`, clases `Skeleton`/`SkeletonList`, host = bloque vía `host` bindings, CSS literal del DS. Ambos en un spec y una carpeta, como Avatar + AvatarGroup.
- **Sí:** las piezas de la lista son `<app-skeleton>` (como el bundle, `h(Skeleton, …)`). **No:** `<span class="skeleton">` plano; duplica `--w`/`--h`/`aria-hidden`.
- **Sí:** filas copiadas exactas del bundle, con anchos alternos por índice par/impar. **No:** simplificar a anchos fijos.
- **Sí:** `rows` normalizado a entero ≥ 1, si no `4`. **No:** `rows || 4` del bundle (negativos darían lista vacía con `role="status"`).
- **Sí:** Skeleton suelto siempre `aria-hidden`; anunciar la carga es del contenedor. **No:** input `label` opcional en Skeleton.
- **Sí:** `label` por defecto `Cargando` (bundle).
- **Sí:** `width`/`height` como `string` pasados tal cual a `--w`/`--h` (README DS: medida relativa o token). Sin validar: lo decide el consumidor.
- **No:** media query propia de movimiento reducido; `reduced-motion.css` ya quita `animation` en `.app *` (README DS: queda color plano).
- **No:** ruta demo. Se verifica con Vitest y build.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `[style.--w]` con `var(...)` no se serializa en jsdom | Test de R2 con `width="var(--icon-xl)"` lo comprueba vía `style.getPropertyValue('--w')`; si falla, `[attr.style]`. |
| `app-skeleton` como host dentro de flex no se comporta como el `<span>` del bundle | `.skeleton` declara `display: block` e `inline-size`, el elemento da igual; revisar visualmente al primer uso real. |
| Movimiento reducido fuera de `.app` sigue animando | Toda la app vive bajo `.app`; anotado aquí por si un Skeleton se renderiza fuera (overlay). |
| Resincronizar `skeleton.css` o el bundle con otra estructura | `diff` vacío documentado; tests de R10–R12 detectan cambios de piezas. |

## What is **not** in this spec

- Uso en pantallas; `label`/`role` en Skeleton suelto; variantes nuevas; cambios de movimiento reducido; página demo.

Cada uno, si llega, va en su propio spec.
