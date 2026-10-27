# SPEC 69 — Enlace a Inicio en el breadcrumb y etiquetas en el seed

> **Status:** Implemented
> **Depends on:** SPEC 28 (Breadcrumb), SPEC 54 (TaskForm), SPEC 56 (rutas), SPEC 59/60 (agenda store, seed, LocalStorageApi), SPEC 62/63/64 (calendario), SPEC 67 (Tareas), SPEC 68 (Configuración)
> **Date:** 2026-10-27
> **Objective:** Hacer que el crumb «Inicio» lleve a `/inicio` desde el resto de pantallas y que las tareas de ejemplo traigan etiquetas para que el diálogo de edición las muestre marcadas.

## Scope

**In:**

- `link: '/inicio'` en el crumb «Inicio» de `OverviewMain`, `DayMain`, `WeekMain`, `MonthMain`, `TasksMain` y `SettingsPage`.
- `agenda-seed.ts`: `tags` (de `TASK_TAGS`) en varias tareas seed.
- `LocalStorageApi`: clave `agenda:v3:<path>` (antes `v2`) para re-sembrar; specs que usan la clave.
- Tests.

**Out of scope:**

- Crumb «Inicio» de `CalendarPanel` (la propia pantalla Inicio): sigue sin enlace.
- Entrada «Inicio» en `SidebarNav` / `BottomNav`.
- Cambios en `Breadcrumb`, `TaskForm` o `tag-button.css` (funcionan bien); sin sección demo nueva.
- Clave de ajustes `agenda:v2:/settings` (no cambia).
- Migrar datos de `agenda:v2:*` a `v3`.

## Requisitos (EARS)

Breadcrumb:

- **R1.** El crumb «Inicio» de `OverviewMain`, `DayMain`, `WeekMain`, `MonthMain`, `TasksMain` y `SettingsPage` deberá renderizarse como `a.breadcrumb__link` con `href="/inicio"`.
- **R2.** Cuando el usuario hace clic en ese crumb, la app deberá navegar a `/inicio` (sin recarga completa) y mostrar «Inicio · Agenda».
- **R3.** El crumb «Inicio» de `CalendarPanel` no deberá tener enlace.

Etiquetas:

- **R4.** `seedTasks` deberá dar `tags` con valores de `TASK_TAGS` al menos a `t1` (`['Revisión']`), `t4` (`['Cliente', 'Urgente']`) y `t6` (`['Personal']`); el resto sin `tags`.
- **R5.** Cuando el usuario abre la edición de una tarea con `tags`, el `app-task-form` deberá mostrar esas etiquetas con `aria-pressed="true"` e icono `check`, y las demás con `aria-pressed="false"`.
- **R6.** `LocalStorageApi` deberá leer y escribir en `agenda:v3:/events` y `agenda:v3:/tasks`; si la clave `v3` no existe, deberá sembrar aunque exista `v2`.

## Data model

Sin estructuras nuevas. Solo datos: `tags?: string[]` (ya existe en `TaskDto`) poblado en el seed; clave `agenda:v3:<path>`.

## Implementation plan

1. `link: '/inicio'` en los 6 crumbs; specs de esos componentes comprueban `href="/inicio"` (añadir `provideRouter([])` donde falte) (R1, R3).
2. Seed con `tags` + test de `seedTasks` (R4).
3. Clave `v3` en `LocalStorageApi` y actualizar `agenda-local-repository.spec.ts` y demás specs que usan `agenda:v2:/events|tasks` (R6).
4. Test de `AgendaDialogs`/`TaskForm` con tarea con tags: botones pressed (R5).
5. Playwright `npm start`: desde `/resumen`, `/calendario/dia|semana|mes`, `/tareas`, `/configuracion` clic en «Inicio» lleva a `/inicio`; editar «Enviar presupuesto» muestra Cliente y Urgente marcadas; storage `v2` previo no impide ver tags; sin errores de hidratación (R2, R5, R6).
6. `npm test -- --watch=false` verde; `npm run build` sin warnings.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa, con ≥1 test por requisito R1–R6.
- [x] `npm run build` sin errores ni warnings de budget.
- [x] Playwright: crumb «Inicio» navega a `/inicio` desde las 6 pantallas (R1, R2).
- [x] Playwright: en `/inicio` el crumb «Inicio» no es enlace (R3).
- [x] Playwright: editar `t4` muestra «Cliente» y «Urgente» con `aria-pressed="true"` y check; editar `t3` ninguna (R4, R5).
- [x] Playwright: con `agenda:v2:/tasks` previo, la app crea `agenda:v3:/tasks` con tags (R6).
- [x] Sin emojis; copy en español.

## Decisions

- **Sí:** causa del bug = seed sin `tags` (confirmado por el usuario); no se toca `TaskForm`.
- **Sí:** solo breadcrumb, no navegación lateral/inferior (usuario).
- **Sí:** en Inicio el crumb sigue sin enlace: ya estás ahí (usuario).
- **Sí:** subir clave a `agenda:v3` para que todos vean el seed nuevo, aceptando perder datos locales de prueba (usuario). Ajustes quedan en `v2`: no dependen del seed.
- **No:** migrar `v2` a `v3`: datos de prueba, no vale el código.

## Risks

- Al subir a `v3` se pierden tareas/citas editadas localmente (quedan huérfanas en `v2`).
- Specs de componentes dumb sin `provideRouter` fallarán al renderizar `RouterLink`; añadirlo.

## What is not in this spec

Inicio en SidebarNav/BottomNav, enlace en el crumb de la propia Inicio, migración de storage.
