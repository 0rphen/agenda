# SPEC 73 — Aplicar los ajustes de Calendario y Apariencia

> **Status:** Draft
> **Depends on:** SPEC 44 (DayView), SPEC 45 (WeekView), SPEC 38 (MiniCalendar), SPEC 52 (MonthView), SPEC 53 (EventForm), SPEC 56 (rutas), SPEC 62/63/64 (Calendario), SPEC 68 (Configuración), SPEC 72 (reloj, recomendado antes)
> **Date:** 2026-10-27
> **Objective:** Que los ajustes guardados de Calendario y Apariencia cambien de verdad la app: vista por defecto, inicio de semana, formato de hora, fines de semana, citas canceladas, horario laboral, duración predeterminada, densidad, tamaño del texto y animaciones.

## Scope

**In:**

- Ajustes guardados accesibles en toda la app: `SettingsRepository` en root y `UserSettingsStore` (`providedIn: 'root'`) con los ajustes guardados; se carga en navegador al arrancar (`App`, `afterNextRender`) y `SettingsFacade.save()` lo actualiza.
- Calendario:
  - Vista por defecto: `/calendario` redirige a `dia|semana|mes` según el ajuste; el riel «Calendario» apunta ahí.
  - Inicio de semana Lunes/Domingo: `weekStart(iso, firstDay)` en `utils/time.ts`; input `weekStartsOn` en WeekView, MonthView, MiniCalendar; WeekStrip.
  - Formato 12 h: `formatTime(hhmm, format)` en `utils/time.ts`; horas visibles (DayView/WeekView reglas y eventos, AgendaItem, EventCard, MonthView chips, Resumen) en «8:30 a. m.»; los datos siguen en `HH:mm`.
  - Fines de semana ocultos: WeekView y MonthView con 5 columnas (lun–vie).
  - Citas canceladas ocultas: las facades filtran `cancelled` de todas las vistas.
  - Horario laboral: `scrollToHour` de DayView/WeekView = hora de inicio cuando no es hoy (hoy sigue a `now`).
  - Duración predeterminada: «Nueva cita» rellena `end` = `start` + duración.
- Apariencia (en `<html>`, capa `exception`):
  - Densidad Compacta: `data-density="compact"` (contexto `--density` ya existe en `composition`).
  - Tamaño del texto Grande: `html[data-text-size='large'] { font-size: 112.5%; }`.
  - Reducir animaciones: `data-reduce-motion` aplica la misma regla que `utilities/reduced-motion.css`.
- Tests; `PENDING.md`.

**Out of scope:**

- Ajustes de Perfil, Seguridad y Notificaciones (salvo lo de SPEC 74).
- «Añadir enlace de videollamada» (sin efecto: no hay videollamadas).
- Zona horaria e idioma.
- MobileScreens (cuando existan leerán el mismo store).

## Requisitos (EARS)

Store:

- **R1.** `UserSettingsStore.settings` deberá valer `SETTINGS_DEFAULTS` en el servidor y hasta cargar; en el navegador deberá cargar `agenda:v2:/settings` una vez al arrancar.
- **R2.** Cuando `SettingsFacade.save()` termina bien, `UserSettingsStore` deberá reflejar lo guardado sin recargar.

Calendario:

- **R3.** Cuando el usuario abre `/calendario` (o pulsa «Calendario» en el riel o BottomNav), la app deberá ir a la vista de «Vista por defecto».
- **R4.** Donde «Inicio de semana» es Domingo, WeekView, MonthView, MiniCalendar y WeekStrip deberán empezar en domingo (cabecera y rejilla); el número de semana ISO no cambia.
- **R5.** Donde «Formato de hora» es 12 h, todas las horas visibles deberán mostrarse con `Intl` `es-ES` `hour12` («8:30 a. m.», rango «8:00 – 9:00 a. m.»); los inputs de hora (TimeField) siguen en nativo.
- **R6.** Mientras «Mostrar fines de semana» está desactivado, WeekView y MonthView deberán mostrar solo lunes a viernes (5 columnas) y la navegación seguirá por semanas/meses completos.
- **R7.** Mientras «Mostrar citas canceladas» está desactivado, ninguna pantalla deberá mostrar citas con `cancelled`.
- **R8.** Cuando DayView/WeekView se abre en un día sin hoy, el scroll inicial deberá ir a la hora de «Horario laboral · Inicio».
- **R9.** Cuando el usuario abre «Nueva cita» desde un hueco o el botón, EventForm deberá traer `end` = `start` + «Duración predeterminada».

Apariencia:

- **R10.** Donde «Densidad» es Compacta, `<html>` deberá tener `data-density="compact"` y los bloques que leen `@container style(--density: compact)` deberán aplicarlo.
- **R11.** Donde «Tamaño del texto» es Grande, `<html>` deberá tener `data-text-size="large"` y el tamaño raíz deberá ser 112.5 %.
- **R12.** Donde «Reducir animaciones» está activo, `<html>` deberá tener `data-reduce-motion` y no deberá haber animaciones ni transiciones, igual que con `prefers-reduced-motion: reduce`.
- **R13.** Los atributos de `<html>` deberán aplicarse en navegador tras cargar; en SSR no deberán generar errores de hidratación.

## Data model

```ts
@Injectable({ providedIn: 'root' })
export class UserSettingsStore {
  readonly settings: Signal<UserSettings>;
  load(): Promise<void>;
  set(settings: UserSettings): void;
}

// utils/time.ts
export function weekStart(iso: string, firstDay?: 'Lunes' | 'Domingo'): string;
export function formatTime(hhmm: string, format: string): string;
```

## Implementation plan

1. `UserSettingsStore` + `SettingsRepository` en root; `SettingsFacade` lo actualiza al guardar; tests (R1, R2).
2. Apariencia en `<html>` (`effect` en `App` con `DOCUMENT`) + CSS en `exception` (R10–R13).
3. `formatTime` + uso en componentes con input `timeFormat` o pipe; tests (R5).
4. `weekStart(iso, firstDay)` + `weekStartsOn` en WeekView/MonthView/MiniCalendar/WeekStrip; tests y demo (R4).
5. Fines de semana en WeekView/MonthView (input `weekends`, grid de 5 columnas) + demo (R6).
6. Filtro de canceladas en facades; scroll a horario laboral; duración por defecto; redirección de vista por defecto (R3, R7–R9).
7. Playwright: cambiar cada ajuste en `/configuracion`, guardar y comprobar en `/calendario/*`, `/inicio`, `/resumen`; `npm test -- --watch=false`; `npm run build`.

## Acceptance criteria

- [ ] `npm test -- --watch=false` pasa, con ≥1 test por requisito R1–R13.
- [ ] `npm run build` sin errores ni warnings de budget.
- [ ] Demo actualizada para WeekView, MonthView, MiniCalendar y WeekStrip (inicio domingo, 5 columnas, 12 h) en `src/app/demo/demo-page.html`.
- [ ] Playwright: cada ajuste de R3–R12 visible tras guardar, sin recargar y tras recargar.
- [ ] Sin errores de hidratación; CSS solo tokens y logical properties; sin emojis.

## Decisions

- **Sí:** spec separado de las acciones de cuenta (SPEC 74) (usuario).
- **Sí:** texto grande = `font-size` raíz 112.5 % (usuario).
- **Sí:** horario laboral solo fija el scroll inicial (usuario).
- **Sí:** fines de semana ocultos en WeekView y MonthView (usuario).
- **Sí:** 12 h es solo presentación; los datos siguen en `HH:mm`.
- **No:** atenuar horas fuera de horario (CSS nuevo, divergencia del DS).

## Risks

- Spec grande (10 ajustes en ~12 componentes): si al implementar se alarga, partir en 73a (Calendario) y 73b (Apariencia).
- 12 h en DayView/WeekView: etiquetas más anchas pueden no caber en la columna de horas.
- En SSR se pinta con defaults; si el usuario tiene otros ajustes habrá un salto visual al hidratar.

## What is not in this spec

Perfil, Seguridad, Notificaciones, videollamada, zona horaria, idioma, pantallas móviles.
