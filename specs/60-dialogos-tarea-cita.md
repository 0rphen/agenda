# SPEC 60 — Editar tarea y crear cita desde Inicio y Resumen

> **Status:** Implemented
> **Depends on:** SPEC 42/48 (Dialog), SPEC 53 (EventForm), SPEC 54 (TaskForm), SPEC 33/58 (TaskItem `opened`/`selected`), SPEC 57 (Inicio), SPEC 59 (Resumen, `features/agenda/`)
> **Date:** 2026-10-26
> **Objective:** En Inicio y Resumen, abrir una tarea en un Dialog con TaskForm y guardarla, y crear citas desde «Nueva cita» con EventForm en un Dialog, persistiendo en localStorage vía `create`/`update` del repositorio.

## Scope

**In:**

- Modelos y DTO ampliados: `Task` (+ `notes`, `priority`, `tags`, `subtasks` como lista), `CalendarEvent` (+ `notes`, `reminder`, `repeat`); mapper en ambos sentidos.
- `AgendaRepository`: `createEvent`, `updateTask`; `LocalStorageApi.post`; clave `agenda:v2:<path>`.
- `features/agenda/agenda-forms.ts`: conversión form ↔ modelo y mapas fijos categoría→color y lista→color (+ spec).
- `features/agenda/agenda-commands.ts`: `AgendaCommands` (load, toggleTask, saveError, createEvent, updateTask), provisto por `provideAgenda()`; `HomeFacade` y `OverviewFacade` delegan en él.
- `AgendaStore`: `addEvent`, `replaceTask`.
- Inicio: `TasksPanel` emite `opened` y marca `selected`; `AgendaPanel` emite `newEvent` desde el IconButton «Nueva cita»; `HomePage` monta los dos Dialog.
- Resumen: `OverviewMain` emite `taskOpened` (tareas que vencen) y `newEvent` («Nueva cita»), marca `selected`; `OverviewPage` monta los dos Dialog.
- `shared/utils/task-form.ts`: `TASK_LISTS` = Personal, Trabajo, Casa; `task-form.spec.ts` y demo (`demo-page.ts` «Lista 1») actualizados.
- Tests de todo lo anterior; marcar el ítem de `TODO.md`.

**Out of scope:**

- Borrar tarea (`deletable` = false) y borrar/editar citas.
- Crear tareas (campo «Agregar nueva tarea» sigue sin acción).
- Clic en AgendaItem/EventCard para editar cita.
- Pantallas móviles (Dialog `sheet`), Calendario, Tareas.
- Migración de datos `agenda:/…` antiguos: se ignoran y se re-siembra en `agenda:v2:`.
- Recordatorios/repetición reales: solo se guardan como texto.
- `/demo`: ningún componente de `shared/components/` cambia API; solo se ajusta el dato «Lista 1».

## Requisitos (EARS)

Datos:

- **R1.** `Task` deberá incluir `notes?`, `priority?`, `tags?: string[]` y `subtasks?: Subtask[]` (antes número); `CalendarEvent`, `notes?`, `reminder?`, `repeat?`. DTO y `AgendaMapper` (`toEvent`/`toTask` y `fromEvent`/`fromTask`) deberán cubrirlos.
- **R2.** `LocalStorageApi` deberá usar la clave `agenda:v2:<path>`; sin datos en esa clave, deberá sembrar (semilla con `subtasks` como lista de `{ title, done }`).
- **R3.** `LocalStorageApi.post(path, item)` deberá añadir el item con `id` = `crypto.randomUUID()` y devolverlo.
- **R4.** `AgendaRepository` deberá declarar `createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent>` y `updateTask(task: Task): Promise<void>`; `AgendaLocalRepository` deberá implementarlos y, si fallan, lanzar `AgendaUnavailableError`.
- **R5.** `TaskItem` en Inicio y Resumen deberá recibir `subtasks` = longitud de la lista (sin subtareas, nada).

Conversión (`agenda-forms.ts`):

- **R6.** `taskToForm(task)` deberá devolver `TaskFormValue` completo (`''`/`[]`/`'media'` donde falte).
- **R7.** `formToTask(task, value)` deberá devolver la tarea con los valores del form, `due` vacío como `undefined`, `listColor` = `TASK_LIST_COLORS[list]` (Personal `orange`, Trabajo `blue`, Casa `green`), conservando `id` y `done`.
- **R8.** `formToEvent(value)` deberá devolver la cita sin `id`: `start`/`end` solo si no es todo el día; `category` = `EVENT_CATEGORY_COLORS[category]` (Marketing `orange`, Estrategia `violet`, Descubrimiento `cyan`, Desarrollo `blue`, Personal `red`, Finanzas `mustard`, Clientes `green`) y `categoryLabel` = etiqueta; `people` = `value.people` separado por comas, sin vacíos; `confirmed: false`; textos vacíos como `undefined`.

Comandos (`AgendaCommands`):

- **R9.** `provideAgenda()` deberá proveer además `AgendaCommands`; `HomeFacade` y `OverviewFacade` deberán delegar `load`, `toggleTask`, `saveError` y `dismissSaveError` en él sin cambiar su comportamiento (tests de SPEC 57/59 siguen pasando).
- **R10.** `createEvent(value)` deberá esperar al repositorio y, si resuelve, añadir la cita devuelta al store; si rechaza, deberá relanzar sin tocar el store.
- **R11.** `updateTask(id, value)` deberá esperar al repositorio y, si resuelve, sustituir la tarea en el store; si rechaza, deberá relanzar sin tocar el store.

Dialog de tarea:

- **R12.** Cuando el usuario abre una tarea (`opened` de `app-task-item`) en Inicio (panel Tareas) o Resumen («Tareas que vencen»), la página deberá abrir `app-dialog` modal heading «Detalle de tarea» con `app-task-form` y `defaultValues` = `taskToForm(task)`.
- **R13.** Mientras el Dialog de tarea esté abierto, el `app-task-item` de esa tarea deberá llevar `selected`.
- **R14.** Cuando TaskForm emite `saved`, el facade deberá llamar a `updateTask`; si resuelve, el Dialog deberá cerrarse y la lista mostrar los cambios.
- **R15.** Si `updateTask` rechaza, entonces el Dialog deberá seguir abierto con los valores escritos y mostrar `app-alert` `danger` «No se pudo guardar la tarea. Inténtalo de nuevo.» encima del form.
- **R16.** Cuando el Dialog de tarea se cierra (X, Escape o scrim), el facade deberá olvidar la tarea abierta y el error del Dialog; nada se guarda.

Dialog de cita:

- **R17.** Cuando el usuario pulsa «Nueva cita» (IconButton de `AgendaPanel` en Inicio, Button de `OverviewMain` en Resumen), la página deberá abrir `app-dialog` modal heading «Nueva cita», descripción «Agenda una reunión, evento o recordatorio.», con `app-event-form` `cancelable` y `defaultValues.date` = día seleccionado (Inicio) u hoy (Resumen).
- **R18.** Cuando EventForm emite `saved`, el facade deberá llamar a `createEvent`; si resuelve, el Dialog deberá cerrarse y la cita aparecer en agenda, MiniCalendar y StatCards según su fecha.
- **R19.** Si `createEvent` rechaza, entonces el Dialog deberá seguir abierto con `app-alert` `danger` «No se pudo guardar la cita. Inténtalo de nuevo.».
- **R20.** Cuando EventForm emite `cancelled` o el Dialog se cierra, deberá cerrarse sin guardar y olvidar el error.

Frontera smart/dumb y estilo:

- **R21.** Los Dialog deberán vivir en `HomePage`/`OverviewPage`; `TasksPanel`, `AgendaPanel` y `OverviewMain` solo emitirán outputs (`taskOpened: string`, `newEvent: void`) y recibirán `selectedTaskId` por input; no inyectarán facade, store ni repositorio.
- **R22.** Los Dialog no deberán añadir pistas ni huecos al grid de `.l-shell__grid` (host `display: contents` en página).
- **R23.** Sin `styleUrl`; copy en español, sentence case, 24 h, sin emojis.

## Data model

```ts
// features/agenda/domain/task.model.ts
import { Subtask } from '@shared/interfaces';
export interface Task {
  id: string; title: string; done: boolean;
  due?: string; list?: string; listColor?: Category;
  notes?: string; priority?: string; tags?: string[];
  subtasks?: Subtask[]; // antes: number
}

// features/agenda/domain/calendar-event.model.ts (+)
notes?: string; reminder?: string; repeat?: string;

// structure/agenda.dto.ts (+)
TaskDto: notes?, priority?, tags?: string[], subtasks?: { title: string; done: boolean }[]
CalendarEventDto: notes?, reminder?, repeat?

// domain/agenda-repository.ts (+)
abstract createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent>;
abstract updateTask(task: Task): Promise<void>;

// structure/local-storage-api.ts
key: `agenda:v2:${path}`
post<T extends { id: string }>(path: ApiPath, item: Omit<T, 'id'>): Promise<T>;

// features/agenda/agenda-forms.ts
export const TASK_LIST_COLORS: Record<string, Category>;
export const EVENT_CATEGORY_COLORS: Record<string, Category>;
export function taskToForm(task: Task): TaskFormValue;
export function formToTask(task: Task, value: TaskFormValue): Task;
export function formToEvent(value: EventFormValue): Omit<CalendarEvent, 'id'>;

// features/agenda/agenda-commands.ts
@Injectable() export class AgendaCommands {
  readonly saveError: Signal<boolean>;
  load(): Promise<void>; toggleTask(id: string, done: boolean): Promise<void>;
  dismissSaveError(): void;
  createEvent(value: EventFormValue): Promise<void>; // relanza
  updateTask(id: string, value: TaskFormValue): Promise<void>; // relanza
}

// estado de Dialog en cada facade (HomeFacade, OverviewFacade)
editingTask: Signal<Task | undefined>; eventDraft: Signal<Partial<EventFormValue> | undefined>;
dialogError: Signal<boolean>;
openTask(id), closeTask(), saveTask(value), openNewEvent(), closeNewEvent(), saveEvent(value)
```

## Implementation plan

1. Modelos, DTO, mapper (+ `fromEvent`/`fromTask`), semilla con subtareas en lista, clave `agenda:v2:`, `post`; specs de mapper y repositorio actualizadas; `TaskItem` recibe `subtasks?.length` en Inicio/Resumen. Tests verdes (R1–R5).
2. `TASK_LISTS` = Personal/Trabajo/Casa; ajustar `task-form.spec.ts` y «Lista 1» de `demo-page.ts`.
3. `agenda-forms.ts` + spec (R6–R8).
4. `AgendaStore.addEvent`/`replaceTask`; `AgendaCommands` + spec; `provideAgenda()`; facades delegan. Tests de SPEC 57/59 sin cambiar expectativas (R9–R11).
5. Estado de Dialog en `HomeFacade` y `OverviewFacade` + specs (abrir, guardar ok, guardar falla, cerrar) (R12–R20).
6. Dumb: outputs `taskOpened`/`newEvent`, input `selectedTaskId` en `TasksPanel`, `AgendaPanel`, `OverviewMain` + specs (R13, R21).
7. Páginas: Dialog de tarea y de cita en `home-page.html`/`overview-page.html` con Alert de error; specs de página (R12–R20, R22).
8. Playwright en `npm start` `/inicio` y `/resumen` a 1440 px: abrir tarea, editar título/subtareas, guardar, recargar y persiste; crear cita en día seleccionado y verla en agenda y MiniCalendar; error forzado (localStorage lleno/stub) mantiene Dialog con Alert; grid sin pistas extra; sin errores de hidratación.
9. `npm run build` sin warnings de budget; `npm test -- --watch=false` verde; marcar `TODO.md`.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa, con tests de R1–R21.
- [x] Tests de SPEC 57/59 pasan sin cambiar expectativas (R9).
- [x] localStorage usa `agenda:v2:/events` y `agenda:v2:/tasks`; claves antiguas no se leen (R2).
- [x] Playwright Inicio: clic en tarea abre «Detalle de tarea» con sus datos, la fila lleva `data-selected`; guardar cambia la lista y persiste tras recargar (R12–R14). Verificado enviando `submit` al form: el clic en el botón dentro de `app-dialog` queda cancelado (ver Risks).
- [x] Playwright Resumen: lo mismo desde «Tareas que vencen» (R12–R14).
- [x] Playwright: «Nueva cita» en Inicio con otro día seleccionado propone ese día; guardar crea la cita visible en agenda y MiniCalendar; en Resumen sube «Citas hoy» si es de hoy (R17, R18). Mismo aviso que arriba.
- [x] Playwright: forzar fallo de `setItem` deja Dialog abierto con Alert y valores intactos (R15, R19).
- [x] Cancelar/X/Escape cierran sin guardar (R16, R20).
- [x] Columnas de `.l-shell__grid` iguales con y sin Dialog (R22).
- [x] `task-form.spec.ts` y `/demo#task-form` muestran Personal/Trabajo/Casa.
- [x] `npm run build` sin errores ni warnings; sin `styleUrl`, sin emojis, copy en español (R23).
- [x] `TODO.md`: ítem SPEC 60 marcado.

## Decisions

- **Sí:** ampliar `Task`/`CalendarEvent` y DTO con todos los campos de los forms (respuesta del usuario). **No:** descartar campos al guardar.
- **Sí:** mapa fijo categoría→color en `features/agenda/` (el DS no lo define; propuesta aceptada por el usuario).
- **Sí:** guardado pesimista; error dentro del Dialog sin perder lo escrito (respuesta del usuario). **No:** optimista como `toggleTask`.
- **Sí:** `AgendaCommands` común en `features/agenda/` con load/toggle/create/update (respuesta del usuario); revoca la decisión de SPEC 59 de duplicar en facades. El estado del Dialog sigue en cada facade (es estado de pantalla).
- **Sí:** clave nueva `agenda:v2:` y re-siembra (respuesta del usuario). **No:** mapper tolerante a `subtasks` numérico.
- **Sí:** `TASK_LISTS` = listas de la semilla + mapa lista→color (respuesta del usuario).
- **Sí:** fecha por defecto = día seleccionado (Inicio) / hoy (Resumen); TaskItem `selected` mientras el Dialog está abierto (respuesta del usuario).
- **No:** borrar tarea, crear tarea, editar cita (fuera de alcance; specs propios).
- **Sí:** Dialog modal por defecto en escritorio; `sheet` queda para pantallas móviles.

## Risks

- `app-dialog` como hijo de una página `display: contents` puede convertirse en item del grid de `.l-shell__grid` (pista extra). Verificar con Playwright; si pasa, montar el Dialog dentro del área principal o dar `display: contents` al host.
- Claves `agenda:/…` antiguas quedan huérfanas en localStorage (no se borran).
- Mapas color fijos: una lista o categoría nueva sin entrada queda sin color (`blue` por defecto en TaskItem).
- `crypto.randomUUID` requiere contexto seguro (localhost/https); en HTTP plano fallaría.
- Abrir tarea vencida en Resumen y cambiar `due` a futuro la saca de «Tareas que vencen» al guardar (esperado, puede sorprender).
- Encontrado al implementar: el `(click)` del `<dialog>` en `app-dialog` devuelve `false` fuera del scrim y Angular hace `preventDefault()`, así que el botón `submit` de TaskForm/EventForm no envía el form. Queda como ítem propio en `TODO.md` (decisión del usuario: spec aparte).
