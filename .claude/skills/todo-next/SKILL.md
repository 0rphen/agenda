---
name: todo-next
description: Completes the next unchecked item of TODO.md end to end (DS research, spec, one approval gate, implementation, tests, build, commit on spec branch). Semi-autonomous; non-blocking doubts go to PENDING.md.
disable-model-invocation: true
argument-hint: '[texto del ítem de TODO.md | vacío = siguiente pendiente]'
allowed-tools: Read, Glob, Grep, Edit, Write, AskUserQuestion, Artifact, Skill, Bash(git status:*), Bash(git branch:*), Bash(git checkout:*), Bash(git log:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(npx ng test:*), Bash(npm test:*), Bash(npm run build:*), Bash(diff:*), Bash(ls:*), Bash(cat:*), Bash(date:*), Bash(grep:*)
---

# /todo-next — Completar el siguiente ítem de TODO.md

## Contexto de sesión

Fecha (úsala en spec y PENDING.md, nunca la inventes):
!`date +%F`

Rama actual:
!`git branch --show-current`

Working tree:
!`git status --short`

Specs existentes:
!`ls specs/`

Próximos ítems pendientes:
!`grep -n '\- \[ \]' TODO.md | head -3`

---

Flujo **semiautónomo**: un solo bloque de preguntas, un solo gate (aprobar el spec), luego implementación entera sin pausas. Todo lo que no bloquee va a `PENDING.md` en vez de detenerte. Un ítem por invocación.

Responde en español. Sigue `CLAUDE.md` (DS Agenda, EARS, demo-page, CSS) al pie de la letra.

## Fase 0 — Preparación

1. Carga las skills `caveman` y `ponytail` con la herramienta Skill si no están ya cargadas (regla de `CLAUDE.md`).
2. Si el working tree no está limpio o la rama actual no es `master`: para, muestra el estado y pide al usuario que lo resuelva. No hagas stash ni commit por él.

## Fase 1 — Elegir ítem

- Si `$ARGUMENTS` tiene valor, busca en `TODO.md` el ítem `- [ ]` que coincida. Si no existe o ya está marcado, dilo y para.
- Si está vacío, toma el primer `- [ ]` de la lista de arriba.
- Las dependencias van entre paréntesis (p. ej. `Menu (IconButton disparador, teclado)`). Comprueba que cada componente citado existe en `src/app/shared/`. Si falta alguno, para y propone primero el ítem que lo crea.
- Anuncia en una línea qué ítem vas a hacer.

## Fase 2 — Investigar (sin preguntar)

1. DS Agenda (`https://claude.ai/artifact/MdcHTrC5TjmKLyr6EiJbxe`) con Artifact `action: "read"` y `paths`:
   - `project/README.md` (si no lo leíste en esta sesión).
   - `project/api/components/<Comp>.md` si existe; si no, `project/components/<Comp>/README.md` + `preview.html`.
   - CSS del bloque: `project/assets/Code/styles/blocks/<bloque>.css` (y composición/utilidades que use).
   - Nunca supongas tokens ni valores: léelos. `project/tokens.css` del DS está desfasado; manda `src/styles/tokens.css`.
2. Lee los 2 specs más recientes de `specs/` (formato, idioma, encabezados, estilo de criterios).
3. Lee el componente de `src/app/shared/` más parecido (inputs, `host`, `data-*`, test, sección demo) para copiar el patrón.
4. Revisa `PENDING.md` (si existe) por entradas que afecten a este ítem.

## Fase 3 — Preguntas (máx. un bloque)

- Pregunta **solo** lo que cambia archivos o la API pública (inputs/outputs, nombres, qué entra o no en alcance) y no se resuelve leyendo el DS o el código.
- Un único AskUserQuestion, máx. 4 preguntas, recomendación primero con «(Recomendado)».
- Si no hay nada bloqueante, no preguntes.
- Lo no bloqueante: decide con el default más conservador y fiel al DS, regístralo en la sección de decisiones del spec y como `[duda]` en `PENDING.md`.

## Fase 4 — Spec + gate de aprobación

1. Número: el mayor de `specs/` + 1, dos dígitos. Slug kebab-case corto. Fichero `specs/NN-slug.md`.
2. Estructura y estilo idénticos a los últimos specs (cabecera `Status / Depends on / Date / Objective`, Scope In/Out, Requisitos EARS `R1…`, Data model, Implementation plan, Acceptance criteria como `- [ ]`, Decisions, Risks si aplica, What is not in this spec). Plantilla base: `~/.claude/skills/spec/template.md`.
3. Criterios obligatorios: `npm test -- --watch=false` pasa con ≥1 test por requisito; `npm run build` sin errores ni warnings de budget; `diff` CSS local vs DS sin diferencias (si se copia bloque); sin `styles`/`styleUrl` en el componente; sección en `/demo` + índice; ítem marcado en `TODO.md`; sin emojis ni copy en inglés.
4. Escríbelo con `Status: Draft`.
5. Muestra un resumen corto (objetivo, alcance in/out, requisitos R1…, decisiones tomadas sin preguntar) y lanza AskUserQuestion:
   - «Aprobar e implementar (Recomendado)»
   - «Cambiar algo» → aplica lo que diga el usuario (vía «Other»/notas), reescribe y vuelve a preguntar.
   - «Abortar» → deja el spec en Draft, sin rama, y para.
6. Solo tras «Aprobar», cambia el estado a `Approved`. **Nunca saltes este gate.**

## Fase 5 — Implementar sin pausas

1. `git checkout -b spec-NN-slug` (o cambia a ella si existe y revisa `git log` para retomar).
2. Sigue el plan del spec completo, paso a paso, sin pedir confirmación entre pasos.
3. Antes de escribir CSS lee `~/.claude/skills/css-guidelines/SKILL.md`. Bloque CSS = copia literal del DS en `src/styles/blocks/`, importado en `src/styles.css`. Nunca edites `src/styles/tokens.css` a mano.
4. Componente standalone en `src/app/shared/<comp>/` (selector `app-…`, template externo salvo una línea, signals, inputs que reflejan props del DS, `data-*` para variantes). Test Vitest junto al componente. Sección en `src/app/demo/demo-page.html` (+ `.ts`) y en su índice.
5. Si surge una ambigüedad: elige la opción más conservadora/fiel al DS, anótala en `PENDING.md` como `[duda] … (opción tomada: …)` y sigue. Para solo si continuar obligaría a contradecir el spec aprobado: entonces pregunta.
6. Ideas fuera de alcance o mejoras detectadas → `PENDING.md` (`[sugerencia]` / `[pendiente]`), nunca en el código de esta rama.

## Fase 6 — Verificar

1. `npx ng test --watch=false` y `npm run build`.
2. Si fallan, corrige y repite (máx. 3 rondas). Si siguen fallando: para, **sin commit**, muestra la salida relevante y anota el bloqueo en `PENDING.md`.
3. Repasa cada criterio de aceptación contra el código real; marca `[x]` solo los verificados.

## Fase 7 — Cerrar

1. `TODO.md`: marca el ítem `- [x] … (SPEC NN)`.
2. Spec: criterios marcados y `Status: Implemented`.
3. Commit único en la rama, estilo del repo:
   `feat: <resumen en español> (spec NN)` (o `fix:`/`refactor:` según el caso), terminado con la línea de atribución Co-Authored-By indicada por el sistema.
4. **No merges, no push, no remotos.**
5. Reporte final (conciso):
   - Ítem y spec (`specs/NN-slug.md`), rama `spec-NN-slug`.
   - Archivos creados/cambiados.
   - Entradas nuevas en `PENDING.md`.
   - Siguiente comando: `git checkout master && git merge --no-ff spec-NN-slug`, luego `/todo-next`.

## PENDING.md

Créalo en la raíz si no existe. Solo añade, nunca borres ni reescribas entradas previas; promoverlas a `TODO.md` lo decide el usuario. Va en el mismo commit del ítem.

```markdown
# PENDING — candidatos para TODO.md

## SPEC NN — <Comp> (YYYY-MM-DD)

- [duda] <pregunta> (opción tomada: <qué se hizo y por qué>)
- [sugerencia] <mejora fuera de alcance>
- [pendiente] <trabajo que queda para otro spec>
```

## Reglas duras

- Nunca merge, push ni crear remoto.
- Nunca saltar el gate de aprobación del spec.
- Un ítem por invocación.
- Implementar lo que dice el spec aprobado; cambios de criterio van al spec o a `PENDING.md`, no al código por sorpresa.
- Copy en español, tuteo, sentence case, 24 h, sin emojis. Solo tokens, sin colores literales.
