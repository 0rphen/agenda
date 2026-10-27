# SPEC 63 — Calendario · Semana: WeekPage con fecha en la URL

> **Status:** Implemented
> **Depends on:** SPEC 45 (WeekView), SPEC 62 (DayPage, `CalendarDayFacade`, `DaySide`, `AgendaDialogs`, `?fecha=`), SPEC 60/61 (Dialogs), SPEC 59 (layout por ruta), SPEC 56 (rutas), SPEC 55 (`.l-shell`), SPEC 38 (MiniCalendar), SPEC 28 (Breadcrumb), SPEC 21 (SegmentedControl), SPEC 15 (demo)
> **Date:** 2026-10-26
> **Objective:** Montar en `/calendario/semana?fecha=AAAA-MM-DD` la WeekPage del DS (WeekView de la semana que contiene `fecha`, MiniCalendar y tareas de la semana), con clic en hueco del WeekView para crear cita.

## Scope

**In:**

- `WeekView` (`shared/components/week-view/`): botones de hueco por hora y día + output `slotClicked: WeekViewSlot`; `WeekViewEvent.id?` opcional; interfaz `WeekViewSlot` en `@shared/interfaces/week-view.ts`; CSS `.week-view__slot` en `src/styles/blocks/week-view.css`; sección WeekView de `demo-page.html` muestra el hueco pulsado.
- `@shared/utils` (`time.ts`): `isoWeek(iso)`, `weekRangeLabel(start)`, `slotEnd(hour)` (+ tests). `CalendarDayFacade.openSlot` pasa a usar `slotEnd`.
- `DaySide`: inputs de copy `heading` (default «Sin hora»), `emptyHeading` (default «Sin tareas para este día»), `emptyDescription` (default «No tienes tareas con esta fecha.»). DayPage sin cambios visibles.
- `src/app/features/calendar/`: `calendar-week.facade.ts`, `pages/calendar-week-page/`, `components/week-main/`; ruta `semana` en `calendar.routes.ts` con `CalendarWeekPage`, `provideAgenda()`, facade y `data.layout = 'week'`.
- `app.routes.server.ts`: `calendario/semana` → `RenderMode.Server`.
- `src/styles/blocks/calendar-week-page.css` (host `display: contents`, igual que `calendar-day-page.css`) importado en `src/styles.css`.
- Tests de todo lo anterior; marcar «Calendario · Semana» en `TODO.md`.

**Out of scope:**

- Panel con EventForm inline y Badge «Cita guardada» del DS: «Nueva cita» abre el Dialog común (`app-agenda-dialogs`).
- MonthPage: `mes` sigue con `PlaceholderPage`.
- Editar, mover o borrar citas (arrastrar en la rejilla incluido); clic en cita solo la marca `selected`.
- Crear o borrar tareas.
- Reloj vivo: «ahora» se fija al cargar.
- Pantallas móviles (`.l-screen`).
- Hueco en la fila «Todo el día».

## Requisitos (EARS)

WeekView (shared):

- **R1.** `WeekView` deberá renderizar en cada columna un `button.week-view__slot` por hora de `startHour` a `endHour`, debajo de las citas, con `aria-label` «Agendar el <dow> <num> a las HH:00».
- **R2.** Cuando el usuario pulsa un hueco, `WeekView` deberá emitir `slotClicked` con `{ day: <iso>, hour: 'HH:00' }`.
- **R3.** El hueco deberá mostrar icono `add` y «HH:00» solo en hover/foco, con fondo `--color-surface-sunken` (mismo patrón que `.day-view__slot`); focus visible con `--color-focus-ring`.
- **R4.** `WeekViewEvent` deberá aceptar `id?: string` sin cambiar el render.
- **R5.** La sección WeekView de `/demo` deberá mostrar «Hueco: <día> <hora>» tras pulsar un hueco.

Utilidades:

- **R6.** `isoWeek('2026-10-22')` deberá devolver `43`; `isoWeek('2026-01-01')` `1`; `isoWeek('2027-01-01')` `53`.
- **R7.** `weekRangeLabel(lunes)` deberá devolver «19 – 25 de octubre, 2026» si la semana no cruza mes; «26 de octubre – 1 de noviembre, 2026» si cruza mes; «28 de diciembre, 2026 – 3 de enero, 2027» si cruza año.
- **R8.** `slotEnd('10:00')` deberá devolver `'11:00'`; `slotEnd('23:00')`, `'23:59'`. `CalendarDayFacade.openSlot` deberá usarla (tests de SPEC 62 sin cambiar expectativas).

Ruta y fecha:

- **R9.** `/calendario/semana` deberá montar `CalendarWeekPage` con título «Semana · Agenda» y `data.layout = 'week'`; el destino «Calendario» del riel deberá seguir activo.
- **R10.** El servidor deberá renderizar `/calendario/semana` en cada petición (`RenderMode.Server`).
- **R11.** `day` deberá ser `?fecha=` si `isIsoDay`; si no, hoy. La semana mostrada deberá ser lunes–domingo de `weekStart(day)`.
- **R12.** Cuando el usuario pulsa «Semana anterior»/«Semana siguiente», la página deberá navegar a `/calendario/semana?fecha=<day ∓/± 7>`; «Hoy», a `?fecha=<today>`; un día del MiniCalendar, a `?fecha=<ese día>`.
- **R13.** Cuando el usuario elige «Día» o «Mes» en el SegmentedControl, el router deberá navegar a `/calendario/dia` o `/calendario/mes` con el mismo `?fecha=`.
- **R14.** Cuando `CalendarWeekPage` se ha renderizado en el navegador (`afterNextRender`), deberá llamar a `load()`; el servidor no deberá leer datos.

Facade:

- **R15.** `CalendarWeekFacade` deberá ser lo único que `CalendarWeekPage` inyecta (además de `Router`); expondrá `today`, `day`, `weekStart`, `weekDays`, `now`, `status`, `weekEvents`, `weekAllDay`, `eventDays`, `weekTasks`, `pendingCount`, `selectedEventId`, `saveError`, `editingTask`, y `load()`, `selectEvent(id)`, `toggleTask(id, done)`, `dismissSaveError()`, `openTask(id)`, `openNewEvent()`, `openSlot(slot)`.
- **R16.** `weekDays` deberá ser 7 `WeekDay` (`iso`, `dow` de `WEEKDAYS_SHORT`, `num`, `today` = `iso === today`).
- **R17.** `now` deberá ser «HH:MM» fijado en `load()` solo si la semana contiene hoy; si no, `undefined`.
- **R18.** `weekEvents` deberá ser las citas con `start` dentro de la semana como `WeekViewEvent` (`id`, `day` = `date`, `start`, `end` ?? `start`, `title`, `tint`, `selected` = `id === selectedEventId`); `weekAllDay`, las citas sin `start` de la semana como `WeekViewAllDay` (`day`, `title`, `category`).
- **R19.** `weekTasks` deberá ser las tareas con `due` entre lunes y domingo, pendientes primero; `pendingCount`, las no hechas.
- **R20.** `openNewEvent()` deberá abrir «Nueva cita» con `date` = `day`; `openSlot({ day, hour })`, con `date` = `day` del hueco, `start` = `hour`, `end` = `slotEnd(hour)`.
- **R21.** Cuando cambia `weekStart`, `selectedEventId` deberá limpiarse.

Área principal (`.l-shell__main`):

- **R22.** `WeekMain` deberá renderizar, en orden: `app-breadcrumb` (Inicio `home` › Calendario › «Semana 43»), cabecera `.l-cluster` `data-justify="between"` con `h1.page-title` = `weekRangeLabel` y un `.l-cluster` `data-gap="xs"` con `app-icon-button` `chevron_left` «Semana anterior», `app-icon-button` `chevron_right` «Semana siguiente», `app-button` `secondary` `s` «Hoy» y `app-segmented-control` label «Vista» (Día · Semana · Mes, valor Semana).
- **R23.** Mientras `status` sea `'ready'`, `WeekMain` deberá renderizar `app-week-view` con `days` = `weekDays`, `events`, `allDay`, `now`, horas 0–24 (defaults).
- **R24.** Cuando el usuario pulsa una cita, deberá quedar `selected` (una a la vez); cuando pulsa un hueco, deberá abrirse «Nueva cita» según R20.
- **R25.** Mientras `status` no sea `'ready'` ni `'error'`, en lugar del WeekView deberá mostrarse `app-skeleton-list` (variante `agenda`).
- **R26.** Si `load()` rechaza, entonces `WeekMain` deberá mostrar `app-alert` `danger` «No se pudo cargar tu agenda», «Revisa el almacenamiento del navegador e inténtalo de nuevo.» y «Reintentar» que llama a `load()` (copy de SPEC 62 R22).

Panel (`.l-shell__panel`):

- **R27.** `CalendarWeekPage` deberá usar `app-day-side` con `day` = `day`, `tasks` = `weekTasks`, `heading` «Esta semana», `emptyHeading` «Sin tareas esta semana», `emptyDescription` «No tienes tareas con fecha en esta semana.»; resto de comportamiento igual que SPEC 62 R23–R28 (MiniCalendar, toggle optimista con Alert de error, Dialog de tarea con fila `selected`, botón «Nueva cita»).
- **R28.** Donde `DaySide` no recibe `heading`/`emptyHeading`/`emptyDescription`, deberá mostrar el copy de SPEC 62 (DayPage sin cambios).

Maquetación y frontera smart/dumb:

- **R29.** `CalendarWeekPage` deberá renderizar `app-week-main` (host `l-shell__main panel l-stack`, `data-gap="m"`), `app-day-side` y `app-agenda-dialogs` como hijos directos; `.calendar-week-page` en `display: contents`; los Dialog no añaden pistas al grid.
- **R30.** `WeekMain` deberá recibir todo por inputs y comunicar por outputs; no deberá inyectar facade, store, router ni repositorio.
- **R31.** Sin `styleUrl`; CSS solo tokens, logical properties y rem; copy en español, sentence case, 24 h, sin emojis.

## Data model

Sin datos persistidos nuevos.

```ts
// @shared/interfaces/week-view.ts (+)
export interface WeekViewEvent { id?: string; /* resto igual */ }
export interface WeekViewSlot { day: string; hour: string } // YYYY-MM-DD, HH:00

// @shared/utils/time.ts (+)
export function isoWeek(iso: string): number;
export function weekRangeLabel(start: string): string; // start = lunes
export function slotEnd(hour: string): string;          // 'HH:00' → hora siguiente, 23:00 → 23:59

// features/calendar/calendar-week.facade.ts
@Injectable() export class CalendarWeekFacade {
  readonly today: string; readonly day: Signal<string>; readonly weekStart: Signal<string>;
  readonly weekDays: Signal<WeekDay[]>; readonly now: Signal<string | undefined>;
  readonly status: Signal<AgendaStatus>;
  readonly weekEvents: Signal<WeekViewEvent[]>; readonly weekAllDay: Signal<WeekViewAllDay[]>;
  readonly eventDays: Signal<string[]>; readonly weekTasks: Signal<Task[]>;
  readonly pendingCount: Signal<number>; readonly selectedEventId: Signal<string | undefined>;
  readonly saveError: Signal<boolean>; readonly editingTask: Signal<Task | undefined>;
  load(); selectEvent(id); toggleTask(id, done); dismissSaveError();
  openTask(id); openNewEvent(); openSlot(slot: WeekViewSlot);
}
// day = toSignal(ActivatedRoute.queryParamMap) → fecha válida o today (igual que CalendarDayFacade)
```

## Implementation plan

1. Utils `isoWeek`, `weekRangeLabel`, `slotEnd` + tests; `CalendarDayFacade.openSlot` usa `slotEnd`; tests SPEC 62 verdes (R6–R8).
2. `WeekView`: `id?`, `WeekViewSlot`, huecos + `slotClicked`, CSS `.week-view__slot`; spec del componente; sección en `demo-page.html` (R1–R5).
3. `DaySide`: inputs de copy con defaults; spec: defaults y copy propio (R27–R28).
4. `CalendarWeekFacade` + spec: fecha desde query param, semana lun–dom, `now` solo si contiene hoy, mapeo a WeekView, tareas de la semana, `openSlot`, selección limpiada al cambiar semana (R11, R15–R21).
5. Dumb `WeekMain` + spec por input/output (R22–R26, R30).
6. `CalendarWeekPage`, `calendar-week-page.css`, ruta `semana`, `app.routes.server.ts`. Spec de página: flechas/Hoy/MiniCalendar/vista, esqueleto sin carga en servidor, carga tras render, error + Reintentar, hijos directos (R9–R14, R25–R27, R29).
7. Playwright en `npm start` `/calendario/semana` a 1440 px: flechas y «Hoy» cambian URL, título y breadcrumb; `?fecha=2026-02-30` muestra semana de hoy; MiniCalendar navega; «Día» lleva a `/calendario/dia?fecha=…`; desde DayPage «Semana» abre la semana con el mismo día; clic en hueco jueves 10:00 abre «Nueva cita» 10:00–11:00 y al guardar aparece en la columna; clic en cita la marca; tarea se marca y abre Dialog; recargar conserva semana; grid sin pistas extra; sin errores de hidratación. `/calendario/dia` y `/demo` WeekView siguen bien.
8. `npm run build` sin warnings de budget; `curl` a `/calendario/semana?fecha=2026-10-22` devuelve «19 – 25 de octubre, 2026», «Semana 43» y esqueletos; `npm test -- --watch=false` verde; marcar `TODO.md`.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa, con tests de R1–R30.
- [x] Tests de SPEC 45 (WeekView) y SPEC 62 pasan sin cambiar expectativas (R4, R8, R28).
- [x] `/demo`: pulsar hueco de WeekView muestra «Hueco: …» (R5).
- [x] `npm run build` sin errores ni warnings; `dist/.../browser/calendario/semana/index.html` no existe (R10).
- [x] `curl` a `/calendario/semana?fecha=2026-10-22` en `serve:ssr:calendar` devuelve «Semana · Agenda», «19 – 25 de octubre, 2026», «Semana 43» y `skeleton-list`, sin WeekView (R10, R11, R14, R25).
- [x] Playwright: flechas ±7, «Hoy» y MiniCalendar cambian `?fecha=`, título y breadcrumb; fecha inválida muestra semana de hoy (R11, R12).
- [x] Playwright: «Día»/«Mes» navegan con el mismo `?fecha=`; «Semana» desde DayPage abre la semana del día (R13).
- [x] Playwright: línea «ahora» solo en la semana de hoy (R17, R23).
- [x] Playwright: clic en hueco abre «Nueva cita» con fecha y hora propuestas; guardar la muestra en WeekView y MiniCalendar; recargar y persiste (R2, R20, R24).
- [x] Playwright: clic en cita lleva `data-selected`; otra cita lo quita a la primera (R24).
- [x] Playwright: panel «Esta semana» lista tareas lun–dom; marcar una y abrir «Detalle de tarea» con fila `selected` (R19, R27).
- [x] Playwright: JSON corrupto en `agenda:v2:/events` muestra Alert y «Reintentar» (R26).
- [x] Columnas de `.l-shell__grid[data-layout=week]` iguales con y sin Dialog (R29).
- [x] `/calendario/dia` sin cambios visibles (R28).
- [x] Sin errores de hidratación; sin `styleUrl`, sin emojis, copy en español (R31).
- [x] `TODO.md`: «Calendario · Semana» marcado.

## Decisions

- **Sí:** panel como DayPage (MiniCalendar, tareas, botón «Nueva cita» con Dialog común) (respuesta del usuario). **No:** EventForm inline + Badge «Cita guardada» del DS (dos caminos para crear cita; el Dialog ya existe).
- **Sí:** reusar `DaySide` con inputs de copy y defaults de SPEC 62 (respuesta del usuario). **No:** `WeekSide` copiado.
- **Sí:** tareas de lunes–domingo en el panel (respuesta del usuario). **No:** solo las del día `fecha`.
- **Sí:** `?fecha=` conserva el día; la semana se deriva con `weekStart` (respuesta del usuario). Volver a Día abre el mismo día. **No:** normalizar a lunes.
- **Sí:** `slotClicked` en `WeekView` con `{ day, hour }` (respuesta del usuario); cambia componente shared, por eso sección demo. **No:** crear solo desde el panel.
- **Sí:** 0–24 con scroll (respuesta del usuario; coherente con SPEC 62). **No:** 8–18 del DS.
- **Sí:** título y breadcrumb como el DS, semana ISO 8601 (respuesta del usuario).
- **Sí:** `slotEnd` en utils, compartida con `CalendarDayFacade` (evita duplicar la regla 23:00 → 23:59).
- **Sí:** `id?` opcional en `WeekViewEvent`, como `DayViewEvent` en SPEC 62.
- **Sí:** facade propio en lugar de generalizar `CalendarDayFacade`: comparten fecha/carga pero difieren en rango y mapeo; abstraer con dos consumidores sería prematuro (regla del tercer consumidor, SPEC 59). MonthPage decidirá.

## Risks

- 168 botones de hueco por semana: más nodos y tabulaciones (24 por columna). Aceptado; mismo patrón que DayView.
- Huecos debajo de citas: si el z-order falla, el clic en una cita abriría «Nueva cita». Test de componente lo cubre.
- Hora del servidor ≠ hora del usuario: sin `?fecha=`, cerca de medianoche del domingo el servidor puede pintar otra semana (mismatch), igual que SPEC 62.
- `Intl` es-ES con `month: 'long'` sin año; formato de rango construido a mano: verificar cruce de mes/año en tests.
- Citas que cruzan medianoche se pintan mal (dato no validado), igual que DayView.
- Cambiar `DaySide` toca DayPage: defaults protegen; tests de SPEC 62 lo verifican.

