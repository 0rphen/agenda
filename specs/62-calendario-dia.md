# SPEC 62 — Calendario · Día: DayPage con fecha en la URL y Dialogs comunes

> **Status:** Implemented
> **Depends on:** SPEC 28 (Breadcrumb), SPEC 17 (IconButton), SPEC 12 (Button), SPEC 21 (SegmentedControl), SPEC 44 (DayView), SPEC 38 (MiniCalendar), SPEC 33/58 (TaskItem), SPEC 06 (Badge), SPEC 26 (EmptyState), SPEC 11 (SkeletonList), SPEC 25 (Alert), SPEC 55 (`.l-shell`), SPEC 56 (rutas), SPEC 59 (`features/agenda/`, layout por ruta), SPEC 60 (Dialogs de tarea y cita), SPEC 61 (submit en Dialog)
> **Date:** 2026-10-26
> **Objective:** Montar en `/calendario/dia?fecha=AAAA-MM-DD` la DayPage del DS (DayView del día, MiniCalendar y tareas «Sin hora»), con el estado de los Dialog de tarea y cita extraído a `features/agenda/` para Inicio, Resumen y Día.

## Scope

**In:**

- `features/agenda/agenda-dialogs.ts`: servicio `AgendaDialogs` (estado y acciones de los Dialog de tarea y cita, hoy duplicado en `HomeFacade` y `OverviewFacade`), provisto por `provideAgenda()`.
- `features/agenda/components/agenda-dialogs/`: componente `app-agenda-dialogs` con los dos `app-dialog` de SPEC 60; sustituye los bloques `@if` de `home-page.html` y `overview-page.html`.
- `HomeFacade` y `OverviewFacade` delegan en `AgendaDialogs` (mismo API público; sus tests pasan sin cambiar expectativas).
- `@shared/utils` (`time.ts`): `isIsoDay(value)` (+ test).
- `DayViewEvent` (`@shared/interfaces`): campo opcional `id?: string` (solo interfaz; el componente no cambia).
- `src/app/features/calendar/`: `calendar-day.facade.ts`, `pages/calendar-day-page/`, `components/day-main/`, `components/day-side/`; `calendar.routes.ts` monta `CalendarDayPage` en `dia` (con `provideAgenda()`, facade y `data.layout = 'week'`).
- `app.routes.server.ts`: `calendario/dia` → `RenderMode.Server`.
- `src/styles/blocks/calendar-day-page.css` (host `display: contents`) importado en `src/styles.css`.
- Tests de todo lo anterior; marcar «Calendario · Día» en `TODO.md`.

**Out of scope:**

- WeekPage y MonthPage: `semana` y `mes` siguen con `PlaceholderPage` (solo reciben `?fecha=` al navegar, sin leerlo).
- Editar o borrar citas: clic en evento solo lo marca `selected`.
- Crear tareas; borrar tareas.
- Reloj vivo: «ahora» se fija al cargar.
- Pantallas móviles (`.l-screen`).
- `/demo`: ningún componente de `shared/components/` cambia API (`DayViewEvent.id` es opcional y el demo no lo necesita).

## Requisitos (EARS)

Dialogs comunes:

- **R1.** `AgendaDialogs` deberá exponer `editingTask`, `eventDraft`, `dialogError` y `openTask(id)`, `closeTask()`, `saveTask(value)`, `openNewEvent(draft: Partial<EventFormValue>)`, `closeNewEvent()`, `saveEvent(value)`, con el comportamiento de SPEC 60 R12–R20 (guardado pesimista vía `AgendaCommands`, error en el Dialog sin perder lo escrito).
- **R2.** `provideAgenda()` deberá proveer `AgendaDialogs`.
- **R3.** `app-agenda-dialogs` deberá renderizar el Dialog «Detalle de tarea» mientras `editingTask` exista y el Dialog «Nueva cita» mientras `eventDraft` exista, con el mismo marcado, copy y Alert de error que SPEC 60.
- **R4.** `HomePage` y `OverviewPage` deberán usar `app-agenda-dialogs`; `HomeFacade` y `OverviewFacade` deberán delegar en `AgendaDialogs` (Inicio propone el día seleccionado, Resumen hoy). Los tests de SPEC 57/59/60/61 deberán pasar sin cambiar expectativas.

Ruta, fecha y render:

- **R5.** `/calendario/dia` deberá montar `CalendarDayPage` con título «Día · Agenda» y `data.layout = 'week'`; el destino «Calendario» del riel deberá seguir activo.
- **R6.** El servidor deberá renderizar `/calendario/dia` en cada petición (`RenderMode.Server`).
- **R7.** El día mostrado deberá ser el query param `fecha`; si falta o `isIsoDay(fecha)` es falso (formato `AAAA-MM-DD` y fecha real), entonces deberá ser hoy.
- **R8.** `isIsoDay` deberá aceptar `2026-10-22` y rechazar `''`, `2026-13-01`, `2026-02-30`, `22-10-2026`.
- **R9.** Cuando el usuario pulsa «Día anterior»/«Día siguiente», «Hoy» o un día del MiniCalendar, la página deberá navegar a `/calendario/dia?fecha=<día>` (misma ruta, sin recargar datos).
- **R10.** Cuando el usuario elige «Semana» o «Mes» en el SegmentedControl, el router deberá navegar a `/calendario/semana` o `/calendario/mes` con el mismo `?fecha=`.
- **R11.** Cuando `CalendarDayPage` se ha renderizado en el navegador (`afterNextRender`), deberá llamar a `load()`; el servidor no deberá leer datos.

Facade:

- **R12.** `CalendarDayFacade` deberá ser lo único que `CalendarDayPage` inyecta (además de `Router`, como SPEC 59); expondrá `today`, `day`, `isToday`, `now`, `status`, `dayEvents`, `allDayEvents`, `eventDays`, `dayTasks`, `pendingCount`, `selectedEventId`, `saveError`, `editingTask`, y `load()`, `selectEvent(id)`, `toggleTask(id, done)`, `dismissSaveError()`, `openTask(id)`, `openNewEvent()`, `openSlot(hour)`.
- **R13.** `now` deberá ser «HH:MM» fijado en `load()` solo si `day` es hoy; si no, `undefined`.
- **R14.** `dayEvents` deberá ser las citas con `start` de `day` como `DayViewEvent` (`id`, `start`, `end`, `title`, `tint`, `category` = `categoryLabel`, `location`, `people`, `selected` = `id === selectedEventId`); `allDayEvents`, las citas sin `start` de `day` como `DayViewAllDay` (`title`, `category`).
- **R15.** `dayTasks` deberá ser las tareas con `due` = `day`, pendientes primero; `pendingCount`, las no hechas.
- **R16.** `openNewEvent()` deberá abrir «Nueva cita» con `date` = `day`; `openSlot('HH:00')` con `date` = `day`, `start` = `HH:00` y `end` = una hora después (`23:00` → `23:59`).
- **R17.** Cuando cambia `day`, `selectedEventId` deberá limpiarse.

Área principal (`.l-shell__main`):

- **R18.** `DayMain` deberá renderizar, en orden: `app-breadcrumb` (Inicio `home` › Calendario › «22 de octubre»), cabecera `.l-cluster` `data-justify="between"` con `h1.page-title` = día largo («Jueves 22 de octubre») y un `.l-cluster` `data-gap="xs"` con `app-icon-button` `chevron_left` «Día anterior», `app-icon-button` `chevron_right` «Día siguiente», `app-button` `secondary` `s` «Hoy» y `app-segmented-control` label «Vista» (Día · Semana · Mes, valor Día).
- **R19.** Mientras `status` sea `'ready'`, `DayMain` deberá renderizar `app-day-view` heading «Agenda del día», `today` = `isToday`, `events` = `dayEvents`, `allDay` = `allDayEvents`, `now` = `now`, horas 0–24 (defaults del componente).
- **R20.** Cuando el usuario pulsa una cita del DayView, la cita deberá quedar `selected` (una a la vez); cuando pulsa un hueco, deberá abrirse «Nueva cita» según R16.
- **R21.** Mientras `status` no sea `'ready'` ni `'error'`, en lugar del DayView deberá mostrarse `app-skeleton-list` (variante `agenda`).
- **R22.** Si `load()` rechaza, entonces `DayMain` deberá mostrar `app-alert` `danger` «No se pudo cargar tu agenda», «Revisa el almacenamiento del navegador e inténtalo de nuevo.» y botón «Reintentar» que llama a `load()` (copy de SPEC 57 R17).

Panel (`.l-shell__panel`):

- **R23.** `DaySide` deberá renderizar `app-mini-calendar` con `today`, `selected` = `day` y `events` = `eventDays` (vacío hasta `'ready'`).
- **R24.** `DaySide` deberá renderizar `.l-cluster` con `h2.section-title` «Sin hora» y `app-badge` `count` = `pendingCount` (solo `'ready'`), y debajo un `app-task-item` por tarea de `dayTasks` (`subtasks` = longitud, `selected` mientras su Dialog esté abierto).
- **R25.** Cuando el usuario marca una tarea, el facade deberá llamar a `toggleTask` (optimista, SPEC 57 R32–R33); si falla, `DaySide` deberá mostrar `app-alert` `danger` `dismissible` «No se pudo guardar la tarea.» que llama a `dismissSaveError()`.
- **R26.** Cuando el usuario abre una tarea (`opened`), deberá abrirse «Detalle de tarea» (R1).
- **R27.** Si `dayTasks` está vacío en `'ready'`, entonces `DaySide` deberá mostrar `app-empty-state` `s` «Sin tareas para este día», descripción «No tienes tareas con esta fecha.», icono `task_alt`. Mientras carga, `app-skeleton-list` en lugar de la lista.
- **R28.** `DaySide` deberá terminar con `app-button` `accent` icono `add` `block` «Nueva cita» que llama a `openNewEvent()`.

Maquetación y frontera smart/dumb:

- **R29.** `CalendarDayPage` deberá renderizar `app-day-main` (host `l-shell__main panel l-stack`, `data-gap="m"`), `app-day-side` (host `l-shell__panel panel l-stack`, `data-variant="side"`, `data-gap="m"`) y `app-agenda-dialogs` como hijos directos; `.calendar-day-page` en `display: contents`; los Dialog no añaden pistas al grid.
- **R30.** `DayMain` y `DaySide` deberán recibir todo por inputs y comunicar por outputs; no deberán inyectar facade, store, router ni repositorio.
- **R31.** Sin `styleUrl`; copy en español, sentence case, 24 h, sin emojis.

## Data model

Sin datos persistidos nuevos.

```ts
// @shared/interfaces/day-view.ts (+)
export interface DayViewEvent { id?: string; /* resto igual */ }

// @shared/utils/time.ts (+)
export function isIsoDay(value: string | null | undefined): value is string;

// features/agenda/agenda-dialogs.ts
@Injectable() export class AgendaDialogs {
  readonly editingTask: Signal<Task | undefined>;
  readonly eventDraft: Signal<Partial<EventFormValue> | undefined>;
  readonly dialogError: Signal<boolean>;
  openTask(id: string): void; closeTask(): void; saveTask(value: TaskFormValue): Promise<void>;
  openNewEvent(draft: Partial<EventFormValue>): void; closeNewEvent(): void;
  saveEvent(value: EventFormValue): Promise<void>;
}

// features/calendar/calendar-day.facade.ts
@Injectable() export class CalendarDayFacade {
  readonly today: string; readonly day: Signal<string>; readonly isToday: Signal<boolean>;
  readonly now: Signal<string | undefined>; readonly status: Signal<AgendaStatus>;
  readonly dayEvents: Signal<DayViewEvent[]>; readonly allDayEvents: Signal<DayViewAllDay[]>;
  readonly eventDays: Signal<string[]>; readonly dayTasks: Signal<Task[]>;
  readonly pendingCount: Signal<number>; readonly selectedEventId: Signal<string | undefined>;
  readonly saveError: Signal<boolean>; readonly editingTask: Signal<Task | undefined>;
  load(); selectEvent(id); toggleTask(id, done); dismissSaveError();
  openTask(id); openNewEvent(); openSlot(hour: string);
}
// day = toSignal(ActivatedRoute.queryParamMap) → fecha válida o today
```

## Implementation plan

1. `AgendaDialogs` + spec (abrir, guardar ok/falla, cerrar) movido de los tests de facades; `provideAgenda()` lo provee; `HomeFacade`/`OverviewFacade` delegan. Tests de SPEC 57/59/60/61 verdes sin cambiar expectativas (R1, R2, R4).
2. `app-agenda-dialogs` + spec; `home-page.html` y `overview-page.html` lo usan. Specs de página verdes (R3, R4).
3. `isIsoDay` en `time.ts` + test; `DayViewEvent.id?` (R8, R14).
4. `CalendarDayFacade` + spec: fecha desde query param, `now` solo hoy, mapeo a DayView, tareas del día, `openSlot`, selección limpiada al cambiar día (R7, R12–R17).
5. Dumb `DayMain` y `DaySide` + specs por input/output (R18–R28, R30).
6. `CalendarDayPage`, `calendar-day-page.css`, ruta `dia` en `calendar.routes.ts`, `app.routes.server.ts`. Spec de página: navegación de flechas/Hoy/MiniCalendar/vista, esqueleto sin carga en servidor, carga tras render, error + Reintentar (R5–R6, R9–R11, R21–R22, R29).
7. Playwright en `npm start` `/calendario/dia` a 1440 px: flechas y «Hoy» cambian URL y título; `?fecha=2026-02-30` muestra hoy; MiniCalendar navega; «Semana» lleva a `/calendario/semana?fecha=…`; clic en hueco 10:00 abre «Nueva cita» con 10:00–11:00 y al guardar aparece en DayView; clic en cita la marca; tarea abre Dialog y guarda; recargar conserva día; grid sin pistas extra; sin errores de hidratación. `/inicio` y `/resumen` siguen igual.
8. `npm run build` sin warnings de budget; `curl` a `/calendario/dia?fecha=2026-10-22` devuelve «Jueves 22 de octubre» y esqueletos; `npm test -- --watch=false` verde; marcar `TODO.md`.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa, con tests de R1–R30.
- [x] Tests de SPEC 57/59/60/61 pasan sin cambiar expectativas (R4).
- [x] grep: `home.facade.ts` y `overview.facade.ts` no declaran `editingTaskId`/`eventDraftState`/`dialogErrorState`; `home-page.html` y `overview-page.html` no contienen `app-dialog` (R1–R4).
- [x] `npm run build` sin errores ni warnings; `dist/.../browser/calendario/dia/index.html` no existe (R6).
- [x] `curl` a `/calendario/dia?fecha=2026-10-22` en `serve:ssr:calendar` devuelve «Día · Agenda», «Jueves 22 de octubre», «22 de octubre» en breadcrumb y `skeleton-list`, sin DayView con citas (R6, R7, R11, R21).
- [x] Playwright: flechas, «Hoy» y MiniCalendar cambian `?fecha=` y el título; fecha inválida muestra hoy (R7, R9).
- [x] Playwright: «Semana»/«Mes» navegan con el mismo `?fecha=` (R10).
- [x] Playwright: línea «ahora» y Badge «Hoy» solo en el día de hoy (R13, R19).
- [x] Playwright: clic en hueco abre «Nueva cita» con fecha y hora propuestas; guardar la muestra en DayView y en MiniCalendar; recargar y persiste (R16, R20).
- [x] Playwright: clic en cita lleva `data-selected`; otra cita lo quita a la primera (R20).
- [x] Playwright: tarea del día se marca y abre «Detalle de tarea» con `selected` en la fila (R24–R26).
- [x] Playwright: JSON corrupto en `agenda:v2:/events` muestra Alert y «Reintentar» (R22).
- [x] Columnas de `.l-shell__grid[data-layout=week]` iguales con y sin Dialog (R29).
- [x] `/inicio` y `/resumen` sin cambios visibles; Dialogs funcionan igual (R4).
- [x] Sin errores de hidratación; sin `styleUrl`, sin emojis, copy en español (R31).
- [x] `TODO.md`: «Calendario · Día» marcado.

## Decisions

- **Sí:** fecha en query param `?fecha=` (respuesta del usuario). Compartible, sobrevive a recarga, el servidor pinta el título correcto. **No:** signal en facade (se pierde al recargar); **No:** param de ruta `/dia/:fecha` (redirect extra).
- **Sí:** SegmentedControl navega a semana/mes conservando `?fecha=` (respuesta del usuario); WeekPage/MonthPage lo leerán en sus specs.
- **Sí:** «Nueva cita», clic en hueco con hora, TaskItem con Dialog y clic en cita = `selected` (respuesta del usuario). **No:** editar cita (no hay `updateEvent`).
- **Sí:** extraer estado de Dialogs a `AgendaDialogs` en `features/agenda/` (respuesta del usuario; regla del tercer consumidor de SPEC 59). Facades conservan su API delegando para no tocar expectativas de tests.
- **Sí:** también el marcado de los Dialog a `app-agenda-dialogs` (componente de feature que inyecta `AgendaDialogs`), consecuencia de la extracción: evita tres copias de la misma plantilla. Es la única pieza que inyecta servicio fuera de la página.
- **Sí:** excepción a R4: los tests de hijos directos (SPEC 57 R35, SPEC 59 R32) añaden `app-agenda-dialogs` al final de la lista esperada (respuesta del usuario). Consecuencia de R3/R29: el componente siempre está en el DOM. **No:** filtrar en el test; **No:** `@if` en la página (volvería a conocer el estado de los Dialog).
- **Sí:** `openNewEvent(draft)` en el servicio recibe el borrador; cada facade decide fecha (Inicio día seleccionado, Resumen hoy, Día `day` y hora del hueco).
- **Sí:** `id?` opcional en `DayViewEvent` para mapear la cita pulsada sin buscar por referencia. **No:** cambiar el componente DayView.
- **Sí:** «Sin hora» = tareas con `due` = día, Badge con pendientes (respuesta del usuario).
- **Sí:** DayView 0–24 con scroll, «ahora» fijado al cargar y solo hoy (respuesta del usuario). **No:** 8–18 del DS (ocultaría citas).
- **Sí:** carga y error como Resumen; `RenderMode.Server` (respuesta del usuario).
- **Sí:** breadcrumb, h1 y heading de DayView como el DS; `<title>` fijo «Día · Agenda» (respuesta del usuario).
- **Sí:** «Hoy» del día es `today` fijado al construir el facade, como Inicio.
- **No:** Badge «Hoy»/línea «ahora» en otros días.

## Risks

- Hora del servidor ≠ hora del usuario: sin `?fecha=`, el servidor puede pintar otro día cerca de medianoche (mismatch de hidratación), igual que Inicio/Resumen.
- `toSignal(queryParamMap)` en SSR: el valor inicial debe salir del snapshot o el HTML de servidor saldría con hoy aunque haya `?fecha=`. Verificar con `curl`.
- Extraer `AgendaDialogs` toca Inicio y Resumen: si algún test de facade dependía del estado interno, falla. Mitigado por el paso 1 aislado.
- Navegar entre días con `router.navigate` relanza la ruta solo si cambia el componente; con mismo componente el store se reutiliza (deseado). Verificar que no se recarga ni pierde selección de Dialog abierto.
- Citas que cruzan medianoche o con `end` < `start` se pintan mal en DayView (dato no validado).
- `openSlot('23:00')` propone `23:59`: cita de 59 min, aceptado.
