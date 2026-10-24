# SPEC 14 — Types compartidos de UI

> **Status:** Implemented
> **Depends on:** SPEC 02, SPEC 03, SPEC 06, SPEC 07, SPEC 10, SPEC 12, SPEC 13
> **Date:** 2026-10-23
> **Objective:** Reunir en `src/app/shared/types/ui.ts` los types de tamaño, tono y categoría que hoy se repiten con nombres distintos en varios componentes, y hacer que todos los consuman desde ahí.

## Why

- `AvatarSize` e `IconSize` son el mismo `'s' | 'm' | 'l' | 'xl'`.
- `ButtonSize` y `SpinnerSize` son el mismo `'s' | 'm' | 'l'`.
- `BadgeTone` y `ProgressTone` describen el mismo eje (tono del DS) con valores distintos.
- `BadgeCategory` es la paleta de categorías del DS; la reutilizarán AgendaItem y EventCard (`TODO.md`).

## Scope

**In:**

- Nuevo `src/app/shared/types/ui.ts` con `Size`, `Tone` y `Category`.
- Borrar `AvatarSize`, `IconSize`, `ButtonSize`, `SpinnerSize`, `BadgeTone`, `BadgeCategory`, `ProgressTone`.
- Actualizar los inputs de `icon.ts`, `avatar.ts`, `avatar-group.ts`, `spinner.ts`, `button.ts`, `button-link.ts`, `badge.ts`, `progress.ts` para usar los types compartidos.

**Out of scope (para specs futuros):**

- `ButtonVariant`: solo lo usan Button y ButtonLink (mismo bloque CSS); se queda en `button.ts`.
- Types de un solo componente (`TextFieldType`, `SkeletonShape`, `SkeletonListVariant`, `SelectOption`, `AvatarPerson`, `ValidatorConfig`): no se repiten.
- Barrel `index.ts` o un fichero por dominio.
- Cambios de comportamiento, valores por defecto, templates o CSS.
- Unificar `disabled` (`booleanAttribute` en Button, `boolean` plano en los fields).
- Reescribir specs antiguos que citan los nombres borrados.

## Requisitos (EARS)

- **R1.** El fichero `src/app/shared/types/ui.ts` deberá exportar `Size`, `Tone` y `Category`, y nada más.
- **R2.** `Size` deberá ser `'s' | 'm' | 'l' | 'xl'`.
- **R3.** `Tone` deberá ser la unión de todos los tonos usados hoy: `'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'inverse' | 'glass' | 'count'`.
- **R4.** `Category` deberá ser `'orange' | 'violet' | 'red' | 'blue' | 'green' | 'mustard' | 'cyan'`.
- **R5.** El input `size` de `Icon`, `Avatar` y `AvatarGroup` deberá tiparse como `Size`.
- **R6.** El input `size` de `Spinner`, `Button` y `ButtonLink` deberá tiparse como `Exclude<Size, 'xl'>`.
- **R7.** El input `tone` de `Badge` deberá tiparse como `Exclude<Tone, 'accent'>`.
- **R8.** El input `tone` de `Progress` deberá tiparse como `Extract<Tone, 'brand' | 'success' | 'accent'>`.
- **R9.** El input `category` de `Badge` deberá tiparse como `Category`.
- **R10.** El código de `src/` no deberá declarar ni importar `AvatarSize`, `IconSize`, `ButtonSize`, `SpinnerSize`, `BadgeTone`, `BadgeCategory` ni `ProgressTone`.
- **R11.** Si un consumidor pasa un valor fuera del subconjunto (p. ej. `size="xl"` a `app-button`), entonces `strictTemplates` deberá dar error de compilación, igual que hoy.
- **R12.** Los valores por defecto de los inputs y el HTML renderizado no deberán cambiar.

## Data model

```ts
// src/app/shared/types/ui.ts
export type Size = 's' | 'm' | 'l' | 'xl';
export type Tone =
  | 'neutral' | 'brand' | 'accent' | 'success' | 'warning'
  | 'danger' | 'info' | 'inverse' | 'glass' | 'count';
export type Category = 'orange' | 'violet' | 'red' | 'blue' | 'green' | 'mustard' | 'cyan';
```

Uso en componentes (import relativo `../types/ui`):

| Componente | Input | Type |
| --- | --- | --- |
| Icon, Avatar, AvatarGroup | `size` | `Size` |
| Spinner, Button, ButtonLink | `size` | `Exclude<Size, 'xl'>` |
| Badge | `tone` | `Exclude<Tone, 'accent'>` |
| Badge | `category` | `Category` |
| Progress | `tone` | `Extract<Tone, 'brand' \| 'success' \| 'accent'>` |

## Implementation plan

1. Crear `src/app/shared/types/ui.ts` con `Size`, `Tone`, `Category` (R1–R4). Nadie lo importa aún; build verde.
2. Icon, Avatar, AvatarGroup: borrar `IconSize`/`AvatarSize`, usar `Size` (R5). `avatar-group.ts` deja de importar `AvatarSize` de `avatar.ts`.
3. Spinner, Button, ButtonLink: borrar `SpinnerSize`/`ButtonSize`, usar `Exclude<Size, 'xl'>` (R6). `button-link.ts` sigue importando `ButtonVariant` de `button.ts`.
4. Badge y Progress: borrar `BadgeTone`, `BadgeCategory`, `ProgressTone`; usar R7–R9.
5. `grep -rn "AvatarSize\|IconSize\|ButtonSize\|SpinnerSize\|BadgeTone\|BadgeCategory\|ProgressTone" src` vacío (R10). `npm test -- --watch=false` y `npm run build` en verde (R12).

## Acceptance criteria

- [x] `src/app/shared/types/ui.ts` existe y exporta exactamente `Size`, `Tone`, `Category` con los valores de R2–R4.
- [x] El grep del paso 5 no devuelve resultados (R10).
- [x] Cada input listado en la tabla del Data model usa el type indicado (R5–R9).
- [x] `npm test -- --watch=false` pasa sin tocar ningún `*.spec.ts` (R12).
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] Poner temporalmente `<app-button size="xl">` en un template da error de `strictTemplates`; se revierte tras comprobarlo (R11).
- [x] `git diff --stat` solo toca `src/app/shared/types/ui.ts` y los 8 `.ts` de componente.

## Decisions

- **Sí:** un único fichero `src/app/shared/types/ui.ts`. Pocos types. **No:** carpeta con un fichero por dominio + barrel: sobra para 3 types.
- **Sí:** un solo `Size` de 4 valores; los componentes de 3 tamaños usan `Exclude<Size, 'xl'>`. **No:** `Size3`/`Size4`: dos nombres para la misma escala.
- **Sí:** borrar los alias por componente. **No:** mantener `ButtonSize = …` como alias: vuelve a haber nombres distintos para lo mismo.
- **Sí:** `Tone` = unión total; cada componente acota con `Exclude`/`Extract`. **No:** `Tone` solo semántico con extras locales en Badge: deja tonos fuera de la fuente única.
- **Sí:** mover `Category` ya, aunque hoy solo la use Badge: AgendaItem y EventCard la necesitarán.
- **No:** mover `ButtonVariant`: no es transversal.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `Exclude`/`Extract` en `input<…>()` hace los tipos menos legibles en el hover del IDE | Aceptado; el valor real se ve en `ui.ts`. |
| Un componente futuro añade un tono y lo mete local en vez de en `Tone` | `Tone` es la fuente; el componente acota con `Extract`. |

## What is **not** in this spec

- `ButtonVariant` y types de un solo componente.
- Barrel o fichero por dominio.
- Unificar `disabled`/`booleanAttribute`.
- Cambios de comportamiento, templates o CSS.
