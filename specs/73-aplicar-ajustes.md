# SPEC 73 — Aplicar los ajustes de Calendario y Apariencia

> **Status:** Implemented
> **Depends on:** SPEC 44 (DayView), SPEC 45 (WeekView), SPEC 53 (EventForm), SPEC 56 (rutas), SPEC 60 (diálogos), SPEC 62/63/64 (Calendario), SPEC 68 (Configuración), SPEC 72 (reloj), SPEC 75–77 (móvil)
> **Date:** 2026-10-27
> **Objective:** Que los ajustes guardados cambien de verdad la app: vista por defecto del Calendario, horario laboral, duración predeterminada, densidad, tamaño del texto y animaciones. Inicio de semana, 12 h y fines de semana van a SPEC 78.

## Scope

**In:**

- Ajustes guardados accesibles en toda la app: `SettingsRepository` provisto en root (`app.config.ts`) y `UserSettingsStore` (`providedIn: 'root'`, `features/settings/store/user-settings.store.ts`); carga una vez en navegador (`App`, `afterNextRender`, y bajo demanda desde la redirección); `SettingsFacade.save()` lo actualiza.
- Calendario:
  - Vista por defecto: `/calendario` redirige (redirect asíncrono) a `dia|semana|mes` según el ajuste; el riel «Calendario» apunta a `/calendario`. `/calendario` se renderiza en cliente (`RenderMode.Client`) para que el servidor no redirija con los defaults.
  - Horario laboral: `scrollToHour` de DayView/WeekView = hora de «Inicio» del horario laboral (cuando hoy no está a la vista; con hoy sigue a `now`, SPEC 44/45).
  - Duración predeterminada: «Nueva cita» (botón, Fab o hueco) rellena `end` = `start` + duración, en `AgendaDialogs.openNewEvent`.
- Apariencia (atributos en `<html>`, `effect` en `App`; CSS en `src/styles/exceptions/user-preferences.css`):
  - Densidad Compacta: `data-density="compact"` y `--density: compact` en `:root` (capa `composition`).
  - Tamaño del texto Grande: `:root[data-text-size='large'] { font-size: 112.5%; }` (capa `exception`).
  - Reducir animaciones: `data-reduce-motion` quita `animation` y `transition` en toda la página (capa `exception`).
- Escritorio y móvil (Hoy, Mes, Tareas, Ajustes móviles usan los mismos facades y componentes).
- Tests; `TODO.md` (ítem SPEC 78 nuevo); `PENDING.md`.

**Out of scope:**

- Inicio de semana, formato 12 h y fines de semana: SPEC 78 (nuevo ítem en `TODO.md`).
- Mostrar citas canceladas: `CalendarEvent` no tiene `cancelled` ni acción para cancelar; va a `PENDING.md`.
- Hora de «Fin» del horario laboral (sin efecto visible acordado), «Añadir enlace de videollamada», zona horaria, idioma.
- Perfil, Seguridad y Notificaciones (SPEC 74).
- Arreglar `utilities/reduced-motion.css` del DS (apunta a `.app`, que no existe en local): `PENDING.md`.

## Requisitos (EARS)

Store:

- **R1.** `UserSettingsStore.settings` deberá valer `SETTINGS_DEFAULTS` en el servidor y hasta cargar; en el navegador `load()` deberá leer `SettingsRepository` una sola vez (llamadas repetidas comparten la misma promesa).
- **R2.** Si la carga falla (JSON corrupto), entonces `UserSettingsStore` deberá quedarse con `SETTINGS_DEFAULTS` sin lanzar.
- **R3.** Cuando `SettingsFacade.save()` termina bien, `UserSettingsStore.settings` deberá reflejar lo guardado sin recargar.

Calendario:

- **R4.** Cuando el usuario abre `/calendario` (o pulsa «Calendario» en el riel), la app deberá ir a `/calendario/dia`, `/calendario/semana` o `/calendario/mes` según «Vista por defecto» (Día, Semana, Mes).
- **R5.** El `app-day-view` de Día y el `app-week-view` de Semana deberán recibir `scrollToHour` = hora de «Horario laboral · Inicio» (`'07:30'` → 7).
- **R6.** Cuando el usuario abre «Nueva cita» desde el botón, el Fab o un hueco, el borrador deberá traer `end` = `start` + «Duración predeterminada» (15, 30, 45 min o 1 hora); sin `start` en el borrador, `start` = `09:00` (default de EventForm); el fin no deberá pasar de `23:59`.

Apariencia:

- **R7.** Donde «Densidad» es Compacta, `<html>` deberá tener `data-density="compact"` y `--density` en `:root` deberá valer `compact`; en Cómoda no deberá tener el atributo.
- **R8.** Donde «Tamaño del texto» es Grande, `<html>` deberá tener `data-text-size="large"` y el tamaño de fuente raíz deberá ser 112.5 %.
- **R9.** Donde «Reducir animaciones» está activo, `<html>` deberá tener `data-reduce-motion` y ningún elemento deberá tener `animation` ni `transition`.
- **R10.** Cuando cambian los ajustes del store (carga o guardado), los atributos de `<html>` deberán actualizarse sin recargar; en SSR se renderizan con los defaults (sin atributos), sin errores de hidratación.

## Data model

```ts
// features/settings/store/user-settings.store.ts
@Injectable({ providedIn: 'root' })
export class UserSettingsStore {
  readonly settings: Signal<UserSettings>;
  load(): Promise<void>; // idempotente; no-op en servidor
  set(settings: UserSettings): void;
}

// features/settings/domain/settings-options.ts
export function durationMinutes(duration: string): number; // '1 hora' → 60, '30 min' → 30

// shared/utils/time.ts
export function addMinutes(hhmm: string, minutes: number): string; // tope '23:59'
```

## Implementation plan

1. `UserSettingsStore` + `SettingsRepository` en `app.config.ts` (fuera de `SETTINGS_ROUTES`); `SettingsFacade.save()` llama `store.set()`; tests (R1–R3).
2. `App`: `afterNextRender` → `store.load()`; `effect` que pone/quita `data-density`, `data-text-size`, `data-reduce-motion` en `document.documentElement`; `src/styles/exceptions/user-preferences.css` importado al final de `src/styles.css`; tests (R7–R10).
3. `CALENDAR_ROUTES`: `redirectTo` asíncrono que espera `store.load()` y mapea Día/Semana/Mes; `RAIL_DESTINATIONS` «Calendario» → `/calendario`; `app.routes.server.ts` `calendario` → `RenderMode.Client`; tests (R4).
4. `CalendarFacade.workStartHour`; `day-main`/`week-main` pasan `[scrollToHour]`; tests (R5).
5. `addMinutes` en `utils/time.ts`, `durationMinutes` en settings; `AgendaDialogs.openNewEvent` fija `start`/`end`; tests (R6).
6. `TODO.md`: ítem nuevo SPEC 78 (inicio de semana, 12 h, fines de semana); `PENDING.md`.
7. Playwright: cambiar cada ajuste en `/configuracion`, guardar y comprobar en `/calendario`, `/calendario/dia`, `/calendario/semana`, «Nueva cita»; `npx ng test --watch=false`; `npm run build`.

## Acceptance criteria

- [x] `npx ng test --watch=false` pasa, con ≥1 test por requisito R1–R10.
- [x] `npm run build` sin errores ni warnings de budget.
- [x] Playwright: vista por defecto, scroll a horario laboral, duración en «Nueva cita», densidad, texto grande y reducir animaciones visibles tras guardar, sin recargar y tras recargar.
- [x] Sin errores de hidratación en `/calendario/*` ni `/configuracion`.
- [x] CSS solo tokens y logical properties (salvo el 112.5 % acordado); sin `styles`/`styleUrl` nuevos; sin emojis ni copy en inglés.
- [x] Sin cambios en componentes de `shared/components/` (no hay sección de demo que actualizar).
- [x] `TODO.md`: ítem SPEC 73 marcado e ítem SPEC 78 añadido.

## Decisions

- **Sí:** spec separado de las acciones de cuenta (SPEC 74) (usuario).
- **Sí:** partir: inicio de semana, 12 h y fines de semana a SPEC 78 (usuario).
- **Sí:** incluir pantallas móviles; reutilizan facades y componentes, no requieren código propio (usuario).
- **Sí:** texto grande = `font-size` raíz 112.5 % (usuario).
- **Sí:** horario laboral solo fija el scroll inicial (usuario).
- **No:** citas canceladas: no hay datos que filtrar (sin campo `cancelled` en `CalendarEvent`).
- **Sí:** `/calendario` en `RenderMode.Client`: la vista por defecto vive en `localStorage`.
- **Sí:** la duración también manda en los huecos (antes 1 h fija por `slotEnd`).
- **Sí:** BottomNav «Hoy» sigue en `/calendario/dia` (en móvil Hoy es el día).
- **No:** atenuar horas fuera de horario (CSS nuevo, divergencia del DS).

## Risks

- En SSR se pinta con defaults; con Compacta o Grande habrá un salto visual al hidratar.
- `redirectTo` asíncrono espera a `localStorage` (instantáneo); si `load()` falla, usa la vista por defecto de `SETTINGS_DEFAULTS` (Semana).

## What is not in this spec

Inicio de semana, 12 h, fines de semana (SPEC 78), citas canceladas, Perfil, Seguridad, Notificaciones, videollamada, zona horaria, idioma.
