# SPEC 16 — Control a todo el campo e iconos con pseudo-elementos

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 04, SPEC 15
> **Date:** 2026-10-23
> **Objective:** Hacer que el control nativo de cada field ocupe todo `.input`, pintar el ícono inicial y la flecha del select con `::before`/`::after` de `.input`, y girar la flecha mientras el select está abierto.

## Why

- `.input` es flex con `<app-icon>` + control + `<app-icon>`: el control solo cubre el hueco central. Clic en el ícono, la flecha o el padding no enfoca ni abre el control.
- `.input::after` (touch target) tiene `pointer-events: none`: no amplía nada.
- La flecha `expand_more` no refleja el estado abierto.

## Scope

**In:**

- `src/styles/blocks/field.css`: `.input` sin padding; `.input__control` ocupa todo `.input` con el padding dentro; `::before` para el ícono inicial, `::after` para la flecha del select; giro con `:open`; touch target en el propio control.
- Templates de `text-field`, `select`, `date-field`, `time-field`, `number-field`: quitar `<app-icon>` de `.input`; exponer `data-icon` en `.input`.
- Tests de icono en los `*.spec.ts` de esos 5 fields (R13, R18, R19, R22, R25 de SPEC 04 y el de NumberField).
- `src/app/demo/demo-page.html`: sección SelectField con un select sin ícono además del que lo tiene (ya hay con ícono).

**Out of scope:**

- Ícono `error_outline` de `.field__hint`: sigue siendo `<app-icon>`.
- Textarea: no tiene ícono; solo hereda el padding dentro del control.
- Indicadores nativos de date/time/number (`::-webkit-calendar-picker-indicator`, spin buttons): sin cambios.
- `appearance: base-select`, dropdown/opciones personalizados.
- Señal JS de "abierto".
- Ícono final en fields que no son select.

## Requisitos (EARS)

- **R1.** El `.input__control` deberá ocupar todo el ancho y alto interior de `.input`, con el padding inline dentro del control.
- **R2.** Cuando el usuario hace clic en cualquier punto de `.input` (ícono, flecha o padding incluidos), el control deberá recibir el clic (enfocar o abrir).
- **R3.** Donde haya `icon`, `app-text-field`, `app-select`, `app-date-field`, `app-time-field` y `app-number-field` deberán exponer `data-icon="<nombre>"` en `.input` y no renderizar `<app-icon>` dentro de `.input`.
- **R4.** Si no hay `icon`, entonces el field no deberá exponer `data-icon` en `.input`.
- **R5.** Mientras `.input` tenga `data-icon`, `.input::before` deberá pintar el ícono con `content: attr(data-icon) / ""`, fuente `--font-icon`, tamaño `--icon-m`, color `--_icon`, `pointer-events: none`, al inicio (lógico), y el control deberá reservar ese hueco en `padding-inline-start`.
- **R6.** Mientras `.input` tenga `data-select`, `.input::after` deberá pintar `expand_more` con `content: 'expand_more' / ""`, mismas reglas de fuente/color/`pointer-events` que R5, al final (lógico), y el control deberá reservar ese hueco en `padding-inline-end`.
- **R7.** Mientras el `<select>` esté abierto (`.input:has(.input__control:open)`), la flecha deberá girar 180°.
- **R8.** El giro de R7 deberá animarse con `transition` de `rotate` en `--duration-fast`; con `prefers-reduced-motion: reduce` no deberá animarse (ya cubierto por `utilities/reduced-motion.css`).
- **R9.** Si el navegador no soporta `:open`, entonces la flecha deberá quedarse en `expand_more` sin girar y el select deberá seguir funcionando.
- **R10.** Los pseudo-elementos de R5 y R6 no deberán leerse por lectores de pantalla (texto alternativo vacío tras `/`).
- **R11.** El área táctil del control deberá medir al menos `--touch-target` en bloque sin cambiar el aspecto de `.input` (margen negativo en bloque del control, mismo cálculo que el `::after` actual), salvo en `data-multiline`.
- **R12.** Mientras `data-disabled`, los pseudos deberán usar `--color-disabled-ink` (vía `--_icon`) y el cursor `not-allowed` deberá cubrir todo `.input`.
- **R13.** El aspecto en reposo (tamaños, colores, posiciones de ícono y flecha, hover, focus, invalid, disabled) deberá coincidir con el actual.
- **R14.** CSS solo con tokens, unidades rem/em/% y propiedades lógicas; `px` solo vía `--border-hairline` (CLAUDE.md, `css-guidelines`).

## Data model

Sin datos nuevos. Inputs sin cambios (`icon` sigue igual). Nuevo atributo DOM: `data-icon` en `.input`.

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Tests primero: en los 5 `*.spec.ts` cambiar los tests de ícono para comprobar `data-icon` en `.input` y que `.input app-icon` no existe (R3, R4); en `select.spec.ts`, `data-select` sigue y no hay `<app-icon>` en `.input` (R6). Fallan.
2. Templates: quitar `@if (icon()) <app-icon>` y `<app-icon name="expand_more">`; añadir `[attr.data-icon]="icon() ?? null"` en `.input`. `Icon` se sigue importando (hint). Tests en verde.
3. `field.css`: `.input` sin `padding-inline`, `gap` fuera; `.input__control` `align-self: stretch`, `padding-inline: var(--space-xs)`, `margin-block` negativo para touch target (R11); quitar el `::after` de touch target. `[data-icon]` suma `--icon-m + --space-2xs` al padding de inicio; `[data-select]` al de fin (R1, R5, R6).
4. `::before`/`::after` con estilo de ícono (copiar lo necesario de `.icon`: `font-family`, `font-size`, `line-height: 1`, `font-feature-settings: 'liga'`, `-webkit-font-smoothing`), `position: absolute`, centrados en bloque (R5, R6, R10, R12).
5. `:open` + `transition: rotate` (R7–R9).
6. Demo: añadir select sin ícono en la sección SelectField.
7. Playwright en `/demo`: clic en ícono, flecha y padding abre/enfoca cada field; flecha gira con el select abierto; capturas antes/después iguales en reposo; consola limpia.
8. `npm test -- --watch=false` y `npm run build` en verde (budget incluido).

## Acceptance criteria

- [x] En `/demo`, clic sobre el ícono de inicio de text/date/time/number/select enfoca el control (R2).
- [x] En `/demo`, clic sobre la flecha del select abre el desplegable (R2).
- [x] Con el select abierto en Chromium, la flecha apunta hacia arriba; al cerrarlo vuelve (R7).
- [x] Con `prefers-reduced-motion: reduce` emulado, el giro es instantáneo (R8).
- [x] `.input` de cada field con `icon` tiene `data-icon`; ninguno contiene `app-icon` (tests, R3, R4).
- [x] Captura en reposo antes/después de la sección de fields sin diferencias visibles (R13).
- [x] Field disabled: ícono y flecha en color deshabilitado, cursor `not-allowed` en todo el campo (R12).
- [x] El árbol de accesibilidad no expone `expand_more` ni el nombre del ícono (R10).
- [x] `field.css` sin colores literales ni `px` y con propiedades lógicas (R14).
- [x] Demo actualizada: SelectField con y sin ícono.
- [x] `npm test -- --watch=false` y `npm run build` en verde.

## Decisions

- **Sí:** pseudos en `.input` con `attr(data-icon)`. **No:** pseudos en `<select>`/`<input>` (elementos reemplazados, sin soporte fiable).
- **Sí:** `:open` CSS. **No:** señal JS (heurística, Esc/clic fuera la desincronizan). **No:** `appearance: base-select` (alcance mucho mayor).
- **Sí:** rotación animada con `--duration-fast`.
- **Sí:** todos los fields con `icon`. **No:** solo SelectField (dejaría dos patrones en el mismo bloque).
- **Sí:** touch target como margen negativo del control. **No:** mantener `.input::after` (con `pointer-events: none` no amplía nada y ahora es la flecha).
- **Sí:** `error_outline` del hint sigue como `<app-icon>`: no está dentro del control.
- Desviación del DS: el bloque Input del DS usa elementos ícono; aquí pseudos. Mismo aspecto, distinto DOM.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `:open` sin soporte en algún navegador | R9: degrada a flecha fija. |
| Ligaduras en `content` no se aplican y se ve el texto `expand_more` | `font-feature-settings: 'liga'` en el pseudo; verificar en Playwright. |
| Fuente de iconos aún no cargada: se ve el nombre | Igual que hoy con `<app-icon>`. |
| Margen negativo del control rompe alineación vertical | Captura antes/después (R13). |
| `attr()` con nombre inválido pinta texto | El nombre viene del input `icon`, igual que hoy. |

## What is **not** in this spec

- Hint, textarea, indicadores nativos, select personalizable, estado abierto por JS.
