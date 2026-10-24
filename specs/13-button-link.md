# SPEC 13 — Componente ButtonLink

> **Status:** Implemented
> **Depends on:** SPEC 02, SPEC 12
> **Date:** 2026-10-23
> **Objective:** Crear `a[app-button-link]` como componente Angular tonto que da a un `<a>` nativo el aspecto del Button del DS Agenda (bloque `.button`, variante, tamaño, iconos y ancho completo) para navegar con `routerLink` o `href`.

## Scope

**In:**

- `src/app/shared/button-link/button-link.ts` — componente `ButtonLink`, selector `a[app-button-link]`, template externo `button-link.html` (multilínea, SPEC 08).
- Exportar `ButtonVariant` y `ButtonSize` desde `src/app/shared/button/button.ts` y reutilizarlos.
- Test Vitest: `button-link.spec.ts`.
- Marcar «ButtonLink» en `TODO.md`.

**Out of scope (para specs futuros):**

- `disabled` y `loading`: un enlace no se deshabilita; si no se puede navegar, el consumidor no lo pinta. `button.css` no cubre `<a>` deshabilitado.
- Inputs de navegación (`to`, `queryParams`, `target`…): el consumidor los pone directo en el `<a>`.
- Prop `state` / `data-force` (solo vitrinas).
- Cambios en `button.css`: ya trae `text-decoration: none` para `<a>`.
- Ruta o página demo.

## Requisitos (EARS)

- **R1.** El `ButtonLink` deberá aplicarse solo a elementos `<a>` con el atributo `app-button-link`, y el host deberá tener la clase `button`.
- **R2.** El `ButtonLink` deberá proyectar su contenido dentro de un `<span>` hijo del `<a>`.
- **R3.** Donde `variant` sea `accent`, `secondary`, `ghost`, `ghost-danger` o `danger`, el `<a>` deberá exponer `data-variant` con ese valor; donde sea `primary` (por defecto), no deberá exponerlo.
- **R4.** Donde `size` sea `s` o `l`, el `<a>` deberá exponer `data-size` con ese valor; donde sea `m` (por defecto), no deberá exponerlo.
- **R5.** Mientras `block` sea `true`, el `<a>` deberá exponer `data-block` vacío; si no, no deberá exponerlo.
- **R6.** Donde haya `icon`, el `<a>` deberá renderizar `app-icon` con ese nombre antes del `<span>`.
- **R7.** Donde haya `iconEnd`, el `<a>` deberá renderizar `app-icon` con ese nombre después del `<span>`.
- **R8.** El `ButtonLink` deberá conservar los atributos que el consumidor ponga en el `<a>` (`href`, `target`, `aria-current`…) sin modificarlos.
- **R9.** Donde el consumidor ponga `routerLink` en el mismo `<a>`, el `<a>` deberá exponer el `href` que genera `RouterLink`.
- **R10.** El `ButtonLink` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `button.css`.

## Data model

```ts
// src/app/shared/button/button.ts: pasan a `export type`
export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'ghost-danger' | 'danger';
export type ButtonSize = 's' | 'm' | 'l';

// src/app/shared/button-link/button-link.ts
// selector: 'a[app-button-link]' · host: { class: 'button', [attr.data-variant], [attr.data-size], [attr.data-block] }
// inputs: variant: ButtonVariant = 'primary' · size: ButtonSize = 'm'
//         icon?: string · iconEnd?: string · block = false
// imports: Icon (src/app/shared/icon/icon.ts)
```

## Implementation plan

1. En `button.ts`, `export` en `ButtonVariant` y `ButtonSize`. Tests de Button siguen en verde.
2. Crear `ButtonLink` (`templateUrl: './button-link.html'`, imports `Icon`). Host binding: `class: 'button'`, `[attr.data-variant]` (`primary` → `null`), `[attr.data-size]` (`m` → `null`), `[attr.data-block]`. Template: `@if (icon())` icon; `<span><ng-content /></span>`; `@if (iconEnd())` icon (R1–R8, R10).
3. `button-link.spec.ts` con host component de test (`<a app-button-link href="/semana">…</a>`) y helper `render()` como en `button.spec.ts`: un test por R1–R8; un test con `provideRouter([])` + `RouterLink` en el host (`<a app-button-link routerLink="/semana">`) que comprueba `href="/semana"` (R9).
4. Marcar «ButtonLink» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R9.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `src/app/shared/button-link/` no declara `styles` ni `styleUrl` (R10); `button.css` sin cambios.
- [x] `<a app-button-link href="/semana">Ver semana</a>` renderiza `<a class="button" href="/semana">` sin `data-variant`/`data-size`/`data-block`, con `<span>Ver semana</span>`.
- [x] `<a app-button-link variant="ghost" size="s" iconEnd="chevron_right" href="/tareas">` expone `data-variant="ghost"`, `data-size="s"` y `app-icon` `chevron_right` después del texto.
- [x] `<a app-button-link routerLink="/semana">` expone `href="/semana"`.
- [x] Sin emojis ni copy por defecto en inglés.

## Decisions

- **Sí:** selector de atributo `a[app-button-link]`; host = bloque `.button` (como Badge/Avatar). Consumidor pone `routerLink`/`href`/`target` directo en el `<a>`. **No:** wrapper `<app-button-link [to]>`: obliga a reexponer cada input de `RouterLink`.
- **Sí:** `ButtonLink` no importa `RouterLink` ni depende del Router: sirve igual con `href` externo.
- **Sí:** solo inputs visuales (`variant`, `size`, `icon`, `iconEnd`, `block`). **No:** `disabled`/`loading`: `:disabled` no aplica a `<a>` y el DS no tiene estilo para ello.
- **Sí:** directorio propio `src/app/shared/button-link/`; tipos `ButtonVariant`/`ButtonSize` importados de `button.ts`. **No:** duplicar los tipos.
- **Sí:** misma estructura interna que Button (icono, `<span>` con texto, icono final) para que ambos se vean idénticos.
- **No:** `state`/`data-force`, inputs de navegación, ruta demo.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `RouterLink` añade `routerLinkActive`/`aria-current` y el consumidor espera estilo activo | `button.css` no define estado activo de navegación; si hace falta, spec propio. |
| Divergencia futura entre template de Button y ButtonLink | Tests R2, R6, R7 replican los de Button. |

## What is **not** in this spec

- `disabled`/`loading` en enlaces; inputs de navegación; `state`/`data-force`; cambios en `button.css`; página demo.

Cada uno, si llega, va en su propio spec.
