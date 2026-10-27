# SPEC 70 — Ajustes de componentes desde PENDING.md

> **Status:** Implemented
> **Depends on:** SPEC 04 (TimeField), SPEC 43/50 (SaveBar), SPEC 45 (WeekView), SPEC 52 (MonthView), SPEC 54 (TaskForm), SPEC 68 (Configuración)
> **Date:** 2026-10-27
> **Objective:** Cerrar las dudas y sugerencias de PENDING.md que solo tocan componentes de `shared/components`: label oculto en TimeField, subtareas editables en TaskForm, «Guardando» en SaveBar, nombre accesible con eventos en MonthView y elipsis en «Todo el día» de WeekView.

## Scope

**In:**

- `TimeField`: inputs `ariaLabel` y `hideLabel` (mismo patrón que `TextField.hideLabel` y `SelectField.ariaLabel`).
- `SettingsCalendar` («Horario laboral»): «Inicio»/«Fin» con `hideLabel`, como el DS.
- `TaskForm`: Enter en «Agregar subtarea» añade la subtarea sin enviar el formulario; quitar y renombrar subtareas existentes.
- `SaveBar`: el botón de guardar en carga anuncia «Guardando».
- `MonthView`: nombre accesible del número de día con «, N eventos» (DS sync).
- `WeekView`: badges de «Todo el día» con elipsis y `title` con el texto completo.
- Sección demo de cada componente en `src/app/demo/demo-page.html`; tests; `PENDING.md`.

**Out of scope:**

- Reordenar subtareas (arrastrar).
- Cambiar el `loadingLabel` por defecto de `Button` («Cargando» sigue).
- Modo compacto de eventos estrechos en WeekView (duda SPEC 45, se queda como está).
- Cambios en el DS (peticiones aparte).

## Requisitos (EARS)

TimeField:

- **R1.** Donde `hideLabel` es `true`, el `app-time-field` deberá renderizar el `label.field__label` con `u-visually-hidden` (sigue asociado por `for`).
- **R2.** Donde `ariaLabel` tiene valor, el `app-time-field` deberá ponerlo como `aria-label` del `input` y no deberá cambiar el texto del `label`.
- **R3.** En «Horario laboral» de `/configuracion/calendario`, «Inicio» y «Fin» deberán tener `hideLabel`; el nombre accesible de cada `input` seguirá siendo «Inicio»/«Fin».

TaskForm:

- **R4.** Cuando el usuario pulsa Enter en «Agregar subtarea» con texto, el `app-task-form` deberá añadir la subtarea, vaciar el campo y no deberá emitir `saved`.
- **R5.** Si el campo «Agregar subtarea» está vacío o solo tiene espacios, entonces Enter no deberá añadir nada ni emitir `saved`.
- **R6.** Cada subtarea deberá tener un `app-icon-button` «Quitar subtarea: <título>» (icono `close`) que la elimina de `value().subtasks`.
- **R7.** Cuando el usuario activa «Editar subtarea: <título>» (icono `edit`), la fila deberá cambiar a un `app-text-field` con el título; Enter o perder el foco con texto deberá guardar el título, Escape deberá cancelar, y texto vacío deberá mantener el título anterior.
- **R8.** Mientras una subtarea está en edición, Enter en su campo no deberá enviar el formulario.

SaveBar:

- **R9.** Mientras `saving` es `true`, el botón de guardar del `app-save-bar` deberá mostrar el texto «Guardando» y su spinner deberá anunciar «Guardando» (`loadingLabel`), como el README del DS.

MonthView:

- **R10.** El `aria-label` de `.month-view__num` deberá ser «<fecha>[, hoy][, N eventos]»: «, 1 evento» en singular, «, N eventos» en plural y nada si el día no tiene eventos (cuenta todos, también los ocultos tras «+N más»).

WeekView:

- **R11.** Cada `app-badge` de `.week-view__allday-cell` deberá tener `title` con el título completo y envolver el texto en un `span`; si no cabe, el texto deberá mostrar elipsis en una sola línea (sin recorte seco).

Demo:

- **R12.** La demo deberá mostrar: TimeField con `hideLabel`; TaskForm con subtareas quitables y editables; SaveBar en `saving`; MonthView con días de 1 y varios eventos; WeekView con un título largo en «Todo el día».

## Data model

Sin estructuras nuevas. Inputs nuevos: `TimeField.ariaLabel?: string`, `TimeField.hideLabel: boolean` (`booleanAttribute`). `TaskForm` añade estado interno `editingIndex = signal<number | undefined>()`.

## Implementation plan

1. TimeField `ariaLabel`/`hideLabel` + spec + demo; aplicar en `settings-calendar.html` (R1–R3, R12).
2. TaskForm: `(keydown.enter)` en el campo de nueva subtarea con `preventDefault()` + `addSubtask()`; botones quitar/editar en cada fila (`l-cluster` con `app-task-item` + `app-icon-button`); edición inline; specs (R4–R8). Demo con subtareas (R12).
3. SaveBar: `loadingLabel="Guardando"` y texto `saving() ? 'Guardando' : saveLabel()` + spec (R9).
4. MonthView: `label` con conteo de eventos del día en el `computed` de días + spec (R10); demo.
5. WeekView: `[attr.title]` en el badge y texto en `<span>`; `.badge` es `inline-flex` y `text-overflow` no actúa sobre el texto anónimo, así que se añade `& .badge > span { overflow: hidden; text-overflow: ellipsis; }` en `week-view.css` (única divergencia del DS, anotada en PENDING para pedirla al DS) (R11); demo: título largo en `WEEK_ALL_DAY`.
6. Playwright `/demo` y `/configuracion/calendario`; `npm test -- --watch=false`; `npm run build`.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa, con ≥1 test por requisito R1–R11.
- [x] `npm run build` sin errores ni warnings de budget.
- [x] `src/app/demo/demo-page.html` actualizado para TimeField, TaskForm, SaveBar, MonthView y WeekView (R12).
- [x] Playwright `/configuracion/calendario`: «Inicio»/«Fin» sin label visible, nombre accesible correcto (R3).
- [x] Playwright `/demo#task-form`: Enter añade subtarea sin emitir `saved`; quitar y editar funcionan con teclado (R4–R8).
- [x] Playwright `/demo#week-view`: título largo con elipsis y tooltip (R11).
- [x] CSS solo tokens y logical properties; `week-view.css` igual al DS salvo la regla del `span` (R11); sin `styles`/`styleUrl` en componentes; copy en español; sin emojis.
- [x] Ítem SPEC 70 marcado en `TODO.md`.

## Decisions

- **Sí:** un spec para los cinco ajustes de componentes (usuario: agrupar por bloque).
- **Sí:** «Guardando» solo en SaveBar, no como default de Button.
- **Sí:** quitar/editar con IconButton junto al TaskItem (no dentro: TaskItem ya es interactivo).
- **No:** Menu por subtarea: dos acciones caben como botones.
- **Sí:** «Guardando» también como texto visible del botón (README SaveBar del DS: «Mientras guarda, el botón dice «Guardando» (también su spinner accesible)»).
- **Sí:** bloque local `task-form.css` (`.task-form__subtask`, grid `minmax(0, 1fr) auto auto`) para que el TaskItem ocupe la fila junto a los IconButton.
- **Sí:** regla de elipsis sobre el `span` hijo en `week-view.css` aunque diverge del CSS del DS: la regla del DS sobre `.badge` (`inline-flex`) no produce elipsis.

## Risks

- `app-task-item` dentro de `l-cluster` puede cambiar el alto de fila; comprobar en Playwright.
- `keydown.enter` en Signal Forms: el submit nativo del `<form>` también lo dispara; `preventDefault()` en el handler del campo.

## What is not in this spec

Reordenar subtareas, modo compacto en WeekView, default de `Button.loadingLabel`.
