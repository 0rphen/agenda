# SPEC 54 — Componente TaskForm

> **Status:** Implemented
> **Depends on:** SPEC 05 (Signal Forms en campos), SPEC 12 (Button), SPEC 17 (IconButton), SPEC 21 (SegmentedControl), SPEC 33 (TaskItem), SPEC 53 (patrón de EventForm)
> **Date:** 2026-10-25
> **Objective:** Crear `app-task-form`, formulario de detalle de tarea del DS Agenda (título, descripción, lista, fecha límite, prioridad, etiquetas y subtareas) con validación al guardar, y ampliar `app-text-field` con `hideLabel` y `grow`.

## Scope

**In:**

- `src/app/shared/components/task-form/task-form.ts` + `task-form.html` — componente `TaskForm` (selector `app-task-form`), markup de `function TaskForm` del `bundle.js` del DS con los campos locales (`app-text-field`, `app-textarea`, `app-select`, `app-date-field`, `app-segmented-control`, `app-task-item`, `app-icon-button`, `app-button`) enlazados con Signal Forms.
- `src/styles/blocks/tag-button.css` copiado del DS e importado en `src/styles.css`.
- `TextField`: inputs `hideLabel` y `grow`.
- `src/app/shared/interfaces/task-form.ts` (`TaskFormValue`, `Subtask`) y `src/app/shared/utils/task-form.ts` (listas, prioridades, etiquetas, valores por defecto), re-exportados.
- Tests Vitest `task-form.spec.ts` y casos nuevos en `text-field.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts`: sección TaskForm e índice; ejemplo de `hideLabel`/`grow` en la sección de TextField.
- Marcar «TaskForm» en `TODO.md`.

**Out of scope:**

- Guardar o borrar la tarea de verdad, mapear la lista a color: lo hace la pantalla.
- Quitar o editar subtareas existentes, etiquetas propias: el DS no lo tiene.
- Montarlo en `Dialog` o en un panel de pantalla.

## Requisitos (EARS)

- **R1.** El `TaskForm` deberá renderizar un `form.form.l-stack` con `novalidate` que contenga, en este orden: `app-text-field` «Tarea» (placeholder «Ej. Renovar licencia de conducción»); `app-textarea` «Descripción» (placeholder «Detalles de la tarea»); `div.l-form-grid` con `app-select` «Lista» y `app-date-field` «Fecha límite»; `div.field` «Prioridad»; `div.field` «Etiquetas»; `div.field` «Subtareas»; `div.l-cluster[data-justify="between"]` con las acciones.
- **R2.** El `TaskForm` deberá ofrecer en «Lista» `Personal`, `Trabajo`, `Lista 1` (valor = texto) y en «Prioridad» un `app-segmented-control` con label «Prioridad» y opciones `baja`/«Baja», `media`/«Media», `alta`/«Alta», bajo un `span.field__label` «Prioridad».
- **R3.** El `TaskForm` deberá iniciar sus valores con los por defecto del DS (`list` «Personal», `priority` «media», `tags` y `subtasks` vacíos, el resto vacío) sobrescritos por `defaultValues`; cuando cambia `defaultValues`, deberá reiniciarlos, vaciar la subtarea en escritura y volver a ocultar los errores salvo con `showErrors`.
- **R4.** El `TaskForm` deberá renderizar en «Etiquetas» un `div.l-cluster` con un `button.tag-button` `type="button"` por cada etiqueta `Urgente`, `Cliente`, `Revisión`, `Personal`, con `aria-pressed` según esté en `tags` e icono `check` (`size="s"`) solo si lo está.
- **R5.** Cuando el usuario pulsa una etiqueta, el `TaskForm` deberá añadirla a `tags` si no estaba o quitarla si estaba.
- **R6.** El `TaskForm` deberá renderizar en «Subtareas» un `app-task-item` por subtarea con `heading` = su título y `done` = su estado; cuando el usuario marca o desmarca una, deberá actualizar su `done` en `subtasks`.
- **R7.** El `TaskForm` deberá renderizar tras las subtareas un `div.l-cluster[data-nowrap]` con `app-text-field` (label oculto «Agregar subtarea», placeholder «Agregar subtarea», icono `add`, `grow`) y `app-icon-button` `variant="tonal"` icono `add` label «Añadir subtarea».
- **R8.** Cuando el usuario pulsa «Añadir subtarea» con texto no vacío, el `TaskForm` deberá añadir `{ title: <texto sin espacios extremos>, done: false }` al final de `subtasks` y vaciar el campo; si el texto está vacío o solo tiene espacios, entonces no deberá cambiar `subtasks`.
- **R9.** Si el título está vacío o solo tiene espacios, entonces el `TaskForm` deberá tener el error «La tarea necesita un título» en «Tarea», pasado a su input `error` solo después del primer intento de guardar o con `showErrors`, y actualizado en vivo desde entonces.
- **R10.** Cuando el usuario envía el formulario, el `TaskForm` deberá impedir el envío nativo, mostrar los errores (R9) y, si no hay errores, emitir `saved` con el `TaskFormValue` actual.
- **R11.** El `TaskForm` deberá renderizar `app-button` `type="submit"` `variant="accent"` «Guardar cambios» al final del cluster de acciones.
- **R12.** Donde `deletable` sea `true`, el `TaskForm` deberá renderizar al inicio del cluster `app-button` `variant="ghost-danger"` icono `delete_outline` «Eliminar tarea» que, al pulsarlo, emita `deleted`; si no, deberá renderizar un `span` vacío en su lugar.
- **R13.** Donde `hideLabel` sea `true`, el `TextField` deberá renderizar su `label` con la clase `u-visually-hidden` (sigue asociado al control).
- **R14.** Donde `grow` sea `true`, el `TextField` deberá poner `data-grow` en su host.
- **R15.** El bloque `src/styles/blocks/tag-button.css` deberá ser el del DS salvo la zona táctil del `::after` dentro de `@media (pointer: coarse)` y la indentación de `outline-offset` (criterio de SPEC 51).
- **R16.** El `TaskForm` no deberá usar `styleUrl` ni estilos de componente.

## Data model

```ts
// src/app/shared/interfaces/task-form.ts
export interface Subtask {
  title: string;
  done: boolean;
}
export interface TaskFormValue {
  title: string;
  notes: string;
  list: string;
  due: string; // ISO 'YYYY-MM-DD' o ''
  priority: string; // 'baja' | 'media' | 'alta'
  tags: string[];
  subtasks: Subtask[];
}

// src/app/shared/utils/task-form.ts
export const TASK_LISTS: SelectOption[]; // value = label
export const TASK_PRIORITIES: SegmentedOption[];
export const TASK_TAGS: string[];
export const TASK_FORM_DEFAULTS: TaskFormValue;

// src/app/shared/components/task-form/task-form.ts
export class TaskForm {
  // inputs:  defaultValues: Partial<TaskFormValue> = {} · showErrors = false · deletable = false
  // outputs: saved: TaskFormValue · deleted: void
}

// TextField: + hideLabel = false · grow = false
```

Valores en `linkedSignal` desde `defaultValues`; `form()` con `validate` para R9; `submitted` y `newSubtask` en `linkedSignal` desde `defaultValues`/`showErrors`. `tags` y `subtasks` se cambian con `value.update`.

## Implementation plan

1. `TextField`: `hideLabel` (clase `u-visually-hidden` en el label) y `grow` (`data-grow` en el host) + tests (R13–R14).
2. Copiar `tag-button.css` del DS a `src/styles/blocks/`, `::after` con `inset-block` dentro de `@media (pointer: coarse)`, reindentar; importarlo en `src/styles.css` tras `task-item.css` (R15).
3. Crear `interfaces/task-form.ts` y `utils/task-form.ts` y re-exportarlos.
4. Crear `TaskForm` (R1–R12, R16).
5. `task-form.spec.ts`: al menos un test por R1–R12.
6. Demo: sección `task-form` tras EventForm, `{ id: 'task-form', name: 'TaskForm' }` en `SECTIONS` e `IDS`. Ejemplos del preview DS dentro de `app-card.demo__form` «Tarea»: «Nueva tarea» con `showErrors`; «Editando con subtareas» con `deletable` y los `defaultValues` del preview. Texto «Guardada: título» o «Eliminada» al emitir. En TextField, un ejemplo con `hideLabel` y `grow` en un `l-cluster[data-nowrap]`.
7. Comprobación en `/demo` con Playwright: error al guardar vacío, etiquetas alternan, añadir subtarea, `saved` emite; consola sin errores.
8. Marcar «TaskForm» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por R1–R14.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff -w` de `tag-button.css` local vs DS solo muestra el `@media (pointer: coarse)` (R15).
- [x] `src/app/shared/components/task-form/` no declara `styles` ni `styleUrl` (R16).
- [x] Campos, orden, textos y opciones del DS (R1–R2, R4, R7, R11).
- [x] Valores por defecto y reinicio con `defaultValues` (R3).
- [x] Etiquetas y subtareas se actualizan (R5–R6, R8).
- [x] Error de título solo tras guardar o con `showErrors`, y en vivo después (R9).
- [x] `saved` solo sin errores; `deleted` con `deletable` (R10, R12).
- [x] `TextField` con `hideLabel` y `grow` (R13–R14).
- [x] `/demo` muestra la sección TaskForm del paso 6, aparece en el índice, y TextField muestra `hideLabel`/`grow`.
- [x] Ítem «TaskForm» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** `TextField` con `hideLabel` y `grow` (respuesta del usuario); el DS deja el campo sin label, inaccesible.
- **Sí:** input `deletable` + output `deleted` (respuesta del usuario), patrón de `cancelable` en EventForm.
- **Sí:** «Guardar cambios» fijo, como el DS (sin `saveLabel`).
- **Sí:** `saved` no incluye la subtarea en escritura (el DS emite también `newSub`).
- **Sí:** `priority` y `list` como `string`, como `category` en EventForm.
- **Sí:** Enter en «Agregar subtarea» envía el formulario, como el DS.
- **No:** `fieldError()`: muestra al `touched`; el DS muestra solo tras guardar.

## Risks

- `aria-pressed` con `[attr.aria-pressed]` debe pintar `"true"`/`"false"`, no omitirse, para que el CSS `[aria-pressed='true']` funcione.

## What is **not** in this spec

- Guardado real, borrar o editar subtareas, etiquetas propias, color de lista, montaje en Dialog o pantalla.
