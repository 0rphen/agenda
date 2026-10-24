# SPEC 45 — Componente WeekView

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 15, SPEC 22 (`u-tint`), SPEC 37 (`WeekDay`), SPEC 44 (patrón de scroll)
> **Date:** 2026-10-24
> **Objective:** Crear `app-week-view`, rejilla semanal por horas que refleja el WeekView del DS Agenda: cabecera con siete días y hoy resaltado, columna de horas, eventos posicionados por hora de inicio y fin, seleccionados o cancelados, y línea de «ahora» en la columna de hoy; con día completo 0–24 desplazable como `DayView`.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/week-view.css`: copia del DS (`project/assets/Code/styles/blocks/week-view.css`) con `padding-block-start: var(--space-2xs)`, `max-block-size` y `overflow-y: auto` en `.week-view__body` y `scrollbar-gutter: stable` en `.week-view__head` y `.week-view__body` (con `overflow: hidden` en la cabecera), importado en `src/styles.css` tras `day-view.css`.
- `src/app/shared/week-view/week-view.ts` + `week-view.html` — componente `WeekView` (selector `app-week-view`). Reutiliza el tipo `WeekDay` de `week-strip`.
- Tests Vitest `week-view.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts`: sección WeekView e índice.
- Marcar «WeekView» en `TODO.md`.

**Out of scope:**

- Huecos para agendar, crear/arrastrar eventos, navegación entre semanas, pantalla WeekPage.
- Calcular `days`, `now` o la semana a partir de la fecha (lo pasa el consumidor).

## Requisitos (EARS)

- **R1.** El `app-week-view` deberá tener clase `week-view`, `role="region"`, `aria-label` = `label` (por defecto «Semana») y las variables `--hours` (`endHour - startHour`) y `--visible-hours` en el host.
- **R2.** El `WeekView` deberá renderizar `div.week-view__head` con un `span` vacío inicial y un `div.week-view__day` por día con `span.week-view__dow` (`dow`) y `span.week-view__num` (`num`); donde el día sea `today`, deberá ponerle `data-today`.
- **R3.** El `WeekView` deberá renderizar `div.week-view__body` con `div.week-view__times` (un `span.week-view__time` «HH:00» por hora de `startHour` a `endHour - 1`, por defecto 0–24) y un `div.week-view__col` por día con `role="group"`, `aria-label` «dow num» y `data-today` donde el día sea `today`.
- **R4.** El `WeekView` deberá renderizar cada evento en la columna cuyo `iso` coincide con su `day`, como `button.week-view__event.u-tint` con `data-tint` (por defecto `periwinkle`), `--start` y `--span` en horas desde `startHour`, `span.week-view__event-time` «HH:MM – HH:MM» y `span.week-view__event-title`.
- **R5.** Donde un evento sea `selected`, el `WeekView` deberá ponerle `data-selected` y `aria-pressed="true"` (si no, `aria-pressed="false"`); donde sea `cancelled`, `data-cancelled` y el texto oculto «Cancelado.» antes del título; donde tenga `state`, `data-force` con su valor.
- **R6.** Cuando el usuario pulsa un evento, el `WeekView` deberá emitir `eventSelected` con ese evento.
- **R7.** Donde haya `now` en o después de `startHour`, el `WeekView` deberá renderizar en la columna de hoy `div.week-view__now` con `role="img"`, `aria-label` «Ahora HH:MM» y `--start`; sin `now`, sin día `today` o antes de `startHour` no deberá renderizarlo.
- **R8.** El `WeekView` deberá mostrar una ventana de `visibleHours` filas (por defecto 10) con scroll vertical en `div.week-view__body` y, cuando se renderiza en el navegador, deberá abrirla una hora antes de `now` (sin bajar de `startHour`) si hay día `today`, o si no en `scrollToHour` (por defecto 8).
- **R10.** Mientras dos o más eventos del mismo día se solapan, el `WeekView` deberá repartirlos en carriles con `--lane` y `--lanes` usando `dayLanes` de `DayView`; un evento sin solape deberá tener `--lane: 0` y `--lanes: 1`.
- **R11.** Donde `allDay` no esté vacío, el `WeekView` deberá renderizar entre cabecera y cuerpo `div.week-view__allday` con `span.week-view__allday-label` «Todo el día» y un `div.week-view__allday-cell` por día con un `app-badge` por entrada de ese `day` y su `category` (por defecto `blue`); con `allDay` vacío no deberá renderizarlo.
- **R9.** El `WeekView` no deberá usar `styleUrl` ni estilos de componente; el aspecto viene de `week-view.css`.

## Data model

```ts
// src/app/shared/week-view/week-view.ts
export interface WeekViewEvent {
  day: string; // ISO 'YYYY-MM-DD', = WeekDay.iso
  start: string; // 'HH:MM'
  end: string;
  title: string;
  tint?: Tint;
  selected?: boolean;
  cancelled?: boolean;
  state?: 'hover' | 'focus';
}
export interface WeekViewAllDay { day: string; title: string; category?: Category }

export class WeekView {
  // inputs:  days: WeekDay[] (required) · events: WeekViewEvent[] = [] · allDay: WeekViewAllDay[] = [] · label = 'Semana'
  //          startHour = 0 · endHour = 24 · visibleHours = 10 · scrollToHour = 8 · now?: string
  // outputs: eventSelected: WeekViewEvent
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `week-view.css` del DS con los cambios de scroll de Scope e importarlo en `src/styles.css` tras `day-view.css` (R8, R9).
2. Crear `WeekView` con el markup de `function WeekView` del `bundle.js` del DS; `computed` para horas, eventos por día y posición de `now`; scroll inicial en `afterNextRender` como `DayView` (R1–R8).
3. `week-view.spec.ts`: al menos un test por R1–R8.
4. Demo: sección `week-view` tras DayView, `{ id: 'week-view', name: 'WeekView' }` en `SECTIONS` e `IDS`. Ejemplo del preview DS (semana 19–25 octubre, hoy jueves 22, nueve eventos con hover, focus, seleccionado y cancelado, `now="13:10"`); pulsar un evento lo selecciona y muestra «Seleccionado: título».
5. Comprobación en `/demo` con Playwright (columnas alineadas con la cabecera, hoy resaltado, línea de ahora, scroll inicial).
6. Marcar «WeekView» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R8.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/week-view.css` y su original del DS sin diferencias salvo `padding-block-start`, `max-block-size`, `overflow-y` y `scrollbar-gutter` de `.week-view__body` y `overflow`/`scrollbar-gutter` de `.week-view__head`; carriles en `.week-view__event` (`inset-inline-start` + `inline-size`, como `day-view.css`) y reglas nuevas `.week-view__allday*`.
- [x] Solapes en carriles y fila «Todo el día» (R10–R11); al menos un test por requisito.
- [x] `src/app/shared/week-view/` no declara `styles` ni `styleUrl` (R9).
- [x] Cabecera con días y hoy resaltado (R1–R2).
- [x] Horas y columnas por día (R3).
- [x] Eventos posicionados, seleccionado, cancelado y `eventSelected` (R4–R6).
- [x] Línea de ahora en la columna de hoy (R7).
- [x] Día completo 0–24 con scroll y ventana inicial en `now` - 1 h o 08:00 (R8).
- [x] `/demo` muestra la sección WeekView del paso 4 y aparece en el índice.
- [x] Ítem «WeekView» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** día completo 0–24 con scroll, `visibleHours` y `scrollToHour`, como `DayView` (elegido por el usuario; el DS muestra 8–18 sin scroll).
- **Sí:** `scrollbar-gutter: stable` en cabecera y cuerpo para que las columnas sigan alineadas con la barra de scroll (divergencia del DS, consecuencia del scroll).
- **Sí:** `padding-block-start: var(--space-2xs)` en el cuerpo: «00:00» sube media línea y pisaría el borde de la cabecera (como `DayView`).
- **Sí:** host `role="region"` en vez de `role="grid"` del DS: `grid` exige filas (`row`) y el DS pone `columnheader`/`gridcell` sin ellas. Columnas como `role="group"` con `aria-label` «dow num» para dar contexto de día a los eventos; sin roles en la cabecera.
- **Sí:** input `label` (por defecto «Semana»), como el DS y `WeekStrip`.
- **Sí:** reutilizar `WeekDay` de `week-strip` para `days` (mismo `{iso, dow, num, today}`; `hasEvents` se ignora).
- **Sí:** output `eventSelected` (DS `onSelect`), como `DayView`.
- **Sí:** `aria-pressed`, texto oculto «Cancelado.» y `role="img"` en la línea de ahora, como `DayView` (el DS no los pone).
- **Sí:** estados forzados `state` por evento (solo demo), como el DS.
- **Sí:** carriles para solapes reutilizando `dayLanes` (exportada y genérica en `day-view.ts`, con `toMin`/`pad2`); el DS no los tiene en semana (sugerencia de PENDING).
- **Sí:** fila «Todo el día» con `app-badge` por categoría como `DayView`; el README del DS la pide («chip aparte sobre la rejilla») pero no da markup ni CSS. Un título largo se recorta con la celda (`overflow: hidden`).

## Risks

- `week-view.css` del DS tiene `outline-offset` con indentación rota en `.week-view__event:focus-visible`; se copia literal.

## What is **not** in this spec

- Pantalla WeekPage, panel EventForm, navegación entre semanas, cálculo de `now` en tiempo real.
