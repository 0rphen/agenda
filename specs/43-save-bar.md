# SPEC 43 — Componente SaveBar

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 12, SPEC 15
> **Date:** 2026-10-24
> **Objective:** Crear `app-save-bar`, barra de guardado de formularios largos pegada al borde inferior, con estados `dirty`, `saving` y `saved`, que refleja el SaveBar del DS Agenda (mensaje, «Descartar», «Guardar cambios» y confirmación).

## Scope

**In:**

- Bloque CSS `src/styles/blocks/save-bar.css`: copia literal del DS (`project/assets/Code/styles/blocks/save-bar.css`), importado en `src/styles.css` tras `dialog.css`.
- `src/app/shared/save-bar/save-bar.ts` + `save-bar.html` — componente `SaveBar` (selector `app-save-bar`). Reutiliza `app-button` y `app-icon`.
- Tests Vitest `save-bar.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts`: sección SaveBar e índice.
- Marcar «SaveBar» en `TODO.md`.

**Out of scope:**

- Ocultar «Cambios guardados» pasado un tiempo (lo decide el consumidor, como la demo del DS).
- Aviso al salir con cambios sin guardar.
- Calcular `dirty` desde Signal Forms (lo pasa el consumidor).
- Pantalla de Ajustes.

## Requisitos (EARS)

- **R1.** Si no es `dirty`, ni `saved`, ni `static`, entonces el `app-save-bar` no deberá renderizar nada.
- **R2.** Mientras se muestre, el `app-save-bar` deberá renderizar `div.save-bar` con `role="region"` y `aria-label="Cambios"`.
- **R3.** Mientras no sea `saved`, el `SaveBar` deberá mostrar `span.save-bar__msg` con ícono `edit` y `message` (por defecto «Tienes cambios sin guardar»).
- **R4.** Mientras no sea `saved`, el `SaveBar` deberá mostrar `span.l-cluster` con `data-gap="2xs"` que contiene un `app-button` `ghost` «Descartar» y un `app-button` con ícono `check` y `saveLabel` (por defecto «Guardar cambios»).
- **R5.** Cuando el usuario pulsa «Descartar», el `SaveBar` deberá emitir `cancelClicked`; cuando pulsa el botón de guardar, deberá emitir `saveClicked`.
- **R6.** Mientras `saving`, el `SaveBar` deberá poner «Descartar» `disabled` y el botón de guardar en `loading`, sin emitir `saveClicked`.
- **R7.** Donde `saved` sea verdadero, el `SaveBar` deberá poner `data-state="saved"` y mostrar solo `span.save-bar__msg` con ícono `check_circle` y `savedMessage` (por defecto «Cambios guardados»), sin botones; `saved` manda sobre `dirty`.
- **R8.** Donde `static` sea verdadero, el `SaveBar` deberá renderizarse aunque no haya `dirty` ni `saved`.
- **R9.** El `SaveBar` no deberá usar `styleUrl` ni estilos de componente; el aspecto viene de `save-bar.css`.

## Data model

```ts
// src/app/shared/save-bar/save-bar.ts
export class SaveBar {
  // inputs:  dirty · saving · saved · static (alias de isStatic) — booleanAttribute, false
  //          message = 'Tienes cambios sin guardar' · savedMessage = 'Cambios guardados'
  //          saveLabel = 'Guardar cambios'
  // outputs: saveClicked: MouseEvent · cancelClicked: MouseEvent
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `save-bar.css` del DS sin cambios e importarlo en `src/styles.css` tras `dialog.css` (R9).
2. Crear `SaveBar` con el markup de `function SaveBar` del `bundle.js` del DS: `@if` con `div.save-bar` interno y host `display: contents` (para que `sticky` se pegue al contenedor real).
3. `save-bar.spec.ts`: al menos un test por R1–R8.
4. Demo: sección `save-bar` tras Dialog, `{ id: 'save-bar', name: 'SaveBar' }` en `SECTIONS` e `IDS`. Ejemplos del preview DS, cada uno en su `div.l-stack`: «Cambios pendientes» (`static dirty`), «Guardando» (`static dirty saving`), «Guardado» (`static saved`) e «Interactivo» (guardar 900 ms, confirmar 1800 ms y volver a cambios pendientes; descartar vuelve a cambios pendientes en 1200 ms).
5. Comprobación en `/demo` con Playwright (sticky dentro de un contenedor con scroll).
6. Marcar «SaveBar» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R8.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/save-bar.css` y su original del DS sin diferencias.
- [x] `src/app/shared/save-bar/` no declara `styles` ni `styleUrl` (R9).
- [x] Sin render sin estado salvo `static` (R1, R8).
- [x] Región «Cambios» con mensaje, «Descartar» y «Guardar cambios» (R2, R3, R4).
- [x] Salidas `cancelClicked`/`saveClicked` y estado `saving` (R5, R6).
- [x] Confirmación `saved` sin botones (R7).
- [x] `/demo` muestra la sección SaveBar del paso 4 y aparece en el índice.
- [x] Ítem «SaveBar» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** host `display: contents` con `div.save-bar` interno. `position: sticky` se acota a la caja del padre; con el host como caja, la barra no se pegaría. Mantiene el CSS literal del DS y permite no renderizar nada (R1). Descartado: `class: 'save-bar'` en el host, que pediría una regla `[hidden]` divergente.
- **Sí:** salidas `saveClicked`/`cancelClicked` (patrón `backClicked` de `AppBar`; `saved` ya es input).
- **Sí:** `static` con alias, como `Dialog`/`Menu`.
- **Sí:** `loadingLabel` del botón queda en «Cargando», como el DS.
- **No:** temporizador para ocultar `saved`, aviso al salir.

## Risks

- `display: contents` en el host: el elemento `app-save-bar` no tiene caja; cualquier estilo puesto en él no se aplica.

## What is **not** in this spec

- Pantalla de Ajustes, conexión con Signal Forms, aviso de cambios sin guardar al navegar.
