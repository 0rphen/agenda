# SPEC 35 — Componente StatCard + composición `.l-grid`

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 02, SPEC 14, SPEC 15, SPEC 22
> **Date:** 2026-10-24
> **Objective:** Crear `app-stat-card` como tarjeta tonta de métrica del Resumen (icono sobre círculo con tono, etiqueta, valor grande y pista) que refleja el StatCard del DS Agenda, estática o interactiva (`button`), y traer la composición `.l-grid` del DS para agruparlas.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/stat-card.css`: copia literal del DS (`project/assets/Code/styles/blocks/stat-card.css`). Importado en `src/styles.css` tras `event-card.css`.
- Composición `src/styles/composition/grid.css`: copia literal del DS (`project/assets/Code/styles/composition/grid.css`, incluye `.l-form-grid`). Importada en `src/styles.css` tras `cluster.css`.
- `src/app/shared/stat-card/stat-card.ts` — componente `StatCard` (selectores `app-stat-card` y `button[app-stat-card]`, template externo `stat-card.html`), patrón de `Card` (SPEC 22). Reutiliza `app-icon`.
- Test Vitest `stat-card.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts`: sección StatCard e índice.
- Marcar «StatCard» en `TODO.md`.

**Out of scope:**

- Navegación a la vista del dato: la decide la pantalla de Resumen con `(clicked)`.
- Formatear `value` (horas, decimales con coma): el consumidor pasa el texto (`6,3 h`).
- `disabled`: no existe en la API del DS.
- Usar `.l-grid` en otras pantallas: llegará con ellas.

## Requisitos (EARS)

- **R1.** El `app-stat-card` deberá tener la clase `stat-card` en el host y renderizar, en orden, `<span class="stat-card__icon">` con `app-icon [name]=icon` decorativo, `<span class="stat-card__label">` = `label` y `<span class="stat-card__value">` = `value`; `icon`, `label` y `value` (`string | number`) son obligatorios.
- **R2.** Donde `hint` tenga valor, el `StatCard` deberá renderizar `<span class="stat-card__hint">` con el texto tras el valor; si no, no.
- **R3.** El `StatCard` deberá poner `data-tone` = `tone` cuando `tone` no sea `brand` (por defecto); con `brand`, sin atributo.
- **R4.** Donde el host sea `button[app-stat-card]`, el `StatCard` deberá tener `type="button"` y `data-interactive`; en `app-stat-card`, ninguno de los dos.
- **R5.** Cuando el usuario hace clic en un `button[app-stat-card]`, el `StatCard` deberá emitir `clicked` con el `MouseEvent`; en `app-stat-card` no deberá emitir.
- **R6.** Donde `state` tenga valor (`hover` | `active` | `focus`), el `StatCard` deberá ponerlo en `data-force`; si no, sin atributo.
- **R7.** El `StatCard` no deberá usar `styleUrl` ni estilos de componente; el aspecto viene de `stat-card.css`, y la agrupación de `.l-grid` (`grid.css`).

## Data model

```ts
// src/app/shared/stat-card/stat-card.ts
export type StatCardTone = 'brand' | 'accent' | 'success' | 'info' | 'danger';

export class StatCard {
  // inputs: icon: string (required) · label: string (required) · value: string | number (required)
  //         hint?: string · tone: StatCardTone = 'brand' · state?: 'hover' | 'active' | 'focus'
  // output: clicked: MouseEvent (solo en button[app-stat-card])
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `stat-card.css` y `grid.css` del DS sin cambios; `@import` en `src/styles.css` (R7).
2. `stat-card.spec.ts` con host de test (`app-stat-card` y `button[app-stat-card]`, `(clicked)`): al menos un test por R1–R6.
3. Crear `StatCard` (`templateUrl: './stat-card.html'`), patrón de `Card`: `host` con `class: 'stat-card'`, `[attr.data-tone]`, `[attr.data-interactive]`, `[attr.type]`, `[attr.data-force]`, `(click)`; `interactive` por `tagName === 'BUTTON'`. Tests en verde.
4. Demo: sección `stat-card` en `demo-page.html` (tras EventCard), `{ id: 'stat-card', name: 'StatCard' }` en `SECTIONS` y `'stat-card'` en `IDS`. Copy del preview DS. «Tonos» en `.l-grid data-min="s"`: `event` Citas hoy 5 «Próxima a las 14:30» (brand), `task_alt` Pendientes 7 «2 vencen hoy» (accent), `schedule` Reservadas «6,3 h» «De 8 h disponibles» (info), `check_circle` Completadas 12 «De 15 planificadas» (success). «Interactiva» en `.l-grid data-min="s"`: `button[app-stat-card]` Normal, Hover, Active, Focus (`task_alt`, 7, «Ver tareas», accent, `state`) y Vencidas (`error_outline`, 2, «Requieren atención», danger), con contador de clics.
5. Playwright en `/demo`: tonos, rejilla `.l-grid`, hover/active/focus, consola limpia.
6. Marcar «StatCard» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R6.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/stat-card.css` y `src/styles/composition/grid.css` y sus originales del DS no muestra diferencias.
- [x] `src/app/shared/stat-card/` no declara `styles` ni `styleUrl` (R7).
- [x] Host `.stat-card` con icono decorativo, etiqueta y valor en orden (R1).
- [x] `hint` añade `.stat-card__hint` (R2).
- [x] `data-tone` solo para tonos distintos de `brand` (R3).
- [x] `button[app-stat-card]` con `type="button"` y `data-interactive`, emite `clicked`; `app-stat-card` estática sin ellos ni emisión (R4, R5).
- [x] `state` escribe `data-force` (R6).
- [x] `/demo` muestra la sección StatCard del paso 4 en `.l-grid` y aparece en el índice.
- [x] Ítem «StatCard» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** interactiva por selector `button[app-stat-card]` en vez de `onClick` del DS: Angular no sabe si hay suscriptores a un output. Mismo patrón que `Card` (SPEC 22).
- **Sí:** `state` (`data-force`) expuesto, como `Card`: el preview DS documenta hover/active/focus con él.
- **Sí:** `grid.css` copiado entero, con `.l-form-grid` y `data-density`, para que el `diff` con el DS sea limpio.
- **Sí:** el nombre accesible del botón es el texto de etiqueta, valor y pista, como el DS; el icono es decorativo.
- **No:** `disabled`, formato de `value`, navegación.

## What is **not** in this spec

- Pantalla de Resumen; navegación; `disabled`; formato de valores.
