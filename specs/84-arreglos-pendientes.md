# SPEC 84 — Arreglos pendientes: reloj, limpieza, semana, badge y horario laboral

> **Status:** Implemented
> **Depends on:** SPEC 54 (TaskForm), SPEC 72 (Reloj en vivo), SPEC 73 (Aplicar ajustes), SPEC 75 (Pantallas móviles), SPEC 78 (Inicio de semana, 12 h y fines de semana), SPEC 81 (Quitar subtarea)
> **Date:** 2026-11-04
> **Objective:** Cerrar los pendientes y sugerencias de `PENDING.md` que se pueden hacer ya: reloj alineado al minuto, «hoy» vivo en Tareas, limpieza menor, rangos de semana con «Inicio de semana», badge de pendientes en la navegación y efecto de «Horario laboral · Fin».

## Why

`PENDING.md` acumula arreglos pequeños sin dependencias abiertas (SPEC 72, 73, 75, 78, 81). Juntos son un spec mediano; por separado, ruido.

## Scope

**In:**

- **Reloj** (`src/app/features/agenda/clock.ts`): primer `setTimeout` hasta el segundo 0 del minuto siguiente; después `setInterval` de 60 s. Limpiar ambos en `onDestroy`.
- **Tareas vivo** (`src/app/features/tasks/tasks.facade.ts`): `today` pasa de `localIso(new Date())` a `computed(() => localIso(clock.now()))`; `groupOf`, `addTask` y quien lea `today` en plantillas lo llaman como signal.
- **Reduced motion** (`src/styles/utilities/reduced-motion.css`): `.app` → `:root` en los 4 selectores. Divergencia local del DS, anotada en PENDING para pedir el selector al DS. Spinner sin tocar.
- **`slotEnd`**: quitarlo de `CalendarDayFacade.openSlot` y `CalendarWeekFacade.openSlot` (el fin lo pone `AgendaDialogs.openNewEvent`). Si `slotEnd` en `shared/utils/time.ts` queda sin uso, borrarlo con su test.
- **Subtarea** (`app-task-form`): tras pulsar «Añadir subtarea» el campo «Agregar subtarea» deberá vaciarse, como con Enter. Primero reproducir (Playwright y test); arreglar la causa en `task-form` o `text-field`.
- **Rangos de semana**: `weekProgress(tasks, day, firstDay)` en `agenda-queries.ts`; `HomeFacade` (`agendaGroups` «Esta semana»/«Próxima» y `weekProgress`) y `OverviewFacade.weekProgress` pasan `UserSettingsStore.firstDay()`. `weekTasks` de Semana ya lo respeta: no se toca.
- **Badge de pendientes**:
  - `AgendaStore`, `AgendaCommands` con `providedIn: 'root'`; binding `AgendaRepository → AgendaLocalRepository` a `app.config.ts` (como `SettingsRepository`). `provideAgenda()` queda solo con `AgendaDialogs`.
  - `App`: `afterNextRender` carga la agenda (`commands.load()`); `pendingTasks = computed(tareas !done)`; `toItems` pone `badge` en el destino «Tareas» de BottomNav y riel. Sin datos (`status !== 'ready'`) no hay badge.
  - `App` llama `commands.dismissSaveError()` en cada `NavigationEnd`.
- **Horario laboral · Fin**:
  - `app-day-view` y `app-week-view`: inputs opcionales `workStart` y `workEnd` (`'HH:MM'`). Con ambos, capas `aria-hidden` `.day-view__off` / `.week-view__off` (patrón de `.day-view__past`: absolutas, `--start`/`--span` en horas) antes de `workStart` y después de `workEnd`, fondo `--color-surface-sunken`. Sin inputs: nada. «Pasado» queda encima.
  - `CalendarFacade` expone `workStart`/`workEnd` de ajustes; `calendar-day-page.html` y `calendar-week-page.html` los pasan. Divergencia local del DS (bloque CSS), anotada en PENDING.
  - Ajustes «Horario laboral»: `validate` en `workEnd` con el patrón de `EventForm` (`toMin(fin) <= toMin(inicio)`) y mensaje «La hora de fin debe ser posterior al inicio»; `app-time-field` «Fin» recibe `error`. Mientras sea inválido, `save()` no guarda (también «Guardar y salir» del guard).
- Demo: secciones DayView y WeekView con un ejemplo `workStart="08:00" workEnd="18:00"`.
- Tests de cada punto; `PENDING.md` (marcar hechos + sección SPEC 84); `TODO.md` ítem SPEC 84.

**Out of scope:**

- «Mostrar citas canceladas» (falta modelo `cancelled`).
- Excluir fines de semana de los rangos de Inicio/Resumen.
- Sombreado en MonthView o MiniCalendar.
- Cargar la agenda una sola vez (las pantallas siguen llamando `load()` al entrar).
- Inicio/Semana móviles, «Buscar» en AppBar de Hoy.

## Requisitos (EARS)

- **R1.** Cuando pasa el segundo 0 de cada minuto, el `Clock` deberá actualizar `now` (con margen de un tic del navegador).
- **R2.** Mientras la pantalla de Tareas está abierta, cuando cambia el día local, los grupos «Hoy», «Vencidas» y «Próximas» y «M vencen hoy» deberán recalcularse con el nuevo día.
- **R3.** Mientras el sistema tiene `prefers-reduced-motion: reduce`, la app deberá quitar animaciones y transiciones igual que con `data-reduce-motion`.
- **R4.** Cuando el usuario pulsa un hueco de DayView o WeekView, «Nueva cita» deberá abrir con fin = inicio + duración predeterminada, sin `slotEnd` en las facades.
- **R5.** Cuando el usuario pulsa «Añadir subtarea» con texto, el `app-task-form` deberá añadir la subtarea y vaciar «Agregar subtarea».
- **R6.** Mientras «Inicio de semana» es Domingo, «Esta semana» y «Próxima» de Inicio y «Avance de la semana» de Inicio y Resumen deberán usar semanas domingo–sábado.
- **R7.** Mientras la agenda está cargada y hay tareas sin hacer, «Tareas» de la BottomNav y del riel deberá mostrar su número (riel: en el nombre accesible «Tareas, N pendientes»).
- **R8.** Cuando el usuario marca o crea una tarea, el badge deberá actualizarse sin navegar.
- **R9.** Si no hay tareas pendientes o la agenda no está cargada, entonces «Tareas» no deberá mostrar badge.
- **R10.** Cuando termina una navegación, el aviso de error de guardado de la agenda deberá desaparecer.
- **R11.** Donde `app-day-view`/`app-week-view` reciben `workStart` y `workEnd`, deberán sombrear con `--color-surface-sunken` las horas antes de `workStart` y después de `workEnd`, sin bloquear clics en huecos.
- **R12.** Donde no reciben `workStart`/`workEnd`, `app-day-view`/`app-week-view` deberán verse como antes.
- **R13.** Las pantallas Día y Semana deberán pasar el «Horario laboral» guardado a DayView/WeekView.
- **R14.** Si «Fin» del horario laboral no es posterior a «Inicio», entonces Ajustes deberá mostrar «La hora de fin debe ser posterior al inicio» en «Fin» y no guardar.

## Data model

Sin datos nuevos persistidos. Cambios:

- `Clock`: sin API nueva.
- `TasksFacade.today`: `string` → `Signal<string>`.
- `weekProgress(tasks: Task[], day: string, firstDay: 0 | 1 = 1)`.
- `DayView`/`WeekView`: `readonly workStart = input<string>(); readonly workEnd = input<string>();`
- `CalendarFacade`: `workStart`, `workEnd` (`computed` de `settings().calendar`).
- Providers: `AgendaStore`, `AgendaCommands` root; `AgendaRepository` en `app.config.ts`; `provideAgenda()` → `[AgendaDialogs]`.

## Implementation plan

Cada paso deja `npx ng test --watch=false` y `npm run build` en verde. Antes de CSS, leer `~/.claude/skills/css-guidelines/SKILL.md`.

1. Reloj (R1) y Tareas vivo (R2), tests con `vi.useFakeTimers`.
2. Limpieza: `reduced-motion.css` (R3), quitar `slotEnd` (R4), subtarea (R5: reproducir, test, arreglo).
3. Rangos de semana (R6) + tests de `weekProgress` y `HomeFacade`.
4. Providers root + badge + `dismissSaveError` al navegar (R7–R10); adaptar specs que dependan de `provideAgenda()`.
5. Horario: inputs + capas + CSS en `day-view`/`week-view`, demo, paso desde facades (R11–R13); validación en Ajustes (R14).
6. `PENDING.md`, `TODO.md`. Playwright; tests; build.

## Acceptance criteria

- [x] Test `Clock`: con hora `10:00:30`, `now` cambia a los 30 s y luego cada 60 s (R1).
- [x] Test `TasksFacade`: avanzar el reloj a mañana mueve una tarea de «Hoy» a «Vencidas» (R2).
- [x] `grep -n "\.app" src/styles/utilities/reduced-motion.css` vacío; Playwright con `emulateMedia({ reducedMotion: 'reduce' })`: 0 elementos con transición (R3).
- [x] `grep -rn slotEnd src/app/features` vacío; hueco 10:00 abre «Nueva cita» 10:00–(10:00 + duración) (R4).
- [x] Test + Playwright `/demo#task-form`: escribir y pulsar «Añadir subtarea» deja el campo vacío (R5).
- [x] Test: con `firstDay` 0, «Esta semana» de un miércoles va de domingo a sábado; `weekProgress` igual (R6).
- [x] Playwright 390 px y 1440 px: «Tareas» con el número de pendientes en BottomNav y riel; marcar una tarea lo baja en 1 sin navegar; en `/configuracion` también se ve (R7–R9).
- [x] Test `App`: error de guardado + navegación lo limpia (R10).
- [x] Playwright `/calendario/dia` y `/calendario/semana`: horas fuera de 08:00–18:00 sombreadas; pulsar hueco 07:00 abre «Nueva cita»; `/demo#day-view` y `#week-view` con ejemplo de horario (R11–R13).
- [x] Test DayView/WeekView sin `workStart`/`workEnd`: sin `.day-view__off`/`.week-view__off` (R12).
- [x] Playwright `/configuracion/calendario`: Fin 07:00 con Inicio 08:00 muestra el error y «Guardar» no persiste (R14).
- [x] `npx ng test --watch=false` y `npm run build` en verde; consola sin errores ni warnings.
- [x] `PENDING.md`: pendientes marcados `[hecho]` + sección SPEC 84; `TODO.md` ítem SPEC 84.

## Decisions

- **Yes:** un solo spec con los cuatro bloques (elección del usuario).
- **Yes:** `setTimeout` + `setInterval` en el reloj, en vez de `setTimeout` encadenado: menos código.
- **Yes:** `.app` → `:root` en `reduced-motion.css`, en vez de borrarlo; se pide el selector al DS.
- **Yes:** Spinner igual que con `data-reduce-motion`; no se toca.
- **Yes:** `AgendaStore` + `AgendaCommands` root para que el badge siga en vivo; **No:** que App lea el repositorio en cada navegación (badge desfasado).
- **Yes:** limpiar `saveError` en cada `NavigationEnd`: mantiene el comportamiento de cuando `AgendaCommands` vivía por ruta.
- **Yes:** badge en BottomNav y riel.
- **Yes:** sombrear fuera de horario con `--color-surface-sunken`; «pasado» (`--color-surface-page`) queda encima. **No:** rayado (más CSS).
- **Yes:** validar Fin > Inicio en Ajustes con el mensaje de EventForm.
- **Yes:** `firstDay` en `weekProgress` y rangos de Inicio; **No:** quitar fines de semana de esos rangos.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Estado de agenda compartido entre pantallas (antes se reiniciaba por ruta): datos de otra pantalla visibles un instante | Cada pantalla sigue llamando `load()`; status `loading` pinta esqueleto como hoy. Playwright en cada pantalla. |
| Specs con `TestBed` que proveen `AgendaStore`/`AgendaCommands` vía `provideAgenda()` | Siguen resolviendo por root; ajustar los que esperan instancia aislada. |
| Doble carga al arrancar (App + pantalla) | Inofensivo (localStorage); fuera de alcance optimizar. |
| Bug de subtarea no reproducible en test jsdom | Reproducir primero en Playwright; si es de `text-field`, test en `text-field.spec.ts`. |
| Capas `__off` interceptan clics de huecos | `pointer-events: none`, como `__past`; criterio R11 en Playwright. |

## What is **not** in this spec

- Citas canceladas, fines de semana en rangos, MonthView/MiniCalendar con horario, carga única de agenda, pantallas móviles de Inicio/Semana.
