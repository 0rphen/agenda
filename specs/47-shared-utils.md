# SPEC 47 — Sacar funciones y constantes de componentes a shared/utils

> **Status:** Implemented
> **Depends on:** SPEC 46 (layout `shared/components/`, alias `@shared/*`)
> **Date:** 2026-10-24
> **Objective:** Mover toda función y constante de módulo de `src/app/shared/components/` a `src/app/shared/utils/` (ficheros por dominio + `index.ts`), quitar los duplicados de `pad` y `capitalize` e importarlas con el alias `@shared/utils`.

## Scope

**In:**

- `src/app/shared/utils/{time,lanes,text,avatar,alert,dom}.ts` + `utils/index.ts` con `export *` de cada uno.
- Mover funciones: `pad2`, `toMin`, `dayLanes` (`day-view.ts`); `localIso`, `capitalize` (`mini-calendar.ts`, eran locales); `initials`, `tintFor` (`avatar.ts`).
- Mover constantes: `TINTS` (`avatar.ts`), `ICONS` → `ALERT_ICONS` (`alert.ts`), `FOCUSABLE` (`dialog.ts`), `TITLE` → `MONTH_YEAR` y `DATE` → `LONG_DATE` (`mini-calendar.ts`), `DATE` → `LONG_DAY` (`week-strip.ts`).
- Quitar duplicados: `pad` de `localIso` pasa a `pad2`; `date.charAt(0).toUpperCase() + date.slice(1)` de `week-strip.ts` pasa a `capitalize(date)`.
- Mover los `describe('initials')` y `describe('tintFor')` de `components/avatar/avatar.spec.ts` a `utils/avatar.spec.ts`, sin tocar asserts.
- `compilerOptions.paths` en `tsconfig.json`: `@shared/utils` → `./src/app/shared/utils/index.ts`.
- `CLAUDE.md`: `shared/utils/`, alias y regla «nada de funciones ni constantes de módulo en componentes».

**Out of scope:**

- Los 8 `let nextId = 0` de los campos (checkbox, date-field, number-field, select, switch, textarea, time-field, text-field): son estado mutable y se quedan.
- `shared/validation/` (`PHONE`, `DNI_NIE`, `CONTROL_LETTERS`, `isPhone`, `isDniNie`, `phone`, `dniNie`, `fieldError`).
- `demo/demo-page.ts` (datos de ejemplo e `isWeekend`).
- Métodos de clase de los componentes (p. ej. `WeekStrip.dayLabel`).
- Tests nuevos para `pad2`, `toMin`, `dayLanes`, `capitalize` y `localIso`.
- Alias comodín `@shared/utils/*`.
- Cambios de comportamiento, templates, CSS y secciones de la demo.

## Requisitos (EARS)

- **R1.** Los `.ts` (no `.spec.ts`) de `src/app/shared/components/` no deberán declarar a nivel de módulo ninguna `function`, `const` ni `let`, salvo `let nextId = 0;`.
- **R2.** Cada función y constante de la tabla del Data model deberá vivir en el fichero de `src/app/shared/utils/` indicado, con el nombre indicado y el mismo cuerpo.
- **R3.** `src/app/shared/utils/index.ts` deberá reexportar con `export *` todos los ficheros (no `.spec.ts`) de `utils/`, y nada más.
- **R4.** `tsconfig.json` deberá declarar en `compilerOptions.paths` `@shared/utils` → `./src/app/shared/utils/index.ts`.
- **R5.** Cuando un fichero de fuera de `utils/` importa una util, deberá hacerlo desde `@shared/utils`, nunca desde un fichero concreto ni con ruta relativa.
- **R6.** Mientras dos ficheros están en `utils/`, el import entre ellos deberá ser relativo (`lanes.ts` importa `toMin` de `./time`).
- **R7.** `localIso` deberá usar `pad2`; ningún `.ts` de `shared/components/` ni `shared/utils/` deberá definir otro relleno a dos dígitos.
- **R8.** `WeekStrip.dayLabel` deberá usar `capitalize`; ningún `.ts` de `shared/components/` deberá contener `charAt(0).toUpperCase()`.
- **R9.** Los tests de `initials` y `tintFor` deberán vivir en `src/app/shared/utils/avatar.spec.ts` con los mismos asserts, y `components/avatar/avatar.spec.ts` ya no deberá probarlos.
- **R10.** El HTML renderizado, el CSS y el resultado de los tests (451 tests) no deberán cambiar.
- **R11.** `CLAUDE.md` deberá describir `shared/utils/` (ficheros por dominio, `index.ts`), el alias `@shared/utils` y la regla «nada de funciones ni constantes de módulo en componentes, salvo `let nextId`».

## Data model

```jsonc
// tsconfig.json → compilerOptions.paths (se añade a los de SPEC 46)
"@shared/utils": ["./src/app/shared/utils/index.ts"]
```

| Fichero `utils/` | Exporta | Origen |
| --- | --- | --- |
| `time.ts` | `pad2`, `toMin` | `day-view.ts` |
| `time.ts` | `localIso` (era local; usa `pad2`) | `mini-calendar.ts` |
| `time.ts` | `MONTH_YEAR` (era `TITLE`), `LONG_DATE` (era `DATE`, con año) | `mini-calendar.ts` |
| `time.ts` | `LONG_DAY` (era `DATE`, sin año) | `week-strip.ts` |
| `lanes.ts` | `dayLanes` (importa `toMin` de `./time`, `Placed` de `@shared/interfaces`) | `day-view.ts` |
| `text.ts` | `capitalize` (era local) | `mini-calendar.ts` |
| `avatar.ts` | `initials`, `tintFor`; `TINTS` sin exportar | `avatar.ts` |
| `alert.ts` | `ALERT_ICONS` (era `ICONS`; usa `AlertTone` de `@shared/types`) | `alert.ts` |
| `dom.ts` | `FOCUSABLE` | `dialog.ts` |

Los comentarios que acompañan a cada declaración se mueven con ella: «UTC so server and browser…» (formatters), «Algoritmos portados del bundle del DS…» (`initials`/`tintFor`), «Port of the DS dayLanes…».

Consumidores tras el cambio:

| Fichero | Importa de `@shared/utils` |
| --- | --- |
| `components/day-view/day-view.ts` | lo que use de `pad2`, `toMin`, `dayLanes` |
| `components/week-view/week-view.ts` | `dayLanes`, `pad2`, `toMin` (antes de `@shared/components/day-view/day-view`) |
| `components/mini-calendar/mini-calendar.ts` | `capitalize`, `localIso`, `LONG_DATE`, `MONTH_YEAR` |
| `components/week-strip/week-strip.ts` | `capitalize`, `LONG_DAY` |
| `components/avatar/avatar.ts` | `initials`, `tintFor` |
| `components/alert/alert.ts` | `ALERT_ICONS` |
| `components/dialog/dialog.ts` | `FOCUSABLE` |
| `utils/avatar.spec.ts` | `initials`, `tintFor` de `./avatar` (mismo directorio) |

`utils/` importa de `@shared/types` e `@shared/interfaces`; ni `types/` ni `interfaces/` importan de `utils/`.

## Implementation plan

1. Añadir `@shared/utils` a `paths` (R4). Crear `utils/time.ts`, `utils/text.ts` e `utils/index.ts`; mover `pad2`, `toMin`, `localIso`, `capitalize`, `MONTH_YEAR`, `LONG_DATE` y `LONG_DAY`; `localIso` usa `pad2` y `week-strip` usa `capitalize` (R7, R8); apuntar `day-view`, `week-view`, `mini-calendar` y `week-strip` a `@shared/utils` (R5). Tests y build verdes.
2. Crear `utils/lanes.ts` con `dayLanes`, importando `toMin` de `./time` (R6); añadirlo a `index.ts`; apuntar `day-view` y `week-view` (R2, R3, R5). Tests verdes.
3. Crear `utils/avatar.ts` con `TINTS`, `initials` y `tintFor`; mover sus `describe` a `utils/avatar.spec.ts` (R9); añadirlo a `index.ts`; apuntar `avatar.ts`. Tests verdes, mismo número.
4. Crear `utils/alert.ts` (`ALERT_ICONS`) y `utils/dom.ts` (`FOCUSABLE`); añadirlos a `index.ts`; apuntar `alert.ts` y `dialog.ts` (R1, R2). Tests verdes.
5. Actualizar `CLAUDE.md` (R11).
6. Verificar: greps de los criterios vacíos, `npm test -- --watch=false` (451 tests) y `npm run build` verdes, `/demo` carga sin errores en consola (R10).

## Acceptance criteria

- [x] `grep -rnE "^(export )?(const|let|var|function) " src/app/shared/components --include=*.ts | grep -v "\.spec\.ts" | grep -v "let nextId = 0;"` vacío (R1).
- [x] Cada función/constante de la tabla está en su fichero de `utils/` con el nombre indicado y el mismo cuerpo (R2).
- [x] `utils/index.ts` solo contiene `export * from './<fichero>';`, uno por fichero no `.spec.ts` de `utils/` (R3).
- [x] `tsconfig.json` tiene `@shared/utils` en `paths` (R4).
- [x] `grep -rnE "from '@shared/utils/" src` vacío y `grep -rn "from '\.\./" src/app --include=*.ts | grep -v "validation/"` vacío (R5).
- [x] `utils/lanes.ts` importa `toMin` de `./time` (R6).
- [x] `grep -rn "padStart(2" src/app/shared/components src/app/shared/utils` solo devuelve `pad2` en `utils/time.ts` (R7).
- [x] `grep -rn "charAt(0).toUpperCase()" src/app/shared/components` vacío (R8).
- [x] `utils/avatar.spec.ts` contiene los `describe('initials')` y `describe('tintFor')` sin cambios y `components/avatar/avatar.spec.ts` ya no los tiene (R9).
- [x] `npm test -- --watch=false` pasa 451 tests sin cambiar ningún assert (R10).
- [x] `npm run build` termina sin errores ni warnings de budget (R10).
- [x] `/demo` en `npm start` renderiza todas las secciones sin errores en consola (R10).
- [x] `CLAUDE.md` refleja `shared/utils/`, el alias y la regla (R11).

## Decisions

- **Sí:** mover todas las funciones y constantes de módulo, incluidas las locales (`localIso`, `capitalize`, `TINTS`, formatters). **No:** solo las compartidas: deja la regla con excepciones, como se evitó con los types locales en SPEC 46.
- **Sí:** ficheros por dominio (`time`, `lanes`, `text`, `avatar`, `alert`, `dom`). **No:** un fichero por componente de origen: `pad2`/`toMin`/`dayLanes` ya los usan dos componentes.
- **Sí:** `initials` y `tintFor` juntos en `avatar.ts` (algoritmo del DS para el avatar). **No:** repartirlos entre `text.ts` y `tint.ts`.
- **Sí:** renombrar `TITLE`/`DATE`/`DATE` a `MONTH_YEAR`/`LONG_DATE`/`LONG_DAY` y `ICONS` a `ALERT_ICONS`: los dos `DATE` chocan en el barrel y difieren (con y sin año). **No:** prefijos por componente (`MINI_CALENDAR_DATE`…).
- **Sí:** quitar los duplicados (`pad` de `localIso` y la capitalización en línea de `week-strip`). **No:** movimiento puro con duplicados.
- **Sí:** solo `@shared/utils` (barrel), con imports relativos dentro de `utils/`. **No:** comodín `@shared/utils/*`: permite saltarse el barrel, igual que se descartó `@shared/*` en SPEC 46.
- **Sí:** `let nextId = 0` se queda en cada campo como excepción. **No:** helper `uniqueId(prefix)`: código nuevo y riesgo de cambiar ids; un `let` exportado no se puede incrementar desde fuera.
- **Sí:** `validation/` y `demo/` fuera de la regla. **No:** extender la regla a `validation/`: son validators de Signal Forms con su propia carpeta.
- **Sí:** mover los tests existentes de `initials`/`tintFor`. **No:** tests nuevos para el resto: ya los cubren los specs de `day-view`, `week-view`, `mini-calendar` y `week-strip`.
- **Sí:** sin cambios en `demo-page.html`: el spec no cambia el comportamiento ni la API de ningún componente.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Ciclo entre barrels (`utils` ↔ `types`/`interfaces`) | `types/` e `interfaces/` nunca importan de `utils/`; solo al revés. |
| `capitalize` en `week-strip` cambia la etiqueta | Misma expresión (`charAt(0).toUpperCase() + slice(1)`); los asserts de `week-strip.spec.ts` lo detectan. |
| `utils/avatar.spec.ts` no entra en la ejecución de tests | `tsconfig.spec.json` incluye `src/**/*.spec.ts`; el paso 3 comprueba que se mantienen los 451 tests. |
| Formatters `Intl` creados en otro módulo | Se crean igual una sola vez al cargar el módulo; SSR no cambia (siguen con `timeZone: 'UTC'`). |
