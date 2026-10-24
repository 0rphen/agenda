# SPEC 12 — Componente Button

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 02, SPEC 03
> **Date:** 2026-10-23
> **Objective:** Crear `app-button` como componente Angular tonto que refleja el Button del DS Agenda (`<button class="button">` con variante, tamaño, iconos, ancho completo, `disabled` y `loading` con Spinner, que emite `clicked` solo cuando la acción está disponible).

## Scope

**In:**

- Bloque CSS `src/styles/blocks/button.css`: copia literal del DS. Importado en `src/styles.css` tras `skeleton.css`.
- `src/app/shared/button/button.ts` — componente `Button`, selector `app-button`, template externo `button.html` (multilínea, SPEC 08).
- Test Vitest: `button.spec.ts`.
- Marcar «Button» en `TODO.md`.

**Out of scope (para specs futuros):**

- `<a class="button">` para navegación: SPEC 13 (ítem ButtonLink en `TODO.md`).
- Prop `state` / `data-force` (README DS: solo vitrinas).
- Input `ariaLabel`: el texto proyectado es el nombre accesible; solo icono = IconButton.
- IconButton: su propio spec.
- Ruta o página demo.

## Requisitos (EARS)

- **R1.** El `app-button` deberá renderizar un único `<button class="button">` y proyectar su contenido dentro de un `<span>` hijo de ese botón.
- **R2.** El `<button>` deberá exponer `type` con el input `type` (`button` | `submit`); donde no se indique, `button`.
- **R3.** Donde `variant` sea `accent`, `secondary`, `ghost`, `ghost-danger` o `danger`, el `<button>` deberá exponer `data-variant` con ese valor; donde sea `primary` (por defecto), no deberá exponerlo.
- **R4.** Donde `size` sea `s` o `l`, el `<button>` deberá exponer `data-size` con ese valor; donde sea `m` (por defecto), no deberá exponerlo.
- **R5.** Mientras `block` sea `true`, el `<button>` deberá exponer `data-block` vacío; si no, no deberá exponerlo.
- **R6.** Donde haya `icon` y no esté `loading`, el `<button>` deberá renderizar `app-icon` con ese nombre antes del `<span>`.
- **R7.** Donde haya `iconEnd`, el `<button>` deberá renderizar `app-icon` con ese nombre después del `<span>`, también mientras `loading`.
- **R8.** Mientras `disabled` sea `true`, el `<button>` deberá tener el atributo nativo `disabled`.
- **R9.** Mientras `loading` sea `true`, el `<button>` deberá exponer `data-loading` vacío, `aria-busy="true"` y `aria-disabled="true"`, sin `disabled` nativo (sigue enfocable).
- **R10.** Mientras `loading` sea `true`, el `<button>` deberá renderizar `app-spinner` en lugar del icono inicial, con `size` `m` si `size` es `l` y `s` en otro caso, y `label` = `loadingLabel` (por defecto el del Spinner, `Cargando`).
- **R11.** Cuando el usuario hace clic en el `<button>`, el `app-button` deberá emitir `clicked` con el `MouseEvent`.
- **R12.** Mientras `loading`, cuando el usuario hace clic, el `app-button` no deberá emitir `clicked` y deberá llamar a `preventDefault()` (un `type="submit"` no envía el formulario).
- **R13.** Mientras `disabled`, cuando el usuario hace clic, el `app-button` no deberá emitir `clicked`.
- **R14.** El `app-button` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `button.css`.

## Data model

```ts
// src/app/shared/button/button.ts
type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'ghost-danger' | 'danger';
type ButtonSize = 's' | 'm' | 'l';
// inputs: variant: ButtonVariant = 'primary' · size: ButtonSize = 'm' · type: 'button' | 'submit' = 'button'
//         icon?: string · iconEnd?: string · block = false · disabled = false · loading = false
//         loadingLabel?: string
// output: clicked: MouseEvent
// imports: Icon (src/app/shared/icon/icon.ts), Spinner (src/app/shared/spinner/spinner.ts)
```

## Implementation plan

1. Copiar literal `button.css` del DS (`project/assets/Code/styles/blocks/button.css`) a `src/styles/blocks/`. `@import` en `src/styles.css` tras `skeleton.css`. `npm run build` sin errores (R14).
2. Crear `Button` (`templateUrl: './button.html'`, imports `Icon`, `Spinner`). Template: `<button class="button">` con `[attr.type]`, `[attr.data-variant]` (`primary` → `null`), `[attr.data-size]` (`m` → `null`), `[attr.data-block]`, `[disabled]`, `[attr.data-loading]`, `[attr.aria-busy]`, `[attr.aria-disabled]`, `(click)="onClick($event)"`; `@if (loading())` spinner `@else if (icon())` icon; `<span><ng-content /></span>`; `@if (iconEnd())` icon. `onClick`: si `loading` → `preventDefault()` y salir; si no, `clicked.emit(event)` (R1–R13).
3. `button.spec.ts` con host component de test (proyección de texto) y helper `render()` como en `icon.spec.ts`: un test por R1–R13, incluido `type="submit"` + `loading` dentro de `<form>` sin `submit`, y spinner `m` con `size="l"`.
4. Marcar «Button» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R13.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/button.css` y el del DS es vacío.
- [x] `src/app/shared/button/` no declara `styles` ni `styleUrl` (R14).
- [x] `<app-button>Guardar cita</app-button>` renderiza `<button type="button" class="button">` sin `data-variant`/`data-size`/`data-block`, con `<span>Guardar cita</span>`.
- [x] `<app-button variant="accent" size="l" icon="add">Nueva tarea</app-button>` expone `data-variant="accent"`, `data-size="l"` y `app-icon` `add` antes del texto.
- [x] `<app-button loading size="l" iconEnd="expand_more">` muestra `app-spinner` `size="m"` sin icono inicial, conserva `expand_more`, `aria-busy="true"`, `aria-disabled="true"`, no emite `clicked` al clic.
- [x] `<app-button disabled>` tiene `disabled` nativo y no emite `clicked`.
- [x] Sin emojis ni copy por defecto en inglés.

## Decisions

- **Sí:** convenciones de SPEC 02/03/06/07/10/11: `src/app/shared/button/`, clase `Button`, CSS literal del DS, template externo.
- **Sí:** `<app-button>` envuelve `<button>` y expone `clicked`. **No:** `button[app-button]` (host nativo): no se puede bloquear de forma fiable el `(click)` del consumidor en `loading`. Consumidores usan `(clicked)`, no `(click)` sobre `app-button` (burbujea sin filtro).
- **Sí:** el bloque es el `<button>` interno, no el host (excepción a «host = bloque»: el bloque necesita semántica nativa de botón).
- **Sí:** variantes y tamaños del README + CSS (`ghost-danger`; `s|m|l`). **No:** `sm|md|lg` y lista sin `ghost-danger` de `api/components/Button.md` (desfasado).
- **Sí:** `loading` usa `aria-disabled` y no `disabled` (bundle): mantiene foco durante la carga. Clic en `loading` hace `preventDefault()` para no enviar formularios. **No:** solo omitir `onClick` como el bundle (un `submit` enviaría).
- **Sí:** spinner `m` con `size="l"`, `s` en otro caso; `loadingLabel` pasa a `label` del Spinner (bundle).
- **Sí:** `<span>` del texto siempre presente. **No:** detectar proyección vacía; Button sin texto no es caso de uso (IconButton).
- **No:** `state`/`data-force`, `ariaLabel`, `<a>` (SPEC 13), ruta demo.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Host `app-button` inline: `block` (`inline-size: 100%`) dentro de un padre flex/grid resuelve contra el host, no el contenedor | Revisar en el primer uso real con `block` (SaveBar, formularios); si falla, spec propio para `app-button { display: contents }` o similar. |
| Consumidor usa `(click)` en `<app-button>` y salta el filtro de `loading` | Documentado en Decisions; tests solo cubren `clicked`. |
| Resincronizar `button.css` desde el DS con otros atributos | `diff` vacío documentado; tests R3–R5, R9 detectan nombres cambiados. |

## What is **not** in this spec

- `<a class="button">` (SPEC 13); `state`/`data-force`; `ariaLabel`; IconButton; página demo.

Cada uno, si llega, va en su propio spec.
