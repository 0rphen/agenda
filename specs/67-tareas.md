# SPEC 67 — Tareas: TasksPage de escritorio

> **Status:** Implemented
> **Depends on:** SPEC 33 (TaskItem), SPEC 54 (TaskForm), SPEC 22/23 (Card), SPEC 26 (EmptyState), SPEC 10 (Progress), SPEC 21 (SegmentedControl), SPEC 28 (Breadcrumb), SPEC 55/56 (`.l-shell`, rutas), SPEC 59/60 (agenda store, commands), SPEC 62 (copy de error de carga)
> **Date:** 2026-10-27
> **Objective:** Montar en `/tareas` la TasksPage del DS: filtro, agregado rápido, tareas agrupadas por vencimiento y panel con progreso y detalle editable de la tarea seleccionada.

## Scope

**In:**

- Agenda: `createTask` en `AgendaRepository` + `AgendaLocalRepository` (`post('/tasks')`), `AgendaStore.addTask`, `AgendaCommands.createTask(title, due)` (+ tests).
- `src/app/features/tasks/`: `tasks.facade.ts`, `pages/tasks-page/`, `components/tasks-main/`, `components/tasks-side/`; ruta `''` con `TasksPage`, `provideAgenda()`, `TasksFacade`, `data.layout = 'week'`, título «Tareas · Agenda» (sustituye `PlaceholderPage`).
- `app.routes.server.ts`: `tareas` → `RenderMode.Server`.
- `src/styles/blocks/tasks-page.css` (host `display: contents`) importado en `src/styles.css`.
- `cluster.css`: `&[data-align='end']` (divergencia local: el DS usa `alignItems: flex-end` inline).
- Tests; marcar «Tareas» en `TODO.md`.

**Out of scope:**

- Pantalla móvil Tareas (`.l-screen`, MobileScreens).
- Borrar tareas; cancelar/deseleccionar desde el TaskForm (nuestro TaskForm no tiene «Cancelar»).
- Filtro en la URL (el DS lo guarda en estado).
- Cambios en componentes `shared/components` (sin sección demo nueva).
- Agregado rápido en Inicio (sigue decorativo).

## Requisitos (EARS)

Ruta:

- **R1.** `/tareas` deberá montar `TasksPage` con título «Tareas · Agenda» y `data.layout = 'week'`; el destino «Tareas» del riel deberá estar activo.
- **R2.** El servidor deberá renderizar `/tareas` en cada petición (`RenderMode.Server`) sin leer datos; cuando `TasksPage` se ha renderizado en el navegador (`afterNextRender`), deberá llamar a `load()`.

Agenda:

- **R3.** `AgendaCommands.createTask(title, due)` deberá crear en el repositorio una tarea `{ title: title.trim(), done: false, due, list: 'Personal', listColor: TASK_LIST_COLORS.Personal }`, añadirla al store y devolverla.
- **R4.** Si el repositorio rechaza `createTask`, entonces `createTask` deberá activar `saveError` y no deberá añadir nada al store.

Facade (`TasksFacade`, lo único que inyecta la página):

- **R5.** `TasksFacade` deberá exponer `today`, `status`, `filter` (`'todas' | 'hoy' | 'pendientes' | 'hechas'`, por defecto `'todas'`), `groups`, `pendingCount`, `dueTodayCount`, `progress` (`{ done, total, value }`), `selectedTask`, `saveError`, `detailError`, y `load()`, `setFilter()`, `toggleTask()`, `dismissSaveError()`, `addTask(title)`, `selectTask(id)`, `saveTask(value)`.
- **R6.** `groups` deberá agrupar en orden Vencidas (pendientes con `due` < hoy), Hoy (pendientes con `due` = hoy), Próximas (pendientes con `due` > hoy o sin `due`) y Completadas (hechas); dentro de cada grupo por `due` ascendente, sin `due` al final; los grupos vacíos no aparecen.
- **R7.** Mientras `filter` sea `'hoy'`, `groups` deberá tener solo el grupo Hoy; `'pendientes'`, Vencidas + Hoy + Próximas; `'hechas'`, solo Completadas; `'todas'`, los cuatro.
- **R8.** `pendingCount` deberá ser las tareas no hechas; `dueTodayCount`, las no hechas con `due` = hoy; `progress.value` = `round(100 · hechas / total)` (0 sin tareas).
- **R9.** Cuando `addTask(title)` recibe un título no vacío tras `trim`, deberá llamar a `createTask(title, today)` y seleccionar la tarea creada; si el título está vacío, no deberá hacer nada.
- **R10.** `saveTask(value)` deberá llamar a `updateTask` de la tarea seleccionada y mantenerla seleccionada; si rechaza, `detailError` deberá ser `true` hasta el siguiente guardado o selección.

Área principal (`TasksMain`, `.l-shell__main panel l-stack` `data-gap="m"`):

- **R11.** `TasksMain` deberá renderizar `app-breadcrumb` (Inicio `home` › Tareas) y una cabecera `.l-cluster` `data-justify="between"` `data-align="end"` con `.l-stack` `data-gap="2xs"` (`h1.page-title` «Tareas» + `p.page-lead` «N pendientes · M vencen hoy») y `app-segmented-control` label «Filtro» (Todas · Hoy · Pendientes · Hechas).
- **R12.** Mientras `status` sea `'ready'`, `TasksMain` deberá renderizar un `<form>` con `app-text-field` (label oculta «Agregar nueva tarea», placeholder «Agregar nueva tarea y pulsar Enter», icono `add`); cuando el usuario lo envía, deberá emitir `added` con el texto y vaciar el campo.
- **R13.** Mientras `status` sea `'ready'`, por cada grupo `TasksMain` deberá renderizar `app-card` con `heading` del grupo y `app-badge` (`danger` en Vencidas, `count` en el resto) con su número en `cardActions`, y un `app-task-item` por tarea (`heading`, `done`, `list`, `listColor`, `subtasks`, `due` = fecha corta «20 oct» si hay, `overdue` en Vencidas, `selected` si es la seleccionada).
- **R14.** Cuando el usuario marca un TaskItem, `TasksMain` deberá emitir `toggled` `{ id, done }`; cuando lo abre, `taskOpened` con su `id`.
- **R15.** Si no hay grupos con el filtro actual, entonces `TasksMain` deberá mostrar una `app-card` con `app-empty-state` `s`, icono `task_alt`, «Todo al día», «No hay tareas con este filtro.» y `app-button` `secondary` `s` «Ver todas» que emite `filterChanged('todas')`.
- **R16.** Si `saveError`, entonces `TasksMain` deberá mostrar `app-alert` `danger` descartable «No se pudo guardar la tarea.» (copy de Inicio).
- **R17.** Mientras `status` no sea `'ready'` ni `'error'`, `TasksMain` deberá mostrar `app-skeleton-list` `task` en lugar del formulario y los grupos; si `status` es `'error'`, `app-alert` `danger` «No se pudo cargar tu agenda» / «Revisa el almacenamiento del navegador e inténtalo de nuevo.» con «Reintentar» que emite `retry` (copy de SPEC 62).

Panel (`TasksSide`, `.l-shell__panel panel l-stack` `data-variant="side"` `data-gap="m"`):

- **R18.** Mientras `status` sea `'ready'`, `TasksSide` deberá renderizar `app-card` «Progreso» con `app-progress` `success`, `value` = `progress.value` y heading «X de Y completadas».
- **R19.** Donde haya tarea seleccionada, `TasksSide` deberá renderizar `app-card` «Detalle de la tarea» con `app-task-form` (`defaultValues` = `taskToForm`, referencia estable por tarea) y, si `detailError`, `app-alert` `danger` «No se pudo guardar la tarea. Inténtalo de nuevo.»; cuando el form emite `saved`, deberá emitir `saved`.
- **R20.** Si no hay tarea seleccionada, entonces `TasksSide` deberá renderizar `app-card` con `app-empty-state` `s`, icono `touch_app`, «Selecciona una tarea», «Verás aquí sus detalles.».
- **R21.** Mientras `status` no sea `'ready'` ni `'error'`, `TasksSide` deberá mostrar `app-skeleton-list` `task`; con `'error'`, nada (el Alert va en el área principal).

Maquetación y frontera smart/dumb:

- **R22.** `TasksPage` deberá renderizar `app-tasks-main` y `app-tasks-side` como hijos directos; `.tasks-page` en `display: contents`.
- **R23.** `TasksMain` y `TasksSide` deberán recibir todo por inputs y comunicar por outputs; no deberán inyectar facade, store, router ni repositorio.
- **R24.** Sin `styleUrl`; CSS solo tokens y logical properties; copy en español, sentence case, sin emojis.

## Data model

```ts
// domain/agenda-repository.ts (+)
abstract createTask(task: Omit<Task, 'id'>): Promise<Task>;
// store (+) addTask(task: Task): void
// commands (+) createTask(title: string, due: string): Promise<Task | undefined>

// features/tasks/domain/tasks-view.model.ts
export type TaskFilter = 'todas' | 'hoy' | 'pendientes' | 'hechas';
export type TaskGroupKey = 'late' | 'today' | 'next' | 'done';
export interface TaskGroup { key: TaskGroupKey; heading: string; tasks: Task[] }
export interface TasksProgress { done: number; total: number; value: number }
```

## Implementation plan

1. `createTask` en repositorio local (mapper `fromTask` sin id), store, commands + tests (R3, R4).
2. `TasksFacade` + spec: grupos, orden, filtros, contadores, progreso, addTask, selección, saveTask/detailError (R5–R10).
3. Dumb `TasksMain` + spec (R11–R17, R23); `cluster.css` `data-align='end'`.
4. Dumb `TasksSide` + spec (R18–R21, R23).
5. `TasksPage`, `tasks-page.css`, ruta, `app.routes.server.ts`; spec de página: carga tras render, hijos directos, flujo filtro/añadir/seleccionar (R1, R2, R22).
6. Playwright `npm start` `/tareas` a 1440 px: grupos y badges; filtros; Enter añade en Hoy y la selecciona; marcar mueve a Completadas y actualiza progreso; seleccionar abre detalle, guardar persiste tras recargar; filtro vacío + «Ver todas»; JSON corrupto en `agenda:v2:/tasks` muestra Alert + Reintentar; riel «Tareas» activo; sin errores de hidratación.
7. `npm run build` sin warnings; `curl` `/tareas` en `serve:ssr:calendar` devuelve «Tareas · Agenda» y esqueletos; `npm test -- --watch=false` verde; `TODO.md`.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa, con ≥1 test por requisito R1–R23. (864/864)
- [x] `npm run build` sin errores ni warnings de budget; `dist/.../browser/tareas/index.html` no existe (R2).
- [x] `curl` `/tareas` devuelve «Tareas · Agenda», «Tareas» y `skeleton-list` (R2, R17, R21).
- [x] Playwright: grupos Vencidas/Hoy/Próximas/Completadas en orden con badge, Vencidas `danger` (R6, R13).
- [x] Playwright: filtros Hoy/Pendientes/Hechas/Todas; vacío con «Ver todas» (R7, R15).
- [x] Playwright: Enter añade tarea en Hoy, seleccionada, persiste al recargar (R3, R9, R12).
- [x] Playwright: marcar mueve a Completadas y cambia «X de Y completadas» y «N pendientes» (R8, R14, R18).
- [x] Playwright: seleccionar abre «Detalle de la tarea»; guardar cambia el título en la lista y persiste (R10, R19, R20).
- [x] Playwright: JSON corrupto en `agenda:v2:/tasks` muestra Alert y «Reintentar» (R17).
- [x] Riel «Tareas» activo; sin errores de hidratación (R1).
- [x] Sin `styles`/`styleUrl`; sin emojis; copy en español (R24).
- [x] `TODO.md`: «Tareas» marcado `(SPEC 67)`.

## Decisions

- **Sí:** seguir `TasksPage` del DS (respuesta del usuario: «según DS»): layout `week`, filtro con 4 opciones, default «Todas», en estado (no URL); grupos por vencimiento en Cards.
- **Sí:** Enter crea tarea real con `due` = hoy y lista «Personal» (DS); color de `TASK_LIST_COLORS` (`orange`), no el `red` del ejemplo.
- **Sí:** detalle en el panel con selección propia del facade y `commands.updateTask`, no `AgendaDialogs` (su `saveTask` cierra la selección; el DS la mantiene). Sin `app-agenda-dialogs` en la página.
- **Sí:** sin selección inicial (el `sel = 2` del DS es de la demo).
- **Sí:** sin «Cancelar» en el detalle: el TaskForm local no lo tiene.
- **Sí:** tareas sin `due` pendientes van a Próximas al final.
- **Sí:** `data-align='end'` en `.l-cluster` en vez de estilo inline.

## Risks

- Hora del servidor ≠ usuario: grupos dependen de `today` del navegador; el servidor solo pinta esqueletos, sin mismatch.
- `createTask` usa `crypto.randomUUID()` del `LocalStorageApi`: solo navegador.

## What is not in this spec

Móvil Tareas, borrar tareas, filtro en URL, agregado rápido en Inicio.

