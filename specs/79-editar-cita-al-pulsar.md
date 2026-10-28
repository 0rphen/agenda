# SPEC 79 — Editar cita al pulsarla

> **Status:** Implemented
> **Depends on:** SPEC 53 (EventForm), SPEC 60 (Diálogos tarea/cita), SPEC 71 (Menu Editar/Eliminar), SPEC 59 (Resumen), SPEC 57 (Inicio), SPEC 62/63/64 (Calendario)
> **Date:** 2026-10-28
> **Objective:** Que pulsar una cita en Resumen, Inicio y Calendario (Día, Semana, Mes) abra el Dialog «Editar cita», con «Eliminar cita» abajo a la izquierda, sustituyendo al Menu «Editar/Eliminar».

## Scope

**In:**

- `EventForm`: input `deletable` + output `deleted`; botón `ghost-danger` «Eliminar cita» (`delete_outline`) a la izquierda del pie, como `TaskForm`.
- `AgendaDialogs` (componente): Dialog «Editar cita» pasa `deletable` y `(deleted)` → `dialogs.askDeleteEvent(id)` (confirmación existente).
- Resumen (`OverviewMain`): sin `app-menu` en «Próxima cita» ni «Agenda de hoy»; clic en EventCard (antes navegaba al día) y en AgendaItem → `eventEdited`.
- Inicio (`AgendaPanel`): sin `app-menu`; clic en EventCard y AgendaItem → `eventEdited`.
- Calendario:
  - Día (`DayView`) y Semana (`WeekView`): `selectEvent(id)` sigue marcando la cita y además abre «Editar cita».
  - Mes: clic en chip de `MonthView` (desktop) y en AgendaItem de la lista móvil abre «Editar cita» (antes navegaban al día). «+N más» sigue abriendo el día.
  - `MonthViewEvent` gana `id?: string` (como `WeekViewEvent`/`DayViewEvent`); `monthEvents` lo rellena.
- Limpieza: borrar `eventDeleted`, `eventActions`, `onEventAction` de OverviewMain/AgendaPanel; `askDeleteEvent` de `OverviewFacade`/`HomeFacade` si queda sin uso; `src/styles/blocks/event-actions.css` y su import (sin usuarios).
- Demo: sección EventForm con un ejemplo `deletable`.
- Tests, `TODO.md`.

**Out of scope:**

- Selección visual (`data-selected`) en MonthView.
- Pulsar EventCard de Mes móvil / «+N más»: siguen como hoy («+N más» abre el día).
- Cambiar la confirmación de borrado o borrar sin confirmar.
- Menú contextual / long-press.
- Cambios en bloques CSS del DS.

## Requisitos (EARS)

EventForm y diálogos:

- **R1.** Donde `deletable`, el `app-event-form` deberá mostrar «Eliminar cita» (`ghost-danger`, icono `delete_outline`) a la izquierda del pie, y «Cancelar»/guardar a la derecha.
- **R2.** Cuando el usuario pulsa «Eliminar cita», el `app-event-form` deberá emitir `deleted` sin emitir `saved`.
- **R3.** Sin `deletable`, el `app-event-form` no deberá mostrar «Eliminar cita» (Nueva cita sigue igual).
- **R4.** Cuando `deleted` se emite en «Editar cita», `app-agenda-dialogs` deberá abrir la confirmación «¿Eliminar “<título>”?»; al confirmar deberá borrar la cita y cerrar ambos Dialogs; al cancelar, «Editar cita» deberá seguir abierto.

Resumen e Inicio:

- **R5.** El `app-overview-main` no deberá tener `app-menu` en «Próxima cita» ni en «Agenda de hoy».
- **R6.** Cuando el usuario pulsa el EventCard de «Próxima cita» o un AgendaItem de «Agenda de hoy», el `app-overview-main` deberá emitir `eventEdited` con el id y Resumen deberá abrir «Editar cita» de esa cita.
- **R7.** El `app-agenda-panel` no deberá tener `app-menu`; cuando el usuario pulsa un EventCard o AgendaItem, deberá emitir `eventEdited` e Inicio deberá abrir «Editar cita».

Calendario:

- **R8.** Cuando el usuario pulsa una cita del `app-day-view` en `/calendario/dia` o un `week-view__event` en `/calendario/semana`, la cita deberá quedar marcada (`selected`) y deberá abrirse «Editar cita».
- **R9.** Cuando el usuario pulsa un chip del `app-month-view` o un AgendaItem de la lista móvil en `/calendario/mes`, deberá abrirse «Editar cita» de esa cita sin navegar.
- **R10.** `MonthViewEvent.id` deberá llegar en `eventSelected`; `CalendarMonthFacade.monthEvents` deberá rellenarlo.
- **R11.** Cuando el usuario pulsa «+N más» en `app-month-view`, `/calendario/mes` deberá seguir navegando al día.

Limpieza:

- **R12.** Si ninguna plantilla usa `.event-actions`, entonces `event-actions.css` y su import en `src/styles.css` deberán eliminarse.

## Data model

```ts
// shared/interfaces/month-view.ts
export interface MonthViewEvent { id?: string; /* resto igual */ }

// shared/components/event-form/event-form.ts
readonly deletable = input(false, { transform: booleanAttribute });
readonly deleted = output<void>();

// features/calendar/calendar.facade.ts (base)
editEvent(id: string): void; // dialogs.openEditEvent(id)
```

Sin datos persistidos nuevos.

## Implementation plan

1. `EventForm`: `deletable`/`deleted`, pie `l-cluster data-justify="between"` copiado de `task-form.html`; tests (R1–R3).
2. `agenda-dialogs.html`: `deletable` + `(deleted)="dialogs.askDeleteEvent(...)"` en «Editar cita»; test (R4).
3. `OverviewMain` + `overview-page.html`: quitar Menu y `eventDeleted`; `(clicked)` de EventCard/AgendaItem → `eventEdited`; `OverviewFacade.askDeleteEvent` fuera si sin uso; tests (R5, R6).
4. `AgendaPanel` + `home-page.html`: igual; `HomeFacade.askDeleteEvent` fuera si sin uso; tests (R7).
5. `CalendarFacade.editEvent(id)`; `CalendarDayFacade`/`CalendarWeekFacade.selectEvent` llaman además a `editEvent`; tests (R8).
6. `MonthViewEvent.id`; `monthEvents` mapea `id`; `MonthMain` nuevo output `eventEdited` desde chip y AgendaItem móvil; `calendar-month-page.html` → `facade.editEvent`; tests (R9–R11).
7. Borrar `src/styles/blocks/event-actions.css` + import (R12).
8. Demo `/demo`: EventForm `deletable` (estado «Eliminada» en `formAction`).
9. `TODO.md`; Playwright; `npx ng test --watch=false`; `npm run build`.

## Acceptance criteria

- [x] `npx ng test --watch=false` pasa, con ≥1 test por requisito R1–R12.
- [x] `npm run build` sin errores ni warnings de budget.
- [x] Playwright: en `/resumen`, `/inicio`, `/calendario/dia`, `/calendario/semana`, `/calendario/mes` (desktop y móvil) pulsar cita abre «Editar cita»; «Eliminar cita» → confirmar borra la cita y cierra Dialogs; cancelar deja «Editar cita» abierto; sin errores de hidratación.
- [x] `grep -rn "event-actions\|eventDeleted" src/app src/styles` sin resultados.
- [x] Demo `/demo`: sección EventForm con ejemplo `deletable`.
- [x] `TODO.md`: ítem SPEC 79 marcado. Copy en español, sin emojis.

## Decisions

- **Sí:** «Próxima cita» abre edición en vez del día (usuario); sin Menu no habría otra vía.
- **Sí:** también Inicio (AgendaPanel), Calendario Día y Mes móvil (usuario), por coherencia.
- **Sí:** Día/Semana mantienen `selected` además de abrir el Dialog (usuario).
- **Sí:** «Eliminar cita» igual que TaskForm (`deletable`/`deleted`, `ghost-danger`, izquierda) y pasa por la confirmación existente (usuario).
- **Sí:** `editEvent` en la base `CalendarFacade`, compartido por Día, Semana y Mes.
- **No:** borrar sin confirmar (irreversible).
- **No:** selección visual en MonthView (fuera del pedido).

## Risks

- Diálogo de confirmación encima de «Editar cita» (`showModal` apilado): comprobar foco y Escape en Playwright (ya ocurre con TaskForm).
- Quitar Menu deja sin acción secundaria accesible: editar/eliminar ahora solo vía Dialog; nombre accesible del botón de la cita no anuncia «editar».

## What is not in this spec

Selección en MonthView, long-press/menú contextual, borrar sin confirmar, cambios en bloques del DS.
