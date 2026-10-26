# SPEC 57 — Inicio: AppShell con agenda y tareas desde una API simulada en localStorage

> **Status:** Implemented
> **Depends on:** SPEC 32 (AgendaItem), SPEC 33 (TaskItem), SPEC 34 (EventCard), SPEC 38 (MiniCalendar), SPEC 21 (SegmentedControl), SPEC 25 (Alert), SPEC 26 (EmptyState), SPEC 11 (SkeletonList), SPEC 55 (`.l-shell`), SPEC 56 (rutas y navegación)
> **Date:** 2026-10-26
> **Objective:** Montar en `/inicio` la pantalla AppShell del DS (calendario, agenda y tareas en las áreas de `.l-shell`), renderizada en servidor, con eventos y tareas leídos de un cliente localStorage con forma de API detrás de un port de `domain/`, y marcar tareas como hechas.

## Scope

**In:**

- `src/app/features/home/`, estructura front-guidelines:
  - `domain/`: `calendar-event.model.ts`, `task.model.ts`, `agenda-repository.ts` (port, clase abstracta), `agenda-errors.ts` (`AgendaUnavailableError`).
  - `structure/`: `local-storage-api.ts` (`LocalStorageApi`), `agenda.dto.ts`, `agenda.mapper.ts`, `agenda-seed.ts`, `agenda-local-repository.ts` (`AgendaLocalRepository extends AgendaRepository`).
  - `store/home.store.ts` (`HomeStore`).
  - `home.facade.ts` (`HomeFacade`).
  - `components/`: `calendar-panel`, `agenda-panel`, `tasks-panel` (dumb, uno por área de `.l-shell`).
  - `pages/home-page/` (`HomePage`, smart).
  - `home.routes.ts` (`HOME_ROUTES`, providers de port/repositorio/store/facade).
- `src/app/app.routes.ts`: `inicio` con `loadChildren`; `''` y `**` redirigen a `/inicio`.
- `src/app/app.routes.server.ts`: `inicio` → `RenderMode.Server`; resto sigue `Prerender`.
- `src/styles/blocks/home-page.css` (host en `display: contents`) importado en `src/styles.css`.
- Tests: mapper, repositorio (con `localStorage` de jsdom), facade (derivados), `HomePage`; `app.spec.ts` actualizado (redirecciones a `/inicio`).
- Marcar «Inicio: AppShell» en `TODO.md`.

**Out of scope:**

- Crear/editar/borrar eventos y tareas: «Nueva cita», «Agregar tarea», «Buscar» y «Configurar vista» se pintan sin acción (respuesta del usuario).
- Destino «Inicio» en riel o BottomNav (se llega por `/` y la miga «Inicio»).
- Resto de pantallas de §6 (siguen con `PlaceholderPage`) y su uso de esta capa de datos.
- Backend real / `HttpClient`.
- Versionado o migración del formato en localStorage.
- Página propia para `<48rem`: se apilan las áreas de `.l-shell` (comportamiento del DS); el móvil real es MobileScreens.
- `/demo`: no se toca (no se crea ni cambia nada de `shared/components/`).

## Requisitos (EARS)

Ruta y render:

- **R1.** El router deberá tener `/inicio` declarada en `features/home/home.routes.ts`, cargada con `loadChildren`, título «Inicio · Agenda», que monta `HomePage`.
- **R2.** Cuando se navega a `/` o a una URL sin ruta, el router deberá redirigir a `/inicio`.
- **R3.** El servidor deberá renderizar `/inicio` en cada petición (`RenderMode.Server`); las demás rutas seguirán prerenderizadas.
- **R4.** Mientras `/inicio` esté activa, ningún destino del riel ni de la BottomNav deberá estar activo.

Datos:

- **R5.** El `AgendaRepository` (`domain/`) deberá declarar `listEvents(): Promise<CalendarEvent[]>`, `listTasks(): Promise<Task[]>` y `setTaskDone(id: string, done: boolean): Promise<void>`, sin vocabulario de transporte.
- **R6.** `HOME_ROUTES` deberá proveer `AgendaRepository` con `useClass: AgendaLocalRepository`; ningún fichero fuera de `structure/` y `home.routes.ts` deberá importar `structure/`.
- **R7.** El `LocalStorageApi` deberá exponer `get<T>(path)` y `patch<T>(path, id, changes)` que devuelven `Promise`, guardando cada recurso como JSON en la clave `agenda:<path>` (p. ej. `agenda:/events`, `agenda:/tasks`).
- **R8.** Si la clave de un recurso no existe, entonces el `LocalStorageApi` deberá escribir la semilla de ese recurso y devolverla.
- **R9.** La semilla deberá generar fechas relativas a hoy (hoy, mañana, pasado, +3 y +7 días): al menos 6 eventos (uno de todo el día, uno con personas y `confirmed`) y 6 tareas en 3 listas, con alguna hecha y alguna para hoy.
- **R10.** El `AgendaLocalRepository` deberá convertir DTO (snake_case: `all_day`, `category_label`, `list_color`…) a modelo con `AgendaMapper`; ningún DTO deberá salir de `structure/`.
- **R11.** Si `localStorage` no está disponible, lanza al leer/escribir o contiene JSON no válido, entonces el repositorio deberá rechazar con `AgendaUnavailableError`.
- **R12.** El `HomeStore` deberá exponer `events`, `tasks` y `status` (`'idle' | 'loading' | 'ready' | 'error'`) como signals de solo lectura, mutables solo por métodos con nombre.

Facade y estado:

- **R13.** El `HomeFacade` deberá ser lo único que `HomePage` inyecta; expondrá `today`, `selectedDay`, `range`, `status`, `agendaGroups`, `eventDays`, `dayTasks`, `pendingCount`, `weekProgress`, `saveError`, y los métodos `load()`, `selectDay(iso)`, `setRange(range)`, `toggleTask(id, done)`, `dismissSaveError()`.
- **R14.** El `HomeFacade` deberá calcular `today` con la hora local de quien ejecuta (`localIso(new Date())`); `selectedDay` empezará en `today` y `range` en `'day'`.
- **R15.** Cuando `HomePage` se ha renderizado en el navegador (`afterNextRender`), deberá llamar a `load()`; el servidor no deberá leer datos.
- **R16.** Mientras `status` no sea `'ready'` ni `'error'`, la agenda y las tareas deberán mostrar `app-skeleton-list` (variante `agenda` y `task`, respectivamente).
- **R17.** Si `load()` rechaza, entonces la agenda deberá mostrar un `app-alert` `tone="danger"` con heading «No se pudo cargar tu agenda», texto «Revisa el almacenamiento del navegador e inténtalo de nuevo.» y botón «Reintentar» que vuelve a llamar a `load()`; las tareas no deberán mostrar contenido.

Panel calendario (`.l-shell__calendar`):

- **R18.** El `CalendarPanel` deberá renderizar, en orden: `app-breadcrumb` (Inicio `home` › Calendario), `h1.page-title` con mes y año del día elegido en sentence case (p. ej. «Octubre 2026»), `app-segmented-control` label «Vista» con opciones Hoy (`day`), Esta semana (`week`), Próxima (`next`), `app-mini-calendar` y `app-button` secundario `s` icono `tune` «Configurar vista».
- **R19.** El `app-mini-calendar` deberá recibir `today`, `selected` = `selectedDay` y `events` = `eventDays` (días con al menos un evento).
- **R20.** Cuando el usuario elige un día en el MiniCalendar, el `HomeFacade` deberá fijar `selectedDay` a ese día.
- **R21.** Cuando el usuario cambia el SegmentedControl, el `HomeFacade` deberá fijar `range`.

Panel agenda (`.l-shell__agenda`):

- **R22.** El `AgendaPanel` deberá tener cabecera con `h2.section-title[data-tone=brand]` «Tu agenda» e `app-icon-button` «Buscar» (`search`) y «Nueva cita» (`add`, `solid`), sin acción.
- **R23.** El rango deberá ser: `day` = `selectedDay`; `week` = lunes a domingo de la semana de `selectedDay`; `next` = lunes a domingo de la semana siguiente.
- **R24.** El `AgendaPanel` deberá agrupar los eventos del rango por día ascendente, solo días con eventos, cada grupo con `.agenda-group__title` = día largo en sentence case (p. ej. «Jueves 22 octubre»), eventos de todo el día primero y luego por `start`.
- **R25.** Donde un evento tiene `people` no vacío, el `AgendaPanel` deberá renderizarlo como `app-event-card` (`time` «HH:MM – HH:MM», `tint`, `location`, `people`), con `app-badge` `glass` `check_circle` «Confirmada» si `confirmed`; si no, como `app-agenda-item` (`start`, `end`, `category`, `categoryLabel`).
- **R26.** Donde un evento es de todo el día, el `app-agenda-item` deberá mostrar «Todo el día» en lugar de horas.
- **R27.** Si el rango no tiene eventos, entonces el `AgendaPanel` deberá mostrar `app-empty-state` `s` heading «Sin citas», descripción «No tienes nada en estos días.», icono `event_available`.

Panel tareas (`.l-shell__tasks`):

- **R28.** El `TasksPanel` deberá tener cabecera `h2.section-title` «Hoy» si `selectedDay` = `today`, si no el día corto (p. ej. «23 oct»), y `app-badge` `count` con `pendingCount`.
- **R29.** El `TasksPanel` deberá renderizar `app-text-field` label oculto «Agregar nueva tarea», placeholder igual, icono `add`, sin acción.
- **R30.** El `TasksPanel` deberá listar como `app-task-item` solo las tareas con `due` = `selectedDay` (`dayTasks`), pendientes primero, con `list`, `listColor` y `subtasks`; `pendingCount` = número de esas sin hacer.
- **R31.** Si `dayTasks` está vacío, entonces el `TasksPanel` deberá mostrar `app-empty-state` `s` heading «Sin tareas», descripción «No hay tareas para este día.», icono `task_alt`.
- **R32.** Cuando el usuario marca o desmarca una tarea, el `HomeFacade` deberá actualizar el store al momento y llamar a `setTaskDone`.
- **R33.** Si `setTaskDone` rechaza, entonces el `HomeFacade` deberá devolver la tarea a su estado anterior y fijar `saveError`; el `TasksPanel` deberá mostrar `app-alert` `danger` `dismissible` «No se pudo guardar la tarea.», que al cerrarse llama a `dismissSaveError()`.
- **R34.** El `TasksPanel` deberá terminar con `app-card` heading «Avance de la semana» con un `app-progress` por lista (heading = nombre de la lista, orden alfabético): `value` = % redondeado de tareas hechas de esa lista con `due` en la semana lun–dom de `selectedDay`; `tone="success"` si es 100. Si no hay tareas esa semana, la Card no deberá renderizarse.

Maquetación y frontera smart/dumb:

- **R35.** `HomePage` deberá renderizar `app-calendar-panel`, `app-agenda-panel`, `app-tasks-panel` como hijos directos, con clases de host `l-shell__calendar panel l-stack` (`data-gap="m"`), `l-shell__agenda panel l-stack` (`data-variant="surface"`, `data-gap="xs"`) y `l-shell__tasks panel l-stack`; `.home-page` deberá ser `display: contents` para que cada panel ocupe su área del grid.
- **R36.** Los componentes de `components/` deberán recibir todo por inputs y comunicar solo por outputs; no deberán inyectar facade, store, router ni repositorio.
- **R37.** Ningún componente de la feature deberá usar `styleUrl`; copy en español, sentence case, 24 h, sin emojis.

## Data model

```ts
// domain/calendar-event.model.ts
export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  start?: string; // HH:MM; sin start = todo el día
  end?: string;
  category?: Category;
  categoryLabel?: string;
  tint?: Tint;
  location?: string;
  people: string[];
  confirmed: boolean;
}

// domain/task.model.ts
export interface Task {
  id: string;
  title: string;
  done: boolean;
  due?: string; // YYYY-MM-DD
  list?: string;
  listColor?: Category;
  subtasks?: number;
}

// domain/agenda-repository.ts
export abstract class AgendaRepository {
  abstract listEvents(): Promise<CalendarEvent[]>;
  abstract listTasks(): Promise<Task[]>;
  abstract setTaskDone(id: string, done: boolean): Promise<void>;
}

// domain/agenda-errors.ts
export class AgendaUnavailableError extends Error {}

// structure/agenda.dto.ts
export interface CalendarEventDto { id; title; date; start?; end?; all_day: boolean; category?; category_label?; tint?; location?; people: string[]; confirmed: boolean }
export interface TaskDto { id; title; done: boolean; due?; list?; list_color?; subtasks?: number }

// structure/local-storage-api.ts
export class LocalStorageApi {
  get<T>(path: '/events' | '/tasks'): Promise<T[]>;
  patch<T extends { id: string }>(path, id: string, changes: Partial<T>): Promise<T>;
}

// home.facade.ts (UI-shaped)
type AgendaRange = 'day' | 'week' | 'next';
interface AgendaGroup { day: string; title: string; events: CalendarEvent[] }
interface ListProgress { list: string; value: number }
```

Tipos de vista (`AgendaRange`, `AgendaGroup`, `ListProgress`) en `features/home/domain/` junto a los modelos. Utilidades de fecha reutilizadas de `@shared/utils` (`localIso`, `addDays`, `LONG_DAY`, `MONTH_YEAR`); si falta lunes-de-semana, se añade en `shared/utils/time.ts` con test.

## Implementation plan

1. `domain/`: modelos, port, error, tipos de vista (R5, R12 tipos).
2. `structure/`: DTO, mapper, semilla, `LocalStorageApi`, `AgendaLocalRepository`. Tests de mapper y repositorio: semilla al vacío, JSON corrupto y `setItem` que lanza dan `AgendaUnavailableError` (R7–R11).
3. `HomeStore` + `HomeFacade` con derivados y `toggleTask` optimista con revertido. Tests de rango, agrupado, `dayTasks`, `pendingCount`, `weekProgress`, revertido (R12–R14, R23–R24, R30, R32–R34).
4. Dumb components `CalendarPanel`, `AgendaPanel`, `TasksPanel` (R18–R37 de vista). Tests por input/output.
5. `HomePage` + `home-page.css` + `home.routes.ts` con providers; `app.routes.ts` (`inicio`, redirecciones), `app.routes.server.ts` (`RenderMode.Server`). Test de `HomePage` (esqueleto en servidor, carga tras render, error + reintentar) y `app.spec.ts` (R1–R4, R15–R17, R35).
6. Playwright en `npm start` a 40rem, 56rem y 80rem: áreas en su sitio (4 columnas a 80rem), MiniCalendar y SegmentedControl cambian la agenda, marcar tarea persiste tras recargar, `localStorage.setItem('agenda:/events','{')` + recarga muestra Alert y «Reintentar», consola sin errores de hidratación.
7. `npm run build` + `npm run serve:ssr:calendar`: `/inicio` sirve HTML con mes y esqueletos; `dist/.../browser/inicio/index.html` no existe (R3). Marcar ítem en `TODO.md`. `npm test -- --watch=false` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa con tests de R2, R4, R7–R11, R14–R17, R20–R21, R23–R34.
- [x] `npm run build` sin errores ni warnings de budget; `/inicio` no prerenderizada, resto sí (R3).
- [x] `curl` a `/inicio` en `serve:ssr:calendar` devuelve «Inicio · Agenda», el mes y `skeleton-list`, sin eventos (R3, R15–R16).
- [x] `/` y `/no-existe` acaban en `/inicio` (R2).
- [x] Ningún import de `structure/` o `store/` fuera de `structure/`, `home.routes.ts` y `home.facade.ts` (grep) (R6, R13, R36).
- [x] Ningún DTO importado fuera de `structure/` (grep) (R10).
- [x] Playwright a 80rem: riel, calendario, agenda y tareas en 4 columnas; a 56rem riel + columna apilada; a 40rem apilado con BottomNav sin destino activo (R4, R35).
- [x] Playwright: elegir día y cambiar «Vista» actualiza grupos de agenda; tareas y Badge siguen el día elegido (R19–R31).
- [x] Playwright: marcar tarea, recargar, sigue marcada; Avance cambia (R32, R34).
- [x] Playwright: JSON corrupto en `agenda:/events` muestra Alert y «Reintentar» (R11, R17).
- [x] Sin errores de hidratación en consola.
- [x] Sin `styleUrl` en la feature; sin emojis ni copy en inglés (R37).
- [x] Ítem marcado en `TODO.md`.

## Decisions

- **Sí:** §6 partido en una spec por pantalla; esta es Inicio (respuesta del usuario).
- **Sí:** datos en `features/home/` completos, no repartidos por dominio (respuesta del usuario). Day/Tareas tendrán que mover o reutilizar esta capa cuando lleguen.
- **Sí:** modelos de feature en `features/home/domain/` (front-guidelines); la regla de CLAUDE.md «types → `shared/types`, interfaces → `shared/interfaces`» se aplica a `shared/`, no a features.
- **Sí:** `LocalStorageApi` propio con rutas tipo API (`/events`, `/tasks`) y `Promise`; cambiar a backend = nuevo repositorio + cambiar el provider del port (respuesta del usuario). **No:** interceptor HTTP.
- **Sí:** `RenderMode.Server` para `/inicio` (respuesta del usuario). Requiere servidor Express en producción para esa ruta.
- **Sí:** servidor pinta fecha, mes y esqueletos; datos solo en navegador tras `afterNextRender` (respuesta del usuario): sin desajuste de hidratación aunque luego haya escritura. **No:** semilla en servidor.
- **Sí:** «hoy» = hora local de quien ejecuta, servidor y navegador (respuesta del usuario).
- **Sí:** solo lectura salvo marcar tarea, con actualización optimista y revertido (respuesta del usuario). Botones restantes pintados sin acción (respuesta del usuario).
- **Sí:** MiniCalendar fija el día base; SegmentedControl el rango relativo a él (respuesta del usuario).
- **Sí:** EventCard si el evento tiene personas; si no, AgendaItem (respuesta del usuario).
- **Sí:** tareas = solo `due` = día elegido (respuesta del usuario); cabecera «Hoy» o día corto según el día elegido.
- **Sí:** Avance derivado de tareas por lista en la semana del día elegido (respuesta del usuario).
- **Sí:** error de almacenamiento = Alert + Reintentar; nunca se reescribe la semilla sobre datos ilegibles (respuesta del usuario).
- **Sí:** `/inicio` sin destino en riel ni BottomNav (respuesta del usuario).
- **Sí:** tres dumb components, uno por área, para respetar la frontera smart/dumb y que cada uno sea hijo directo del grid; host de la página en `display: contents`.
- **No:** `index.ts` de la feature: nada se exporta fuera salvo `HOME_ROUTES`.

## Risks

- Hora local del servidor ≠ del usuario cerca de medianoche: título del mes/MiniCalendar del HTML de servidor y del navegador pueden diferir → posible mismatch de hidratación ese rato.
- `RenderMode.Server`: `/inicio` deja de funcionar en un hosting estático; los demás destinos siguen prerenderizados.
- `app-text-field` «Agregar nueva tarea» e icon buttons sin acción: el usuario puede escribir y nada pasa hasta su spec.
- Semilla relativa a hoy se escribe una vez: pasados días, los eventos quedan en el pasado (sin versionado ni reseed, fuera de alcance).
- jsdom no evalúa container queries ni `display: contents` en layout: R35 solo con Playwright.
- `localStorage` compartido entre pestañas: sin sincronizar (`storage` event fuera de alcance).

## What is **not** in this spec

- Crear/editar/buscar, destino Inicio en navegación, otras pantallas, backend real, versionado de almacenamiento, `/demo`.
