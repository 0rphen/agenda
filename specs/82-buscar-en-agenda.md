# SPEC 82 — Buscar en la agenda de Inicio

> **Status:** Implemented
> **Depends on:** SPEC 57 (Inicio), SPEC 79 (Editar cita al pulsar)
> **Date:** 2026-10-28
> **Objective:** Que la lupa «Buscar» de `app-agenda-panel` se convierta en un campo de texto que filtra en tiempo real las citas del rango mostrado.

## Scope

**In:**

- `app-agenda-panel`: estado local `searching` (signal booleano) y `query` (signal string).
- Pulsar la lupa: se sustituye por `app-text-field` (`type="search"`, `icon="search"`, `label="Buscar citas"` con `hideLabel`, `placeholder="Buscar citas"`, `grow`) + `app-icon-button` `icon="close"` `label="Cerrar búsqueda"`; el campo recibe el foco.
- Cabecera: «Tu agenda» y «Nueva cita» siguen visibles; el campo crece entre ambos; el cluster envuelve si no cabe.
- Filtro en tiempo real sobre `groups()` (rango actual): subcadena sin mayúsculas ni tildes en `title`, `location` y `people`; grupos sin citas coincidentes desaparecen.
- Sin coincidencias con texto no vacío: `app-empty-state` `size="s"`, `icon="search_off"`, `heading="Sin resultados"`, `description="No hay citas que coincidan con «<texto>»."`.
- Cerrar (X o Esc en el campo): vacía texto, vuelve la lupa y el foco pasa a la lupa.
- Cambiar `range` o `selectedDay`: vacía texto y cierra (sin mover el foco). Crear/editar/borrar citas no cierra.
- Nuevos inputs `range` y `selectedDay` en `app-agenda-panel`, pasados desde `home-page.html`.
- Util `normalizeSearch(text)` en `src/app/shared/utils/text.ts` (`normalize('NFD')`, quitar diacríticos, `toLocaleLowerCase('es')`).
- Tests en `agenda-panel.spec.ts` y `text.spec.ts` (o el spec de utils existente).
- `PENDING.md` sección SPEC 82; `TODO.md` ítem SPEC 82.

**Out of scope:**

- Buscar fuera del rango (todas las citas) o en tareas.
- Resaltar el texto coincidente.
- Persistir la búsqueda (recarga, navegación, URL).
- Debounce.
- Búsqueda en Calendario, Tareas o Resumen.
- Cambios en `app-text-field` o en `HomeFacade`.

## Requisitos (EARS)

- **R1.** Mientras no se busca, el `app-agenda-panel` deberá mostrar la lupa «Buscar» como hoy.
- **R2.** Cuando el usuario pulsa la lupa, el `app-agenda-panel` deberá sustituirla por el campo «Buscar citas» y el botón «Cerrar búsqueda», y enfocar el campo.
- **R3.** Mientras se busca, el `app-agenda-panel` deberá seguir mostrando «Tu agenda» y «Nueva cita».
- **R4.** Mientras el texto (sin espacios a los lados) no esté vacío, el `app-agenda-panel` deberá mostrar solo las citas cuyo `title`, `location` o alguna de `people` contenga el texto, sin distinguir mayúsculas ni tildes.
- **R5.** Mientras se filtra, el `app-agenda-panel` deberá ocultar los grupos de día sin citas coincidentes.
- **R6.** Mientras el texto esté vacío, el `app-agenda-panel` deberá mostrar todos los grupos de `groups()`.
- **R7.** Si el texto no está vacío y ninguna cita coincide, entonces el `app-agenda-panel` deberá mostrar «Sin resultados» con «No hay citas que coincidan con «<texto>».».
- **R8.** Si `groups()` está vacío y el texto está vacío, entonces el `app-agenda-panel` deberá mostrar «Sin citas» como hoy.
- **R9.** Cuando el usuario pulsa «Cerrar búsqueda» o pulsa Esc en el campo, el `app-agenda-panel` deberá vaciar el texto, volver a la lupa y enfocarla.
- **R10.** Cuando cambia `range` o `selectedDay`, el `app-agenda-panel` deberá vaciar el texto y volver a la lupa.
- **R11.** Cuando cambia `groups()` sin cambiar `range` ni `selectedDay`, el `app-agenda-panel` deberá mantener la búsqueda y aplicarla a los nuevos grupos.
- **R12.** Mientras `status` no sea `'ready'`, el `app-agenda-panel` deberá mostrar esqueleto o error como hoy, con o sin búsqueda abierta.
- **R13.** Pulsar una cita filtrada deberá emitir `eventEdited` con su id (SPEC 79 sin cambios).

## Data model

- `src/app/shared/utils/text.ts`: `export const normalizeSearch = (text: string) => string;`
- `AgendaPanel`:
  - `readonly range = input.required<AgendaRange>();`
  - `readonly selectedDay = input.required<string>();`
  - `protected readonly searching = signal(false);`
  - `protected readonly query = signal('');`
  - `protected readonly visibleGroups = computed<AgendaGroup[]>(…)` (filtra `groups()` por `query()`).
- Limpieza de R10: `linkedSignal` o `effect` sobre `range()`/`selectedDay()`; decide `/spec-impl` (lo más corto que no dispare en la primera carga).

## Implementation plan

1. `normalizeSearch` en `utils/text.ts` + test (R4).
2. `agenda-panel.ts`: inputs `range`/`selectedDay`, signals `searching`/`query`, `visibleGroups`; `home-page.html` pasa `[range]`/`[selectedDay]` (R4–R6, R10, R11).
3. `agenda-panel.html`: cabecera con `@if (searching())` campo + X / lupa; `@for` sobre `visibleGroups()`; `@empty` distingue «Sin resultados» y «Sin citas»; Esc en el campo; foco al abrir y al cerrar (R1–R3, R7–R9, R12, R13). Si hace falta CSS, leer antes `~/.claude/skills/css-guidelines/SKILL.md`.
4. `agenda-panel.spec.ts`: tests R2, R4, R5, R7–R11; tests existentes adaptados a los nuevos inputs requeridos (incluido `home-page.spec.ts` si aplica).
5. `PENDING.md`, `TODO.md`; Playwright en `/` (Inicio); `npx ng test --watch=false`; `npm run build`.

## Acceptance criteria

- [x] `npx ng test --watch=false` pasa, con ≥1 test para R2, R4, R5, R7, R8, R9, R10, R11 y para `normalizeSearch`.
- [x] `npm run build` sin errores ni warnings de budget.
- [x] Playwright `/`: pulsar lupa muestra campo enfocado + X; «Tu agenda» y «Nueva cita» visibles (R2, R3).
- [x] Playwright `/`: escribir «reunion» filtra «Reunión…» en cada pulsación; buscar por lugar y por persona funciona; grupos vacíos desaparecen (R4, R5).
- [x] Playwright `/`: texto sin coincidencias muestra «Sin resultados» con el texto (R7).
- [x] Playwright `/`: X y Esc cierran, vacían y enfocan la lupa (R9).
- [x] Playwright `/`: cambiar rango o día en el calendario cierra la búsqueda (R10).
- [x] Playwright `/`: pulsar una cita filtrada abre su edición (R13).
- [x] Consola sin errores. Copy en español, sin emojis.
- [x] `PENDING.md` con sección SPEC 82; `TODO.md` ítem SPEC 82 marcado.

## Decisions

- **Sí:** campos `title`, `location`, `people` (usuario): lo que se ve en la tarjeta.
- **No:** `categoryLabel` (usuario).
- **Sí:** filtrar el rango actual, lógica local en `AgendaPanel` (usuario): sin tocar `HomeFacade`.
- **No:** buscar en todo el store (necesita otro agrupado en el facade).
- **Sí:** sin mayúsculas ni tildes (usuario).
- **Sí:** cerrar con X + Esc, foco a la lupa (usuario). **No:** cerrar al perder foco.
- **Sí:** «Nueva cita» y «Tu agenda» visibles mientras se busca (usuario).
- **Sí:** «Sin resultados» propio, distinto de «Sin citas» (usuario).
- **Sí:** reutilizar `app-text-field` (usuario), sin cambiarlo.
- **Sí:** cambiar rango o día vacía y cierra (usuario); editar citas no (evita perder el filtro tras guardar).
- **No:** debounce: filtro en memoria sobre pocas citas.
- **No:** `app-agenda-panel` en `/demo`: es componente de `features/`, no de `shared/components/`.

## Risks

- `type="search"` nativo: Esc ya vacía el input en Chromium y muestra su propia X; la X nativa duplicaría «Cerrar búsqueda». Verificar en Playwright; si aparece, parar y decidir (no tocar `app-text-field` sin acuerdo).
- `app-text-field` no expone `focus()`: enfocar vía `viewChild(…, { read: ElementRef })` + `afterNextRender`, sin cambiar el componente.
- El `[value]` de `TextField` no se vacía al poner `value` a `''` (PENDING SPEC 81): aquí no afecta porque cerrar destruye el campo con `@if`.
- R10 no debe disparar en la carga inicial ni al hidratar.

## What is not in this spec

Búsqueda global o en tareas, resaltado, persistencia, debounce, búsqueda en otras pantallas, cambios en `app-text-field` o `HomeFacade`.
