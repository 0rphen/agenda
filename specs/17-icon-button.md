# SPEC 17 — Componente IconButton

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 02, SPEC 03, SPEC 12, SPEC 15
> **Date:** 2026-10-23
> **Objective:** Crear `app-icon-button` como componente Angular tonto que refleja el IconButton del DS Agenda (`<button class="icon-button">` circular con solo un ícono, `label` obligatorio como nombre accesible y tooltip, variante, tamaño, `filled`, `type`, `disabled` y `loading` con Spinner, que emite `clicked` solo cuando la acción está disponible).

## Scope

**In:**

- Bloque CSS `src/styles/blocks/icon-button.css`: copia del DS + una regla `&[data-loading] { cursor: progress; }`. Importado en `src/styles.css` tras `button.css`.
- `src/app/shared/icon-button/icon-button.ts` — componente `IconButton`, selector `app-icon-button`, template externo `icon-button.html`.
- Test Vitest: `icon-button.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts`: sección IconButton.
- Marcar «IconButton» en `TODO.md`.

**Out of scope:**

- `aria-expanded` / `aria-haspopup`: los añade el spec de Menu.
- Prop `state` / `data-force` (solo vitrinas del DS).
- Tooltip propio (más allá de `title` nativo).
- `loadingLabel`: el botón conserva `label` como nombre; el spinner va oculto.

## Requisitos (EARS)

- **R1.** El `app-icon-button` deberá renderizar un único `<button class="icon-button">` con un único `app-icon` (o `app-spinner` mientras `loading`) dentro.
- **R2.** El `<button>` deberá exponer `aria-label` y `title` con el input obligatorio `label`.
- **R3.** El `<button>` deberá exponer `type` con el input `type` (`button` | `submit`); donde no se indique, `button`.
- **R4.** Donde `variant` sea `tonal` o `solid`, el `<button>` deberá exponer `data-variant` con ese valor; donde sea `ghost` (por defecto), no deberá exponerlo.
- **R5.** Donde `size` sea `s` o `l`, el `<button>` deberá exponer `data-size` con ese valor; donde sea `m` (por defecto), no deberá exponerlo.
- **R6.** Mientras no esté `loading`, el `<button>` deberá renderizar `app-icon` con `name` = `icon` (obligatorio), tamaño por defecto (`m`) y `filled` = input `filled` (por defecto `false`).
- **R7.** Mientras `disabled` sea `true`, el `<button>` deberá tener el atributo nativo `disabled`.
- **R8.** Mientras `loading` sea `true`, el `<button>` deberá exponer `data-loading` vacío, `aria-busy="true"` y `aria-disabled="true"`, sin `disabled` nativo (sigue enfocable), y conservar `aria-label` = `label`.
- **R9.** Mientras `loading` sea `true`, el `<button>` deberá renderizar `app-spinner` con `aria-hidden="true"` en lugar del ícono, con `size` `m` si `size` es `l` y `s` en otro caso.
- **R10.** Cuando el usuario hace clic en el `<button>`, el `app-icon-button` deberá emitir `clicked` con el `MouseEvent`.
- **R11.** Mientras `loading`, cuando el usuario hace clic, el `app-icon-button` no deberá emitir `clicked` y deberá llamar a `preventDefault()` (un `type="submit"` no envía el formulario).
- **R12.** Mientras `disabled`, cuando el usuario hace clic, el `app-icon-button` no deberá emitir `clicked`.
- **R13.** Mientras `data-loading`, el `<button>` deberá mostrar `cursor: progress`.
- **R14.** El `app-icon-button` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `icon-button.css`.

## Data model

```ts
// src/app/shared/icon-button/icon-button.ts
export type IconButtonVariant = 'ghost' | 'tonal' | 'solid';
// inputs: icon: string (required) · label: string (required)
//         variant: IconButtonVariant = 'ghost' · size: Exclude<Size, 'xl'> = 'm'
//         type: 'button' | 'submit' = 'button' · filled = false · disabled = false · loading = false
// output: clicked: MouseEvent
// imports: Icon, Spinner; Size de src/app/shared/types/ui.ts
```

## Implementation plan

1. Copiar `icon-button.css` del DS (`project/assets/Code/styles/blocks/icon-button.css`) a `src/styles/blocks/`, añadir `&[data-loading] { cursor: progress; }` tras las reglas de `data-size`. `@import` en `src/styles.css` tras `button.css`. `npm run build` sin errores (R13, R14).
2. `icon-button.spec.ts` con helper `render()` y host de test (`<form>`, `loading` + `type="submit"`, `disabled`, normal), como `button.spec.ts`: un test por R1–R12. Fallan.
3. Crear `IconButton` (`templateUrl: './icon-button.html'`, imports `Icon`, `Spinner`; inputs `filled`/`disabled`/`loading` con `booleanAttribute`). Template: `<button class="icon-button">` con `[attr.type]`, `[attr.aria-label]`, `[attr.title]`, `[attr.data-variant]` (`ghost` → `null`), `[attr.data-size]` (`m` → `null`), `[disabled]`, `[attr.data-loading]`, `[attr.aria-busy]`, `[attr.aria-disabled]`, `(click)="onClick($event)"`; `@if (loading())` `<app-spinner aria-hidden="true" [size]>` `@else` `<app-icon [name] [filled]>`. `onClick` como en `Button`. Tests en verde.
4. Demo: sección `icon-button` en `demo-page.html` (tras ButtonLink) y entrada en `sections` de `demo-page.ts`: una fila por variante (`ghost` `more_horiz`, `tonal` `edit`, `solid` `add`) con tamaños `s`/`m`/`l`, `disabled` y `loading`; una fila con `filled` (`star`).
5. Playwright en `/demo`: sección visible, hover/focus en cada variante, tooltip `title`, consola limpia.
6. Marcar «IconButton» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R12.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/icon-button.css` y el del DS solo muestra la regla `data-loading` (R13).
- [x] `src/app/shared/icon-button/` no declara `styles` ni `styleUrl` (R14).
- [x] `<app-icon-button icon="more_horiz" label="Más opciones" />` renderiza `<button type="button" class="icon-button" aria-label="Más opciones" title="Más opciones">` sin `data-variant`/`data-size`, con `app-icon` `more_horiz`.
- [x] `<app-icon-button variant="solid" size="l" icon="add" label="Nuevo evento" />` expone `data-variant="solid"` y `data-size="l"`.
- [x] `<app-icon-button loading size="l" ...>` muestra `app-spinner` `size="m"` con `aria-hidden="true"`, sin `app-icon`, `aria-busy`/`aria-disabled="true"`, `aria-label` intacto, no emite `clicked`.
- [x] `<app-icon-button disabled ...>` tiene `disabled` nativo y no emite `clicked`.
- [x] `/demo` muestra la sección IconButton (variantes, tamaños, disabled, loading, filled) y aparece en el índice.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** mismas convenciones que SPEC 12: `<app-icon-button>` envuelve `<button>` y expone `clicked`; el bloque es el `<button>` interno. **No:** `button[app-icon-button]` (no se bloquea el `(click)` del consumidor en `loading`).
- **Sí:** `title` = `label` además de `aria-label` (bundle y README DS: «nombre accesible y tooltip»).
- **Sí:** variantes `ghost|tonal|solid` y tamaños `s|m|l` del CSS. **No:** `sm|md|lg` de `api/components/IconButton.md` (desfasado, igual que Button).
- **Sí:** `filled` (DS; `Icon` ya lo soporta). Ícono siempre tamaño `m` (bundle).
- **Sí:** `type` `button|submit` y `loading`, aunque el DS no los tiene: paridad con `app-button`. Desviación del DS documentada.
- **Sí:** `loading` como Button (`aria-disabled`, sin `disabled` nativo, `preventDefault`). Spinner `aria-hidden`: el nombre sigue siendo `label`, `aria-busy` anuncia la carga. **No:** `loadingLabel`.
- **Sí:** una regla `cursor: progress` en `icon-button.css`. **No:** copia literal sin cursor.
- **No:** `aria-expanded`/`aria-haspopup` (spec de Menu), `state`/`data-force`.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `title` nativo duplica la lectura del nombre en algunos lectores | Mismo valor que `aria-label`; es lo que pide el DS. |
| Resincronizar `icon-button.css` desde el DS borra la regla `data-loading` | Criterio de `diff` documentado; test visual en demo. |
| Consumidor usa `(click)` en `<app-icon-button>` y salta el filtro de `loading` | Igual que Button; documentado en Decisions. |

## What is **not** in this spec

- `aria-expanded`/`aria-haspopup` (Menu); `state`/`data-force`; tooltip propio; `loadingLabel`.
