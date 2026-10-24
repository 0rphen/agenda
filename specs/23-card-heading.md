# SPEC 23 — Card: input `heading` en lugar de `title`

> **Status:** Implemented
> **Depends on:** SPEC 22
> **Date:** 2026-10-23
> **Objective:** Renombrar el input `title` de `Card` a `heading` para que el host no reciba el atributo nativo `title` ni muestre tooltip sobre toda la tarjeta.

## Scope

**In:**

- `src/app/shared/card/card.ts`: input `title` pasa a `heading`.
- `src/app/shared/card/card.html`: usa `heading()`.
- `src/app/shared/card/card.spec.ts`: tests R5–R8 de SPEC 22 con `heading`; test nuevo de ausencia de atributo `title`.
- `src/app/demo/demo-page.html`: sección Card usa `heading="..."`.
- Marcar el ítem en `TODO.md`.

**Out of scope:**

- Clase CSS `.card__title` y `card.css` (siguen igual, son del DS).
- Alias `title` o compatibilidad hacia atrás (no hay consumidores fuera de demo y tests).
- Editar SPEC 22 (queda como histórico; este spec sustituye su R5).
- Otros componentes con input `title` (no hay en `src/app/shared/`).

## Requisitos (EARS)

- **R1.** Donde `heading` tenga valor, el `Card` deberá renderizar `<div class="card__head">` con `<h3 class="card__title">` y el texto de `heading`.
- **R2.** El `Card` no deberá declarar input `title`.
- **R3.** Donde `heading` se pase como atributo estático (`heading="..."`) o enlazado (`[heading]`), el host no deberá tener atributo `title`.
- **R4.** Donde el consumidor proyecte `cardActions` sin `heading`, el `Card` deberá seguir renderizando `.card__head` sin `h3` (comportamiento de SPEC 22 R6 conservado).
- **R5.** Si no hay `heading` ni `cardActions`, entonces el `Card` no deberá renderizar `.card__head`.
- **R6.** La demo `/demo` deberá usar `heading` en todas las tarjetas con título.

## Data model

Sin estructuras nuevas. Cambio de firma:

```ts
// src/app/shared/card/card.ts
readonly heading = input<string>(); // antes: title
```

## Implementation plan

1. `card.spec.ts`: sustituir `title` por `heading` en host de test (`#actions`, `#button`) y en `render({ heading: ... })`; añadir test R3 (host estático y enlazado sin atributo `title`). Fallan.
2. `card.ts`: renombrar input a `heading`. `card.html`: `title()` pasa a `heading()` (condición `@if` y `h3`). Tests en verde (R1, R2, R4, R5).
3. `demo-page.html`: `title="Notas recientes"`, `"Hábitos"`, `"Reunión de equipo"` pasan a `heading="..."` (R6).
4. Playwright en `/demo`: tarjetas de la sección Card sin atributo `title` en host, `h3.card__title` con el texto, consola limpia.
5. Marcar ítem en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa, con tests para R1–R5.
- [x] `npm run build` sin errores ni warnings de budget.
- [x] `grep -n "title" src/app/shared/card/card.ts` no encuentra input `title` (R2).
- [x] `<app-card heading="Notas recientes">` renderiza `h3.card__title` «Notas recientes» y el host no tiene atributo `title` (R1, R3).
- [x] `<button app-card [heading]="x">` no tiene atributo `title` (R3).
- [x] Solo `cardActions`: `.card__head` sin `h3`; sin nada: sin `.card__head` (R4, R5).
- [x] `/demo` (Playwright): ninguna tarjeta con atributo `title`, títulos visibles, consola limpia (R6).
- [x] Ítem marcado en `TODO.md`.

## Decisions

- **Sí:** renombrar a `heading`. API explícita, sin colisión con atributo global HTML. **No:** `'[attr.title]': 'null'` en host (mantiene nombre confuso que choca con atributo global); **No:** alias `title` (seguiría siendo atributo estático y volvería el tooltip).
- **Sí:** romper API sin compatibilidad; solo la usan demo y tests.
- **Sí:** mantener clase `.card__title` (nombre del DS, no del input).
- **No:** editar SPEC 22; este spec lo sustituye en lo relativo al título.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Consumidor futuro escribe `title="..."` por costumbre: compila (atributo nativo válido) y vuelve el tooltip sin título visible | Card de demo muestra `heading`; sin mitigación técnica, aceptado. |

## What is **not** in this spec

- Cambios en `card.css`; alias `title`; edición de SPEC 22.
