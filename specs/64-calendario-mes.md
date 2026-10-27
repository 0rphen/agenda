# SPEC 64 — Calendario · Mes: MonthPage con fecha en la URL

> **Status:** Implemented
> **Depends on:** SPEC 52 (MonthView), SPEC 62 (DayPage, `CalendarDayFacade`, `DaySide`, `AgendaDialogs`, `?fecha=`), SPEC 63 (WeekPage, `CalendarWeekFacade`), SPEC 60/61 (Dialogs), SPEC 59 (layout por ruta, regla del tercer consumidor), SPEC 56 (rutas), SPEC 55 (`.l-shell`), SPEC 38 (MiniCalendar), SPEC 28 (Breadcrumb), SPEC 21 (SegmentedControl)
> **Date:** 2026-10-26
> **Objective:** Montar en `/calendario/mes?fecha=AAAA-MM-DD` la MonthPage (MonthView del mes que contiene `fecha` + panel `DaySide` del día `fecha`), extrayendo la base común de los tres facades de calendario.

## Scope

**In:**

- `@shared/utils` (`time.ts`): `addMonths(iso, n)` que recorta al último día del mes destino (+ tests).
- `src/app/features/calendar/calendar.facade.ts`: clase abstracta `CalendarFacade` con lo común de `CalendarDayFacade` y `CalendarWeekFacade` (store, commands, dialogs, query param, `today`, `day`, `status`, `saveError`, `editingTask`, `eventDays`, `now` base, `load()`, `toggleTask`, `dismissSaveError`, `openTask`, `openNewEvent`, helper de tareas por rango). `CalendarDayFacade` y `CalendarWeekFacade` pasan a extenderla sin cambiar su API pública.
- `src/app/features/calendar/`: `calendar-month.facade.ts`, `pages/calendar-month-page/`, `components/month-main/`; ruta `mes` en `calendar.routes.ts` con `CalendarMonthPage`, `provideAgenda()`, facade y `data.layout = 'week'` (sustituye `PlaceholderPage`).
- `app.routes.server.ts`: `calendario/mes` → `RenderMode.Server`.
- `src/styles/blocks/calendar-month-page.css` (host `display: contents`, igual que `calendar-week-page.css`) importado en `src/styles.css`.
- Tests de todo lo anterior; marcar «Calendario · Mes» en `TODO.md`.

**Out of scope:**

- Cambios en `MonthView` (shared): sin `id`, sin `selected` en chips, sin huecos clicables. Por eso no cambia `demo-page.html`.
- Popover de «+N más»: navega a DayPage.
- Crear cita pulsando una celda: solo el botón «Nueva cita» del panel.
- Editar, mover o borrar citas; crear o borrar tareas.
- Pantallas móviles (`.l-screen`, MobileScreens «Mes»).
- Layout propio para Mes en `shell.css`.

## Requisitos (EARS)

Utilidades:

- **R1.** `addMonths(iso, n)` deberá sumar `n` meses (negativo resta) conservando el día; si el día no existe en el mes destino, deberá devolver su último día: `addMonths('2026-01-31', 1)` = `'2026-02-28'`, `addMonths('2028-01-31', 1)` = `'2028-02-29'`, `addMonths('2026-03-31', -1)` = `'2026-02-28'`, `addMonths('2026-12-15', 1)` = `'2027-01-15'`, `addMonths('2026-01-10', -1)` = `'2025-12-10'`.

Base de facades:

- **R2.** `CalendarFacade` deberá contener la lógica común hoy duplicada en `CalendarDayFacade` y `CalendarWeekFacade`; ambos deberán extenderla y exponer los mismos miembros públicos que en SPEC 62 R12 / SPEC 63 R15.
- **R3.** Los tests existentes de `CalendarDayFacade`, `CalendarWeekFacade`, `CalendarDayPage` y `CalendarWeekPage` deberán pasar sin cambiar expectativas.

Ruta y fecha:

- **R4.** `/calendario/mes` deberá montar `CalendarMonthPage` con título «Mes · Agenda» y `data.layout = 'week'`; el destino «Calendario» del riel deberá seguir activo.
- **R5.** El servidor deberá renderizar `/calendario/mes` en cada petición (`RenderMode.Server`).
- **R6.** `day` deberá ser `?fecha=` si `isIsoDay`; si no, hoy. El mes mostrado deberá ser el de `day`.
- **R7.** Cuando el usuario pulsa «Mes anterior»/«Mes siguiente», la página deberá navegar a `/calendario/mes?fecha=<addMonths(day, ∓1/±1)>`; «Hoy», a `?fecha=<today>`; un día del MiniCalendar o un número del MonthView (también fuera de mes), a `?fecha=<ese día>`.
- **R8.** Cuando el usuario elige «Día» o «Semana» en el SegmentedControl, el router deberá navegar a `/calendario/dia` o `/calendario/semana` con el mismo `?fecha=`.
- **R9.** Cuando el usuario pulsa un chip de cita o «+N más» de una celda, el router deberá navegar a `/calendario/dia?fecha=<día de la celda>`.
- **R10.** Cuando `CalendarMonthPage` se ha renderizado en el navegador (`afterNextRender`), deberá llamar a `load()`; el servidor no deberá leer datos.

Facade:

- **R11.** `CalendarMonthFacade` deberá extender `CalendarFacade` y ser lo único que `CalendarMonthPage` inyecta (además de `Router`); expondrá `today`, `day`, `year`, `month` (0–11), `status`, `monthEvents`, `eventDays`, `dayTasks`, `pendingCount`, `saveError`, `editingTask`, y `load()`, `toggleTask(id, done)`, `dismissSaveError()`, `openTask(id)`, `openNewEvent()`.
- **R12.** `monthEvents` deberá ser las citas con `date` dentro de las 42 celdas de la rejilla (lunes de la semana del día 1 + 41 días) como `MonthViewEvent` (`day` = `date`, `title`, `start`, `category`), con las de todo el día primero y luego por `start` ascendente dentro de cada día.
- **R13.** `dayTasks` deberá ser las tareas con `due` = `day`, pendientes primero; `pendingCount`, las no hechas (igual que SPEC 62).
- **R14.** `openNewEvent()` deberá abrir «Nueva cita» con `date` = `day`.

Área principal (`.l-shell__main`):

- **R15.** `MonthMain` deberá renderizar, en orden: `app-breadcrumb` (Inicio `home` › Calendario › «Octubre 2026»), cabecera `.l-cluster` `data-justify="between"` con `h1.page-title` «Octubre 2026» (mes y año de `day`, mayúscula inicial, sin «de») y un `.l-cluster` `data-gap="xs"` con `app-icon-button` `chevron_left` «Mes anterior», `app-icon-button` `chevron_right` «Mes siguiente», `app-button` `secondary` `s` «Hoy» y `app-segmented-control` label «Vista» (Día · Semana · Mes, valor Mes).
- **R16.** Mientras `status` sea `'ready'`, `MonthMain` deberá renderizar `app-month-view` con `year`, `month`, `today`, `selected` = `day`, `events` = `monthEvents`, `label` = título, `maxPerDay` por defecto (3).
- **R17.** Mientras `status` no sea `'ready'` ni `'error'`, en lugar del MonthView deberá mostrarse `app-skeleton-list` (variante `agenda`).
- **R18.** Si `load()` rechaza, entonces `MonthMain` deberá mostrar `app-alert` `danger` «No se pudo cargar tu agenda», «Revisa el almacenamiento del navegador e inténtalo de nuevo.» y «Reintentar» que llama a `load()` (copy de SPEC 62).

Panel (`.l-shell__panel`):

- **R19.** `CalendarMonthPage` deberá usar `app-day-side` con `day` = `day`, `tasks` = `dayTasks` y el copy por defecto (SPEC 62: «Sin hora», «Sin tareas para este día»…); MiniCalendar, toggle optimista con Alert de error, Dialog de tarea con fila `selected` y botón «Nueva cita» igual que SPEC 62.

Maquetación y frontera smart/dumb:

- **R20.** `CalendarMonthPage` deberá renderizar `app-month-main` (host `l-shell__main panel l-stack`, `data-gap="m"`), `app-day-side` y `app-agenda-dialogs` como hijos directos; `.calendar-month-page` en `display: contents`; los Dialog no añaden pistas al grid.
- **R21.** `MonthMain` deberá recibir todo por inputs y comunicar por outputs; no deberá inyectar facade, store, router ni repositorio.
- **R22.** Sin `styleUrl`; CSS solo tokens, logical properties y rem; copy en español, sentence case, 24 h, sin emojis.

## Data model

Sin datos persistidos nuevos ni interfaces shared nuevas.

```ts
// @shared/utils/time.ts (+)
export function addMonths(iso: string, n: number): string; // recorta al último día del mes destino

// features/calendar/calendar.facade.ts
export abstract class CalendarFacade {
  protected readonly store; protected readonly commands; protected readonly dialogs;
  readonly today: string; readonly day: Signal<string>;        // ?fecha= válida o today
  readonly status; readonly saveError; readonly editingTask; readonly eventDays: Signal<string[]>;
  protected readonly nowState: WritableSignal<string | undefined>;
  protected tasksBetween(start: () => string, end: () => string): Signal<Task[]>; // pendientes primero
  load(); toggleTask(id, done); dismissSaveError(); openTask(id); openNewEvent();
}

// features/calendar/calendar-month.facade.ts
@Injectable() export class CalendarMonthFacade extends CalendarFacade {
  readonly year: Signal<number>; readonly month: Signal<number>; // 0–11
  readonly monthEvents: Signal<MonthViewEvent[]>;
  readonly dayTasks: Signal<Task[]>; readonly pendingCount: Signal<number>;
}
```

## Implementation plan

1. `addMonths` + tests (R1).
2. `CalendarFacade` abstracta; `CalendarDayFacade` y `CalendarWeekFacade` la extienden; tests de SPEC 62/63 verdes sin cambiar expectativas (R2, R3).
3. `CalendarMonthFacade` + spec: fecha desde query param, `year`/`month`, rango de 42 celdas, orden de chips, tareas del día, `openNewEvent` (R6, R11–R14).
4. Dumb `MonthMain` + spec por input/output: título, breadcrumb, flechas, Hoy, vista, número, chip y «+N más», esqueleto, error (R15–R18, R21).
5. `CalendarMonthPage`, `calendar-month-page.css`, ruta `mes`, `app.routes.server.ts`. Spec de página: navegación (flechas/Hoy/MiniCalendar/número/chip/+N/vista), esqueleto sin carga en servidor, carga tras render, error + Reintentar, hijos directos (R4–R10, R17, R19, R20).
6. Playwright en `npm start` `/calendario/mes` a 1440 px: flechas desde `?fecha=2026-01-31` dan `2026-02-28`; «Hoy» y MiniCalendar cambian URL, título y breadcrumb; `?fecha=2026-02-30` muestra mes de hoy; número fuera de mes cambia de mes; chip y «+N más» abren DayPage del día; «Día»/«Semana» conservan `?fecha=`; desde Week/DayPage «Mes» abre el mes; «Nueva cita» guardada aparece como chip; tarea se marca y abre Dialog; recargar conserva mes; grid sin pistas extra; sin errores de hidratación. `/calendario/dia` y `/calendario/semana` siguen bien.
7. `npm run build` sin warnings de budget; `curl` a `/calendario/mes?fecha=2026-10-22` devuelve «Mes · Agenda», «Octubre 2026» y esqueletos; `npm test -- --watch=false` verde; marcar `TODO.md`.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa, con tests de R1–R21. (829/829 a las 23:5x; entre 00:00 y 12:00 falla `overview-page.spec.ts` R9/R27 por `\w` sin «í» en «Buenos días», ajeno a esta spec)
- [x] Tests de SPEC 62 y 63 (facades, páginas, `DaySide`) pasan sin cambiar expectativas (R2, R3).
- [x] `CalendarDayFacade` y `CalendarWeekFacade` extienden `CalendarFacade` y no duplican store/commands/dialogs/query param/`load`/`toggleTask` (R2).
- [x] `npm run build` sin errores ni warnings; `dist/.../browser/calendario/mes/index.html` no existe (R5).
- [x] `curl` a `/calendario/mes?fecha=2026-10-22` en `serve:ssr:calendar` devuelve «Mes · Agenda», «Octubre 2026» y `skeleton-list`, sin MonthView (R5, R6, R10, R17).
- [x] Playwright: flechas desde `?fecha=2026-01-31` navegan a `2026-02-28` y `2025-12-31`; «Hoy», MiniCalendar y número del MonthView cambian `?fecha=`, título y breadcrumb; fecha inválida muestra mes de hoy (R1, R6, R7).
- [x] Playwright: «Día»/«Semana» navegan con el mismo `?fecha=`; «Mes» desde Day/WeekPage abre el mes del día (R8).
- [x] Playwright: chip y «+N más» navegan a `/calendario/dia?fecha=<día>` (R9).
- [x] Playwright: en una celda con cita de todo el día y citas con hora, la de todo el día va primero y las demás por hora (R12).
- [x] Playwright: «Nueva cita» desde el panel propone `fecha`; al guardar aparece como chip y en MiniCalendar; recargar y persiste (R14, R19).
- [x] Playwright: panel lista tareas del día `fecha`; marcar una y abrir «Detalle de tarea» con fila `selected` (R13, R19).
- [x] Playwright: JSON corrupto en `agenda:v2:/events` muestra Alert y «Reintentar» (R18).
- [x] Columnas de `.l-shell__grid[data-layout=week]` iguales con y sin Dialog (R20).
- [x] `/calendario/dia` y `/calendario/semana` sin cambios visibles (R3).
- [x] Sin errores de hidratación; sin `styleUrl`, sin emojis, copy en español (R22).
- [x] `TODO.md`: «Calendario · Mes» marcado.

## Decisions

- **Sí:** panel = `DaySide` del día `fecha` con copy por defecto (respuesta del usuario). **No:** tareas del mes con copy propio; **No:** sin panel (pediría layout nuevo).
- **Sí:** chip y «+N más» navegan a DayPage del día (respuesta del usuario); `MonthView` intacto, sin sección demo nueva. **No:** `id?`/`selected` en `MonthViewEvent` (cambio shared sin necesidad).
- **Sí:** flechas ±1 mes recortando al último día (respuesta del usuario): conserva el día al volver a Día/Semana. **No:** saltar al día 1.
- **Sí:** h1 y último crumb «Octubre 2026» (respuesta del usuario), mismo formato que `calendar-panel` (`MONTH_YEAR` sin «de», capitalizado).
- **Sí:** extraer `CalendarFacade` abstracta (respuesta del usuario): tercer consumidor, cumple la regla de SPEC 59/63. **No:** facade copiado; **No:** heredar de `CalendarDayFacade` (arrastra `dayEvents`/`openSlot`).
- **Sí:** chips con todo el día primero y luego por hora (respuesta del usuario), como la fila «Todo el día» de Day/WeekView. `category` del evento (MonthView pone `blue` por defecto).
- **Sí:** `app-skeleton-list` mientras carga (respuesta del usuario), igual que Day/WeekPage. **No:** rejilla vacía desde SSR.
- **Sí:** `?fecha=` conserva el día; el mes se deriva (coherente con SPEC 63). Número fuera de mes cambia de mes por la URL.
- **Sí:** reusar `data.layout = 'week'` (main + panel), sin layout nuevo.

## Risks

- Refactor de dos facades ya implementados: si `CalendarFacade` cambia el orden de inicialización de campos (`inject` en inicializadores de la base, `computed` en la subclase que leen `day`), un campo podría leerse antes de existir. Tests de SPEC 62/63 lo cubren.
- Hora del servidor ≠ hora del usuario: sin `?fecha=`, cerca de medianoche del último día del mes el servidor puede pintar otro mes (mismatch), igual que SPEC 62/63.
- `MONTH_YEAR` es «octubre de 2026»: quitar « de » depende del formato de `Intl` es-ES; test lo fija.
- Celdas con muchas citas: solo 3 visibles; el resto depende de «+N más» → DayPage.
