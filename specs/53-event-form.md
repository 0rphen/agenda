# SPEC 53 — Componente EventForm

> **Status:** Implemented
> **Depends on:** SPEC 05 (Signal Forms en campos), SPEC 12 (Button), SPEC 15, SPEC 20 (Switch), SPEC 47 (`@shared/utils`)
> **Date:** 2026-10-25
> **Objective:** Crear `app-event-form`, formulario de cita del DS Agenda (título, categoría, fecha, todo el día, horas, lugar, invitados, recordatorio, repetición, notas) con validación al guardar y corrección en vivo.

## Scope

**In:**

- `src/app/shared/components/event-form/event-form.ts` + `event-form.html` — componente `EventForm` (selector `app-event-form`), markup de `function EventForm` del `bundle.js` del DS con los campos locales (`app-text-field`, `app-select`, `app-date-field`, `app-switch`, `app-time-field`, `app-textarea`, `app-button`) enlazados con Signal Forms (`form()` + `[formField]`).
- `src/app/shared/interfaces/event-form.ts` (`EventFormValue`) re-exportado en `interfaces/index.ts`.
- `src/app/shared/utils/event-form.ts` (opciones de categoría, recordatorio y repetición; valores por defecto) re-exportado en `utils/index.ts`.
- Tests Vitest `event-form.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts`: sección EventForm e índice.
- Marcar «EventForm» en `TODO.md`.

**Out of scope:**

- CSS nuevo: el DS no tiene bloque `.form`; se usan `.l-stack`, `.l-form-grid` y `.l-cluster` ya presentes.
- Mapear la categoría a color (`Category`) o guardar el evento: lo hace la pantalla.
- Invitados como lista o chips: es un texto libre, como el DS.
- Panel `size-panel` de WeekPage o montarlo en `Dialog` (pantallas).

## Requisitos (EARS)

- **R1.** El `EventForm` deberá renderizar un `form.form.l-stack` con `novalidate` que contenga, en este orden: `app-text-field` «Título» (placeholder «Ej. Reunión con contratistas»); `div.l-form-grid` con `app-select` «Categoría» y `app-date-field` «Fecha»; `app-switch` «Todo el día»; `div.l-form-grid` con `app-time-field` «Inicio» y «Fin»; `app-text-field` «Lugar o enlace» (icono `videocam`, placeholder «Sala o enlace de la videollamada»); `app-text-field` «Invitados» (icono `group`, placeholder «Nombres o correos, separados por coma», hint «Recibirán una invitación por correo»); `div.l-form-grid` con `app-select` «Recordatorio» y «Repetición»; `app-textarea` «Notas» (placeholder «Agrega notas, enlaces o la agenda de la reunión»); `div.l-cluster[data-justify="end"]` con los botones.
- **R2.** El `EventForm` deberá ofrecer en «Categoría» `Marketing`, `Estrategia`, `Descubrimiento`, `Desarrollo`, `Personal`, `Finanzas`, `Clientes`; en «Recordatorio» `Sin recordatorio`, `5 min antes`, `15 min antes`, `1 hora antes`, `1 día antes`; y en «Repetición» `No se repite`, `Todos los días`, `Cada semana`, `Cada mes` (valor = texto, como el DS).
- **R3.** El `EventForm` deberá iniciar sus valores con los por defecto del DS (`category` «Marketing», `start` «09:00», `end` «10:00», `reminder` «15 min antes», `repeat` «No se repite», el resto vacío o `false`) sobrescritos por `defaultValues`.
- **R4.** Cuando cambia `defaultValues`, el `EventForm` deberá reiniciar sus valores (R3) y volver a ocultar los errores salvo con `showErrors`.
- **R5.** Mientras `allDay` sea `true`, el `EventForm` no deberá renderizar el `div.l-form-grid` de «Inicio» y «Fin».
- **R6.** Si el título está vacío o solo tiene espacios, entonces el `EventForm` deberá tener el error «Escribe un título para la cita» en «Título».
- **R7.** Si la fecha está vacía, entonces el `EventForm` deberá tener el error «Elige una fecha» en «Fecha».
- **R8.** Mientras `allDay` sea `false`, si `start` y `end` tienen valor y `end` no es posterior a `start`, entonces el `EventForm` deberá tener el error «La hora de fin debe ser posterior al inicio» en «Fin».
- **R9.** El `EventForm` deberá pasar el error de cada campo a su input `error` solo después del primer intento de guardar o con `showErrors`; a partir de ahí, deberá actualizarlo en vivo al editar.
- **R10.** Cuando el usuario envía el formulario, el `EventForm` deberá impedir el envío nativo, mostrar los errores (R9) y, si no hay errores, emitir `saved` con el `EventFormValue` actual.
- **R11.** El `EventForm` deberá renderizar `app-button` `type="submit"` con icono `check` y texto `saveLabel` (por defecto «Guardar cita»).
- **R12.** Donde `cancelable` sea `true`, el `EventForm` deberá renderizar antes del botón de guardar `app-button` `variant="ghost"` «Cancelar» que, al pulsarlo, emita `cancelled`; si no, no deberá renderizarlo.
- **R13.** El `EventForm` no deberá usar `styleUrl` ni estilos de componente.

## Data model

```ts
// src/app/shared/interfaces/event-form.ts
export interface EventFormValue {
  title: string;
  category: string;
  date: string; // ISO 'YYYY-MM-DD' o ''
  start: string; // 'HH:MM'
  end: string; // 'HH:MM'
  allDay: boolean;
  location: string;
  people: string;
  notes: string;
  reminder: string;
  repeat: string;
}

// src/app/shared/utils/event-form.ts
export const EVENT_CATEGORIES: SelectOption[]; // value = label
export const EVENT_REMINDERS: SelectOption[];
export const EVENT_REPEATS: SelectOption[];
export const EVENT_FORM_DEFAULTS: EventFormValue;

// src/app/shared/components/event-form/event-form.ts
export class EventForm {
  // inputs:  defaultValues: Partial<EventFormValue> = {} · saveLabel = 'Guardar cita'
  //          showErrors = false · cancelable = false
  // outputs: saved: EventFormValue · cancelled: void
}
```

Valores en `linkedSignal` desde `defaultValues`; `form()` con `validate` para R6–R8; `submitted` en `linkedSignal` desde `showErrors`.

## Implementation plan

1. Crear `interfaces/event-form.ts` y `utils/event-form.ts` y re-exportarlos.
2. Crear `EventForm`: `linkedSignal` de valores (R3–R4), `form()` con validadores (R6–R8), `submitted` (R9), `save($event)` (R10), template de R1, R5, R11–R12 con `[formField]`.
3. `event-form.spec.ts`: al menos un test por R1–R12.
4. Demo: sección `event-form` tras MonthView, `{ id: 'event-form', name: 'EventForm' }` en `SECTIONS` e `IDS`. Ejemplos del preview DS dentro de `app-card` (27.5rem): «Nueva cita» vacío y `cancelable`; «Editar cita» con `showErrors`, `saveLabel` «Guardar cambios» y los `defaultValues` del preview (fin 14:00 antes de inicio 15:00). Texto «Guardado: título» o «Cancelado» al emitir.
5. Comprobación en `/demo` con Playwright: errores al guardar vacío, se corrigen al escribir, «Todo el día» oculta las horas, consola sin errores.
6. Marcar «EventForm» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por R1–R12.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] Sin CSS nuevo; `src/app/shared/components/event-form/` no declara `styles` ni `styleUrl` (R13).
- [x] Campos, orden, textos y opciones del DS (R1–R2).
- [x] Valores por defecto y reinicio con `defaultValues` (R3–R4).
- [x] «Todo el día» oculta las horas (R5).
- [x] Errores de título, fecha y fin solo tras guardar o con `showErrors`, y en vivo después (R6–R9).
- [x] `saved` solo sin errores; `cancelled` con `cancelable` (R10–R12).
- [x] `/demo` muestra la sección EventForm del paso 4 y aparece en el índice.
- [x] Ítem «EventForm» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** categoría guardada como nombre (`Marketing`…), literal del DS (respuesta del usuario). Mapear a `Category` lo hace la pantalla.
- **Sí:** input `cancelable` + output `cancelled` (respuesta del usuario); el DS muestra «Cancelar» solo si hay `onCancel`, y Angular no sabe si un output tiene oyente.
- **Sí:** output `saved` (no `save`, verbo) como `cancelled`; el DS usa `onSave`.
- **Sí:** Signal Forms (`form()` + `validate` + `[formField]`): los campos ya implementan `FormValueControl`.
- **No:** `fieldError()` de `shared/validation`: muestra al `touched` (blur); el DS muestra solo tras guardar.
- **Sí:** reinicio por `linkedSignal` al cambiar `defaultValues`; sustituye al `key` de React con que WeekPage del DS limpia el formulario tras guardar.
- **Sí:** `saved` emite todos los valores aunque `allDay` oculte las horas, como el DS.
- **No:** bloque `.form` en CSS: el DS no lo define; la clase queda solo como gancho, como en el DS.

## Risks

- Host `app-event-form` es inline por defecto; dentro de `.l-stack`/flex se blockifica. Fuera de flex el `form` interno sigue siendo bloque (caja anónima), sin efecto visible.

## What is **not** in this spec

- Mapeo de categoría a color, guardado real, invitados como chips, montaje en Dialog o panel de WeekPage.
