# SPEC 22 — Componente Card

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 14, SPEC 15, SPEC 17
> **Date:** 2026-10-23
> **Objective:** Crear `app-card` / `button[app-card]` como contenedor tonto que refleja la Card del DS Agenda (título, acciones proyectadas, variantes `elevated` y tinte, y modo interactivo con `selected`, `disabled` y `clicked`).

## Scope

**In:**

- Bloque CSS `src/styles/blocks/card.css`: copia literal del DS (`project/assets/Code/styles/blocks/card.css`), sin reglas propias. Importado en `src/styles.css` tras `segmented.css`.
- Tipo `Tint` en `src/app/shared/types/ui.ts`.
- `src/app/shared/card/card.ts` — componente `Card` (selector `app-card, button[app-card]`, template externo `card.html`) y directiva `CardActions` (selector `[cardActions]`).
- Test Vitest `card.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts`: sección Card.
- Marcar «Card» en `TODO.md`.

**Out of scope:**

- `tone="danger"` (la regla `data-tone` del CSS queda inerte).
- Nivel de título configurable.
- Acciones dentro de `button[app-card]` (controles interactivos anidados).
- Migrar `Avatar` al tipo `Tint`.
- Componentes que usan Card (StatCard, EventCard, pantallas).

## Requisitos (EARS)

- **R1.** El `app-card` deberá tener en el host `class="card"`.
- **R2.** Donde el host sea `<button app-card>`, el `Card` deberá añadir `data-interactive`, `type="button"` y `class="card"`.
- **R3.** Donde `variant` sea `'elevated'`, el host deberá tener `data-variant="elevated"`; con `'default'` (valor por defecto), sin atributo.
- **R4.** Donde `tint` tenga valor, el host deberá tener la clase `u-tint` y `data-tint` = `tint`; sin `tint`, ninguno de los dos.
- **R5.** Donde `title` tenga valor, el `Card` deberá renderizar `<div class="card__head">` con `<h3 class="card__title">` y el texto de `title`.
- **R6.** Donde el consumidor proyecte un elemento con `cardActions` en `app-card`, el `Card` deberá colocarlo dentro de `.card__head`, tras el título; la cabecera deberá renderizarse aunque no haya `title`.
- **R7.** Si no hay `title` ni `cardActions`, entonces el `Card` no deberá renderizar `.card__head`.
- **R8.** Donde el host sea `<button app-card>`, el `Card` no deberá proyectar `cardActions`.
- **R9.** El `Card` deberá proyectar el resto del contenido dentro de `<div class="card__body">`.
- **R10.** Mientras `selected` sea `true`, el host deberá tener `data-selected` y `aria-current="true"`; si no, ninguno.
- **R11.** Mientras `disabled` sea `true`, el host deberá tener `data-disabled`; en `<button app-card>`, además `disabled` nativo; en `app-card`, además `aria-disabled="true"`.
- **R12.** Donde `selected` o `disabled` se pasen como atributo suelto, el `Card` deberá tratarlos como `true` (`booleanAttribute`).
- **R13.** Donde `state` tenga valor (`'hover' | 'active' | 'focus'`), el host deberá tener `data-force` = `state`.
- **R14.** Cuando el usuario activa un `<button app-card>` habilitado (clic, `Espacio` o `Enter`), el `Card` deberá emitir `clicked` con el `MouseEvent`.
- **R15.** Mientras `disabled` sea `true`, cuando el usuario hace clic, el `<button app-card>` no deberá emitir `clicked`.
- **R16.** Donde el host sea `app-card` (no botón), el `Card` no deberá emitir `clicked`.
- **R17.** El `Card` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `card.css`.

## Data model

```ts
// src/app/shared/types/ui.ts
export type Tint = 'periwinkle' | 'cream' | 'rose' | 'mint' | 'sky' | 'lilac' | 'lime';
```

```ts
// src/app/shared/card/card.ts
@Directive({ selector: '[cardActions]' })
export class CardActions {}

export class Card {
  // inputs: title?: string · variant: 'default' | 'elevated' = 'default' · tint?: Tint
  //         selected = false, disabled = false (booleanAttribute)
  //         state?: 'hover' | 'active' | 'focus'
  // output: clicked = output<MouseEvent>()
  // interactive = tagName del host === 'BUTTON' (ElementRef, constante)
  // actions = contentChild(CardActions)
  // host: class 'card', [class.u-tint], data-variant, data-tint, data-interactive, type,
  //       data-selected, aria-current, data-disabled, disabled / aria-disabled, data-force, (click)
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `card.css` del DS a `src/styles/blocks/` sin cambios; `@import` en `src/styles.css` tras `segmented.css`. Añadir `Tint` a `ui.ts`. `npm run build` sin errores (R17).
2. `card.spec.ts` con hosts de test para `app-card` y `<button app-card>`: un test por R1–R16. Fallan.
3. Crear `Card` + `CardActions` (`templateUrl: './card.html'`). Template: `@if (title() || (actions() && !interactive))` cabecera con `h3` y `<ng-content select="[cardActions]" />` (solo si `!interactive`); `<div class="card__body"><ng-content /></div>`. `(click)` del host emite `clicked` solo si `interactive` y no `disabled`. Tests en verde.
4. Demo: sección `card` en `demo-page.html` (tras NumberField) y entrada `{ id: 'card', name: 'Card' }` en `SECTIONS`: «Notas recientes» con `app-icon-button` «Más» (`more_horiz`, `size="s"`) en `cardActions`; `elevated`; `tint="mint"`; interactiva con contador de clics; `state` hover y focus; `selected`; interactiva `disabled`; `app-card` `disabled`. Copy en español.
5. Playwright en `/demo`: hover sube y da sombra, foco visible con Tab, Enter/Espacio emiten `clicked` (contador sube), disabled no emite, consola limpia.
6. Marcar «Card» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R16.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/card.css` y el del DS no muestra diferencias.
- [x] `src/app/shared/card/` no declara `styles` ni `styleUrl` (R17).
- [x] `<app-card title="Notas recientes"><app-icon-button cardActions … />…</app-card>` renderiza `.card > .card__head > h3.card__title + app-icon-button` y `.card__body` con el contenido (R1, R5, R6, R9).
- [x] `<app-card>` sin `title` ni acciones no tiene `.card__head` (R7).
- [x] `<button app-card>` tiene `class="card"`, `data-interactive`, `type="button"` y no proyecta `cardActions` (R2, R8).
- [x] `variant="elevated"` pone `data-variant="elevated"`; `tint="mint"` pone `u-tint` y `data-tint="mint"` (R3, R4).
- [x] `selected` (atributo suelto) pone `data-selected` y `aria-current="true"` (R10, R12).
- [x] `disabled` en botón pone `disabled` nativo y `data-disabled`; en `app-card`, `aria-disabled="true"` y `data-disabled` (R11, R12).
- [x] `state="focus"` pone `data-force="focus"` (R13).
- [x] Clic en `<button app-card>` emite `clicked`; deshabilitado no; `app-card` nunca (R14–R16).
- [x] `/demo` muestra la sección Card con todas las variantes del paso 4 y aparece en el índice.
- [x] Ítem «Card» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** un componente con `selector: 'app-card, button[app-card]'`; el tag del host decide el modo interactivo. Patrón de `a[app-button-link]`. **No:** input `interactive` con `<button>` interno (el host perdería `.card`); dos componentes (template duplicado).
- **Sí:** acciones por slot `[cardActions]` con directiva `CardActions` + `contentChild` para saber si pintar la cabecera. **No:** cabecera siempre (margen vacío).
- **Sí:** `h3` fijo como el DS. **No:** `headingLevel` configurable.
- **Sí:** tipo `Tint` en `ui.ts`, reutilizable. **No:** migrar `Avatar` ahora.
- **Sí:** `state` → `data-force` (vitrina en demo). Se desvía de specs previos, pedido explícito.
- **Sí:** output `clicked`, como `app-button`. **No:** solo `(click)` nativo.
- **Sí:** `selected` → `aria-current="true"` (elegir una de varias), no solo color. **No:** `aria-pressed` (semántica de toggle).
- **Sí:** `selected` y `disabled` también en `app-card`; div deshabilitado con `aria-disabled="true"`.
- **No:** `tone="danger"`; regla CSS copiada pero inerte.
- **Sí:** CSS copiado literal.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `<h3>` y `<div>` dentro de `<button>` no son contenido válido (solo *phrasing*) | Mismo markup que el DS; los navegadores lo renderizan. Revisar si un validador lo exige. |
| `aria-current` en una tarjeta sin contexto de conjunto puede confundir | El consumidor usa `selected` solo en listas de elección. |
| `tagName` en SSR | Domino devuelve mayúsculas como el navegador; test cubre ambos hosts. |

## What is **not** in this spec

- `tone="danger"`; `headingLevel`; acciones en la tarjeta interactiva; migrar `Avatar` a `Tint`; StatCard, EventCard y pantallas.
