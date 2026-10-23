# SPEC 07 — Componentes Avatar y AvatarGroup

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-10-23
> **Objective:** Crear `app-avatar` y `app-avatar-group` como componentes Angular tontos que reflejan el Avatar del DS Agenda (iniciales sobre tinte estable o imagen, tamaños, grupo con contador «+N»).

## Scope

**In:**

- Bloque CSS `src/styles/blocks/avatar.css`: copia literal del DS. Importado en `src/styles.css` tras `badge.css`.
- `src/app/shared/avatar/avatar.ts` — componente `Avatar`, selector `app-avatar`.
- `src/app/shared/avatar/avatar-group.ts` — componente `AvatarGroup`, selector `app-avatar-group`.
- Tests Vitest: `avatar.spec.ts`, `avatar-group.spec.ts`.
- Marcar «Avatar + AvatarGroup» en `TODO.md`.

**Out of scope (para specs futuros):**

- Uso en EventCard, DayView, SidebarNav: cada uno en su spec.
- Elegir tinte a mano (input `tint`): siempre sale del nombre.
- Lista desplegable o tooltip con los nombres ocultos tras «+N».
- Ruta o página demo.

## Requisitos (EARS)

Avatar:

- **R1.** El `app-avatar` deberá ser el elemento `.avatar` con clase `u-tint` (host binding).
- **R2.** El `app-avatar` deberá exponer `role="img"` y `aria-label` con el valor de `name`.
- **R3.** El `app-avatar` deberá exponer `data-tint` calculado de `name` con el algoritmo del DS: suma de `charCodeAt` módulo 997, índice módulo 7 sobre `periwinkle, cream, rose, mint, sky, lilac, lime`. El mismo `name` deberá dar siempre el mismo tinte.
- **R4.** Mientras no haya `src` o la imagen haya fallado, el `app-avatar` deberá mostrar las iniciales: primera letra de la primera palabra más primera letra de la última (si hay más de una), en mayúsculas, ignorando espacios sobrantes.
- **R5.** Si `name` está vacío o solo tiene espacios, entonces el `app-avatar` deberá mostrar `?`.
- **R6.** Donde haya `src`, el `app-avatar` deberá renderizar `<img [src] alt="">` en lugar de las iniciales.
- **R7.** Cuando la imagen emita `error`, el `app-avatar` deberá quitar la `<img>` y mostrar las iniciales (R4).
- **R8.** Cuando cambie `src`, el `app-avatar` deberá volver a intentar la imagen nueva.
- **R9.** Donde `size` sea `s`, `l` o `xl`, el `app-avatar` deberá exponer `data-size` con ese valor; con `m` (por defecto) no deberá exponer `data-size`.

AvatarGroup:

- **R10.** El `app-avatar-group` deberá ser el elemento `.avatar-group` (host binding) y renderizar un `app-avatar` por cada una de las primeras `max` personas de `people`, en orden, pasando `name`, `src` y `size`.
- **R11.** Donde no se indique, `max` deberá valer `3` y `size` deberá valer `s`.
- **R12.** Si `people` tiene más de `max` personas, entonces el `app-avatar-group` deberá añadir al final `<span class="avatar" data-more role="img" aria-label="N más">+N</span>`, con N = personas ocultas y el mismo `data-size` que los avatares.
- **R13.** Si `people` tiene `max` personas o menos, entonces el `app-avatar-group` no deberá renderizar el contador.
- **R14.** Donde `onTint` sea `true`, el `app-avatar-group` deberá exponer `data-on-tint=""`; si no, no deberá exponerlo.

Común:

- **R15.** `app-avatar` y `app-avatar-group` no deberán usar `styleUrl` ni estilos de componente; todo el aspecto viene de `avatar.css`.

## Data model

```ts
// src/app/shared/avatar/avatar.ts
type AvatarSize = 's' | 'm' | 'l' | 'xl';
// inputs: name: string (required) · src?: string · size: AvatarSize = 'm'
// estado interno: failed = signal(false), se reinicia al cambiar src (linkedSignal o effect)
// funciones puras exportadas para test: initials(name) · tintFor(name)

// src/app/shared/avatar/avatar-group.ts
interface AvatarPerson { name: string; src?: string }
// inputs: people: AvatarPerson[] (required) · max = 3 · size: AvatarSize = 's' · onTint = false
// computed: shown = people.slice(0, max) · extra = people.length - shown.length
```

## Implementation plan

1. Copiar literal `avatar.css` del DS (`project/assets/Code/styles/blocks/avatar.css`) a `src/styles/blocks/`. Añadir `@import` en `src/styles.css` tras `badge.css`. `npm run build` sin errores (R15).
2. Crear `Avatar` con host bindings igual que `Badge` (`src/app/shared/badge/badge.ts`): `class: 'avatar u-tint'`, `role`, `aria-label`, `data-tint`, `data-size`. `initials` y `tintFor` como funciones puras portadas del bundle. `failed = linkedSignal(() => { src(); return false; })`. Template: `@if (src() && !failed())` `<img (error)="failed.set(true)">`, si no, iniciales (R1–R9).
3. `avatar.spec.ts` con el helper `render()` de `icon.spec.ts`: tests de `initials` (una palabra, varias, espacios, vacío, minúsculas) y `tintFor` (estable, valor conocido), más R1–R9 en el DOM, incluido disparar `error` en la `<img>` y cambiar `src` después.
4. Crear `AvatarGroup`: host `class: 'avatar-group'`, `[attr.data-on-tint]`. Template `@for` sobre `shown()` con `<app-avatar>` y `@if (extra() > 0)` el contador; `data-size` del contador con la misma regla que R9 (R10–R14).
5. `avatar-group.spec.ts`: un test por R10–R14 (2 personas sin contador, 6 con `max` 3 da «+3», `max` 4 + `size="m"` sin `data-size`, `src` llega al avatar, `onTint`).
6. Marcar ítem en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R14.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/avatar.css` y el del DS es vacío.
- [x] `src/app/shared/avatar/` no declara `styles` ni `styleUrl` (R15).
- [x] `<app-avatar name="Adrian Murillo" size="l" />` renderiza `class="avatar u-tint"`, `role="img"`, `aria-label="Adrian Murillo"`, `data-size="l"`, `data-tint` igual al de `tintFor('Adrian Murillo')` del bundle DS, y el texto `AM`.
- [x] Un `app-avatar` con `src` que da 404 acaba mostrando las iniciales (R7).
- [x] `<app-avatar-group [people]="seis personas" />` renderiza 3 avatares `data-size="s"` y `+3` con `aria-label="3 más"`.
- [x] Sin emojis ni copy por defecto en inglés.

## Decisions

- **Sí:** convenciones de SPEC 02/03/06: `src/app/shared/avatar/`, clases `Avatar`/`AvatarGroup`, host = bloque vía `host` bindings, CSS literal del DS. Los dos componentes en la misma carpeta: el grupo solo existe para el avatar.
- **Sí:** tamaños `s | m | l | xl`, todo lo que define `avatar.css`; `m` sin `data-size` (regla `sz()` del bundle). **No:** `sm|md|lg` de la api card, obsoleta.
- **Sí:** tinte e iniciales con el algoritmo literal del bundle DS, para que el mismo nombre dé el mismo color que en el DS. **No:** input `tint` manual.
- **Sí:** si la imagen falla, volver a iniciales; se reintenta al cambiar `src`. **No:** dejar el círculo vacío como el DS.
- **Sí:** `people: { name, src? }[]` para permitir fotos en el grupo. **No:** `string[]` del DS; diverge a propósito.
- **Sí:** `<img alt="">` decorativa; el nombre lo da `aria-label` del host con `role="img"` (DS).
- **Sí:** contador «+N» con `role="img"` y `aria-label="N más"`. **No:** `aria-label` sin rol como el DS (algunos lectores lo ignoran). **No:** `role="group"` con etiqueta en el grupo; lo pone el consumidor si lo necesita.
- **Sí:** `onTint` como input del grupo (lo necesita EventCard sobre tinte).
- **No:** ruta demo. Se verifica con Vitest y build.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| En SSR la `<img>` rota no dispara `error` en servidor; se hidrata con `<img>` y el error llega en navegador | `failed` es estado de cliente; tras el `error` se pintan iniciales. Aceptado. |
| `(error)` puede dispararse antes de hidratar y perderse | `withEventReplay()` ya está en `app.config.ts`; si aun así falla, se revisa con `img.complete && !naturalWidth` en `afterNextRender`. |
| Nombres con letra inicial fuera de BMP (p. ej. combinantes) dan iniciales raras | Mismo comportamiento que el DS; aceptado. |
| Resincronizar `avatar.css` desde el DS con otra API de atributos | `diff` vacío documentado; tests de R9, R12, R14 detectan nombres cambiados. |

## What is **not** in this spec

- Uso en EventCard, DayView, SidebarNav; tinte manual; lista de ocultos tras «+N»; página demo.

Cada uno, si llega, va en su propio spec.
