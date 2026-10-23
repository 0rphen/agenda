# SPEC 08 — Templates externos para componentes multilínea

> **Status:** Implemented
> **Depends on:** SPEC 03, SPEC 06, SPEC 07
> **Date:** 2026-10-23
> **Objective:** Mover a un `.html` externo (`templateUrl`) todo template de componente que no quepa en una línea, y dejar la regla escrita en `CLAUDE.md`.

## Scope

**In:**

- `src/app/shared/avatar/avatar.ts` → `templateUrl: './avatar.html'` + nuevo `avatar.html`.
- `src/app/shared/avatar/avatar-group.ts` → `templateUrl: './avatar-group.html'` + nuevo `avatar-group.html`.
- `src/app/shared/badge/badge.ts` → `templateUrl: './badge.html'` + nuevo `badge.html`.
- `CLAUDE.md`: regla en la sección Architecture.

**Out of scope:**

- `icon.ts` (`'{{ name() }}'`) y `spinner.ts` (`''`): una línea, se quedan inline.
- Hosts de test en `*.spec.ts` (p. ej. `badge.spec.ts`, `select.spec.ts`): fixtures locales, se quedan como están.
- Cualquier cambio de markup, inputs, host bindings o comportamiento.
- Bug de NumberField en `TODO.md`.

## Requisitos (EARS)

- **R1.** Donde el template de un componente de `src/app` (excluidos `*.spec.ts`) ocupe más de una línea, el componente deberá usar `templateUrl` a un `.html` con el mismo basename en su carpeta.
- **R2.** Donde el template quepa en una línea, el componente podrá mantener `template` inline.
- **R3.** El contenido de cada `.html` nuevo deberá ser el template inline actual, sin la indentación del literal, sin cambios de markup.
- **R4.** El DOM renderizado por `app-avatar`, `app-avatar-group` y `app-badge` no deberá cambiar: los tests existentes deberán pasar sin modificarse.
- **R5.** `CLAUDE.md` deberá recoger la regla R1/R2 para componentes futuros.

## Data model

Sin datos nuevos.

## Implementation plan

1. `avatar.html` con el bloque `@if/@else` actual; en `avatar.ts` cambiar `template` por `templateUrl: './avatar.html'` (R1, R3).
2. Igual para `avatar-group.html` / `avatar-group.ts`, conservando el span `+N` con su formato actual (sin espacios extra en el texto) (R1, R3).
3. Igual para `badge.html` / `badge.ts` (R1, R3).
4. `CLAUDE.md`, tras «Component selector prefix»: `- Templates: inline only if it fits on one line (e.g. '{{ name() }}'); otherwise templateUrl './<basename>.html'. Test host components in *.spec.ts are exempt.` (R5).
5. `npm test -- --watch=false` y `npm run build` en verde (R4).

## Acceptance criteria

- [x] `grep -rn "template: \`" src/app --include=*.ts --exclude=*.spec.ts` no devuelve nada (R1).
- [x] Existen `avatar.html`, `avatar-group.html`, `badge.html` y sus `.ts` usan `templateUrl` (R1).
- [x] `icon.ts` y `spinner.ts` sin cambios (R2).
- [x] `git diff` no toca ningún `*.spec.ts` (R4).
- [x] `npm test -- --watch=false` pasa (R4).
- [x] `npm run build` sin errores ni warnings de budget.
- [x] `CLAUDE.md` contiene la regla (R5).

## Decisions

- **Sí:** criterio «una línea» = el template entero cabe en una línea de código. **No:** umbral por caracteres.
- **Sí:** mismo basename que el `.ts` (`avatar-group.html`), como `text-field.ts/.html` de SPEC 04.
- **No:** mover hosts de test a `.html`: añade archivos sin valor; exentos explícitamente.
- **Sí:** regla en `CLAUDE.md` para que futuros specs la sigan sin repetirla.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Whitespace del texto `+N` en avatar-group cambia el `textContent` | Copiar el formato `>+{{ extra() }}</span` tal cual; test de R12 de SPEC 07 lo detecta. |
| Prettier reformatea el `.html` y mete espacios en el texto | No formatear el `.html` nuevo sin revisar el diff; tests lo detectan. |
