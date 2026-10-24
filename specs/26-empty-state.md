# SPEC 26 — Componente EmptyState

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 12, SPEC 14, SPEC 15, SPEC 22
> **Date:** 2026-10-23
> **Objective:** Crear `app-empty-state` como estado vacío tonto que refleja el EmptyState del DS Agenda (icono, título, descripción, hasta dos acciones proyectadas y tamaño compacto).

## Scope

**In:**

- Composición `src/styles/composition/cluster.css`: copia literal del DS (`project/assets/Code/styles/composition/cluster.css`). Importada en `src/styles.css` tras `tokens/context.css` y antes de los bloques.
- Bloque CSS `src/styles/blocks/empty-state.css`: copia literal del DS (`project/assets/Code/styles/blocks/empty-state.css`). Importado en `src/styles.css` tras `alert.css`.
- `src/app/shared/empty-state/empty-state.ts` — componente `EmptyState` (selector `app-empty-state`, template externo `empty-state.html`) y directiva `EmptyStateAction` (selector `[emptyStateAction]`).
- Test Vitest `empty-state.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts`: sección EmptyState.
- Marcar «EmptyState» en `TODO.md`.

**Out of scope:**

- Nivel de encabezado configurable (siempre `h3`).
- Descripción con markup (solo texto).
- Limitar por código el número de acciones a dos (es regla de uso del DS).
- `role="status"` u otros roles ARIA en el host.
- Estado de carga (usar `SkeletonList`).

## Requisitos (EARS)

- **R1.** El `app-empty-state` deberá tener en el host `class="empty-state"`.
- **R2.** Donde `size` sea `'s'`, el host deberá tener `data-size="s"`; con `'m'` (valor por defecto), sin atributo.
- **R3.** El `EmptyState` deberá renderizar como primer hijo `<span class="empty-state__icon">` con un `app-icon` decorativo (`aria-hidden="true"`) cuyo `name` es `icon`, o `event_available` si `icon` no tiene valor.
- **R4.** El `app-icon` deberá tener `size="xl"` mientras `size` sea `'m'` y `size="l"` mientras sea `'s'`.
- **R5.** El `EmptyState` deberá renderizar tras el icono `<h3 class="empty-state__title">` con el texto de `heading` (input obligatorio).
- **R6.** El `EmptyState` no deberá declarar input `title` y el host no deberá tener atributo `title`.
- **R7.** Donde `description` tenga valor, el `EmptyState` deberá renderizar `<p class="empty-state__description">` con ese texto tras el título; sin `description`, no deberá renderizarlo.
- **R8.** Donde el consumidor proyecte uno o más elementos con `emptyStateAction`, el `EmptyState` deberá colocarlos, en orden, dentro de `<div class="l-cluster" data-justify="center">` al final del host.
- **R9.** Si no hay ningún elemento con `emptyStateAction`, entonces el `EmptyState` no deberá renderizar el `.l-cluster`.
- **R10.** El `EmptyState` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `empty-state.css` y `cluster.css`.

## Data model

Sin tipos compartidos nuevos.

```ts
// src/app/shared/empty-state/empty-state.ts
@Directive({ selector: '[emptyStateAction]' })
export class EmptyStateAction {}

export class EmptyState {
  // inputs: heading: string (required) · description?: string · icon?: string
  //         size: Extract<Size, 's' | 'm'> = 'm'
  // actions = contentChildren(EmptyStateAction)
  // host: class 'empty-state', data-size
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `cluster.css` del DS a `src/styles/composition/` y `empty-state.css` a `src/styles/blocks/`, sin cambios; `@import` de ambos en `src/styles.css` en las posiciones del Scope. `npm run build` sin errores (R10).
2. `empty-state.spec.ts` con host de test: un test por R1–R9 (R6: `heading="..."` estático y `[heading]` sin atributo `title`). Fallan.
3. Crear `EmptyState` + `EmptyStateAction` (`templateUrl: './empty-state.html'`, `imports: [Icon]`). Template: `.empty-state__icon` con `<app-icon [name]="icon() ?? 'event_available'" [size]="size() === 's' ? 'l' : 'xl'" />`; `<h3 class="empty-state__title">`; `@if (description())` `<p>`; `@if (actions().length)` `.l-cluster` con `<ng-content select="[emptyStateAction]" />`. Tests en verde.
4. Demo: sección `empty-state` en `demo-page.html` (tras Alert) y `{ id: 'empty-state', name: 'EmptyState' }` en `SECTIONS`. Copy del preview DS, cada uno dentro de `app-card`: `event_available` «Nada agendado hoy» + `app-button` `icon="add"` «Nueva cita»; `task_alt` «Todo al día» + `app-button` `variant="accent"` `icon="add"` «Nueva tarea»; `search_off` «Sin resultados» + `app-button` `variant="secondary"` «Limpiar búsqueda»; `cloud_off` «No pudimos cargar tu agenda» + `app-button` `icon="refresh"` «Reintentar» y `app-button` `variant="ghost"` «Ver ayuda»; compacto `size="s"` en `app-card` `heading="Sin hora"` (ancho máx. 22rem en `demo-page.css`) `checklist` «Sin tareas pendientes», sin acciones.
5. Playwright en `/demo`: icono en círculo `brand-soft`, tamaños `m`/`s`, acciones centradas y en fila (dos en «No pudimos cargar»), sin `.l-cluster` en el compacto, consola limpia.
6. Marcar «EmptyState» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [ ] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R9.
- [ ] `npm run build` termina sin errores ni warnings de budget.
- [ ] `diff` entre `src/styles/composition/cluster.css` y `src/styles/blocks/empty-state.css` y sus originales del DS no muestra diferencias.
- [ ] `src/app/shared/empty-state/` no declara `styles` ni `styleUrl` (R10).
- [ ] `<app-empty-state heading="Todo al día" />` renderiza `.empty-state` sin `data-size`, `span.empty-state__icon > app-icon[aria-hidden=true]` `event_available` tamaño `xl` y `h3.empty-state__title` «Todo al día»; sin `p` ni `.l-cluster` (R1–R5, R7, R9).
- [ ] `size="s"` pone `data-size="s"` e icono tamaño `l` (R2, R4).
- [ ] `icon="cloud_off"` sustituye el icono por defecto (R3).
- [ ] Host sin atributo `title` con `heading` estático y enlazado (R6).
- [ ] `description="..."` renderiza `p.empty-state__description` tras el título (R7).
- [ ] Dos `app-button emptyStateAction` quedan, en orden, dentro de `div.l-cluster[data-justify=center]` último hijo del host (R8).
- [ ] `/demo` muestra la sección EmptyState con las variantes del paso 4 y aparece en el índice.
- [ ] Ítem «EmptyState» marcado en `TODO.md`.
- [ ] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** acciones por slot `[emptyStateAction]` + `contentChildren`, patrón de `cardActions`/`alertAction`. **No:** `ng-content` por defecto (pintaría `.l-cluster` vacío). **No:** inputs `actionLabel`/`secondaryLabel` (pierde `variant`/`icon` de Button).
- **Sí:** copiar `cluster.css` completo del DS ahora; TODO dice que la composición llega con el primer spec que la consuma. **No:** copiar solo `data-justify='center'` (divergencia con DS).
- **Sí:** inputs `heading` (obligatorio) y `description` (opcional, texto). **No:** `title` (tooltip nativo en el host, SPEC 23–25). **No:** descripción proyectada (sin caso real de markup).
- **Sí:** `h3` fijo, como DS y Card. **No:** input de nivel (fuera de alcance).
- **Sí:** `size` local `Extract<Size, 's' | 'm'>`; `data-size` solo en `s` (como `sz()` del DS).
- **Sí:** CSS copiado literal.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `contentChildren(EmptyStateAction)` solo detecta la directiva en elementos raíz proyectados | Demo y tests la ponen en `app-button` directo. |
| `h3` fijo rompe jerarquía fuera de una Card con `h3` propio (p. ej. página sin `h2`) | Aceptado; nivel configurable en otro spec si aparece el caso. |
| `.l-cluster` global pasa a existir y otros bloques lo heredan | Es la composición del DS; los specs futuros que la usen ya la encuentran. |

## What is **not** in this spec

- Nivel de encabezado configurable; descripción con markup; límite de acciones por código; roles ARIA en host; estado de carga.
