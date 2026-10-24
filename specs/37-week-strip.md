# SPEC 37 — Componente WeekStrip

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 15, SPEC 31
> **Date:** 2026-10-24
> **Objective:** Crear `app-week-strip` como tira semanal tonta de siete `DayPill` a ancho fluido que refleja el WeekStrip del DS Agenda: grupo accesible, un día seleccionado por ISO y selección de día con enlace bidireccional `[(selected)]`. Cada píldora lleva un nombre accesible con la fecha completa.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/week-strip.css`: copia literal del DS (`project/assets/Code/styles/blocks/week-strip.css`). Importado en `src/styles.css` tras `setting-row.css`.
- `src/app/shared/week-strip/week-strip.ts` — componente `WeekStrip` (selector `app-week-strip`, template externo `week-strip.html`) e interfaz `WeekDay`. Reutiliza `app-day-pill`.
- Tests Vitest `week-strip.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts`: sección WeekStrip e índice.
- Marcar «WeekStrip» en `TODO.md`.

**Out of scope:**

- Calcular la semana (lunes a domingo) a partir de una fecha, navegar entre semanas o deslizar: lo hace la pantalla que la consume.
- Navegación por teclado con flechas (el DS no la define; cada píldora es un botón tabulable).
- Días deshabilitados y estados forzados (`state`) en la tira: el DS no los pasa a `DayPill`.

## Requisitos (EARS)

- **R1.** El `app-week-strip` deberá tener en el host la clase `week-strip`, `role="group"` y `aria-label` = `label` (por defecto «Días de la semana»).
- **R2.** El `WeekStrip` deberá renderizar un `app-day-pill` con `fluid` por cada elemento de `days`, en orden, con `dow`, `num`, `today` y `hasEvents` del elemento.
- **R3.** Mientras `selected` sea igual al `iso` de un día, el `WeekStrip` deberá marcar solo esa píldora como seleccionada (`aria-pressed="true"`); las demás, `false`.
- **R4.** Cuando el usuario hace clic en una píldora, el `WeekStrip` deberá actualizar `selected` al `iso` de ese día y emitir `selectedChange` con él.
- **R5.** El `WeekStrip` deberá dar a cada píldora un `label` con la fecha completa en español a partir de `iso` («Jueves 22 de octubre»), seguido de «, hoy» si `today` y «, con eventos» si `hasEvents`.
- **R6.** El `WeekStrip` no deberá usar `styleUrl` ni estilos de componente; el aspecto viene de `week-strip.css` y `day-pill.css`.

## Data model

```ts
// src/app/shared/week-strip/week-strip.ts
export interface WeekDay {
  iso: string; // 'YYYY-MM-DD'
  dow: string; // 'L' | 'M' | 'X' | …
  num: number;
  today?: boolean;
  hasEvents?: boolean;
}

export class WeekStrip {
  // inputs: days: WeekDay[] (required) · label: string = 'Días de la semana'
  // model:  selected?: string (ISO) → [(selected)]
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `week-strip.css` del DS sin cambios; `@import` en `src/styles.css` tras `setting-row.css` (R6).
2. `week-strip.spec.ts` con host de test `[(selected)]`: al menos un test por R1–R5.
3. Crear `WeekStrip` (`templateUrl: './week-strip.html'`): `host` con `class`, `role`, `[attr.aria-label]`; `selected = model<string>()`; `@for` de `app-day-pill fluid` con `(clicked)="selected.set(day.iso)"`; `dayLabel(day)` con `Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })` sobre `iso` + `T00:00:00Z`, sin la coma tras el día de la semana y con mayúscula inicial.
4. Demo: sección `week-strip` tras SettingRow, `{ id: 'week-strip', name: 'WeekStrip' }` en `SECTIONS` e `IDS`. Datos del preview DS (19–25 oct 2026, hoy 22, eventos 20/22/23, seleccionado 23) dentro de `.demo__narrow`, con texto «Seleccionado: {{ iso }}».
5. Playwright en `/demo`: siete columnas iguales, selección al clic, consola limpia.
6. Marcar «WeekStrip» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R5.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/week-strip.css` y su original del DS no muestra diferencias.
- [x] `src/app/shared/week-strip/` no declara `styles` ni `styleUrl` (R6).
- [x] Host `.week-strip` con `role="group"` y `aria-label` (R1).
- [x] Una `DayPill` fluida por día con sus datos y la seleccionada por ISO (R2, R3).
- [x] Clic actualiza `[(selected)]` (R4).
- [x] Cada píldora con nombre accesible de fecha completa (R5).
- [x] `/demo` muestra la sección WeekStrip del paso 4 y aparece en el índice.
- [x] Ítem «WeekStrip» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** `selected` como `model()` (`[(selected)]`) en vez de `selected` + `onSelect` del DS, como `done` en TaskItem.
- **Sí:** `label` de cada `DayPill` derivado de `iso` con `Intl` en UTC (estable en SSR e hidratación), atendiendo el `[pendiente]` de SPEC 31; el DS no lo hace.
- **Sí:** host como contenedor (`div` del DS), sin elemento envoltorio.
- **No:** cálculo de semana, navegación entre semanas, teclado con flechas, días deshabilitados.

## What is **not** in this spec

- Pantalla móvil `WeekStrip` + `DayView`; cálculo de fechas de la semana.
