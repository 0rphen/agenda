# SPEC 38 — Componente MiniCalendar

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 15, SPEC 17
> **Date:** 2026-10-24
> **Objective:** Crear `app-mini-calendar` como calendario mensual compacto que refleja el MiniCalendar del DS Agenda: título del mes, navegación con dos `IconButton`, rejilla de 6 × 7 días que empieza en lunes, «hoy» en acento, selección en marca con enlace bidireccional `[(selected)]`, puntos de eventos y días deshabilitados por función.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/calendar.css`: copia literal del DS (`project/assets/Code/styles/blocks/calendar.css`). Importado en `src/styles.css` tras `week-strip.css`.
- `src/app/shared/mini-calendar/mini-calendar.ts` — componente `MiniCalendar` (selector `app-mini-calendar`, template externo `mini-calendar.html`). Reutiliza `app-icon-button`.
- Tests Vitest `mini-calendar.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts`: sección MiniCalendar e índice.
- Marcar «MiniCalendar» en `TODO.md`.

**Out of scope:**

- Navegación por teclado con flechas entre días (el DS no la define; cada día es un botón tabulable).
- Emitir el mes visible al navegar (el DS no lo expone).
- Rango de fechas, selección múltiple, semana configurable (el DS empieza siempre en lunes).

## Requisitos (EARS)

- **R1.** El `app-mini-calendar` deberá tener en el host la clase `calendar` y mostrar en `.calendar__head` un `h3.calendar__title` con el mes visible y el año en español y mayúscula inicial («Octubre de 2026»).
- **R2.** El `MiniCalendar` deberá renderizar en `.calendar__grid` siete cabeceras `.calendar__dow` (L M X J V S D) y 42 botones `.calendar__day` empezando en el lunes de la semana del día 1 del mes visible.
- **R3.** El `MiniCalendar` deberá marcar con `data-out` los días que no pertenecen al mes visible.
- **R4.** Mientras un día sea igual a `today` (ISO; por defecto la fecha local actual), el `MiniCalendar` deberá marcarlo con `data-today` y `aria-current="date"`.
- **R5.** Mientras `selected` sea igual al ISO de un día, el `MiniCalendar` deberá marcar solo ese botón con `aria-pressed="true"`; si `selected` no está definido, deberá marcar `today`.
- **R6.** Cuando el usuario hace clic en un día, el `MiniCalendar` deberá actualizar `selected` a su ISO y emitir `selectedChange` con él.
- **R7.** El `MiniCalendar` deberá abrir en el mes de `selected` (o de `today` si no hay selección); cuando el usuario pulsa «Mes anterior» o «Mes siguiente», deberá mostrar el mes previo o el siguiente.
- **R8.** Donde un día esté en `events`, el `MiniCalendar` deberá mostrar dentro de su botón un `span.calendar__dot`.
- **R9.** Donde `isDisabled(iso)` devuelva `true`, el `MiniCalendar` deberá deshabilitar ese botón (`disabled`).
- **R10.** El `MiniCalendar` deberá dar a cada día un `aria-label` con la fecha completa en español («Jueves 22 de octubre de 2026»), seguido de «, hoy» si es `today` y «, con eventos» si está en `events`.
- **R11.** Donde `forceState` asigne `hover`, `active` o `focus` a un ISO, el `MiniCalendar` deberá poner ese valor en `data-force` del día (solo demo, como `state` en Card).
- **R12.** El `MiniCalendar` no deberá usar `styleUrl` ni estilos de componente; el aspecto viene de `calendar.css` e `icon-button.css`.

## Data model

```ts
// src/app/shared/mini-calendar/mini-calendar.ts
export class MiniCalendar {
  // inputs: today: string = ISO local de hoy · events: string[] = []
  //         isDisabled?: (iso: string) => boolean
  //         forceState?: Record<string, 'hover' | 'active' | 'focus'>
  // model:  selected?: string (ISO) → [(selected)]
  // estado: mes visible (linkedSignal de selected ?? today)
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `calendar.css` del DS sin cambios; `@import` en `src/styles.css` tras `week-strip.css` (R12).
2. `mini-calendar.spec.ts` con host de test `[(selected)]`: al menos un test por R1–R11.
3. Crear `MiniCalendar`: `host: { class: 'calendar' }`; fechas en UTC (`Date.UTC`, `Intl` con `timeZone: 'UTC'`) para que servidor y navegador rendericen igual; `view = linkedSignal` con el primer día del mes de `selected() ?? today()`; `days = computed` con las 42 celdas (`iso`, `num`, `out`, `today`, `events`, `disabled`, `label`, `force`); `go(delta)` mueve `view`. Template: cabecera con `h3` + `.calendar__nav` con `app-icon-button size="s"` (`chevron_left` «Mes anterior», `chevron_right` «Mes siguiente»); rejilla con DOW y `@for` de `button.calendar__day`.
4. Demo: sección `mini-calendar` tras WeekStrip, `{ id: 'mini-calendar', name: 'MiniCalendar' }` en `SECTIONS` e `IDS`. Dos ejemplos del preview DS (hoy 22 oct 2026, eventos 2/6/10/14/22/27): interactivo con seleccionado 27 y texto «Seleccionado: {{ iso }}»; segundo con seleccionado 6, hover en el 14, focus en el 10 y fines de semana deshabilitados.
5. Comprobación en `/demo`: Playwright si está disponible (rejilla 7 columnas, navegación, selección, consola limpia); si no, SSR de `/demo` con el título y los 84 días.
6. Marcar «MiniCalendar» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R11.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/calendar.css` y su original del DS no muestra diferencias.
- [x] `src/app/shared/mini-calendar/` no declara `styles` ni `styleUrl` (R12).
- [x] Título del mes y rejilla de 42 días desde lunes con días fuera de mes (R1–R3).
- [x] Hoy y seleccionado marcados; clic actualiza `[(selected)]` (R4–R6).
- [x] Navegación entre meses (R7).
- [x] Puntos de eventos, deshabilitados y estados forzados (R8, R9, R11).
- [x] Cada día con nombre accesible de fecha completa (R10).
- [x] `/demo` muestra la sección MiniCalendar del paso 4 y aparece en el índice.
- [x] Ítem «MiniCalendar» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** `selected` como `model()` (`[(selected)]`) en lugar de `selected` + `defaultSelected` + `onSelect`, como WeekStrip.
- **Sí:** mes visible con `linkedSignal`: sigue a `selected` cuando cambia (también al pulsar un día de otro mes, que pasa a su mes). El DS solo fija el mes al montar.
- **Sí:** `role="group"` con `aria-label` = título en la rejilla y cabeceras DOW con `aria-hidden="true"`, en vez del `role="grid"` del DS (sin `row`/`gridcell`, ARIA inválido). Cada día ya lleva su fecha completa.
- **Sí:** `aria-label` del día con «hoy» y «con eventos» (estado con palabra, no solo color) y `aria-current="date"` en hoy, como WeekStrip/DayPill.
- **Sí:** `today` por defecto = fecha local al renderizar (como el DS). En prerender queda la fecha del build hasta hidratar; las pantallas deberán pasar `today`.
- **No:** teclado con flechas, salida de cambio de mes, `aria-live` en el título.

## Risks

- `today` por defecto difiere entre prerender y cliente: se corrige al hidratar, pero la pantalla real debe pasarlo.

## What is **not** in this spec

- Panel derecho del Resumen/AppShell que usa el calendario; enlace con DayView.
