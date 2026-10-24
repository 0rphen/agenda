# SPEC 42 — Componente Dialog (con Sheet)

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 12, SPEC 15, SPEC 17
> **Date:** 2026-10-24
> **Objective:** Crear `app-dialog` como diálogo modal que refleja el Dialog del DS Agenda (título, descripción, cuerpo, pie de botones, botón «Cerrar», variantes `sheet` y `full`, `contained` y `static`) sobre el `<dialog>` nativo con `showModal()`, para tener capa superior, fondo inerte y Escape del navegador.

## Scope

**In:**

- Bloque CSS `src/styles/blocks/dialog.css`: copia literal del DS (`project/assets/Code/styles/blocks/dialog.css`) más un bloque `@layer exception` añadido al final que anula los estilos del agente de usuario de `<dialog>` (como `spinner.css`). Importado en `src/styles.css` tras `app-bar.css`.
- Composición `src/styles/composition/stack.css` (`.l-stack`, que usa `.dialog__body`): copia literal del DS, importada tras `grid.css`. `TODO.md` la deja para el primer spec que la consuma.
- `src/app/shared/dialog/dialog.ts` — componente `Dialog` (selector `app-dialog`, template externo `dialog.html`) y directiva `DialogFooter` (`[dialogFooter]`). Reutiliza `app-icon-button`.
- Tests Vitest `dialog.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.css` + `demo-page.spec.ts`: sección Dialog e índice.
- Marcar «Dialog + Sheet» en `TODO.md`.

**Out of scope:**

- Bloquear el scroll del documento con el diálogo abierto.
- Cerrar al pulsar el scrim (el DS no lo define).
- Apilar diálogos (el DS lo prohíbe).
- `EventForm` dentro de la hoja (spec de EventForm).
- Animación de entrada/salida (el DS no la define).

## Requisitos (EARS)

- **R1.** El `app-dialog` deberá renderizar `div.dialog` con `div.dialog__head`, que contiene un `div` con `h2.dialog__title` (`heading`) y, donde haya `description`, `p.dialog__description`; sin `description` no deberá renderizar el `p`.
- **R2.** El `Dialog` deberá proyectar su contenido por defecto en `div.dialog__body.l-stack` tras la cabecera.
- **R3.** Donde el consumidor proyecte contenido marcado con `dialogFooter`, el `Dialog` deberá colocarlo en `div.dialog__foot.l-cluster` con `data-justify="end"` tras el cuerpo; si no hay, no deberá renderizar ese `div`.
- **R4.** Mientras no sea `static`, el `Dialog` deberá envolver `div.dialog` en un `<dialog class="scrim">` con `aria-label` = `heading`.
- **R5.** Donde `static` sea verdadero, el `Dialog` deberá renderizar solo `div.dialog` con `role="dialog"` y `aria-label` = `heading`, sin `<dialog>` ni scrim, visible siempre.
- **R6.** Cuando `open` pasa a verdadero, el `Dialog` deberá abrir el `<dialog>` con `showModal()`; donde `contained` sea verdadero, deberá abrirlo con `show()` y poner `data-contained` en el scrim.
- **R7.** Cuando `open` pasa a falso, el `Dialog` deberá cerrar el `<dialog>` con `close()`.
- **R8.** Cuando el `<dialog>` emite `close` o el usuario pulsa Escape dentro de él, el `Dialog` deberá poner `open` a falso.
- **R9.** Cuando el `Dialog` se abre, deberá llevar el foco al primer control enfocable del cuerpo; si el cuerpo no tiene ninguno, deberá dejar el foco inicial del navegador.
- **R10.** Donde `closable` sea verdadero (por defecto), el `Dialog` deberá mostrar al final de la cabecera un `app-icon-button` con ícono `close`, nombre accesible «Cerrar» y `size="s"`; cuando el usuario lo pulsa, deberá poner `open` a falso.
- **R11.** Donde haya `variant` (`sheet` | `full`), el `Dialog` deberá poner `data-variant` con ese valor en el scrim y en `div.dialog`.
- **R12.** Donde `variant` sea `sheet`, el `Dialog` deberá renderizar `span.dialog__grabber` con `aria-hidden="true"` como primer hijo de `div.dialog`.
- **R13.** El `Dialog` no deberá usar `styleUrl` ni estilos de componente; el aspecto viene de `dialog.css`.

## Data model

```ts
// src/app/shared/dialog/dialog.ts
@Directive({ selector: '[dialogFooter]' })
export class DialogFooter {}

export class Dialog {
  // inputs: heading (required) · description · variant?: 'sheet' | 'full'
  //         contained = false · static = false · closable = true
  // model:  open = false  →  [(open)]
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `dialog.css` del DS sin cambios y añadir al final `@layer exception` para `dialog.scrim`: `max-inline-size`/`max-block-size: none`, `inline-size`/`block-size: auto`, `margin: 0`, `border: 0`, `display: none` sin `[open]` y `::backdrop` transparente (el color lo pone `.scrim`). `@import` en `src/styles.css` tras `app-bar.css` (R13).
2. `dialog.spec.ts` con host de test y stubs de `showModal`/`show`/`close` (jsdom no los implementa): al menos un test por R1–R12.
3. Crear `Dialog` + `DialogFooter` con el patrón de `AppBar`/`AppBarActions`. Template: `ng-template` con la caja (`grabber`, cabecera, cuerpo, pie) pintada dentro de `<dialog class="scrim">` o suelta si `static`. `afterRenderEffect` (solo navegador) sincroniza `open` con `showModal()`/`show()`/`close()` y enfoca el primer control del cuerpo. `(close)` y `(keydown.escape)` ponen `open` a falso.
4. Demo: sección `dialog` tras AppBar, `{ id: 'dialog', name: 'Dialog' }` en `SECTIONS` e `IDS`. Ejemplos del preview DS:
   - «Estático»: «Nueva cita» · «Agenda una reunión, evento o recordatorio.» con Título, Fecha + Hora, Categoría, Lugar o enlace, «Todo el día» y «Enviar recordatorio 15 min antes»; pie Cancelar (`ghost`) · Guardar cita (`check`).
   - «Hoja contenida»: marco `.demo__frame` con hoja `contained` abierta «Eliminar cita» · «“Lanzamiento de Bestbuy” se quitará de tu agenda y avisaremos a los 4 asistentes.»; pie Cancelar (`secondary`) · Eliminar (`danger`, `delete_outline`); botón «Mostrar hoja» para reabrirla.
   - «Modal»: botones «Abrir diálogo», «Abrir hoja» y «Abrir pantalla completa» que abren un `app-dialog` modal real con la variante elegida.
5. Comprobación en `/demo` con Playwright si está disponible (abrir, Escape, foco); si no, SSR de `/demo`.
6. Marcar «Dialog + Sheet» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R12.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/dialog.css` y su original del DS solo muestra el bloque `@layer exception` añadido al final; `stack.css` sin diferencias.
- [x] `src/app/shared/dialog/` no declara `styles` ni `styleUrl` (R13).
- [x] Cabecera, cuerpo y pie proyectados (R1, R2, R3).
- [x] `<dialog>` nativo con `showModal()`/`show()`, cierre sincronizado con `open` y Escape (R4, R6, R7, R8).
- [x] Variante estática sin scrim (R5).
- [x] Foco inicial en el primer control del cuerpo (R9).
- [x] Botón «Cerrar» opcional (R10).
- [x] Variantes `sheet` (con asa) y `full` (R11, R12).
- [x] `/demo` muestra la sección Dialog del paso 4 y aparece en el índice.
- [x] Ítem «Dialog + Sheet» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** `<dialog>` nativo con `showModal()` (capa superior, fondo inerte, Escape del navegador, foco devuelto al cerrar) en vez del `div.scrim` del DS. Elegido por el usuario. Exige un bloque `@layer exception` que anule los estilos UA.
- **Sí:** `contained` abre con `show()` (no modal): `showModal()` lleva el diálogo a la capa superior y no se puede anclar al contenedor. Sin fondo inerte; Escape lo gestiona el componente.
- **Sí:** `model` `open` (`[(open)]`, como `Menu`) + input `closable` (por defecto verdadero) en vez de `onClose`. Elegido por el usuario. `static` ignora `open`.
- **Sí:** input `heading` en vez de `title` (choca con el atributo global HTML; criterio de `Card`/`AppBar`).
- **Sí:** pie por proyección con `[dialogFooter]`, como `[cardActions]`.
- **Sí:** `aria-label` = `heading`, como el DS.
- **No:** cerrar al pulsar el scrim, bloqueo de scroll, animaciones.

## Risks

- jsdom no implementa `showModal`/`show`/`close`: los tests usan stubs; el comportamiento real (fondo inerte, foco devuelto) se comprueba en navegador.
- Con `open` verdadero en el render de servidor, el diálogo no se ve hasta hidratar (`showModal()` solo existe en el navegador).

## What is **not** in this spec

- `EventForm`/`TaskForm` dentro del diálogo, bloqueo de scroll, cierre por scrim.
