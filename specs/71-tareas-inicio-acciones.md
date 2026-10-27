# SPEC 71 — Borrar tareas, agregado rápido en Inicio y acciones de citas

> **Status:** Draft
> **Depends on:** SPEC 30 (Menu), SPEC 32 (AgendaItem), SPEC 34 (EventCard), SPEC 42 (Dialog), SPEC 53 (EventForm), SPEC 54 (TaskForm), SPEC 57 (Inicio), SPEC 59/60 (Resumen, AgendaCommands, AgendaDialogs), SPEC 67 (Tareas)
> **Date:** 2026-10-27
> **Objective:** Completar las acciones de datos que faltan: borrar tareas con confirmación, agregar tareas desde Inicio, editar y eliminar citas desde un menú, y conservar el filtro de Tareas y poder cerrar su detalle.

## Scope

**In:**

- `AgendaRepository` + `AgendaLocalRepository`: `deleteTask(id)`, `updateEvent(event)`, `deleteEvent(id)`; `AgendaStore`: `removeTask`, `replaceEvent`, `removeEvent`.
- `AgendaCommands`: `deleteTask`, `updateEvent`, `deleteEvent`.
- `AgendaDialogs`: Dialog de confirmación («¿Eliminar …?»), Dialog «Editar cita» (EventForm con los valores de la cita) y borrado de tareas desde «Detalle de tarea» (`deletable`).
- `/tareas`: «Eliminar tarea» en el detalle con confirmación; filtro en query param `?filtro=`; botón «Cancelar» en el detalle que deselecciona.
- Inicio: el campo «Agregar nueva tarea» crea la tarea con `AgendaCommands.createTask` en el día seleccionado.
- `app-menu` de acciones («Editar», «Eliminar») junto a cada EventCard/AgendaItem de Inicio y Resumen.
- `EventForm`: mapeo inverso cita → `EventFormValue` (`eventToForm`) en `agenda-forms.ts`.
- Tests; demo de EventCard/AgendaItem con menú; `PENDING.md`.

**Out of scope:**

- Deshacer borrados.
- Menú en DayView/WeekView/MonthView (eventos del calendario): en un spec aparte si se pide.
- Borrar en lote.

## Requisitos (EARS)

Datos:

- **R1.** `AgendaLocalRepository.deleteTask(id)`, `deleteEvent(id)` y `updateEvent(event)` deberán persistir en `agenda:v3:/tasks` y `agenda:v3:/events`.
- **R2.** Cuando `AgendaCommands.deleteTask|deleteEvent` termina, el store deberá quitar el elemento; si falla, el store no deberá cambiar y el error deberá llegar al Dialog que lo pidió.

Confirmación:

- **R3.** Cuando el usuario pide eliminar una tarea o una cita, la app deberá abrir un `app-dialog` «¿Eliminar “<título>”?» con «Esta acción no se puede deshacer.», «Cancelar» (`ghost`) y «Eliminar» (`danger`).
- **R4.** Cuando el usuario confirma, la app deberá borrar, cerrar los Dialogs abiertos de ese elemento y devolver el foco a un elemento existente; cuando cancela, no deberá borrar nada.

Tareas:

- **R5.** El TaskForm del Dialog «Detalle de tarea» (Inicio, Resumen, Calendario) y el del panel de `/tareas` deberán tener `deletable`; «Eliminar tarea» deberá seguir R3–R4.
- **R6.** Cuando se borra la tarea seleccionada en `/tareas`, el panel deberá volver a «Selecciona una tarea».
- **R7.** El filtro de `/tareas` deberá leerse y escribirse en `?filtro=todas|hoy|pendientes|hechas` (ausente o inválido = `todas`); recargar deberá conservarlo.
- **R8.** Mientras hay una tarea seleccionada en `/tareas`, el detalle deberá mostrar «Cancelar» (`ghost`) que la deselecciona sin guardar.

Inicio:

- **R9.** Cuando el usuario pulsa Enter en «Agregar nueva tarea» de Inicio con texto, la app deberá crear la tarea con vencimiento en el día seleccionado, vaciar el campo y mostrarla en la lista.
- **R10.** Si el texto está vacío, entonces no deberá crear nada; si `createTask` falla, deberá mostrar el Alert «No se pudo guardar la tarea.» existente y conservar el texto.

Citas:

- **R11.** Cada EventCard y AgendaItem de Inicio y Resumen deberá tener al lado un `app-menu` (`triggerLabel` «Acciones de <título>») con «Editar» (`edit`) y «Eliminar» (`delete_outline`, tono danger); el menú no deberá ir dentro del `<button>` del componente.
- **R12.** Cuando el usuario elige «Editar», la app deberá abrir `app-dialog` «Editar cita» con EventForm relleno (`eventToForm`); al guardar deberá llamar a `updateEvent`, cerrar y reflejar el cambio; si falla, Alert «No se pudo guardar la cita. Inténtalo de nuevo.».
- **R13.** Cuando el usuario elige «Eliminar», deberá seguir R3–R4.

## Data model

```ts
// AgendaRepository (abstract)
abstract deleteTask(id: string): Promise<void>;
abstract updateEvent(event: CalendarEvent): Promise<void>;
abstract deleteEvent(id: string): Promise<void>;

// agenda-forms.ts
export function eventToForm(event: CalendarEvent): EventFormValue;

// AgendaDialogs
type PendingDelete = { kind: 'task' | 'event'; id: string; title: string };
```

## Implementation plan

1. Repositorio + store + commands (`deleteTask`, `updateEvent`, `deleteEvent`) con specs (R1, R2).
2. `eventToForm` + test ida y vuelta con `formToEvent`.
3. `AgendaDialogs`: `pendingDelete`, `editingEvent`; plantilla `agenda-dialogs.html` con Dialog de confirmación y «Editar cita» (R3, R4, R12, R13).
4. TaskForm `deletable` en «Detalle de tarea» (R5).
5. `/tareas`: filtro en query param, «Eliminar» y «Cancelar» en `tasks-side` (R6–R8).
6. Inicio: `(keydown.enter)` en el campo de `tasks-panel` → output `added` → `HomeFacade.addTask` (R9, R10).
7. Menú junto a EventCard/AgendaItem en `agenda-panel` y `overview-main` (wrapper `l-cluster` `data-nowrap`); demo (R11).
8. Playwright `/inicio`, `/resumen`, `/tareas`; `npm test -- --watch=false`; `npm run build`.

## Acceptance criteria

- [ ] `npm test -- --watch=false` pasa, con ≥1 test por requisito R1–R13.
- [ ] `npm run build` sin errores ni warnings de budget.
- [ ] Demo de EventCard/AgendaItem con menú al lado actualizada en `src/app/demo/demo-page.html`.
- [ ] Playwright `/tareas?filtro=hechas`: recarga conserva el filtro; borrar con confirmación quita la tarea y persiste (R5–R8).
- [ ] Playwright `/inicio`: Enter crea la tarea del día seleccionado (R9).
- [ ] Playwright `/inicio` y `/resumen`: «Editar» cambia título y hora; «Eliminar» quita la cita tras confirmar y persiste al recargar (R11–R13).
- [ ] Sin errores de hidratación en consola; copy en español; sin emojis.

## Decisions

- **Sí:** «Editar» + «Eliminar» en el menú de citas, con `updateEvent`/`deleteEvent` nuevos (usuario).
- **Sí:** confirmación en Dialog para todo borrado (usuario).
- **Sí:** menú como hermano del botón (EventCard/AgendaItem son `<button>`; anidar es HTML inválido).
- **Sí:** filtro en query param (duda SPEC 67, usuario).
- **No:** deshacer: sin backend, el Dialog de confirmación basta.

## Risks

- Dialog de confirmación encima del Dialog de tarea: dos `showModal()` apilados; comprobar foco y Escape.
- El wrapper del menú cambia el layout de EventCard en la lista; revisar a 1440 px y estrecho.

## What is not in this spec

Menú en vistas de calendario, deshacer, borrado en lote.
