# SPEC 46 — Reorganizar shared en components, types e interfaces

> **Status:** Implemented
> **Depends on:** SPEC 14 (`types/ui.ts`), SPEC 15 (página demo)
> **Date:** 2026-10-24
> **Objective:** Mover cada componente de `src/app/shared/<comp>/` a `src/app/shared/components/<comp>/`, sacar todo `type` a `src/app/shared/types/` y toda `interface` a `src/app/shared/interfaces/` (un fichero por componente y un `index.ts` cada carpeta), e importar entre carpetas con los alias `@shared/components/*`, `@shared/types` y `@shared/interfaces`.

## Scope

**In:**

- `git mv` de las 39 carpetas de componente (todas las de `src/app/shared/` salvo `types/` y `validation/`) a `src/app/shared/components/`, con sus `.ts`, `.html` y `.spec.ts`.
- Sacar a `src/app/shared/types/<comp>.ts` cada declaración `type` (exportada o local) de `shared/`; `ui.ts` se queda tal cual.
- Sacar a `src/app/shared/interfaces/<comp>.ts` cada declaración `interface` (exportada o local) de `shared/`, incluida `validation/`.
- `src/app/shared/types/index.ts` e `src/app/shared/interfaces/index.ts` con `export *` de cada fichero.
- `compilerOptions.paths` en `tsconfig.json`: `@shared/components/*`, `@shared/types`, `@shared/interfaces`.
- Reescribir imports: todo import que cruza carpeta usa alias; mismo directorio sigue relativo (`./skeleton`).
- `CLAUDE.md`: layout nuevo, alias y regla de dónde van types/interfaces; ruta de la regla de demo (`src/app/shared/components/`).

**Out of scope:**

- Convertir `type X = {…}` a `interface` o al revés (criterio = keyword).
- Alias para `validation/` (`shared/validation/` no se mueve; sus imports siguen relativos).
- `DemoModel` (`demo-page.ts`): no es de `shared/`.
- Funciones/constantes exportadas de componentes (`dayLanes`, `pad2`, `toMin`): se quedan en `day-view.ts`.
- Cambios de comportamiento, templates, CSS, `TODO.md`, specs antiguos.
- Barrel de componentes.

## Requisitos (EARS)

- **R1.** El directorio `src/app/shared/` deberá contener solo `components/`, `interfaces/`, `types/` y `validation/`.
- **R2.** Cada componente deberá vivir en `src/app/shared/components/<comp>/` con los mismos nombres de fichero que hoy (`.ts`, `.html`, `.spec.ts`).
- **R3.** Los `.ts` de `shared/components/` y `shared/validation/` no deberán declarar ningún `type` ni `interface`.
- **R4.** Cada `type` de la tabla del Data model deberá declararse exportado en `src/app/shared/types/<fichero>` indicado, sin cambiar su definición.
- **R5.** Cada `interface` de la tabla del Data model deberá declararse exportada en `src/app/shared/interfaces/<fichero>` indicado, sin cambiar su definición.
- **R6.** `src/app/shared/types/index.ts` e `src/app/shared/interfaces/index.ts` deberán reexportar con `export *` todos los ficheros de su carpeta, y nada más.
- **R7.** `tsconfig.json` deberá declarar en `compilerOptions.paths` `@shared/components/*` → `src/app/shared/components/*`, `@shared/types` → `src/app/shared/types/index.ts` y `@shared/interfaces` → `src/app/shared/interfaces/index.ts`.
- **R8.** Cuando un fichero importa un componente de otra carpeta, deberá hacerlo con `@shared/components/<comp>/<fichero>`.
- **R9.** Cuando un fichero importa un type o interface, deberá hacerlo desde `@shared/types` o `@shared/interfaces`, nunca desde un fichero concreto ni con ruta relativa.
- **R10.** Mientras dos ficheros están en el mismo directorio, el import entre ellos deberá seguir siendo relativo (`./…`).
- **R11.** Si queda algún import con `../` que cruce a otra carpeta de `shared/` o de `demo/` a `shared/` (salvo hacia `shared/validation/`), entonces la verificación del paso final deberá fallar.
- **R12.** El HTML renderizado, el CSS y el resultado de los tests no deberán cambiar.
- **R13.** `CLAUDE.md` deberá describir `shared/components/<comp>/`, `shared/types/`, `shared/interfaces/`, los alias y la regla «todo `type` va a `types/`, toda `interface` a `interfaces/`»; la regla de demo de Specs deberá citar `src/app/shared/components/`.

## Data model

```jsonc
// tsconfig.json → compilerOptions
"paths": {
  "@shared/components/*": ["./src/app/shared/components/*"],
  "@shared/types": ["./src/app/shared/types/index.ts"],
  "@shared/interfaces": ["./src/app/shared/interfaces/index.ts"]
}
```

`types/` (`type`; los locales pasan a exportados):

| Fichero | Types | Origen |
| --- | --- | --- |
| `ui.ts` | `Size`, `Tone`, `Category`, `Tint` | ya existe |
| `alert.ts` | `AlertTone` | `alert.ts` |
| `bottom-nav.ts` | `BottomNavItem` | `bottom-nav.ts` |
| `breadcrumb.ts` | `BreadcrumbItem` | `breadcrumb.ts` |
| `button.ts` | `ButtonVariant` | `button.ts` |
| `icon-button.ts` | `IconButtonVariant` | `icon-button.ts` |
| `menu.ts` | `MenuItem`, `MenuEntry` | `menu.ts` |
| `mini-calendar.ts` | `MiniCalendarForcedState` | `mini-calendar.ts` |
| `sidebar-nav.ts` | `SidebarNavItem`, `SidebarNavEntry` | `sidebar-nav.ts` |
| `skeleton.ts` | `SkeletonShape`, `SkeletonListVariant` | `skeleton.ts`, `skeleton-list.ts` |
| `stat-card.ts` | `StatCardTone` | `stat-card.ts` |
| `text-field.ts` | `TextFieldType` (era local) | `text-field.ts` |

`interfaces/`:

| Fichero | Interfaces | Origen |
| --- | --- | --- |
| `avatar.ts` | `AvatarPerson` | `avatar-group.ts` |
| `day-view.ts` | `DayViewEvent`, `DayViewAllDay`, `Placed<T>` | `day-view.ts` |
| `mini-calendar.ts` | `CalendarDay` (era local) | `mini-calendar.ts` |
| `segmented-control.ts` | `SegmentedOption` | `segmented-control.ts` |
| `select.ts` | `SelectOption` | `select.ts` |
| `validators.ts` | `ValidatorConfig` (era local) | `validation/validators.ts` |
| `week-strip.ts` | `WeekDay` | `week-strip.ts` |
| `week-view.ts` | `WeekViewEvent`, `WeekViewAllDay` | `week-view.ts` |

Ejemplo de imports tras el cambio (`components/week-view/week-view.ts`):

```ts
import { Badge } from '@shared/components/badge/badge';
import { dayLanes, pad2, toMin } from '@shared/components/day-view/day-view';
import { Category, Tint } from '@shared/types';
import { Placed, WeekDay, WeekViewAllDay, WeekViewEvent } from '@shared/interfaces';
```

`interfaces/*.ts` que usan types (p. ej. `interfaces/week-view.ts` con `Tint`, `Category`) importan de `@shared/types`; `types/` no importa de `interfaces/`, sin ciclos.

## Implementation plan

1. Añadir `paths` a `tsconfig.json` (R7). Nadie lo usa aún; build verde.
2. `git mv src/app/shared/<comp> src/app/shared/components/<comp>` para las 39 carpetas (R1, R2). Arreglar imports rotos con alias: componentes entre sí, demo y `types/ui` → `@shared/types` (R8–R10). Tests y build verdes.
3. Crear `types/<comp>.ts` + `types/index.ts`; mover cada `type` de la tabla y apuntar sus consumidores a `@shared/types` (R4, R6, R9). Tests verdes.
4. Crear `interfaces/<comp>.ts` + `interfaces/index.ts`; mover cada `interface` de la tabla (incluida `ValidatorConfig`) y apuntar consumidores a `@shared/interfaces` (R5, R6, R9). Tests verdes.
5. Actualizar `CLAUDE.md` (R13).
6. Verificar: greps de los criterios vacíos (R3, R11), `npm test -- --watch=false` y `npm run build` verdes, `/demo` carga sin errores en consola (R12).

## Acceptance criteria

- [x] `ls src/app/shared` muestra solo `components interfaces types validation` (R1).
- [x] `ls src/app/shared/components` lista las 39 carpetas de hoy con sus ficheros intactos (R2).
- [x] `grep -rnE "^(export )?(type|interface) " src/app/shared/components src/app/shared/validation` vacío (R3).
- [x] Cada type/interface de las tablas está en su fichero con la misma definición (R4, R5).
- [x] Los dos `index.ts` solo contienen `export * from './<fichero>';`, uno por fichero de la carpeta (R6).
- [x] `tsconfig.json` tiene los tres `paths` del Data model (R7).
- [x] `grep -rn "from '\.\./" src/app --include=*.ts | grep -v "validation/"` vacío (R8, R11).
- [x] `grep -rnE "from '@shared/(types|interfaces)/" src` vacío (R9).
- [x] `npm test -- --watch=false` pasa sin cambiar ningún assert (R12).
- [x] `npm run build` termina sin errores ni warnings de budget (R12).
- [x] `/demo` en `npm start` renderiza todas las secciones sin errores en consola (R12).
- [x] `CLAUDE.md` refleja layout, alias y regla (R13).

## Decisions

- **Sí:** criterio por keyword (`type` → `types/`, `interface` → `interfaces/`). **No:** convertir alias de objeto a `interface`: reescribe código y uniones (`MenuEntry`, `BreadcrumbItem`) no pueden ser interface.
- **Sí:** un fichero por componente + `index.ts` con `export *`. **No:** un único fichero por carpeta: crece sin orden.
- **Sí:** alias `@shared/components/*`, `@shared/types`, `@shared/interfaces`. **No:** comodín `@shared/*`: permite importar ficheros sueltos de `types/` saltándose el barrel.
- **Sí:** alias en todo import que cruza carpeta; relativo dentro del mismo directorio. **No:** alias solo para types/interfaces: deja `../../` frágiles tras el movimiento.
- **Sí:** mover también types/interfaces locales (`TextFieldType`, `CalendarDay`, `ValidatorConfig`) y exportarlos. **No:** dejar locales: regla «ningún type en componentes» con excepciones.
- **Sí:** `validation/` se queda en `shared/validation/` sin alias; solo sale `ValidatorConfig`. **No:** alias `@shared/validation`: no pedido.
- **Sí:** `Placed<T>` a `interfaces/day-view.ts`; `dayLanes`, `pad2`, `toMin` siguen en `day-view.ts` (son valores, no tipos).
- **Sí:** `AvatarPerson` en `interfaces/avatar.ts` (carpeta `avatar/`), `SkeletonListVariant` en `types/skeleton.ts`: fichero = carpeta del componente.
- **No:** barrel de componentes ni reescribir specs antiguos.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Builder de tests (`@angular/build:unit-test`) no resuelve `paths` | `tsconfig.spec.json` extiende `tsconfig.json`; paso 2 corre tests antes de seguir. Si falla, parar y reportar. |
| Ciclo de imports entre barrels | `types/` nunca importa de `interfaces/`; solo al revés. |
| `templateUrl` relativos | Se mueven junto al `.ts`; no cambian. |
| `git mv` pierde historial visible | `git log --follow` sigue funcionando; commit de movimiento separado del de imports si el diff es grande. |
