# SPEC 32 — Componente AgendaItem

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 14, SPEC 15
> **Date:** 2026-10-24
> **Objective:** Crear `app-agenda-item` como fila tonta de la agenda (hora inicio/fin, barra de categoría con `u-category`, categoría y título en el input `heading`) que refleja el AgendaItem del DS Agenda (seleccionado, cancelado, deshabilitado), con estados accesibles por texto y no solo por color.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/agenda-item.css`: copia literal del DS (`project/assets/Code/styles/blocks/agenda-item.css`, incluye `.agenda-group__title`). Importado en `src/styles.css` tras `day-pill.css`.
- `src/app/shared/agenda-item/agenda-item.ts` — componente `AgendaItem` (selector `app-agenda-item`, template externo `agenda-item.html`).
- Test Vitest `agenda-item.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts`: sección AgendaItem e índice.
- Marcar «AgendaItem» en `TODO.md`.

**Out of scope:**

- Estados forzados `data-force` (prop `state` del DS). La regla viene en el CSS copiado, pero el componente no la expone.
- Componente de grupo por día: la demo usa `.agenda-group__title` en un `h3` a mano.
- Ordenar por hora o formatear horas: el consumidor pasa `start`/`end` como texto `HH:MM`.
- Menú de acciones de la cita (`app-menu`): lo decidirá la pantalla.

## Requisitos (EARS)

- **R1.** El `app-agenda-item` deberá renderizar un único `<button type="button" class="agenda-item">` con, en orden: `<span class="agenda-item__time">` (con `<span class="agenda-item__start">` = `start`), `<span class="agenda-item__bar" aria-hidden="true">` y un `<span>` con `<span class="agenda-item__title">` = `heading`; `start` y `heading` son obligatorios. El título entra por `heading` (no `title`), para no dejar el atributo nativo `title` en el host.
- **R2.** Donde `end` tenga valor, el `.agenda-item__time` deberá renderizar `<span class="agenda-item__end">` = `end` tras el inicio; si no, no.
- **R3.** Donde `category` tenga valor, el `button` deberá tener la clase `u-category` y `data-category` = `category`; si no, ninguna de las dos.
- **R4.** Donde `categoryLabel` tenga valor, el `AgendaItem` deberá renderizar `<span class="agenda-item__category">` = `categoryLabel` antes del título; si no, no.
- **R5.** El `AgendaItem` deberá poner `aria-pressed` igual a `selected` (`"true"`/`"false"`, por defecto `false`) y, mientras `selected`, `data-selected`.
- **R6.** Mientras `cancelled`, el `button` deberá tener `data-cancelled` y un `<span class="u-visually-hidden">Cancelada. </span>` antes del título; si no, ninguno de los dos.
- **R7.** Donde `disabled` sea verdadero, el `button` deberá tener `disabled` nativo.
- **R8.** Cuando el usuario hace clic en el `button` habilitado, el `AgendaItem` deberá emitir `clicked` con el `MouseEvent`; mientras `disabled`, no deberá emitir.
- **R9.** El `AgendaItem` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `agenda-item.css` y `category.css`.

## Data model

```ts
// src/app/shared/agenda-item/agenda-item.ts
export class AgendaItem {
  // inputs: start: string (required) · heading: string (required) · end?: string
  //         category?: Category · categoryLabel?: string
  //         selected · cancelled · disabled: boolean = false (booleanAttribute)
  // output: clicked: MouseEvent
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `agenda-item.css` del DS a `src/styles/blocks/`, sin cambios; `@import` en `src/styles.css` tras `day-pill.css` (R9).
2. `agenda-item.spec.ts` con host de test (atributos sin valor, `(clicked)`): un test por R1–R8. Fallan.
3. Crear `AgendaItem` (`templateUrl: './agenda-item.html'`), patrón de `DayPill`: `button.agenda-item` con `[class.u-category]`, `[attr.data-category]`, `[attr.aria-pressed]`, `[attr.data-selected]`, `[attr.data-cancelled]`, `[disabled]`, `(click)` que emite `clicked`; spans del markup DS, `@if` para `end`, `categoryLabel` y texto oculto de cancelado. `Category` de `shared/types/ui.ts`. Tests en verde.
4. Demo: sección `agenda-item` en `demo-page.html` (tras DayPill), `{ id: 'agenda-item', name: 'AgendaItem' }` en `SECTIONS` y `'agenda-item'` en `IDS`. Copy del preview DS: columna `21.25rem` «Tu agenda · Jue 22 oct» (`h3.agenda-group__title`) con las 5 citas (08:30 – 09:00 Marketing «3 categorías de rocas»… 17:00 – 17:15 Personal «Dentista · Calle 85»); clic selecciona la cita (signal en la demo). Segunda columna «Estados»: cancelado («Reunión cancelada») y disabled («Evento pasado»).
5. Playwright en `/demo`: hover `color-surface-sunken`, seleccionado `color-brand-soft`, barra con color de categoría, tachado de cancelado, focus-visible con anillo, disabled, consola limpia.
6. Marcar «AgendaItem» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R8.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/agenda-item.css` y el original del DS no muestra diferencias.
- [x] `src/app/shared/agenda-item/` no declara `styles` ni `styleUrl` (R9).
- [x] Un único `button.agenda-item[type=button]` con hora, barra `aria-hidden` y título de `heading`; sin `title` en el host (R1).
- [x] `end` añade `.agenda-item__end`; `categoryLabel` añade `.agenda-item__category` (R2, R4).
- [x] `category` da `u-category` y `data-category` (R3).
- [x] `aria-pressed` y `data-selected` siguen a `selected` (R5).
- [x] `cancelled` da `data-cancelled` y texto oculto «Cancelada.» (R6).
- [x] `disabled` nativo y sin `clicked`; habilitado emite `clicked` (R7, R8).
- [x] `/demo` muestra la sección AgendaItem del paso 4 y aparece en el índice.
- [x] Ítem «AgendaItem» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** texto oculto «Cancelada.» con `cancelled` (decidido con el usuario). El DS solo tacha y apaga el color; regla «estado = palabra, nunca solo color».
- **Sí:** `aria-pressed` = `selected`, mismo patrón que `DayPill` (decidido con el usuario). El DS solo pone `data-selected`.
- **Sí:** input `heading` en lugar de `title` del DS (decidido con el usuario al ver el tooltip en `/demo`), como SPEC 23 en Card: con `title="…"` estático el host conservaba el atributo nativo (tooltip y nombre accesible). La clase `.agenda-item__title` se mantiene.
- **Sí:** `button.agenda-item` interno y salida `clicked`, patrón de `DayPill`. **No:** clase en el host.
- **No:** `data-force` / `state`: ningún componente del repo lo soporta; la demo usa estados reales.
- **Sí:** CSS copiado literal (incluye `.agenda-group__title`, reglas `data-force` y la sangría irregular de `outline-offset`).

## What is **not** in this spec

- `data-force`; componente de grupo por día; orden/formato de horas; menú de acciones.
