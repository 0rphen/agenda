# SPEC 50 — Menu con alineación automática y SaveBar que oculta «Cambios guardados»

> **Status:** Draft
> **Depends on:** SPEC 30 (Menu), SPEC 43 (SaveBar)
> **Date:** 2026-10-24
> **Objective:** Que el panel de `app-menu` cambie de lado cuando se sale de la pantalla (sugerencia de SPEC 30) y que `app-save-bar` oculte «Cambios guardados» tras un tiempo sin depender del consumidor (pendiente de SPEC 43).

## Scope

**In:**

- `menu/menu.ts`: alineación efectiva (`align` o su opuesta) medida al abrir.
- `save-bar/save-bar.ts` + `.html`: input `savedTimeout` y estado interno que oculta el mensaje de guardado.
- Tests en `menu.spec.ts` y `save-bar.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts`: menú pegado al borde derecho en `#menu`; quitar el `setTimeout` que apaga `saveSaved` en `save()`.
- `PENDING.md`: marcar `[hecho]` los ítems resueltos de SPEC 30 y 43.

**Out of scope:**

- Recolocar en vertical (abrir hacia arriba) y respetar contenedores con `overflow` (solo viewport).
- Aviso al salir con cambios sin guardar (necesita rutas).

## Requisitos (EARS)

- **R1.** Mientras el `app-menu` está cerrado o es `static`, el `app-menu` deberá pintar `data-align` según `align` como hoy.
- **R2.** Cuando el `app-menu` se abre y el rectángulo de `.menu__panel` sale del viewport por el borde inline del lado de `align`, el `app-menu` deberá pintar el panel con la alineación opuesta.
- **R3.** Cuando el `app-menu` se cierra, deberá volver a la alineación de `align` para la siguiente apertura.
- **R4.** El `app-save-bar` deberá aceptar `savedTimeout` (ms, por defecto `1800`).
- **R5.** Mientras `saved` es verdadero y no `static`, cuando pasan `savedTimeout` ms, el `app-save-bar` deberá dejar de mostrar el mensaje de guardado (y la barra, si no hay `dirty`).
- **R6.** Donde `savedTimeout` sea `0`, el `app-save-bar` no deberá ocultar el mensaje.
- **R7.** Cuando `saved` pasa de falso a verdadero de nuevo, el `app-save-bar` deberá volver a mostrar el mensaje y reiniciar el temporizador.
- **R8.** El temporizador solo deberá correr en el navegador (no en SSR/prerender) y cancelarse al destruir el componente o al cambiar `saved`.
- **R9.** En `/demo`, `#menu` deberá incluir un menú alineado a `end` junto al borde izquierdo (o `start` junto al derecho) que demuestre el cambio, y `#save-bar` deberá dejar de apagar `saveSaved` con su propio `setTimeout`.

## Implementation plan

1. `Menu`: `private readonly flipped = signal(false)`; host `[attr.data-align]` usa `effectiveAlign()` (`computed`: `align()` o su opuesta si `flipped()`). En el `afterRenderEffect` existente, al abrir, medir `.menu__panel` con `getBoundingClientRect()` frente a `document.documentElement.clientWidth` y poner `flipped`; al cerrar, `flipped.set(false)` (R1–R3). Comentario `// shortcut: solo viewport, no contenedores con overflow; ampliar si lo pide una pantalla`.
2. `SaveBar`: `readonly savedTimeout = input(1800)`; `protected readonly showSaved = linkedSignal(() => this.saved())`; `afterRenderEffect((onCleanup) => { … setTimeout(() => this.showSaved.set(false), ms); onCleanup(() => clearTimeout(id)); })` saltando `isStatic()` y `ms === 0`; plantilla usa `showSaved()` en lugar de `saved()` (R4–R8).
3. Tests: con `vi.useFakeTimers()` para SaveBar; para Menu, mock de `getBoundingClientRect` del panel (R1–R8).
4. Demo (R9).
5. `PENDING.md`: `[hecho]` en «Reposicionar el panel…» (SPEC 30) y «Ocultar «Cambios guardados» pasado un tiempo» (SPEC 43).

## Acceptance criteria

- [ ] Test: panel que se sale por la derecha con `align="start"` pinta `data-align` de `end` (sin atributo) y vuelve a `start` al cerrar (R1–R3).
- [ ] Test: panel que cabe no cambia `data-align` (R2).
- [ ] Test: `saved` + 1800 ms oculta `.save-bar` (sin `dirty`) (R4, R5); con `savedTimeout=0` sigue visible (R6); `saved` falso→verdadero lo vuelve a mostrar (R7).
- [ ] Revisión: el temporizador está en `afterRenderEffect` con `onCleanup` (R8).
- [ ] Demo `#menu` y `#save-bar` actualizadas; Playwright: el menú pegado al borde abre hacia dentro; la barra muestra «Cambios guardados» y desaparece sola (R9).
- [ ] `npx ng test --watch=false` y `npm run build` verdes; prettier limpio en los ficheros tocados.

## Decisions

- **Sí:** medir solo en horizontal contra el viewport. **No:** Floating UI ni medir contenedores: dependencia nueva para un caso que aún no existe.
- **Sí:** `saved` sigue siendo `input` y el componente oculta con estado interno. **No:** `model()`: pierde `booleanAttribute` y obliga al consumidor a enlazar en dos sentidos.
- **Sí:** 1800 ms por defecto (mismo tiempo que el preview del DS y la demo).

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Parpadeo: el panel se pinta un frame en el lado malo antes de girar | Medir en `afterRenderEffect` antes de pintar el siguiente frame; si se nota, ocultar el panel con `visibility` hasta medir. |
| El consumidor deja `saved` en `true` y luego espera volver a verlo sin pasar por `false` | R7 exige la transición; documentado en el input. |
