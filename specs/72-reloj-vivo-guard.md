# SPEC 72 — Reloj en vivo y aviso de cambios sin guardar

> **Status:** Implemented
> **Depends on:** SPEC 38 (MiniCalendar), SPEC 43/50 (SaveBar), SPEC 57 (Inicio), SPEC 59 (Resumen), SPEC 62/63/64 (Calendario), SPEC 68 (Configuración)
> **Date:** 2026-10-27
> **Objective:** Que `now`/`today` avancen solos cada minuto en Inicio, Resumen y Calendario, y que salir de Configuración con cambios sin guardar pida confirmación.

## Scope

**In:**

- Reloj compartido `Clock` en `features/agenda/clock.ts` (`signal<Date>` que se actualiza cada 60 s solo en navegador, `isPlatformBrowser`; limpiado con `DestroyRef`).
- `CalendarFacade` (Día/Semana/Mes), `OverviewFacade`, `HomeFacade`: `now`/`today` derivados del reloj, no fijados en `load()`; `today` pasa a `Signal<string>`.
- Las pantallas pasan `today` a `MiniCalendar` y `MonthView`.
- `/configuracion`: guard `canDeactivate` en cada ruta hija (lista móvil y secciones) con Dialog de confirmación en `SettingsPage`, y `beforeunload` mientras `dirty`.
- Tests; `PENDING.md`.

**Out of scope:**

- Cambiar el día seleccionado automáticamente al pasar la medianoche (solo cambia «hoy»).
- Aviso de salida en formularios de Dialog (TaskForm/EventForm).
- Zona horaria de los ajustes.
- `TasksFacade.today` (Tareas): sigue fijo al crear la pantalla; va a `PENDING.md`.

## Requisitos (EARS)

Reloj:

- **R1.** En el navegador, el reloj deberá emitir la hora actual al montar y cada 60 s; en el servidor no deberá crear temporizadores.
- **R2.** Cuando se destruye el injector raíz (cierre de la app o fin de test), el temporizador deberá limpiarse.
- **R3.** Mientras se ve Día o Semana con hoy dentro, `now` («HH:mm») deberá seguir al reloj y la línea de ahora deberá moverse sin recargar.
- **R4.** Cuando cambia la fecha local (medianoche), `today` de Inicio, Resumen y Calendario deberá pasar al nuevo día (marca de hoy en MiniCalendar, MonthView, WeekView, DayPill).
- **R5.** El saludo y «Empieza en N min» de Resumen deberán seguir al reloj.
- **R6.** Las pantallas deberán pasar `today` explícito a `app-mini-calendar` y `app-month-view`; mientras no hay reloj (SSR) usarán la fecha de la petición.

Guard:

- **R7.** Mientras `SettingsFacade.dirty()` es `true`, cuando el usuario navega fuera de `/configuracion` (riel, BottomNav, breadcrumb, atrás), la app deberá abrir `app-dialog` «Tienes cambios sin guardar» con «Seguir editando» (`ghost`), «Descartar» (`ghost-danger`) y «Guardar y salir» (`accent`).
- **R8.** «Seguir editando» deberá cancelar la navegación; «Descartar» deberá llamar a `cancel()` y navegar; «Guardar y salir» deberá llamar a `save()` y navegar solo si guardó; si falla, deberá quedarse y mostrar el Alert de error existente.
- **R9.** Cambiar de sección dentro de `/configuracion`, o volver a la lista móvil (SPEC 77), no deberá activar el guard (draft común, SPEC 68 R8).
- **R10.** Mientras `dirty()`, el navegador deberá avisar al cerrar o recargar la pestaña (`beforeunload` con `preventDefault()`); sin cambios no deberá llamar a `preventDefault()`.

## Data model

```ts
// features/agenda/clock.ts
@Injectable({ providedIn: 'root' })
export class Clock { readonly now: Signal<Date>; }

// SettingsPage
confirmLeave(): Promise<boolean>; // resuelto por el Dialog

// features/settings
export const unsavedSettingsGuard: CanDeactivateFn<SettingsPage>;
```

## Implementation plan

1. `Clock` en `features/agenda/clock.ts` (signal + `setInterval` en navegador, `DestroyRef`) con test de temporizador falso (R1, R2).
2. `CalendarFacade`, `OverviewFacade`, `HomeFacade` usan `Clock` para `now`/`today`; quitar el `set` de `load()`; tests con reloj falso que avanza (R3–R5).
3. `today` explícito a MiniCalendar/MonthView en las pantallas (R6).
4. `unsavedSettingsGuard` en `features/settings/unsaved-settings.guard.ts`, en cada ruta hija de `SETTINGS_ROUTES`; deja pasar si `nextState.url` empieza por `/configuracion` o no hay cambios; si no, `component.confirmLeave()`. Dialog en `SettingsPage`; `beforeunload` con `host` listener que solo llama `preventDefault()` mientras `dirty()` (R7–R10).
5. Playwright: reloj falso (`page.clock`) en `/calendario/dia` avanza la línea; `/configuracion` con cambios bloquea la salida; `npm test -- --watch=false`; `npm run build`.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa, con ≥1 test por requisito R1–R10.
- [x] `npm run build` sin errores ni warnings de budget; prerender/SSR sin temporizadores colgados.
- [x] Playwright `/calendario/dia`: con `page.clock` avanzando 5 min la línea de ahora baja (R3).
- [x] Playwright `/configuracion/apariencia`: cambiar un Switch y pulsar «Calendario» del riel abre el Dialog; cada botón hace lo de R8.
- [x] Sin errores de hidratación; copy en español; sin emojis.

## Decisions

- **Sí:** todas las pantallas, cada minuto (usuario).
- **Sí:** un reloj `providedIn: 'root'` en `features/agenda/` (solo lo usan facades de feature; `shared/utils` es solo funciones) en vez de un intervalo por facade.
- **Sí:** intervalo de 60 s desde el arranque, sin alinear al minuto: la línea puede ir hasta 59 s tarde.
- **Sí:** el guard va en cada ruta hija porque cada sección es su propia ruta: cambiar de sección sí lo dispara y se filtra por URL destino.
- **Sí:** guard propio con Dialog del DS, no `confirm()` nativo; `beforeunload` solo para cierre/recarga (el navegador impone su texto).
- **No:** cambiar `selectedDay` a medianoche: el usuario puede estar mirando otro día.
- **Sí:** R6 ya se cumplía (SPEC 62–64, 57, 59 pasan `today` a MiniCalendar y MonthView); ahora ese `today` es la señal del reloj.

## Risks

- `setInterval` en SSR bloquea la estabilidad de la app: crearlo solo en navegador tras render.
- `canDeactivate` + Dialog asíncrono: devolver `Promise<boolean>`/`Observable` resuelto por el Dialog.

## What is not in this spec

Cambio automático de día seleccionado, aviso en Dialogs de formulario.
