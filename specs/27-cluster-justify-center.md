# SPEC 27 — Regla `data-justify="center"` en `.l-cluster`

> **Status:** Implemented
> **Depends on:** SPEC 26
> **Date:** 2026-10-23
> **Objective:** Añadir a `cluster.css` la regla `data-justify='center'` que el DS usa en el markup de EmptyState pero no define, para que las acciones queden centradas también cuando pasan a varias líneas.

## Scope

**In:**

- `src/styles/composition/cluster.css`: una regla nueva `&[data-justify='center'] { justify-content: center; }` junto a `end`/`between`. Es una divergencia local respecto al DS, anotada con un comentario de una línea.
- `TODO.md`: marcar el ítem «EmptyState: `data-justify="center"`…» con `(SPEC 27)` y añadir en «Fuera de alcance» o al final una nota: «Pedir al DS la regla `center` en `cluster.css`».

**Out of scope:**

- Editar el artifact del DS Agenda (solo se anota).
- Cambiar el template de `app-empty-state`, su test o `empty-state.css` (el atributo ya está, R8 de SPEC 26).
- Otros valores de `data-justify` (`start`, `around`…).
- Test Vitest nuevo (jsdom no calcula layout).
- Cambios en `demo-page.html` (la variante «No pudimos cargar tu agenda» con dos acciones ya cubre el caso).

## Requisitos (EARS)

- **R1.** Donde un `.l-cluster` tenga `data-justify="center"`, el `.l-cluster` deberá tener `justify-content: center`.
- **R2.** Mientras las acciones de un `app-empty-state` ocupen varias líneas, cada línea deberá quedar centrada en el eje horizontal del `.l-cluster`.
- **R3.** El `cluster.css` deberá conservar sin cambios el resto de reglas copiadas del DS (`data-gap`, `end`, `between`, `nowrap`, `align`).
- **R4.** La regla nueva deberá vivir en `@layer composition`, dentro del bloque `.l-cluster` existente.

## Data model

No introduce datos nuevos.

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. En `src/styles/composition/cluster.css`, tras `&[data-justify='between']`, añadir `&[data-justify='center'] { justify-content: center; }` con el comentario `/* divergencia local: el DS usa center en EmptyState sin definir la regla */` (R1, R3, R4).
2. Playwright en `/demo`: con el viewport a un ancho que obligue a «Reintentar» y «Ver ayuda» a ir en dos líneas (p. ej. 20rem / 320px), comprobar que `getComputedStyle(cluster).justifyContent === 'center'` y que el botón de cada línea queda centrado (margen izquierdo ≈ margen derecho dentro del `.l-cluster`, ±1px). Con el viewport ancho, comprobar que siguen en una fila centrada. Consola limpia (R1, R2).
3. Actualizar `TODO.md` según el Scope. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [ ] `diff` entre `src/styles/composition/cluster.css` y el `cluster.css` del DS muestra solo la regla `center` y su comentario (R3, R4).
- [ ] En `/demo`, `div.l-cluster[data-justify=center]` de EmptyState tiene `justify-content: center` calculado (R1).
- [ ] Con viewport estrecho, «Reintentar» y «Ver ayuda» van en dos líneas y cada una queda centrada (±1px) (R2).
- [ ] Con viewport ancho, las dos acciones siguen en una fila centrada (R2).
- [ ] Consola de `/demo` sin errores.
- [ ] `npm test -- --watch=false` pasa.
- [ ] `npm run build` termina sin errores ni warnings de budget.
- [ ] `TODO.md`: ítem marcado con `(SPEC 27)` y nota para pedir la regla al DS.

## Decisions

- **Sí:** añadir la regla en `cluster.css` local. El markup del DS React (`bundle.js`, EmptyState) usa `data-justify: 'center'`, así que el atributo es intencionado y lo que falta es la regla. **No:** quitar el atributo (con wrap, las líneas quedan a la izquierda). **No:** `justify-content` en `empty-state.css` (el atributo seguiría sin efecto y la regla quedaría acoplada al bloque).
- **Sí:** anotar la divergencia (comentario + `TODO.md`) para pedirla al DS. **No:** editar el artifact del DS desde aquí (cambio externo y compartido).
- **Sí:** verificar con Playwright. **No:** test Vitest (jsdom no aplica layout ni `justify-content` calculado útil).
- SPEC 26 dejaba `cluster.css` idéntico al DS. Ese criterio deja de cumplirse a propósito, solo por esta regla.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Al copiar `cluster.css` del DS de nuevo, se pierde la regla | Comentario en la regla + nota en `TODO.md`; desaparece cuando el DS la incorpore. |
| La demo no llega a hacer wrap en el ancho elegido | El paso 2 ajusta el viewport hasta que las acciones vayan en dos líneas antes de medir. |

## What is **not** in this spec

- Editar el DS; cambiar EmptyState; otros valores de `data-justify`; test Vitest; cambios en la demo.
