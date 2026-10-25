# SPEC 52 — Componente MonthView

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 06 (`badge__dot`), SPEC 15, SPEC 45 (patrón `WeekViewEvent`), SPEC 47 (`@shared/utils`), SPEC 49 (roving tabindex)
> **Date:** 2026-10-25
> **Objective:** Crear `app-month-view`, rejilla mensual de 6 semanas que refleja el MonthView del DS Agenda: cabecera de días abreviable, días fuera de mes, hoy y seleccionado, hasta `maxPerDay` chips de eventos por categoría y «+N más», con flechas entre días.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/month-view.css`: copia del DS (`project/assets/Code/styles/blocks/month-view.css`) con `container: month-view / inline-size` en `.month-view`, nombre abreviado de día bajo 40rem y reglas `[data-force]` en `.month-view__chip`; importado en `src/styles.css` tras `week-view.css`.
- `src/app/shared/components/month-view/month-view.ts` + `month-view.html` — componente `MonthView` (selector `app-month-view`).
- `src/app/shared/interfaces/month-view.ts` (`MonthViewEvent`, `MonthViewDay`) re-exportado en `interfaces/index.ts`.
- Tests Vitest `month-view.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts`: sección MonthView e índice.
- Marcar «MonthView» en `TODO.md`.

**Out of scope:**

- Navegación entre meses dentro del componente (botones o flechas que cambian `year`/`month`).
- Popover o expansión de celda para «+N más»; crear o arrastrar eventos.
- Home/End y PageUp/PageDown.
- Pantalla «Calendario · Mes» dentro del shell.

## Requisitos (EARS)

- **R1.** El `app-month-view` deberá tener clase `month-view`, `role="region"` y `aria-label` = `label` (por defecto «Mes»).
- **R2.** El `MonthView` deberá renderizar siete `div.month-view__dow` con `aria-hidden="true"`, cada uno con `span.month-view__dow-long` (`lunes`…`domingo`) y `span.month-view__dow-short` (`lun`, `mar`, `mié`, `jue`, `vie`, `sáb`, `dom`).
- **R3.** Mientras el contenedor `month-view` mida menos de 40rem, el `month-view.css` deberá mostrar solo `.month-view__dow-short`; si no, solo `.month-view__dow-long`.
- **R4.** El `MonthView` deberá renderizar 42 `div.month-view__cell` desde el lunes de la semana del día 1 de `year`/`month` (0–11), cada uno con `role="group"`, `aria-label` = fecha larga en español con mayúscula inicial (como `MiniCalendar`) y `data-out` donde el día no sea del mes, `data-today` donde su ISO sea `today` y `data-selected` donde sea `selected`.
- **R5.** Cada celda deberá contener `button.month-view__num` con el número del día, `aria-label` = fecha larga (más «, hoy» en hoy), `aria-pressed` (`true` si es `selected`) y `aria-current="date"` en hoy.
- **R6.** Cuando el usuario pulsa `button.month-view__num`, el `MonthView` deberá fijar `selected` a ese ISO (`model`, emite `selectedChange`), también para días fuera de mes.
- **R7.** El `MonthView` deberá renderizar en cada celda, en el orden recibido, hasta `maxPerDay` (por defecto 3) eventos cuyo `day` coincida, como `button.month-view__chip.u-category` con `data-category` (por defecto `blue`), `span.badge__dot[data-category-dot]` y `span.month-view__chip-text` «HH:MM título» (solo título sin `start`).
- **R8.** Donde un evento sea `cancelled`, el `MonthView` deberá poner `data-cancelled` en el chip y el texto oculto «Cancelado.» antes del texto; donde tenga `state`, `data-force` con su valor.
- **R9.** Cuando el usuario pulsa un chip, el `MonthView` deberá emitir `eventSelected` con ese evento.
- **R10.** Si un día tiene más de `maxPerDay` eventos, entonces el `MonthView` deberá renderizar tras los chips `button.month-view__more` «+N más» (N = restantes) y, cuando el usuario lo pulsa, emitir `moreSelected` con el ISO del día; con `maxPerDay` o menos no deberá renderizarlo.
- **R11.** El `MonthView` deberá dar `tabindex="0"` a un solo `button.month-view__num` (el enfocado; por defecto `selected` si está en la rejilla, si no `today`, si no el día 1) y `tabindex="-1"` al resto.
- **R12.** Cuando el foco está en un número y el usuario pulsa →, ←, ↓ o ↑, el `MonthView` deberá mover el foco ±1 o ±7 días dentro de las 42 celdas y darle `tabindex="0"`; si el destino sale de la rejilla, el foco no deberá moverse. No deberá cambiar `selected`.
- **R13.** El `MonthView` no deberá usar `styleUrl` ni estilos de componente; el aspecto viene de `month-view.css`.

## Data model

```ts
// src/app/shared/interfaces/month-view.ts
export interface MonthViewEvent {
  day: string; // ISO 'YYYY-MM-DD'
  title: string;
  start?: string; // 'HH:MM'
  category?: Category;
  cancelled?: boolean;
  state?: 'hover' | 'focus';
}
export interface MonthViewDay {
  iso: string;
  num: number;
  out: boolean;
  today: boolean;
  label: string;
  events: MonthViewEvent[]; // ya recortado a maxPerDay
  more: number;
}

// src/app/shared/components/month-view/month-view.ts
export class MonthView {
  // inputs:  year: number (required) · month: number 0–11 (required) · today = localIso(new Date())
  //          events: MonthViewEvent[] = [] · maxPerDay = 3 · label = 'Mes'
  // model:   selected?: string (ISO)
  // outputs: eventSelected: MonthViewEvent · moreSelected: string (ISO)
}
```

Nombres cortos de día como constante en `utils/time.ts` si no existe equivalente.

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `month-view.css` del DS, añadir container, reglas `__dow-long`/`__dow-short` y `[data-force]` del chip (hover = `:hover`, focus = `:focus-visible`), importarlo tras `week-view.css` (R3, R13).
2. Crear `interfaces/month-view.ts` y re-exportarlo.
3. Crear `MonthView` con el markup de `function MonthView` del `bundle.js` del DS; `computed` de 42 días (UTC, como `MiniCalendar`), eventos agrupados por `day`, recorte y `more` (R1–R10).
4. Roving tabindex y flechas con `linkedSignal` + `afterRenderEffect`, como `MiniCalendar` (R11–R12).
5. `month-view.spec.ts`: al menos un test por R1–R2 y R4–R12.
6. Demo: sección `month-view` tras WeekView, `{ id: 'month-view', name: 'MonthView' }` en `SECTIONS` e `IDS`. Ejemplo del preview DS (octubre 2026, hoy 22, seleccionado 27, eventos del preview: el 22 con cinco y «+2 más», el 23 cancelado) más un chip `hover` y uno `focus`; botones «Mes anterior»/«Mes siguiente» que cambian `year`/`month`; texto «Seleccionado: fecha», «Evento: título» o «Más: fecha» al pulsar.
7. Comprobación en `/demo` con Playwright: rejilla 7×6, hoy y seleccionado resaltados, cabecera abreviada en ancho estrecho, flechas.
8. Marcar «MonthView» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por R1–R2 y R4–R12.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/month-view.css` y su original del DS sin diferencias (ignorando espacios, `diff -w`) salvo `container`, reglas `.month-view__dow-long`/`-short` con `@container month-view (width < 40rem)` y `[data-force]` en `.month-view__chip`.
- [x] `src/app/shared/components/month-view/` no declara `styles` ni `styleUrl` (R13).
- [x] Cabecera completa en ancho y «lun…dom» bajo 40rem (R2–R3).
- [x] 42 celdas desde lunes, fuera de mes, hoy y seleccionado (R4–R5).
- [x] Pulsar número cambia `selected` (R6).
- [x] Chips con categoría, hora, cancelado, `eventSelected` (R7–R9).
- [x] «+N más» y `moreSelected` (R10).
- [x] Un solo tab stop entre números y flechas sin salir de la rejilla (R11–R12).
- [x] `/demo` muestra la sección MonthView del paso 6, con cambio de mes, y aparece en el índice.
- [x] Ítem «MonthView» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** `events` como array con `day`, como `WeekViewEvent`; el DS usa `Record<ISO, []>`. Mismo array sirve a varias vistas.
- **Sí:** `selected` como `model`, como `MiniCalendar`; el DS usa `selected` + `onSelect`.
- **Sí:** `year` + `month` 0–11, literal del DS; el consumidor navega entre meses.
- **No:** `month` ISO o mes derivado de `selected` (exigiría navegación interna).
- **Sí:** output `eventSelected` en chip y `moreSelected(iso)` en «+N más»; el DS no les da acción. El consumidor decide qué abre.
- **No:** expandir la celda con «+N más»: rompe la regla DS «máx. 3 chips».
- **Sí:** host `role="region"` y celdas `role="group"` en vez de `grid`/`columnheader`/`gridcell` del DS: `grid` exige filas (`row`) y el DS no las pone (como SPEC 45). Cabecera `aria-hidden`; la fecha va en la celda y el botón.
- **Sí:** roving tabindex + flechas solo entre números, como SPEC 49; chips y «+N más» siguen en el orden Tab normal.
- **No:** patrón ARIA grid completo con `role="row"`: más código sin ganancia clara.
- **Sí:** flechas que no salen de las 42 celdas; días fuera de mes enfocables (son botones en el DS).
- **No:** output `monthChange` al cruzar el borde: acopla navegación.
- **Sí:** cabecera completa con forma de tres letras bajo 40rem por container query (divergencia del DS); los nombres completos desbordan en estrecho.
- **Sí:** estados forzados `state` por chip (solo demo), como DayView/WeekView; el CSS del DS no los tiene y se añaden.
- **Sí:** texto oculto «Cancelado.» como DayView/WeekView (el DS solo tacha).

## Risks

- `month-view.css` del DS tiene `outline-offset` con indentación rota en tres `:focus-visible`; se reindenta en local como hizo SPEC 51 con los demás bloques (diferencia solo de espacios).
- `today` por defecto con `new Date()` puede diferir entre servidor y navegador cerca de medianoche; mismo riesgo que `MiniCalendar`.

## What is **not** in this spec

- Navegación entre meses interna, popover de «+N más», crear/arrastrar eventos, Home/End/PageUp/PageDown, pantalla de mes en el shell.
