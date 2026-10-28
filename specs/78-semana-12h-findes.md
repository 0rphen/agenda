# SPEC 78 — Inicio de semana, formato 12 h y fines de semana

> **Status:** Implemented
> **Depends on:** SPEC 37 (WeekStrip), SPEC 38 (MiniCalendar), SPEC 44 (DayView), SPEC 45 (WeekView), SPEC 52 (MonthView), SPEC 62/63/64 (Calendario), SPEC 59 (Resumen), SPEC 57 (Inicio), SPEC 68 (Configuración), SPEC 73 (UserSettingsStore)
> **Date:** 2026-10-27
> **Objective:** Que «Inicio de semana», «Formato de hora» y «Mostrar fines de semana» guardados en Configuración cambien la app: semanas desde lunes o domingo, horas en 12 h en toda la app y WeekView/MonthView sin sábado ni domingo.

## Scope

**In:**

- `UserSettingsStore`: derivados `firstDay` (`1` Lunes, `0` Domingo), `timeFormat` (`'24 h' | '12 h'`), `showWeekends`.
- Utils (`shared/utils/time.ts`): `weekStart(iso, firstDay = 1)`, `formatTime(hhmm, format)`, `weekdayShort(iso)`.
- Inicio de semana:
  - `MiniCalendar` y `MonthView`: input `firstDay` (`0 | 1`, por defecto `1`) que rota la cabecera y la rejilla.
  - `CalendarFacade.weekStart`/`weekDays` (WeekStrip de Día móvil y WeekView) y `CalendarMonthFacade.gridStart` desde `firstDay`; «Semana N» de WeekMain sigue la semana mostrada.
  - Todas las `app-mini-calendar` (Día/Semana/Mes lateral, Mes móvil, Inicio, Resumen) reciben `firstDay`.
- Formato 12 h (`8:30 AM`, `12:00 PM`, `12:00 AM`):
  - `DayView`, `WeekView`, `MonthView`: input `timeFormat` (`'24 h'` por defecto) para columna de horas, huecos (texto y `aria-label`), horas de citas, chips y «Ahora».
  - Texto de horas en features con el pipe `timeFormat` (`features/settings/time-format.pipe.ts`, impuro, lee el store): AgendaItem/EventCard de Inicio, Resumen y Mes móvil; «Próxima a las…», «Próxima…» y el conflicto de Resumen.
- Fines de semana ocultos:
  - `MonthView`: input `showWeekends` (`true` por defecto); sin él, 5 columnas (lun–vie) y 30 celdas; ↑ ↓ saltan 5 celdas (una semana).
  - `WeekView`: recibe 5 `days` del facade (`CalendarWeekFacade.viewDays`); con 5 días el host lleva `data-weekdays-only`.
  - CSS: `src/styles/exceptions/weekdays-only.css` (capa `exception`) con 5 columnas para `.week-view[data-weekdays-only]` y `.month-view[data-weekdays-only]`; bloques del DS intactos.
- Demo: controles de `firstDay`, `timeFormat` y `showWeekends` en las secciones MiniCalendar, MonthView, DayView y WeekView.
- Tests, `TODO.md`, `PENDING.md`.

**Out of scope:**

- `TimeField`/`EventForm`: `input type="time"` nativo sigue al navegador.
- Rangos «Esta semana»/«Próxima» de Inicio y «Avance de la semana» de Resumen: siguen lunes–domingo (`PENDING.md`).
- WeekStrip y MiniCalendar sin fines de semana (el ítem solo pide WeekView y MonthView).
- Título de WeekMain («19 – 25 de octubre») con fines de semana ocultos: sigue la semana completa.
- Cambios en los bloques CSS del DS.

## Requisitos (EARS)

Store y utils:

- **R1.** `UserSettingsStore` deberá exponer `firstDay` = `0` con «Inicio de semana» Domingo y `1` con Lunes, `timeFormat` = «Formato de hora» y `showWeekends` = «Mostrar fines de semana».
- **R2.** `weekStart(iso, firstDay)` deberá devolver el lunes (`1`) o el domingo (`0`) de la semana de `iso`; sin `firstDay`, el lunes.
- **R3.** `formatTime(hhmm, '12 h')` deberá devolver `h:mm AM|PM` (`'08:30'` → `'8:30 AM'`, `'13:05'` → `'1:05 PM'`, `'00:00'` → `'12:00 AM'`, `'12:00'` → `'12:00 PM'`); con `'24 h'` deberá devolver `hhmm` sin cambios.

Inicio de semana:

- **R4.** Donde `firstDay` es `0`, el `app-mini-calendar` y el `app-month-view` deberán empezar cabecera y filas en domingo (`D L M X J V S`; `domingo … sábado`).
- **R5.** Mientras «Inicio de semana» es Domingo, `/calendario/semana` deberá mostrar domingo a sábado, la WeekStrip de `/calendario/dia` también, y la rejilla de `/calendario/mes` deberá cargar los eventos de sus 42 celdas desde ese domingo.
- **R6.** Mientras «Inicio de semana» es Domingo, toda `app-mini-calendar` de Calendario, Inicio y Resumen deberá recibir `firstDay` = `0`.

Formato 12 h:

- **R7.** Donde `timeFormat` es `'12 h'`, el `app-day-view` y el `app-week-view` deberán mostrar la columna de horas, los huecos (texto y `aria-label`), las horas de cada cita y el `aria-label` «Ahora …» en 12 h; `slotClicked` deberá seguir emitiendo `HH:00`.
- **R8.** Donde `timeFormat` es `'12 h'`, el `app-month-view` deberá mostrar la hora de cada chip en 12 h.
- **R9.** Mientras «Formato de hora» es 12 h, Inicio, Resumen y Mes móvil deberán mostrar en 12 h las horas de AgendaItem/EventCard, «Próxima a las …», «Próxima …» y el conflicto «Hoy a las …»; Calendario deberá pasar `timeFormat` a DayView, WeekView y MonthView.

Fines de semana:

- **R10.** Donde `showWeekends` es `false`, el `app-month-view` deberá mostrar solo lunes a viernes (5 columnas, 30 celdas, `data-weekdays-only`), y ↑ ↓ deberán mover el foco a la misma columna de la semana anterior o siguiente.
- **R11.** Mientras «Mostrar fines de semana» está desactivado, `/calendario/semana` deberá pasar al `app-week-view` solo lunes a viernes y el `app-week-view` con 5 días deberá tener `data-weekdays-only` y 5 columnas; `/calendario/mes` deberá pasar `showWeekends` = `false`.
- **R12.** Cuando cambian los ajustes del store (carga o guardado), las vistas deberán actualizarse sin recargar; en SSR se pintan con los defaults (Lunes, 24 h, con fines de semana).

## Data model

```ts
// shared/types/ui.ts
export type TimeFormat = '24 h' | '12 h';

// shared/utils/time.ts
export function weekStart(iso: string, firstDay?: 0 | 1): string;
export function formatTime(hhmm: string, format: TimeFormat): string;
export const weekdayShort: (iso: string) => string; // 'lun' … 'dom'

// features/settings/store/user-settings.store.ts
readonly firstDay: Signal<0 | 1>;
readonly timeFormat: Signal<TimeFormat>;
readonly showWeekends: Signal<boolean>;

// shared components
MiniCalendar.firstDay = input<0 | 1>(1);
MonthView.firstDay = input<0 | 1>(1);
MonthView.showWeekends = input(true);
MonthView.timeFormat = input<TimeFormat>('24 h');
DayView.timeFormat = input<TimeFormat>('24 h');
WeekView.timeFormat = input<TimeFormat>('24 h');

// features/settings/time-format.pipe.ts
@Pipe({ name: 'timeFormat', pure: false }) // undefined → undefined
```

## Implementation plan

1. `TimeFormat` en `types/ui.ts`; `weekStart(iso, firstDay)`, `formatTime`, `weekdayShort` en `utils/time.ts`; tests (R2, R3).
2. Store: `firstDay`, `timeFormat`, `showWeekends`; `TimeFormatPipe`; tests (R1, R9).
3. MiniCalendar y MonthView `firstDay`; MonthView `showWeekends` (filtra cabecera y celdas, ↑ ↓ por columnas, `data-weekdays-only`) y `timeFormat`; DayView/WeekView `timeFormat`; WeekView `data-weekdays-only` con 5 días; tests (R4, R7, R8, R10).
4. `src/styles/exceptions/weekdays-only.css` importado en `src/styles.css` tras `user-preferences.css` (R10, R11).
5. Facades: `CalendarFacade` (`firstDay`, `timeFormat`, `showWeekends`, `weekStart`, `weekDays` con `weekdayShort`), `CalendarWeekFacade.viewDays`, `CalendarMonthFacade.gridStart`; `HomeFacade`/`OverviewFacade.firstDay`; WeekMain «Semana N» desde la semana mostrada; tests (R5, R11).
6. Plantillas: páginas y mains pasan `firstDay`/`timeFormat`/`showWeekends`; pipe en AgendaPanel, OverviewMain, OverviewSide, MonthMain; tests (R6, R9, R12).
7. Demo: controles en MiniCalendar, MonthView, DayView y WeekView.
8. `TODO.md`, `PENDING.md`; Playwright; `npx ng test --watch=false`; `npm run build`.

## Acceptance criteria

- [x] `npx ng test --watch=false` pasa, con ≥1 test por requisito R1–R12.
- [x] `npm run build` sin errores ni warnings de budget.
- [x] Playwright: guardar Domingo, 12 h y sin fines de semana en `/configuracion/calendario` y comprobar `/calendario/semana`, `/calendario/mes`, `/calendario/dia`, `/inicio` y `/resumen` tras recargar (sin recargar: tests R12); sin errores de hidratación.
- [x] Bloques CSS del DS sin cambios (`diff` de `week-view.css` y `month-view.css` igual que antes); excepción solo con tokens y logical properties; sin `styles`/`styleUrl`.
- [x] Demo `/demo`: secciones MiniCalendar, MonthView, DayView y WeekView con los nuevos inputs.
- [x] `TODO.md`: ítem SPEC 78 marcado. Sin emojis ni copy en inglés (salvo `AM`/`PM`, elegido por el usuario).

## Decisions

- **Sí:** 12 h en toda la app, no solo en Calendario (usuario).
- **Sí:** formato `8:30 AM` (usuario); también en la columna de horas (`8:00 AM`).
- **Sí:** 5 columnas vía excepción `[data-weekdays-only]` en capa `exception`, sin tocar bloques del DS (usuario).
- **Sí:** `firstDay` numérico (`0 | 1`) en los componentes, como `Intl.Locale.weekInfo`; el store traduce «Lunes»/«Domingo».
- **Sí:** texto de horas en features con pipe impuro que lee el store; las vistas compartidas reciben `timeFormat` como input (necesitan la hora cruda para posicionar).
- **Sí:** WeekView no gana input de fines de semana: el facade filtra `days` y el host marca `data-weekdays-only` con 5 días.
- **No:** rangos de Inicio y avance semanal de Resumen siguen lunes–domingo (fuera del ítem; `PENDING.md`).
- **No:** TimeField nativo: el navegador decide su formato.

## Risks

- SSR pinta con defaults: con Domingo, 12 h o sin fines de semana hay salto visual al hidratar (como SPEC 73).
- Gutter de horas (`size-rail`) estrecho para `12:00 PM`; comprobar en Playwright.

## What is not in this spec

TimeField 12 h, rangos semanales de Inicio y Resumen, WeekStrip/MiniCalendar sin fines de semana, citas canceladas, zona horaria, idioma.
