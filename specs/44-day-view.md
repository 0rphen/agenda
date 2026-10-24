# SPEC 44 — Componente DayView

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 06, SPEC 15, SPEC 22 (`u-tint`)
> **Date:** 2026-10-24
> **Objective:** Crear `app-day-view`, agenda de un día hora por hora que refleja el DayView del DS Agenda: cabecera con título, badge «Hoy», contador y eventos de todo el día; columna de horas; huecos para agendar; eventos en carriles lado a lado, compactos, seleccionados o cancelados; línea de «ahora» y horas pasadas atenuadas.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/day-view.css`: copia literal del DS (`project/assets/Code/styles/blocks/day-view.css`), importado en `src/styles.css` tras `save-bar.css`.
- `src/app/shared/day-view/day-view.ts` + `day-view.html` — componente `DayView` (selector `app-day-view`). Reutiliza `app-badge` y `app-icon`.
- Tests Vitest `day-view.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts`: sección DayView e índice.
- Marcar «DayView» en `TODO.md`.

**Out of scope:**

- `AvatarGroup` dentro del evento: el DS no lo usa en DayView (muestra «N asistentes» con ícono `group`).
- Calcular `now` o el título a partir de la fecha (lo pasa el consumidor).
- Crear eventos, formulario, navegación entre días, pantalla DayPage.
- Arrastrar o redimensionar eventos.

## Requisitos (EARS)

- **R1.** El `app-day-view` deberá tener clase `day-view`, `role="region"` y `aria-label` = `heading`.
- **R2.** El `DayView` deberá renderizar `header.day-view__head` con `div.day-view__heading` que contiene `h2.day-view__title` (`heading`) y `span.day-view__count` con «N eventos» («1 evento» en singular).
- **R3.** Donde `today` sea verdadero, el `DayView` deberá poner `data-today` en `div.day-view__heading` y mostrar un `app-badge` `tone="brand"` «Hoy» tras el título.
- **R4.** Donde `allDay` no esté vacío, el `DayView` deberá mostrar `div.day-view__allday` con `span.day-view__allday-label` «Todo el día» y un `app-badge` por entrada con su `category` (por defecto `blue`); con `allDay` vacío no deberá renderizarlo.
- **R5.** El `DayView` deberá renderizar `div.day-view__body` con `div.day-view__times` (un `span.day-view__time` «HH:00» por hora de `startHour` a `endHour - 1`, por defecto 8–18) y `div.day-view__track`.
- **R6.** El `DayView` deberá renderizar en el track un `button.day-view__slot` por hora con ícono `add` `s`, texto «HH:00» y `aria-label` «Agendar a las HH:00»; donde `slotState` coincida con la hora, deberá poner `data-force="hover"`.
- **R7.** Cuando el usuario pulsa un hueco, el `DayView` deberá emitir `slotClicked` con «HH:00».
- **R8.** El `DayView` deberá renderizar cada evento como `button.day-view__event.u-tint` con `data-tint` (por defecto `periwinkle`) y variables `--start` y `--span` en horas desde `startHour`.
- **R9.** Mientras dos o más eventos se solapan, el `DayView` deberá repartirlos en carriles con `--lane` (índice) y `--lanes` (total del grupo), con el mismo algoritmo que el DS; un evento sin solape deberá tener `--lane: 0` y `--lanes: 1`.
- **R10.** El `DayView` deberá mostrar en cada evento `span.day-view__event-time` «HH:MM – HH:MM» (más `span.day-view__event-cat` « · categoría» donde haya `category`) y `span.day-view__event-title`; donde haya `location`, `span.day-view__event-meta` con ícono `locationIcon` (por defecto `place`); donde haya `people`, `span.day-view__event-meta` con ícono `group` y «N asistentes» («1 asistente»).
- **R11.** Donde un evento dure 45 min o menos, el `DayView` deberá ponerle `data-compact`.
- **R12.** Donde un evento sea `selected`, el `DayView` deberá ponerle `data-selected` y `aria-pressed="true"` (si no, `aria-pressed="false"`); donde sea `cancelled`, `data-cancelled` y el texto oculto «Cancelado.» antes del título; donde tenga `state`, `data-force` con su valor.
- **R13.** Cuando el usuario pulsa un evento, el `DayView` deberá emitir `eventSelected` con ese evento.
- **R14.** Donde `now` esté dentro o después de `startHour`, el `DayView` deberá renderizar `div.day-view__now` con `role="img"`, `aria-label` «Ahora HH:MM» y `--start`; y, si `now` es posterior a `startHour`, `div.day-view__past` con `aria-hidden="true"` y el mismo `--start`. Sin `now` o antes de `startHour` no deberá renderizar ninguno.
- **R15.** El `DayView` no deberá usar `styleUrl` ni estilos de componente; el aspecto viene de `day-view.css`.

## Data model

```ts
// src/app/shared/day-view/day-view.ts
export interface DayViewEvent {
  start: string; // 'HH:MM'
  end: string;
  title: string;
  tint?: Tint;
  category?: string;
  location?: string;
  locationIcon?: string;
  people?: string[];
  selected?: boolean;
  cancelled?: boolean;
  state?: 'hover' | 'focus';
}
export interface DayViewAllDay { title: string; category?: Category }

export class DayView {
  // inputs:  heading (required) · today (booleanAttribute) · events: DayViewEvent[] = []
  //          allDay: DayViewAllDay[] = [] · startHour = 8 · endHour = 18 · now?: string
  //          slotState?: number
  // outputs: eventSelected: DayViewEvent · slotClicked: string
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `day-view.css` del DS sin cambios e importarlo en `src/styles.css` tras `save-bar.css` (R15).
2. Crear `DayView` con el markup de `function DayView` del `bundle.js` del DS. `computed` para horas, carriles (port de `dayLanes`) y posición de `now` (R1–R14).
3. `day-view.spec.ts`: al menos un test por R1–R14.
4. Demo: sección `day-view` tras SaveBar, `{ id: 'day-view', name: 'DayView' }` en `SECTIONS` e `IDS`. Ejemplo del preview DS («Jueves 22 octubre», `today`, siete eventos, dos de todo el día, `now="13:10"`, `slotState` 13); pulsar un evento lo selecciona y pulsar un hueco muestra «Hueco: HH:00».
5. Comprobación en `/demo` con Playwright (carriles, compactos, línea de ahora).
6. Marcar «DayView» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R14.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/day-view.css` y su original del DS sin diferencias.
- [x] `src/app/shared/day-view/` no declara `styles` ni `styleUrl` (R15).
- [x] Cabecera con título, «Hoy», contador y todo el día (R1–R4).
- [x] Horas, huecos y `slotClicked` (R5–R7).
- [x] Eventos con carriles, compacto, seleccionado, cancelado y `eventSelected` (R8–R13).
- [x] Línea de ahora y horas pasadas (R14).
- [x] `/demo` muestra la sección DayView del paso 4 y aparece en el índice.
- [x] Ítem «DayView» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** input `heading` en vez de `title` (evita el atributo nativo `title`; patrón de `AppBar`/`Dialog`). Dentro de `DayViewEvent` se mantiene `title`, como el DS.
- **Sí:** sin `AvatarGroup`: el DS muestra el número de asistentes en texto. `people` es `string[]` y solo se cuenta.
- **Sí:** host como región (`role="region"` + `aria-label`) en vez de `<section>` interno, como `WeekStrip`.
- **Sí:** `aria-pressed` y texto oculto «Cancelado.» en eventos, como `EventCard` (estado no solo visual). El DS no los pone.
- **Sí:** estados forzados `state` por evento y `slotState`, como el DS y `Card`/`StatCard` (solo demo).
- **Sí:** el contador cuenta solo `events`, no `allDay`, como el DS.
- **No:** variable `--hours` del DS (ninguna regla CSS la lee).
- **No:** recortar `now` posterior a `endHour`: se dibuja como en el DS y lo recorta el `overflow: hidden` del bloque.

## Risks

- `day-view.css` del DS tiene `outline-offset` con indentación rota en `.day-view__slot:focus-visible` (repetido; gana el negativo) y `.day-view__event:focus-visible`; se copia literal.

## What is **not** in this spec

- Pantalla DayPage, WeekStrip + DayView en móvil, creación/edición de eventos, cálculo de `now` en tiempo real.
