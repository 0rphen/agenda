# SPEC 59 — Resumen: OverviewPage con capa de datos común y layout por ruta

> **Status:** Implemented
> **Depends on:** SPEC 25 (Alert), SPEC 26 (EmptyState), SPEC 28 (Breadcrumb), SPEC 22/23 (Card), SPEC 32 (AgendaItem), SPEC 33/58 (TaskItem), SPEC 34 (EventCard), SPEC 35 (StatCard), SPEC 38 (MiniCalendar), SPEC 10/24 (Progress), SPEC 11 (SkeletonList), SPEC 13 (ButtonLink), SPEC 55 (`.l-shell`), SPEC 56 (rutas), SPEC 57 (Inicio)
> **Date:** 2026-10-26
> **Objective:** Montar en `/resumen` la OverviewPage del DS (`.l-shell` `data-layout="week"`: saludo, cuatro StatCard, próxima cita, tareas que vencen, agenda de hoy y panel con calendario, avance y aviso de solape), con los datos de Inicio movidos a una capa común `features/agenda/`.

## Scope

**In:**

- Mover la capa de datos de `features/home/` a `src/app/features/agenda/`:
  - `domain/`: `calendar-event.model.ts`, `task.model.ts`, `agenda-repository.ts`, `agenda-errors.ts`, `agenda-view.model.ts` (`AgendaStatus`, `ListProgress`).
  - `structure/`: `local-storage-api.ts`, `agenda.dto.ts`, `agenda.mapper.ts`, `agenda-seed.ts`, `agenda-local-repository.ts` (+ sus specs).
  - `store/agenda.store.ts` (`AgendaStore`, antes `HomeStore`).
  - `agenda-queries.ts`: funciones puras compartidas (`weekProgress`, `isOverdue`, `eventMinutes`, `startsIn`) + spec.
  - `agenda.providers.ts`: `provideAgenda()` = `[{ provide: AgendaRepository, useClass: AgendaLocalRepository }, AgendaStore]`.
- `features/home/`: imports a `features/agenda/`, `HOME_ROUTES` usa `provideAgenda()`; `home-view.model.ts` conserva solo `AgendaRange` y `AgendaGroup`; `HomeFacade.weekProgress` y `TasksPanel.isOverdue` usan `agenda-queries`. Sin cambio visible.
- Layout por ruta: `ShellLayout = 'week' | 'settings'` en `@shared/types`; `App` lee `data.layout` de la ruta activa más profunda y lo pone en `.l-shell__grid` (`[attr.data-layout]`).
- `src/app/features/overview/`: `overview.facade.ts`, `pages/overview-page/`, `components/overview-main/`, `components/overview-side/`, `overview.routes.ts` (sustituye `PlaceholderPage`).
- `app.routes.server.ts`: `resumen` → `RenderMode.Server`.
- `src/styles/blocks/overview-page.css` (host `display: contents`) importado en `src/styles.css`.
- Tests: `agenda-queries`, `OverviewFacade`, `OverviewMain`, `OverviewSide`, `OverviewPage`, `app.spec.ts` (layout), specs movidos de home en verde.
- Marcar «Resumen: OverviewPage» en `TODO.md` y añadir debajo el ítem pendiente de SPEC 60.

**Out of scope (SPEC 60):**

- Clic en TaskItem abre Dialog con TaskForm y guarda; «Nueva cita» abre EventForm y crea evento (en Resumen e Inicio). Aquí el chevron/fila de TaskItem y «Nueva cita» se pintan sin acción.
- Repositorio con `create`/`update`.

**Out of scope (otros):**

- Modelo de usuario: nombre fijo en el facade.
- Selección en MiniCalendar con efecto (solo marca visual), selección de AgendaItem.
- Reloj vivo: «ahora» se fija al cargar; el Badge de próxima cita no se refresca solo.
- Más de un aviso de solape; avisos de otros tipos.
- Layout `settings` en Configuración (solo se deja preparado el mecanismo).
- `/demo`: no se crea ni cambia nada de `shared/components/`.

## Requisitos (EARS)

Capa de datos común:

- **R1.** Los modelos, el port `AgendaRepository`, `AgendaUnavailableError`, la implementación localStorage y `AgendaStore` deberán vivir en `features/agenda/`; `features/home/` no deberá contener `domain/` de datos, `structure/` ni `store/`.
- **R2.** `provideAgenda()` deberá proveer `AgendaRepository` (`useClass: AgendaLocalRepository`) y `AgendaStore`; `HOME_ROUTES` y `OVERVIEW_ROUTES` deberán usarlo en los `providers` de su ruta.
- **R3.** Ningún fichero fuera de `features/agenda/` deberá importar `features/agenda/structure/` salvo `agenda.providers.ts`.
- **R4.** Inicio deberá comportarse igual que en SPEC 57/58 (sus tests siguen pasando sin cambiar expectativas).

Layout por ruta:

- **R5.** Donde la ruta activa más profunda declare `data.layout`, `App` deberá ponerlo como `data-layout` de `.l-shell__grid`; si no lo declara, `.l-shell__grid` no deberá llevar `data-layout`.
- **R6.** `OVERVIEW_ROUTES` deberá declarar `data: { layout: 'week' }`.

Ruta y render:

- **R7.** `/resumen` deberá montar `OverviewPage` con título «Resumen · Agenda»; el destino «Resumen» del riel deberá seguir activo (y «Hoy» en BottomNav, como SPEC 56).
- **R8.** El servidor deberá renderizar `/resumen` en cada petición (`RenderMode.Server`).
- **R9.** Cuando `OverviewPage` se ha renderizado en el navegador (`afterNextRender`), deberá llamar a `load()`; el servidor no deberá leer datos.

Facade:

- **R10.** `OverviewFacade` deberá ser lo único que `OverviewPage` inyecta; expondrá `today`, `greeting`, `status`, `stats`, `nextEvent`, `nextEventBadge`, `dueTasks`, `todayEvents`, `eventDays`, `weekProgress`, `conflict`, `saveError`, y `load()`, `toggleTask(id, done)`, `dismissSaveError()`.
- **R11.** `greeting` deberá ser «Buenos días» (hora < 12), «Buenas tardes» (< 20) o «Buenas noches», seguido de «, César» (nombre en campo del facade).
- **R12.** `load()` deberá fijar «ahora» (`now`) en el momento de cargar; todos los cálculos relativos a la hora usarán ese valor.
- **R13.** `toggleTask` deberá actualizar el store al momento, llamar a `setTaskDone` y, si rechaza, revertir y fijar `saveError` (igual que SPEC 57 R32–R33).

Área principal (`.l-shell__main`):

- **R14.** `OverviewMain` deberá renderizar, en orden: `app-breadcrumb` (Inicio `home` › Resumen), cabecera `.l-cluster` con `h1.page-title` = `greeting`, `p.page-lead` y `app-button` `accent` icono `add` «Nueva cita» sin acción.
- **R15.** Mientras `status` no sea `'ready'`, `p.page-lead` deberá mostrar solo el día largo (p. ej. «Jueves 22 de octubre»); cuando sea `'ready'`, añadirá «· tienes N citas hoy y M tareas que vencen.» con singular para 1 («1 cita», «1 tarea que vence»).
- **R16.** Mientras `status` sea `'ready'`, `OverviewMain` deberá renderizar `.l-grid[data-min=s]` con cuatro `app-stat-card`:
  - `button[app-stat-card]` `event` «Citas hoy» = eventos de hoy; hint «Próxima a las HH:MM» (primera cita con hora de hoy que empieza ≥ `now`) o «Sin más citas hoy».
  - `button[app-stat-card]` `task_alt` «Pendientes» `accent` = tareas sin hacer; hint «N vencen hoy» («1 vence hoy»).
  - `app-stat-card` `schedule` «Reservadas» `info` = suma de duración de citas con hora de hoy en horas, 1 decimal es-ES sin «,0» (p. ej. «6,3 h», «2 h»); hint «De 8 h disponibles».
  - `app-stat-card` `check_circle` «Completadas» `success` = tareas hechas con `due` en la semana lun–dom de hoy; hint «De N planificadas» (total con `due` en esa semana).
- **R17.** Cuando el usuario pulsa «Citas hoy», el router deberá navegar a `/calendario/dia`; «Pendientes», a `/tareas`.
- **R18.** `OverviewMain` deberá renderizar `.l-grid[data-min=l][data-gap=m][data-align=start]` con `app-card` «Próxima cita» y `app-card` «Tareas que vencen».
- **R19.** `nextEvent` deberá ser el primer evento con hora cuyo inicio (`date` + `start`) sea ≥ `now`, cualquier día. Donde exista, la Card deberá mostrar `app-event-card` (time «HH:MM – HH:MM», `tint`, `location`, `people`) y, como acción, `app-badge` `info` icono `schedule` con `nextEventBadge`: «En X h Y min» / «En Y min» / «En X h» si es hoy, «Mañana» si es mañana, si no el día corto (`SHORT_DAY`).
- **R20.** Cuando el usuario pulsa la EventCard de próxima cita, el router deberá navegar a `/calendario/dia`.
- **R21.** Si no hay `nextEvent`, entonces la Card deberá mostrar `app-empty-state` `s` «Sin próximas citas», descripción «No tienes citas pendientes.», icono `event_available`.
- **R22.** `dueTasks` deberá ser las tareas sin hacer con `due` ≤ hoy, por `due` ascendente, máx. 5. La Card deberá tener como acción `a[app-button-link]` `ghost` `s` «Ver todas» a `/tareas` y listar `app-task-item` con `due` = día corto y `overdue` si `due` < hoy (`isOverdue`).
- **R23.** Cuando el usuario marca una tarea de «Tareas que vencen», el facade deberá llamar a `toggleTask`; la tarea hecha deberá salir de la lista (deja de cumplir R22).
- **R24.** Si `dueTasks` está vacío, entonces la Card deberá mostrar `app-empty-state` `s` «Nada vence hoy», descripción «Estás al día con tus tareas.», icono `task_alt`.
- **R25.** Si `saveError`, entonces la Card «Tareas que vencen» deberá mostrar `app-alert` `danger` `dismissible` «No se pudo guardar la tarea.», que al cerrarse llama a `dismissSaveError()`.
- **R26.** `OverviewMain` deberá terminar con `app-card` «Agenda de hoy», acción `a[app-button-link]` `ghost` `s` `iconEnd="chevron_right"` «Abrir día» a `/calendario/dia`, y un `app-agenda-item` por evento de hoy (todo el día primero con «Todo el día», luego por `start`); sin eventos, `app-empty-state` `s` «Sin citas hoy», «No tienes nada para hoy.», `event_available`.
- **R27.** Mientras `status` no sea `'ready'` ni `'error'`, en lugar de StatCards y Cards deberá mostrarse `app-skeleton-list` (variante `agenda`).
- **R28.** Si `load()` rechaza, entonces `OverviewMain` deberá mostrar `app-alert` `danger` «No se pudo cargar tu agenda», «Revisa el almacenamiento del navegador e inténtalo de nuevo.» y botón «Reintentar» que llama a `load()` (copy de SPEC 57 R17).

Panel (`.l-shell__panel`):

- **R29.** `OverviewSide` deberá renderizar `app-mini-calendar` con `today`, `selected` = `today` y `events` = `eventDays` (vacío hasta `'ready'`).
- **R30.** Mientras `status` sea `'ready'` y `weekProgress` no esté vacío, deberá renderizar `app-card` «Avance de la semana» con un `app-progress` por lista (misma regla que SPEC 57 R34, semana de hoy).
- **R31.** Donde dos citas con hora de hoy se solapen (`a.start < b.end && b.start < a.end`), `OverviewSide` deberá mostrar `app-alert` `warning` heading «Conflicto de agenda» y texto «Hoy a las HH:MM coinciden «A» y «B».» (primer par por `start`); sin solape, no hay Alert.

Maquetación y frontera smart/dumb:

- **R32.** `OverviewPage` deberá renderizar `app-overview-main` (host `l-shell__main panel l-stack`, `data-gap="m"`) y `app-overview-side` (host `l-shell__panel panel l-stack`, `data-variant="side"`, `data-gap="m"`) como hijos directos; `.overview-page` en `display: contents`.
- **R33.** `OverviewMain` y `OverviewSide` deberán recibir todo por inputs y comunicar por outputs (navegación por output o `routerLink` en `ButtonLink`); no deberán inyectar facade, store ni repositorio.
- **R34.** Sin `styleUrl`; copy en español, sentence case, 24 h, sin emojis.

## Data model

Sin datos nuevos persistidos. Movimientos y tipos de vista:

```ts
// features/agenda/domain/agenda-view.model.ts (movido de home-view.model.ts)
export type AgendaStatus = 'idle' | 'loading' | 'ready' | 'error';
export interface ListProgress { list: string; value: number }

// features/home/domain/home-view.model.ts (queda)
export type AgendaRange = 'day' | 'week' | 'next';
export interface AgendaGroup { day: string; title: string; events: CalendarEvent[] }

// features/agenda/agenda-queries.ts
export function weekProgress(tasks: Task[], day: string): ListProgress[];
export function isOverdue(task: Task, today: string): boolean;
export function eventMinutes(event: CalendarEvent): number; // 0 si todo el día
export function startsIn(event: CalendarEvent, now: Date): string; // «En 1 h 20 min» | «Mañana» | «23 oct»

// features/overview/domain/overview-view.model.ts
export interface OverviewStats {
  eventsToday: number; nextStart?: string;
  pending: number; dueToday: number;
  reservedHours: string; // «6,3 h»
  completed: number; planned: number;
}
export interface AgendaConflict { time: string; first: string; second: string }

// @shared/types/ui.ts (o shell.ts)
export type ShellLayout = 'week' | 'settings';
```

## Implementation plan

1. Mover `features/home/{domain,structure,store}` a `features/agenda/` (`git mv`), renombrar `HomeStore` → `AgendaStore`, crear `provideAgenda()`, actualizar imports de home. `npm test` verde sin tocar expectativas (R1–R4).
2. `agenda-queries.ts` + spec: `weekProgress` y `isOverdue` extraídos de `HomeFacade`/`TasksPanel`, más `eventMinutes`, `startsIn` (R16, R19, R22).
3. Layout por ruta: `ShellLayout`, `App` con `[attr.data-layout]` de la ruta más profunda; test en `app.spec.ts` (`/resumen` → `week`, `/inicio` → sin atributo) (R5, R6).
4. `OverviewFacade` + spec: greeting por hora, stats, `nextEvent`/badge, `dueTasks`, `todayEvents`, `conflict`, toggle optimista con revertido (R10–R13, R15–R16, R19, R22–R23, R31).
5. Dumb `OverviewMain` y `OverviewSide` + specs por input/output (R14–R31, R33).
6. `OverviewPage`, `overview-page.css`, `overview.routes.ts` con `provideAgenda()`, `OverviewFacade` y `data.layout`; `app.routes.server.ts` `resumen` → Server. Spec de página: esqueleto sin carga en servidor, carga tras render, error + Reintentar (R7–R9, R27–R28, R32).
7. Playwright en `npm start` `/resumen` a 1440, 1024 y 800 px: columnas `rail main panel` a ≥64rem, apilado `main`/`panel` entre 48–64rem; StatCard y enlaces navegan; marcar tarea la quita y persiste tras recargar; JSON corrupto muestra Alert; sin errores de hidratación. `/inicio` sigue igual.
8. `npm run build` + `serve:ssr:calendar`: `/resumen` no prerenderizada, `curl` devuelve saludo y esqueletos. Marcar `TODO.md` y añadir ítem SPEC 60. `npm test -- --watch=false` verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa, incluidos tests de R4–R6, R9, R11–R13, R15–R31.
- [x] grep: no existen `features/home/structure`, `features/home/store`; ningún import de `features/agenda/structure` fuera de `features/agenda/` (R1, R3).
- [x] `npm run build` sin errores ni warnings de budget; `dist/.../browser/resumen/index.html` no existe (R8).
- [x] `curl` a `/resumen` en `serve:ssr:calendar` devuelve «Resumen · Agenda», el saludo y `skeleton-list`, sin StatCards (R8, R9, R27).
- [x] Playwright 1440 px: `.l-shell__grid[data-layout=week]`, tres columnas rail/main/panel; en `/inicio` sin `data-layout` (R5, R6, R32).
- [x] Playwright: «Citas hoy», EventCard, «Abrir día» llevan a `/calendario/dia`; «Pendientes» y «Ver todas», a `/tareas` (R17, R20, R22, R26).
- [x] Playwright: marcar tarea que vence la quita, recargar y sigue hecha; «Completadas» sube (R16, R23).
- [x] Playwright: JSON corrupto en `agenda:/events` muestra Alert y «Reintentar» (R28).
- [x] Con semilla (reunión 09:00–10:00 + otra solapada añadida en test) aparece «Conflicto de agenda» (R31).
- [x] Inicio sin cambios visibles (R4).
- [x] Sin errores de hidratación en consola; sin `styleUrl`, sin emojis, copy en español (R34).
- [x] `TODO.md`: Resumen marcado e ítem SPEC 60 añadido.

## Decisions

- **Sí:** partir en dos specs; Dialog TaskForm y «Nueva cita» con EventForm van a SPEC 60 (respuesta del usuario).
- **Sí:** capa de datos movida a `features/agenda/`, compartida por home y overview (respuesta del usuario). Cada ruta provee su propio `AgendaStore` (estado no compartido entre pantallas; fuente única es localStorage).
- **Sí:** `load()`/`toggleTask()` duplicados en `HomeFacade` y `OverviewFacade` (~20 líneas); las funciones puras van a `agenda-queries.ts`. **No:** facade base o servicio común hasta que haya un tercer consumidor.
- **Sí:** `data-layout` desde `data.layout` de la ruta, leído por `App` (respuesta del usuario). **No:** servicio de layout escrito por la página.
- **Sí:** saludo con nombre fijo «César» en el facade (respuesta del usuario).
- **Sí:** StatCards derivadas como en el DS: 8 h disponibles fijas, Completadas por semana (respuesta del usuario).
- **Sí:** próxima cita desde «ahora» en cualquier día; tareas que vencen = pendientes con `due` ≤ hoy, máx. 5 (respuesta del usuario).
- **Sí:** Alert de solape solo para citas de hoy, primer par; `RenderMode.Server` como Inicio (respuesta del usuario).
- **Sí:** «ahora» fijado al cargar, sin reloj vivo.
- **Sí:** navegación de StatCards y EventCard por outputs (`dayOpened`, `tasksOpened`) de `OverviewMain`; `OverviewPage` inyecta además `Router` (excepción a R10: nada de store ni repositorio en la página). «Ver todas»/«Abrir día» con `routerLink` (respuesta del usuario, paso 5).
- **Sí:** cabecera `.l-cluster` solo con `data-justify="between"`; sin `data-align="end"` (no existe en composition, no se añade).
- **Sí:** dos dumb components (main, side), uno por área del grid, host de página `display: contents` (patrón SPEC 57).

## Risks

- Hora del servidor ≠ hora del usuario: saludo y día del lead pueden diferir del HTML de servidor → mismatch de hidratación cerca de cambios de franja/medianoche.
- Mover ficheros rompe imports de home si falta alguno; mitigado por paso 1 aislado con tests.
- `App` lee la ruta más profunda en `NavigationEnd`: con SSR el valor inicial debe salir del snapshot del router o el HTML de servidor saldría sin `data-layout` (salto de layout al hidratar). Verificar con `curl`.
- Badge de próxima cita se queda viejo si la pestaña sigue abierta.
- Semilla escrita una vez: con los días, «Tareas que vencen» se llena de vencidas (sin reseed, fuera de alcance).
