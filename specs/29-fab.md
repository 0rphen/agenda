# SPEC 29 — Componente Fab

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 02, SPEC 15, SPEC 17
> **Date:** 2026-10-24
> **Objective:** Crear `app-fab` como botón de acción flotante tonto que refleja el Fab del DS Agenda (circular con icono o extendido con icono y texto, color `accent`).

## Scope

**In:**

- Bloque CSS `src/styles/blocks/fab.css`: copia literal del DS (`project/assets/Code/styles/blocks/fab.css`). Importado en `src/styles.css` tras `breadcrumb.css`.
- `src/app/shared/fab/fab.ts` — componente `Fab` (selector `app-fab`, template externo `fab.html`).
- Test Vitest `fab.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts`: sección Fab e índice.
- Marcar «Fab» en `TODO.md`.

**Out of scope:**

- Anclaje flotante (`.l-screen__fab`, `position: fixed`, área segura): llega con la composición de pantalla móvil.
- Estados forzados `data-force` (hover/active/focus del preview DS). La regla viene en el CSS copiado, pero el componente no la expone.
- `disabled`, `loading`, `type="submit"`, `filled`: el DS no los define para Fab.
- Limitar a un Fab por pantalla (regla de uso del DS).

## Requisitos (EARS)

- **R1.** El `app-fab` deberá renderizar un único `<button type="button" class="fab">`.
- **R2.** El `Fab` deberá poner `aria-label` del `button` igual a `label` (input obligatorio).
- **R3.** El `Fab` deberá renderizar dentro del `button` un `app-icon` con `name` igual a `icon` (por defecto `add`) y `size="l"`, decorativo (`aria-hidden="true"`).
- **R4.** Donde `extended` sea verdadero, el `button` deberá tener `data-extended` y renderizar tras el icono un `<span>` con el texto de `label`.
- **R5.** Mientras `extended` sea falso (por defecto), el `button` no deberá tener `data-extended` ni `<span>` de texto.
- **R6.** Cuando el usuario hace clic en el `button`, el `Fab` deberá emitir `clicked` con el `MouseEvent`.
- **R7.** El `Fab` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `fab.css`.

## Data model

```ts
// src/app/shared/fab/fab.ts
export class Fab {
  // inputs: label: string (required) · icon: string = 'add' · extended: boolean = false (booleanAttribute)
  // output: clicked: MouseEvent
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `fab.css` del DS a `src/styles/blocks/`, sin cambios; `@import` en `src/styles.css` tras `breadcrumb.css` (R7).
2. `fab.spec.ts` con host de test (atributo `extended` sin valor, `(clicked)`): un test por R1–R6. Fallan.
3. Crear `Fab` (`templateUrl: './fab.html'`, `imports: [Icon]`), patrón de `IconButton`: `button.fab` con `[attr.aria-label]`, `[attr.data-extended]`, `(click)` que emite `clicked`; `app-icon size="l"`; `@if (extended())` `<span>{{ label() }}</span>`. Tests en verde.
4. Demo: sección `fab` en `demo-page.html` (tras Breadcrumb), `{ id: 'fab', name: 'Fab' }` en `SECTIONS` y `'fab'` en `IDS` de `demo-page.spec.ts`. Copy del preview DS: circular «Nueva cita»; extendido «Nueva cita» y «Nueva tarea» (`icon="checklist"`).
5. Playwright en `/demo`: círculo 3.5 rem, hover aclara fondo y sube sombra, focus-visible con anillo, extendido con texto, consola limpia.
6. Marcar «Fab» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R6.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/fab.css` y el original del DS no muestra diferencias.
- [x] `src/app/shared/fab/` no declara `styles` ni `styleUrl` (R7).
- [x] Un único `button.fab[type=button]` con `aria-label` igual a `label` (R1, R2).
- [x] `app-icon` `add` por defecto, `checklist` con `icon="checklist"`, `data-size="l"` y `aria-hidden="true"` (R3).
- [x] Con `extended`: `data-extended` y `<span>` con el label tras el icono; sin `extended`: ninguno de los dos (R4, R5).
- [x] Clic emite `clicked` con un `MouseEvent` (R6).
- [x] `/demo` muestra la sección Fab con las variantes del paso 4 y aparece en el índice.
- [x] Ítem «Fab» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** `button.fab` interno en `app-fab` y salida `clicked`, patrón de `IconButton`. **No:** clase en el host (un custom element no es un botón nativo).
- **Sí:** `aria-label` siempre, también en `extended` (como el DS; coincide con el texto visible). **No:** quitarlo en `extended`.
- **Sí:** solo inputs del DS (`label`, `icon`, `extended`). **No:** `disabled`/`loading`/`type`.
- **No:** `data-force`: ningún componente del repo lo soporta; la demo usa hover/focus reales.
- **No:** anclaje en `.l-screen__fab`: no hay composición de pantalla todavía.
- **Sí:** CSS copiado literal (incluye reglas `data-force` sin uso y la sangría irregular de `outline-offset`).

## What is **not** in this spec

- Anclaje `.l-screen__fab`; `data-force`; `disabled`/`loading`/`submit`; límite de un Fab por pantalla.
