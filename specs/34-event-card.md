# SPEC 34 — Componente EventCard

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 06, SPEC 07, SPEC 14, SPEC 15
> **Date:** 2026-10-24
> **Objective:** Crear `app-event-card` como tarjeta pastel tonta de cita (hora, título en el input `heading`, lugar, asistentes con `AvatarGroup`, badge y estado proyectados) que refleja el EventCard del DS Agenda (7 tintes con `u-tint`, seleccionada, cancelada, deshabilitada), con estados accesibles por texto y no solo por color.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/event-card.css`: copia literal del DS (`project/assets/Code/styles/blocks/event-card.css`). Importado en `src/styles.css` tras `task-item.css`.
- `src/app/shared/event-card/event-card.ts` — componente `EventCard` (selector `app-event-card`, template externo `event-card.html`) y directivas `EventCardStatus` (`[eventCardStatus]`) y `EventCardBadge` (`[eventCardBadge]`), patrón `AlertAction`. Reutiliza `app-icon` y `app-avatar-group`.
- Test Vitest `event-card.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts` + `demo-page.css` (`.demo__cards`): sección EventCard e índice.
- Marcar «EventCard» en `TODO.md`.

**Out of scope:**

- Estados forzados `data-force` (prop `state` del DS). La regla viene en el CSS copiado, pero el componente no la expone.
- `locationIcon`: solo aparece en el bundle del DS, no en la API de la card.
- Menú de acciones de la cita (`app-menu`): lo decidirá la pantalla.
- Formatear horas: el consumidor pasa `time` como texto (`08:00 – 09:00`).

## Requisitos (EARS)

- **R1.** El `app-event-card` deberá renderizar un único `<button type="button" class="event-card u-tint">` con `data-tint` = `tint` (por defecto `periwinkle`) y, en orden, `<span class="event-card__top">` (con `<span class="event-card__time">` = `time` y el contenido `[eventCardStatus]`) y `<span class="event-card__title">` = `heading`; `time` y `heading` son obligatorios y el host no deberá tener atributo `title`.
- **R2.** Donde `location` tenga valor, el `EventCard` deberá renderizar `<span class="event-card__meta">` con `app-icon name="place" size="s"` decorativo y el texto; si no, no.
- **R3.** Donde `people` no esté vacío o se proyecte `[eventCardBadge]`, el `EventCard` deberá renderizar `<span class="event-card__foot">` con `app-avatar-group [people] onTint` (o un `<span>` vacío sin personas) seguido del badge proyectado; si no, no.
- **R4.** El `EventCard` deberá poner `aria-pressed` igual a `selected` (`"true"`/`"false"`, por defecto `false`) y, mientras `selected`, `data-selected`.
- **R5.** Mientras `cancelled`, el `button` deberá tener `data-cancelled` y un `<span class="u-visually-hidden">Cancelada. </span>` antes del título; si no, ninguno de los dos.
- **R6.** Donde `disabled` sea verdadero, el `button` deberá tener `disabled` nativo.
- **R7.** Cuando el usuario hace clic en el `button` habilitado, el `EventCard` deberá emitir `clicked` con el `MouseEvent`; mientras `disabled`, no deberá emitir.
- **R8.** El `EventCard` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `event-card.css` y `category.css`.

## Data model

```ts
// src/app/shared/event-card/event-card.ts
export class EventCard {
  // inputs: time: string (required) · heading: string (required) · tint: Tint = 'periwinkle'
  //         location?: string · people: AvatarPerson[] = []
  //         selected · cancelled · disabled: boolean = false (booleanAttribute)
  // output: clicked: MouseEvent
  // contentChild(EventCardBadge) decide si se pinta el pie
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `event-card.css` del DS a `src/styles/blocks/`, sin cambios; `@import` en `src/styles.css` tras `task-item.css` (R8).
2. `event-card.spec.ts` con host de test (atributos sin valor, slots proyectados, `(clicked)`): al menos un test por R1–R7.
3. Crear `EventCard` (`templateUrl: './event-card.html'`), patrón de `AgendaItem`: `button.event-card.u-tint` con `[attr.data-tint]`, `[attr.aria-pressed]`, `[attr.data-selected]`, `[attr.data-cancelled]`, `[disabled]`, `(click)` que emite `clicked`; `<ng-content select="[eventCardStatus]" />` en el top y `<ng-content select="[eventCardBadge]" />` en el pie. Tests en verde.
4. Demo: sección `event-card` en `demo-page.html` (tras TaskItem), `{ id: 'event-card', name: 'EventCard' }` en `SECTIONS` y `'event-card'` en `IDS`. Copy del preview DS: `08:00 – 09:00`, «Sala 302», `PEOPLE` de la demo, badge `glass` `check_circle` «Confirmada». Rejilla «Tintes» con 7 tarjetas (Pervinca, Crema, Rosa, Menta, Cielo, Lila, Lima). Rejilla «Estados»: Seleccionada (sky, clic alterna la selección), Cancelada (rose, badge `glass` `cancel` «Cancelada»), Deshabilitada (badge neutral «Pasada»). `.demo__cards` en `demo-page.css` con la rejilla del preview (`minmax(13.75rem, 1fr)`).
5. Playwright en `/demo`: tintes, selección con contorno `color-on-tint`, tachado de cancelado, disabled, consola limpia.
6. Marcar «EventCard» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R7.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/event-card.css` y el original del DS no muestra diferencias.
- [x] `src/app/shared/event-card/` no declara `styles` ni `styleUrl` (R8).
- [x] Un único `button.event-card.u-tint[type=button]` con `data-tint`, top con hora y estado, y título de `heading`; sin `title` en el host (R1).
- [x] `location` añade `.event-card__meta` con icono `place` decorativo (R2).
- [x] `people` o badge proyectado añaden `.event-card__foot` con `app-avatar-group` `onTint` (R3).
- [x] `aria-pressed` y `data-selected` siguen a `selected` (R4).
- [x] `cancelled` da `data-cancelled` y texto oculto «Cancelada.» (R5).
- [x] `disabled` nativo y sin `clicked`; habilitada emite `clicked` (R6, R7).
- [x] `/demo` muestra la sección EventCard del paso 4 y aparece en el índice.
- [x] Ítem «EventCard» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** `span` en vez de `h4`/`p` del DS para título y lugar: `<button>` solo admite contenido de fraseo y un heading dentro es HTML inválido. Las clases son las mismas y el CSS no cambia (el flex en columna bloquifica los hijos).
- **Sí:** input `heading` en lugar de `title` del DS, como SPEC 23 y SPEC 32.
- **Sí:** `people: AvatarPerson[]` (tipo de `AvatarGroup`) en lugar de `string[]` del DS.
- **Sí:** `badge` y `status` del DS (nodos React) como slots proyectados `[eventCardBadge]` y `[eventCardStatus]`.
- **Sí:** `aria-pressed` = `selected` y texto oculto «Cancelada.», patrón de SPEC 32.
- **No:** `data-force` / `state` ni `locationIcon`.
- **Sí:** CSS copiado literal (incluye reglas `data-force` y la sangría irregular de `outline-offset`).

## What is **not** in this spec

- `data-force`; `locationIcon`; menú de acciones; formato de horas.
