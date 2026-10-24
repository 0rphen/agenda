# SPEC 49 — Navegación con flechas en WeekStrip y MiniCalendar

> **Status:** Approved
> **Depends on:** SPEC 31 (DayPill), SPEC 37 (WeekStrip), SPEC 38 (MiniCalendar), SPEC 47 (`@shared/utils`)
> **Date:** 2026-10-24
> **Objective:** Añadir roving tabindex y navegación con flechas a `WeekStrip` y `MiniCalendar` (sugerencias de SPEC 37 y 38) y anunciar el cambio de mes del `MiniCalendar` con `aria-live`.

## Scope

**In:**

- `day-pill/day-pill.ts` + `.html`: input `tabIndex` reflejado en el `button`.
- `week-strip/week-strip.ts` + `.html`: un solo tab stop y `(keydown)` en el host.
- `mini-calendar/mini-calendar.ts` + `.html`: signal de día enfocado, tabindex por día, `(keydown)` en la rejilla, `aria-live="polite"` en `.calendar__title`.
- `utils/time.ts`: `addDays(iso, n)` si no existe una equivalente, con test en `utils/time.spec.ts`.
- Tests en `day-pill.spec.ts`, `week-strip.spec.ts`, `mini-calendar.spec.ts`.
- `src/app/demo/demo-page.html`: nota de teclado en `#week-strip` y `#mini-calendar`.
- `PENDING.md`: marcar `[hecho]` las sugerencias de SPEC 37 y 38 y la comprobación Playwright de `/demo#mini-calendar`.

**Out of scope:**

- Selección al mover el foco (la selección sigue en Enter/Espacio/clic, nativo del `button`).
- Home/End y PageUp/PageDown en `MiniCalendar`.
- Cambiar roles ARIA (siguen `role="group"`, decisiones de SPEC 37 y 38).

## Requisitos (EARS)

- **R1.** Donde se pase `tabIndex`, el `app-day-pill` deberá ponerlo en el atributo `tabindex` de su `button`; sin él, no deberá poner el atributo.
- **R2.** El `app-week-strip` deberá dar `tabIndex` 0 a una sola píldora (la del día enfocado; por defecto la seleccionada, si no la de hoy, si no la primera) y -1 al resto.
- **R3.** Cuando el foco está en una píldora y el usuario pulsa → o ←, el `app-week-strip` deberá mover el foco a la siguiente o anterior píldora habilitada, sin salir de los extremos, y darle `tabIndex` 0.
- **R4.** Cuando el usuario pulsa Home o End, el `app-week-strip` deberá mover el foco a la primera o última píldora habilitada.
- **R5.** Cuando el usuario mueve el foco con teclas, el `app-week-strip` no deberá cambiar `selected`.
- **R6.** El `app-mini-calendar` deberá dar `tabindex="0"` solo al botón del día enfocado (por defecto `current()`; si no está en el mes visible, el primer día habilitado del mes) y `tabindex="-1"` al resto.
- **R7.** Cuando el foco está en un día y el usuario pulsa →/←/↓/↑, el `app-mini-calendar` deberá mover el foco a +1/−1/+7/−7 días, saltando los días deshabilitados en la misma dirección.
- **R8.** Si el día destino no está en el mes visible, entonces el `app-mini-calendar` deberá cambiar el mes visible al de ese día y enfocarlo tras renderizar.
- **R9.** Cuando el usuario cambia de mes con las flechas de cabecera, el `app-mini-calendar` deberá mover el día enfocado al mismo número de día en el nuevo mes (o al último si no existe), sin mover el foco del documento.
- **R10.** El `.calendar__title` del `app-mini-calendar` deberá tener `aria-live="polite"`.
- **R11.** Las secciones `#week-strip` y `#mini-calendar` de `/demo` deberán indicar el teclado disponible.

## Implementation plan

1. `DayPill`: `readonly tabIndex = input<number>()` y `[attr.tabindex]="tabIndex() ?? null"` (R1).
2. `WeekStrip`: `focused = linkedSignal(() => selected() ?? days().find((d) => d.today)?.iso ?? days()[0]?.iso)`; plantilla `[tabIndex]="day.iso === focused() ? 0 : -1"`; host `(keydown)` con mapa de teclas sobre los `button.day-pill:not(:disabled)` (mismo estilo que `Menu.onKeydown`) que enfoca y actualiza `focused` (R2–R5).
3. `utils/time.ts`: `addDays(iso, n)` con `Date.UTC` (como `days` de `MiniCalendar`) + test (R7).
4. `MiniCalendar`: `focused = linkedSignal(() => current())`; `[attr.tabindex]` en cada día; `(keydown)` en `.calendar__grid` calcula destino con `addDays`, salta deshabilitados, si cambia de mes actualiza `view`; `afterRenderEffect` enfoca el botón del día cuando el movimiento vino de teclado (flag interno) (R6–R8). `go(delta)` ajusta `focused` (R9). `aria-live` en el título (R10).
5. Tests por requisito (R1–R10).
6. Demo: línea de ayuda (R11). Playwright en `/demo#week-strip` y `/demo#mini-calendar`.
7. `PENDING.md`: `[hecho]` en «Navegación con flechas entre píldoras», «Navegación con flechas entre días… y `aria-live`» y «Comprobación visual en Playwright de `/demo#mini-calendar`».

## Acceptance criteria

- [ ] Test: `app-day-pill` con `tabIndex` 0/-1 pinta `tabindex`; sin él, no hay atributo (R1).
- [ ] Test: en `app-week-strip` exactamente una píldora tiene `tabindex="0"` y es la seleccionada (o hoy, o la primera) (R2).
- [ ] Test: →/←/Home/End mueven `document.activeElement` y `selected` no cambia (R3–R5).
- [ ] Test: en `app-mini-calendar` exactamente un día tiene `tabindex="0"` (R6).
- [ ] Test: → desde el último día del mes cambia el título al mes siguiente y el foco queda en el día 1 (R7, R8); ↓ salta un día deshabilitado (R7).
- [ ] Test: «Mes siguiente» mueve el `tabindex="0"` al mismo día del mes nuevo (R9).
- [ ] `.calendar__title` con `aria-live="polite"` (R10).
- [ ] Demo con nota de teclado en ambas secciones (R11); Playwright `/demo#week-strip` y `/demo#mini-calendar` sin errores de consola.
- [ ] `npx ng test --watch=false` y `npm run build` verdes; prettier limpio en los ficheros tocados.

## Decisions

- **Sí:** el foco no selecciona (patrón de grupo de botones con `aria-pressed`). **No:** seleccionar al mover: cambiaría la vista del consumidor en cada flecha.
- **Sí:** solo flechas en `MiniCalendar`. **No:** Home/End/PageUp/PageDown: nadie lo pidió.
- **Sí:** `linkedSignal` para el día enfocado (patrón ya usado en `view`). **No:** guardar el índice en el DOM.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Enfocar tras cambiar de mes antes de que exista el botón | Enfocar en `afterRenderEffect`, solo si el cambio vino de teclado. |
| Todos los días del mes deshabilitados | El bucle de salto se corta a 42 pasos; el foco se queda donde estaba. |
