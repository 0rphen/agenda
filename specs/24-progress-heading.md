# SPEC 24 — Progress: input `heading` en lugar de `title`

> **Status:** Implemented
> **Depends on:** SPEC 10, SPEC 23
> **Date:** 2026-10-23
> **Objective:** Renombrar el input `title` de `Progress` a `heading` para que el host no reciba el atributo nativo `title` ni muestre tooltip, conservando `label` y el nombre accesible.

## Scope

**In:**

- `src/app/shared/progress/progress.ts`: input `title` pasa a `heading`; `name` usa `label ?? heading ?? 'Progreso'`.
- `src/app/shared/progress/progress.html`: usa `heading()`.
- `src/app/shared/progress/progress.spec.ts`: tests R5 y R6 de SPEC 10 con `heading`; test nuevo de ausencia de atributo `title`.
- `src/app/demo/demo-page.html`: sección Progress usa `heading="..."`.
- Marcar el ítem en `TODO.md`.

**Out of scope:**

- Clase CSS `.progress__title` y `progress.css` (siguen igual, son del DS).
- Cambiar `<span class="progress__title">` por un encabezado `h*`.
- Alias `title` o compatibilidad hacia atrás (no hay consumidores fuera de demo y tests).
- `'[attr.title]': 'null'` en host.
- Editar SPEC 10 (queda como histórico; este spec sustituye su R5 y R6 en lo relativo al título).

## Requisitos (EARS)

- **R1.** Donde `heading` tenga valor, el `app-progress` deberá renderizar `<span class="progress__title">` con ese texto antes de `.progress__row`; sin `heading`, no deberá renderizarlo.
- **R2.** El `Progress` no deberá declarar input `title`.
- **R3.** Donde `heading` se pase como atributo estático (`heading="..."`) o enlazado (`[heading]`), el host no deberá tener atributo `title`.
- **R4.** El `.progress__track` deberá exponer `aria-label` con `label`; si no hay `label`, con `heading`; si no hay ninguno, con `Progreso`.
- **R5.** La demo `/demo` deberá usar `heading` en todas las barras con título.

## Data model

Sin estructuras nuevas. Cambio de firma:

```ts
// src/app/shared/progress/progress.ts
readonly heading = input<string>(); // antes: title
protected readonly name = computed(() => this.label() ?? this.heading() ?? 'Progreso');
```

## Implementation plan

1. `progress.spec.ts`: tests R5/R6 de SPEC 10 pasan a usar `heading` (R1, R4); añadir test R3 con host de test estático (`heading="..."`) y enlazado (`[heading]`) sin atributo `title`. Fallan.
2. `progress.ts`: renombrar input a `heading` y actualizar `name`. `progress.html`: `title()` pasa a `heading()` (condición `@if` y texto). Tests en verde (R1–R4).
3. `demo-page.html`: `title="Tareas de la semana"` y `title="Completado"` pasan a `heading="..."` (R5).
4. Playwright en `/demo`: barras de la sección Progress sin atributo `title` en host, `.progress__title` con el texto, `aria-label` correcto, consola limpia.
5. Marcar ítem en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa, con tests para R1–R4.
- [x] `npm run build` sin errores ni warnings de budget.
- [x] `grep -n "title" src/app/shared/progress/progress.ts` no encuentra input `title` (R2).
- [x] `<app-progress [value]="40" heading="Tareas de la semana" />` renderiza `.progress__title` «Tareas de la semana», track con `aria-label="Tareas de la semana"` y host sin atributo `title` (R1, R3, R4).
- [x] `<app-progress [value]="10" [heading]="x" />` no tiene atributo `title` (R3).
- [x] `label="Tareas"` + `heading="Market Research"` da `aria-label="Tareas"`; sin ninguno, `Progreso` (R4).
- [x] `/demo` (Playwright): ninguna barra con atributo `title`, títulos visibles, consola limpia (R5).
- [x] Ítem marcado en `TODO.md`.

## Decisions

- **Sí:** renombrar a `heading`, igual que Card (SPEC 23). API coherente y sin colisión con atributo global HTML. **No:** `caption` (distinto de Card sin ganar nada).
- **Sí:** romper API sin alias; solo la usan demo y tests. **No:** alias `title` (seguiría siendo atributo estático y volvería el tooltip). **No:** `'[attr.title]': 'null'` en host (oculta el tooltip pero el texto no se ve; mantiene nombre confuso).
- **Sí:** mantener `<span>` y clase `.progress__title` (estructura y nombre del DS). **No:** pasar a `h*` (cambia estructura del documento; fuera del bug).
- **Sí:** nombre accesible `label ?? heading ?? 'Progreso'` (misma precedencia que SPEC 10).
- **No:** editar SPEC 10; este spec lo sustituye en lo relativo al título.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Consumidor futuro escribe `title="..."` por costumbre: compila (atributo nativo válido) y vuelve el tooltip sin título visible ni nombre accesible propio | Demo muestra `heading`; sin mitigación técnica, aceptado (igual que SPEC 23). |

## What is **not** in this spec

- Cambios en `progress.css`; `span` a `h*`; alias `title`; edición de SPEC 10.
