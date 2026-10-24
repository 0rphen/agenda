# SPEC 36 — Componente SettingRow (+ `ariaLabel` en SelectField y `tone` en Card)

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 02, SPEC 04, SPEC 15, SPEC 20, SPEC 21, SPEC 22
> **Date:** 2026-10-24
> **Objective:** Crear `app-setting-row` como fila tonta de ajuste (icono, título, descripción y a la derecha un control proyectado, un valor o una flecha) que refleja el SettingRow del DS Agenda, estática o de navegación (`button`), con variante ancha que apila el control bajo el texto en contenedores estrechos y tono destructivo. Para componer como el preview del DS: `SelectField` acepta `ariaLabel` sin etiqueta visible y `Card` acepta `tone="danger"`.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/setting-row.css`: copia literal del DS (`project/assets/Code/styles/blocks/setting-row.css`). Importado en `src/styles.css` tras `stat-card.css`.
- `src/app/shared/setting-row/setting-row.ts` — componente `SettingRow` (selectores `app-setting-row` y `button[app-setting-row]`, template externo `setting-row.html`) y directiva `SettingRowControl` (`[settingRowControl]`), patrón de `Card`/`CardActions` (SPEC 22). Reutiliza `app-icon`.
- `SelectField`: `label` pasa a opcional e input nuevo `ariaLabel`, como `Switch` (SPEC 20).
- `Card`: input nuevo `tone?: 'danger'` que escribe `data-tone` (regla ya presente en `card.css`).
- Tests Vitest `setting-row.spec.ts`, y casos nuevos en `select.spec.ts` y `card.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts`: sección SettingRow e índice; ejemplo de `ariaLabel` en SelectField y de `tone="danger"` en Card.
- Marcar «SettingRow» en `TODO.md`.

**Out of scope:**

- Prop `leading` del DS (nodo de cabecera libre en lugar de `icon`): ningún uso en el DS fuera del bundle.
- Navegación a sub-pantallas: la decide la pantalla de Ajustes con `(clicked)`.
- Pantalla de Ajustes, `SaveBar`.
- Corregir el `outline-offset` duplicado del bloque DS (se copia literal).

## Requisitos (EARS)

- **R1.** El `app-setting-row` deberá tener la clase `setting-row` en el host y renderizar `<span class="setting-row__inner">` con `<span class="setting-row__text">` que contiene `<span class="setting-row__label">` = `label` (obligatorio).
- **R2.** Donde `description` tenga valor, el `SettingRow` deberá renderizar `<span class="setting-row__desc">` tras el título; si no, no.
- **R3.** Donde `icon` tenga valor, el `SettingRow` deberá renderizar antes del texto `<span class="setting-row__lead">` con `app-icon [name]=icon` decorativo y poner `data-lead` en `.setting-row__inner`; si no, ninguno de los dos.
- **R4.** Donde se proyecte `[settingRowControl]`, `value` tenga valor o el host sea `button[app-setting-row]`, el `SettingRow` deberá renderizar `<span class="setting-row__trail">` con, en orden, `<span class="setting-row__value">` = `value` (si hay), el control proyectado y, en botón sin `noChevron`, `app-icon name="chevron_right"` decorativo; si no, no deberá renderizar `.setting-row__trail`.
- **R5.** Mientras `wide`, el `SettingRow` deberá poner `data-wide` en `.setting-row__inner`; si no, sin atributo.
- **R6.** Donde el host sea `button[app-setting-row]`, el `SettingRow` deberá tener `type="button"` y `data-interactive`; en `app-setting-row`, ninguno de los dos.
- **R7.** Cuando el usuario hace clic en un `button[app-setting-row]` no deshabilitado, el `SettingRow` deberá emitir `clicked` con el `MouseEvent`; en `app-setting-row` no deberá emitir.
- **R8.** Mientras `disabled` en `button[app-setting-row]`, el `SettingRow` deberá tener el atributo `disabled` y no emitir `clicked`; en `app-setting-row`, `disabled` no deberá escribir el atributo.
- **R9.** Donde `tone` = `danger`, el `SettingRow` deberá poner `data-tone="danger"`; si no, sin atributo. Donde `state` tenga valor (`hover` | `active` | `focus`), deberá ponerlo en `data-force`.
- **R10.** Donde `SelectField` reciba `ariaLabel` sin `label`, deberá omitir el `<label class="field__label">` y poner `aria-label` en el `<select>`; con `label`, deberá mostrar la etiqueta y no poner `aria-label`.
- **R11.** Donde `Card` reciba `tone="danger"`, deberá poner `data-tone="danger"` en el host; si no, sin atributo.
- **R12.** El `SettingRow` no deberá usar `styleUrl` ni estilos de componente; el aspecto viene de `setting-row.css`.

## Data model

```ts
// src/app/shared/setting-row/setting-row.ts
@Directive({ selector: '[settingRowControl]' })
export class SettingRowControl {}

export class SettingRow {
  // inputs: label: string (required) · icon?: string · description?: string · value?: string
  //         wide: boolean = false · noChevron: boolean = false · disabled: boolean = false
  //         tone?: 'danger' · state?: 'hover' | 'active' | 'focus'
  // output: clicked: MouseEvent (solo en button[app-setting-row])
}

// SelectField: label?: string (antes required) · ariaLabel?: string
// Card: tone?: 'danger'
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `setting-row.css` del DS sin cambios; `@import` en `src/styles.css` tras `stat-card.css` (R12).
2. `setting-row.spec.ts` con host de test (`app-setting-row` con `[settingRowControl]`, `button[app-setting-row]` con `(clicked)`): al menos un test por R1–R9.
3. Crear `SettingRow` + `SettingRowControl` (`templateUrl: './setting-row.html'`), patrón de `Card`: `host` con `class`, `[attr.data-interactive]`, `[attr.type]`, `[attr.disabled]`, `[attr.data-tone]`, `[attr.data-force]`, `(click)`; `interactive` por `tagName === 'BUTTON'`; `control = contentChild(SettingRowControl)`.
4. `SelectField`: `label = input<string>()`, `ariaLabel = input<string>()`; `<label>` solo con `label`; `[attr.aria-label]="label() ? null : (ariaLabel() ?? null)"`. Test R10.
5. `Card`: `tone = input<'danger'>()`, `[attr.data-tone]`. Test R11.
6. Demo: sección `setting-row` tras StatCard, `{ id: 'setting-row', name: 'SettingRow' }` en `SECTIONS` e `IDS`. Copy del preview DS: «Con controles» en `app-card` (Switch «Recordatorios en el navegador», SelectField `wide` «La semana empieza el» Lunes/Domingo, SegmentedControl `wide` «Formato de hora» 24 h/12 h, Switch sin icono «Mostrar fines de semana»); «Navegación» en `app-card` (Calendario «Semana», Apariencia «Cómoda» hover, Seguridad active, Ayuda focus, Archivo disabled) con contador de clics; «Destructiva» en `app-card tone="danger"` (Cerrar sesión `noChevron`, Eliminar cuenta con descripción). Añadir un SelectField con `ariaLabel` en su sección.
7. Playwright en `/demo`: filas, apilado `wide` en contenedor estrecho, hover/active/focus, consola limpia.
8. Marcar «SettingRow» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R11.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/setting-row.css` y su original del DS no muestra diferencias.
- [x] `src/app/shared/setting-row/` no declara `styles` ni `styleUrl` (R12).
- [x] Host `.setting-row` con título, descripción e icono opcionales (R1–R3).
- [x] `.setting-row__trail` con valor, control proyectado y flecha según el caso; ausente si no hay nada (R4).
- [x] `wide` escribe `data-wide` (R5).
- [x] `button[app-setting-row]` con `type="button"`, `data-interactive`, emite `clicked`, `disabled` bloquea; estática sin ellos (R6–R8).
- [x] `tone` y `state` escriben `data-tone` y `data-force` (R9).
- [x] `SelectField` con `ariaLabel` sin etiqueta visible (R10); `Card` con `tone="danger"` (R11).
- [x] `/demo` muestra la sección SettingRow del paso 6 y aparece en el índice.
- [x] Ítem «SettingRow» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** navegación por selector `button[app-setting-row]` en vez de `onClick` del DS, como `Card` y `StatCard`.
- **Sí:** control proyectado con `[settingRowControl]` + `contentChild` (patrón `CardActions`), para saber si renderizar `.setting-row__trail`.
- **Sí:** `ariaLabel` en `SelectField` y `tone` en `Card` (respuesta del usuario): el título de la fila hace de etiqueta visible; la tarjeta destructiva del DS lleva borde de peligro.
- **Sí:** `state` (`data-force`) expuesto, como `Card`/`StatCard`: el preview DS documenta hover/active/focus con él.
- **No:** prop `leading`, navegación, pantalla de Ajustes.

## Risks

- Un `button[app-setting-row]` con control proyectado anidaría controles interactivos en un botón (HTML inválido). El DS lo evita por convención (control = fila estática); no se valida en código.

## What is **not** in this spec

- Pantalla de Ajustes; `SaveBar`; prop `leading`; corrección del CSS del DS.
