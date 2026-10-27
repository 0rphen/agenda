# SPEC 61 — Dialog: el submit de un form dentro de app-dialog envía

> **Status:** Implemented
> **Depends on:** SPEC 42/48 (Dialog), SPEC 53 (EventForm), SPEC 54 (TaskForm), SPEC 60 (Dialogs de tarea y cita)
> **Date:** 2026-10-26
> **Objective:** Que el handler `click` del `<dialog>` de `app-dialog` no cancele los clics hechos dentro de la caja, para que el botón submit de un form contenido lo envíe.

## Scope

**In:**

- `dialog.html`: `(click)="onClick($event)"`.
- `dialog.ts`: método `onClick(event: MouseEvent): void`.
- `dialog.spec.ts`: tests de submit dentro del Dialog y de clic dentro sin `preventDefault`.
- Marcar el ítem en `TODO.md`.

**Out of scope:**

- Cambios en la API de `app-dialog` (inputs, outputs, `open`).
- `/demo#dialog`: sin cambio (la API no cambia; el test cubre el submit).
- Cambios en TaskForm, EventForm, facades o páginas.

## Requisitos (EARS)

- **R1.** El handler `click` del `<dialog>` de `app-dialog` no deberá devolver ningún valor (no hará `preventDefault()` sobre ningún clic).
- **R2.** Cuando el usuario pulsa un botón `type="submit"` de un `<form>` proyectado en `app-dialog`, el form deberá emitir `submit`.
- **R3.** Cuando el usuario hace clic en el scrim (`target` = el `<dialog>`) y `closable`, el `app-dialog` deberá cerrarse (`open` = `false`).
- **R4.** Cuando el usuario hace clic dentro de la caja `.dialog`, el `app-dialog` no deberá cerrarse y el evento no deberá quedar con `defaultPrevented`.
- **R5.** Mientras `closable` sea `false`, cuando el usuario hace clic en el scrim, el `app-dialog` no deberá cerrarse.

## Data model

Sin datos nuevos.

```ts
// dialog.ts (+)
protected onClick(event: MouseEvent): void {
  if (event.target === event.currentTarget && this.closable()) this.open.set(false);
}
```

## Implementation plan

1. `dialog.ts` + `dialog.html`: método `onClick` y binding (R1, R3–R5).
2. `dialog.spec.ts`: host con `<form>` + botón submit dentro de `app-dialog`; clic en el botón emite `submit` (R2); clic dentro deja `defaultPrevented` = `false` y Dialog abierto (R4); tests de scrim y `closable=false` siguen en verde (R3, R5).
3. Playwright en `npm start`, 1440 px: `/inicio` abrir tarea, editar título, clic en «Guardar» del TaskForm, Dialog se cierra y el cambio persiste tras recargar; «Nueva cita», rellenar, clic en «Guardar cita», aparece en agenda. `/resumen`: lo mismo desde «Tareas que vencen» y «Nueva cita». Clic en scrim cierra; clic dentro no (R2–R4).
4. `npm test -- --watch=false` y `npm run build` en verde; marcar `TODO.md`.

## Acceptance criteria

- [x] `dialog.html` no tiene expresión `&&` en `(click)`; usa `onClick($event)` (R1).
- [x] Test: submit dentro de `app-dialog` emite `submit` del form (R2).
- [x] Test: clic dentro de `.dialog` no cierra y `defaultPrevented` = `false` (R4).
- [x] Tests existentes de scrim y `closable` siguen pasando (R3, R5).
- [x] Playwright Inicio: clic real en «Guardar» de TaskForm guarda, cierra y persiste; «Guardar cita» de EventForm crea la cita (R2).
- [x] Playwright Resumen: lo mismo (R2).
- [x] Playwright: clic en scrim cierra, clic dentro no (R3, R4).
- [x] `/demo#dialog` sin cambio y sigue funcionando.
- [x] `npm test -- --watch=false` y `npm run build` sin errores ni warnings.
- [x] `TODO.md`: ítem del submit en Dialog marcado.

## Decisions

- **Sí:** método `onClick(event): void` (respuesta del usuario): claro y sin valor de retorno. **No:** ternario inline que devuelve `null`: funciona pero depende de que Angular solo cancele con `=== false`, poco obvio.
- **Sí:** sin cambio en `/demo` (respuesta del usuario): la API no cambia.
- **Sí:** verificar con Playwright en Inicio y Resumen además del test unitario (respuesta del usuario): el bug solo se veía con clic real.
- Efecto colateral aceptado: los demás clics dentro del Dialog (links, checkboxes) dejan de cancelarse también; era el mismo bug.
