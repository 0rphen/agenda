# SPEC 28 — Componente Breadcrumb

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 02, SPEC 15
> **Date:** 2026-10-23
> **Objective:** Crear `app-breadcrumb` como ruta de navegación tonta que refleja el Breadcrumb del DS Agenda (lista de ítems con icono opcional, enlaces internos o externos, página actual y variante barra).

## Scope

**In:**

- Bloque CSS `src/styles/blocks/breadcrumb.css`: copia literal del DS (`project/assets/Code/styles/blocks/breadcrumb.css`). Importado en `src/styles.css` tras `empty-state.css`.
- `src/app/shared/breadcrumb/breadcrumb.ts` — componente `Breadcrumb` (selector `app-breadcrumb`, template externo `breadcrumb.html`) y tipo exportado `BreadcrumbItem`.
- Test Vitest `breadcrumb.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts`: sección Breadcrumb.
- Marcar «Breadcrumb» en `TODO.md`.

**Out of scope:**

- Estados forzados `data-force` (hover/focus del preview DS). La regla viene en el CSS copiado, pero el componente no la expone.
- `onClick` por ítem (salida/evento).
- Limitar por código a 4 niveles o el icono al primero/actual (son reglas de uso del DS).
- `aria-label` configurable (fijo «Ruta de navegación», como el DS).
- Colapsar niveles intermedios («…») en anchos estrechos.

## Requisitos (EARS)

- **R1.** El `app-breadcrumb` deberá tener en el host `class="breadcrumb"`, `role="navigation"` y `aria-label="Ruta de navegación"`.
- **R2.** Donde `variant` sea `'bar'`, el host deberá tener `data-variant="bar"`; con `'default'` (valor por defecto), sin atributo.
- **R3.** El `Breadcrumb` deberá renderizar `<ol class="breadcrumb__list">` con un `<li class="breadcrumb__item">` por cada elemento de `items` (input obligatorio), en orden.
- **R4.** El `Breadcrumb` deberá renderizar el último ítem como `<span class="breadcrumb__current" aria-current="page">`, aunque tenga `link` o `href`.
- **R5.** Donde un ítem no último tenga `link`, el `Breadcrumb` deberá renderizarlo como `<a class="breadcrumb__link">` con `routerLink` igual a `link`.
- **R6.** Donde un ítem no último tenga `href`, el `Breadcrumb` deberá renderizarlo como `<a class="breadcrumb__link" target="_blank" rel="noopener noreferrer">` con ese `href`.
- **R7.** Si un ítem no último no tiene `link` ni `href`, entonces el `Breadcrumb` deberá renderizarlo como `<span class="breadcrumb__link">` sin `href`.
- **R8.** Donde un ítem tenga `icon`, el `Breadcrumb` deberá renderizar un `app-icon` decorativo (`aria-hidden="true"`) con ese `name` antes del `label`, dentro del enlace, span o actual.
- **R9.** El `Breadcrumb` deberá renderizar tras el enlace o span de cada ítem no último un `app-icon` `chevron_right` con clase `breadcrumb__sep` y `aria-hidden="true"`; el último ítem no deberá llevar separador.
- **R10.** El tipo `BreadcrumbItem` deberá impedir en compilación que un ítem tenga `link` y `href` a la vez.
- **R11.** El `Breadcrumb` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `breadcrumb.css`.

## Data model

```ts
// src/app/shared/breadcrumb/breadcrumb.ts
export type BreadcrumbItem = { label: string; icon?: string } & (
  | { link: string | readonly unknown[]; href?: never }
  | { href: string; link?: never }
  | { link?: never; href?: never }
);

export class Breadcrumb {
  // inputs: items: BreadcrumbItem[] (required) · variant: 'default' | 'bar' = 'default'
  // host: class 'breadcrumb', role 'navigation', aria-label 'Ruta de navegación', data-variant
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `breadcrumb.css` del DS a `src/styles/blocks/`, sin cambios; `@import` en `src/styles.css` tras `empty-state.css`. `npm run build` sin errores (R11).
2. `breadcrumb.spec.ts` con host de test y `provideRouter([])`: un test por R1–R9; R10 con `// @ts-expect-error` en un ítem con `link` y `href`. Fallan.
3. Crear `Breadcrumb` + `BreadcrumbItem` (`templateUrl: './breadcrumb.html'`, `imports: [Icon, RouterLink]`). Template: `@for` con `$last`; último `span.breadcrumb__current`; si no, `@if (item.link)` `a[routerLink]`, `@else if (item.href)` `a[href][target=_blank][rel]`, `@else` `span.breadcrumb__link`; icono opcional y separador en no últimos. Tests en verde.
4. Demo: sección `breadcrumb` en `demo-page.html` (tras EmptyState) y `{ id: 'breadcrumb', name: 'Breadcrumb' }` en `SECTIONS`. Copy del preview DS: normal «Inicio» (`home`, `link: '/demo'`) › «Calendario» (`link: '/demo'`) › «Octubre 2026»; `variant="bar"` «Maham» (sin enlace, R7) › «Exámenes» (`edit_calendar`, actual); externo «Ayuda» (`href: 'https://example.com'`) › «Atajos de teclado».
5. Playwright en `/demo`: hover subraya y pasa a `color-ink`, focus-visible muestra anillo, variante barra con borde, enlace externo abre pestaña nueva, consola limpia.
6. Marcar «Breadcrumb» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R10.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/breadcrumb.css` y el original del DS no muestra diferencias.
- [x] `src/app/shared/breadcrumb/` no declara `styles` ni `styleUrl` (R11).
- [x] Host con `class="breadcrumb"`, `role="navigation"`, `aria-label="Ruta de navegación"`; `data-variant="bar"` solo con `variant="bar"` (R1, R2).
- [x] Tres ítems renderizan `ol.breadcrumb__list` con tres `li.breadcrumb__item` en orden; el último es `span.breadcrumb__current[aria-current=page]` aunque tenga `link` (R3, R4).
- [x] Ítem con `link: '/semana'` renderiza `a.breadcrumb__link[href="/semana"]` (R5).
- [x] Ítem con `href` renderiza `a.breadcrumb__link` con ese `href`, `target="_blank"` y `rel="noopener noreferrer"` (R6).
- [x] Ítem intermedio sin `link` ni `href` renderiza `span.breadcrumb__link` sin `href` (R7).
- [x] `icon` añade `app-icon[aria-hidden=true]` antes del texto (R8).
- [x] Cada ítem no último va seguido de `app-icon.breadcrumb__sep[aria-hidden=true]` `chevron_right`; el último no (R9).
- [x] Ítem con `link` y `href` no compila (`@ts-expect-error` en el spec) (R10).
- [x] `/demo` muestra la sección Breadcrumb con las variantes del paso 4 y aparece en el índice.
- [x] Ítem «Breadcrumb» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** input `items: BreadcrumbItem[]`, como el DS. **No:** proyección de contenido (más código: separadores y detección del último).
- **Sí:** `link` (RouterLink) y `href` (externo), unión discriminada en el tipo. **No:** solo uno de los dos. **No:** precedencia en runtime (`link` gana): el error sale en compilación.
- **Sí:** `href` con `target="_blank"` + `rel="noopener noreferrer"`. **No:** misma pestaña.
- **Sí:** intermedio sin destino como `span.breadcrumb__link`. **No:** `href="#"` del DS (navega en Angular). **No:** `span.breadcrumb__current` (parece la página actual). **No:** exigir destino en el tipo.
- **Sí:** clase, `role="navigation"` y `aria-label` en el host `app-breadcrumb`, patrón de host con clase de los demás componentes. **No:** `<nav>` interno (el bloque CSS y `data-variant` irían en un hijo, rompe el patrón). **No:** selector `nav[app-breadcrumb]` (el consumidor tendría que escribir el `nav`).
- **Sí:** `variant: 'default' | 'bar'` local; `data-variant` solo en `bar`, como el DS.
- **No:** `data-force`: ningún componente del repo lo soporta; la demo usa hover/focus reales.
- **Sí:** CSS copiado literal (incluye reglas `data-force` sin uso).

## Risks

| Riesgo | Mitigación |
| --- | --- |
| El CSS literal da hover subrayado y `cursor: pointer` a `span.breadcrumb__link`, que no navega | Aceptado; el DS recomienda que los intermedios naveguen. Si molesta, spec aparte (pedir al DS o regla `:is(a)`). |
| `role="navigation"` en un elemento custom: algún lector de pantalla podría anunciarlo distinto a `<nav>` | Rol ARIA válido y equivalente; se comprueba en el árbol de accesibilidad de Playwright. |
| Enlaces de la demo a `/demo` recargan la misma ruta | Sin efecto visible; solo sirven para ver estados. |

## What is **not** in this spec

- `data-force`; `onClick` por ítem; límite de niveles o iconos por código; `aria-label` configurable; colapso de niveles.
