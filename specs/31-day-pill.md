# SPEC 31 — Componente DayPill

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 15
> **Date:** 2026-10-24
> **Objective:** Crear `app-day-pill` como píldora tonta de día de la semana (inicial + número) que refleja el DayPill del DS Agenda (hoy, seleccionado, con eventos, deshabilitado, fluido), con nombre accesible opcional.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/day-pill.css`: copia literal del DS (`project/assets/Code/styles/blocks/day-pill.css`). Importado en `src/styles.css` tras `menu.css`.
- `src/app/shared/day-pill/day-pill.ts` — componente `DayPill` (selector `app-day-pill`, template externo `day-pill.html`).
- Test Vitest `day-pill.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts`: sección DayPill e índice.
- Marcar «DayPill» en `TODO.md`.

**Out of scope:**

- Estados forzados `data-force` (hover/active/focus del preview DS). La regla viene en el CSS copiado, pero el componente no la expone.
- Construir el texto de `label` (lo hará `WeekStrip` con la fecha completa).
- Selección: el componente no cambia `selected` por sí solo; el consumidor lo controla.

## Requisitos (EARS)

- **R1.** El `app-day-pill` deberá renderizar un único `<button type="button" class="day-pill">` con `<span class="day-pill__dow">` (texto `dow`) y `<span class="day-pill__num">` (texto `num`), en ese orden; `dow` y `num` son obligatorios.
- **R2.** El `DayPill` deberá poner `aria-pressed` igual a `selected` (`"true"`/`"false"`, por defecto `false`).
- **R3.** Donde `today` sea verdadero, el `button` deberá tener `data-today` y `aria-current="date"`; si no, ninguno de los dos.
- **R4.** Donde `hasEvents` sea verdadero, el `DayPill` deberá renderizar `<span class="day-pill__dot">` tras el número; si no, no.
- **R5.** Donde `fluid` sea verdadero, el `button` deberá tener `data-fluid`; si no, no.
- **R6.** Donde `disabled` sea verdadero, el `button` deberá tener `disabled` nativo.
- **R7.** Donde `label` tenga valor, el `button` deberá tener `aria-label` igual a `label`; si no, sin `aria-label`.
- **R8.** Cuando el usuario hace clic en el `button` habilitado, el `DayPill` deberá emitir `clicked` con el `MouseEvent`; mientras `disabled`, no deberá emitir.
- **R9.** El `DayPill` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `day-pill.css`.

## Data model

```ts
// src/app/shared/day-pill/day-pill.ts
export class DayPill {
  // inputs: dow: string (required) · num: number | string (required) · label?: string
  //         selected · today · hasEvents · disabled · fluid: boolean = false (booleanAttribute)
  // output: clicked: MouseEvent
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `day-pill.css` del DS a `src/styles/blocks/`, sin cambios; `@import` en `src/styles.css` tras `menu.css` (R9).
2. `day-pill.spec.ts` con host de test (atributos sin valor, `(clicked)`): un test por R1–R8. Fallan.
3. Crear `DayPill` (`templateUrl: './day-pill.html'`), patrón de `Fab`: `button.day-pill` con `[attr.aria-pressed]`, `[attr.data-today]`, `[attr.aria-current]`, `[attr.data-fluid]`, `[attr.aria-label]`, `[disabled]`, `(click)` que emite `clicked`; spans `dow`, `num` y punto `@if (hasEvents())`. Tests en verde.
4. Demo: sección `day-pill` en `demo-page.html` (tras Menu), `{ id: 'day-pill', name: 'DayPill' }` en `SECTIONS` y `'day-pill'` en `IDS`. Copy del preview DS: tira semanal L 19 – D 25 en `.l-cluster[data-gap=2xs]` (19 disabled, 22 hoy, 23 seleccionado, eventos en 20, 22 y 23) con `label` completo (p. ej. «Jueves 22 de octubre, hoy, con eventos»); clic selecciona el día (signal en la demo).
5. Playwright en `/demo`: hover `color-brand-soft`, seleccionado `color-brand`, borde de hoy, punto, focus-visible con anillo, disabled, consola limpia.
6. Marcar «DayPill» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R8.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/day-pill.css` y el original del DS no muestra diferencias.
- [x] `src/app/shared/day-pill/` no declara `styles` ni `styleUrl` (R9).
- [x] Un único `button.day-pill[type=button]` con `dow` y `num` en sus spans (R1).
- [x] `aria-pressed` sigue a `selected` (R2).
- [x] `today` da `data-today` y `aria-current="date"` (R3).
- [x] `hasEvents` añade `.day-pill__dot`; `fluid` da `data-fluid` (R4, R5).
- [x] `disabled` nativo y sin `clicked`; habilitado emite `clicked` (R6, R8).
- [x] `label` da `aria-label`; sin `label`, ninguno (R7).
- [x] `/demo` muestra la sección DayPill con la tira del paso 4 y aparece en el índice.
- [x] Ítem «DayPill» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** input `label` opcional para `aria-label` y `aria-current="date"` con `today` (decidido con el usuario). El DS no los tiene; sin ellos solo se anuncia «L 19» y «hoy» / «con eventos» dependen del color.
- **Sí:** `button.day-pill` interno y salida `clicked`, patrón de `Fab`/`IconButton`. **No:** clase en el host.
- **Sí:** `num` acepta `number | string`, como el DS.
- **No:** `data-force`: ningún componente del repo lo soporta; la demo usa estados reales.
- **Sí:** CSS copiado literal (incluye `inline-size: 3.5rem`/`block-size: 5rem` literales, reglas `data-force` y la sangría irregular de `outline-offset`).

## What is **not** in this spec

- `data-force`; texto de `label` automático; `WeekStrip`.
