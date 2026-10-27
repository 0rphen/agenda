# SPEC 68 — Configuración: SettingsPage de escritorio

> **Status:** Implemented
> **Depends on:** SPEC 36 (SettingRow), SPEC 39 (SidebarNav), SPEC 43/50 (SaveBar), SPEC 20 (Switch), SPEC 21 (SegmentedControl), SPEC 22/23 (Card), SPEC 25 (Alert), SPEC 07 (Avatar), SPEC 28 (Breadcrumb), SPEC 55/56 (`.l-shell`, rutas)
> **Date:** 2026-10-27
> **Objective:** Montar en `/configuracion` la SettingsPage del DS: menú de secciones (Perfil, Seguridad, Calendario, Notificaciones, Apariencia) en rutas hijas, contenido en Cards con SettingRow y SaveBar que guarda los ajustes en localStorage.

## Scope

**In:**

- `src/app/features/settings/`: `domain/settings.model.ts` (`UserSettings`, `SettingsSection`, `SettingsStatus`), `domain/settings-options.ts` (opciones y defaults del DS), `domain/settings-repository.ts` (abstract `load`/`save`), `structure/settings-local-repository.ts` (clave `agenda:v2:/settings`, defaults mezclados con lo guardado), `settings.facade.ts`, `pages/settings-page/`, `components/settings-profile|settings-security|settings-calendar|settings-notifications|settings-appearance/` (dumb).
- `settings.routes.ts`: `''` redirige a `perfil`; hijos `perfil`, `seguridad`, `calendario`, `notificaciones`, `apariencia` con `SettingsPage`, `data: { layout: 'settings', section }` y título «<Sección> · Configuración · Agenda»; repositorio + `SettingsFacade` en la ruta padre (draft común a las secciones). Sustituye `PlaceholderPage`.
- `app.routes.server.ts`: `configuracion/**` → `RenderMode.Server`.
- `src/styles/blocks/settings-page.css` (host `display: contents`; `max-inline-size: 48rem` del cuerpo y la SaveBar, inline en el DS) importado en `src/styles.css`.
- Tests; marcar «Configuración» en `TODO.md`; `PENDING.md`.

**Out of scope:**

- MobileSettings (`.l-screen`, lista → detalle).
- Aplicar los ajustes al resto de la app (vista por defecto, formato 12 h, densidad, tamaño de texto…).
- Acciones del DS sin efecto: «Cambiar foto», «Quitar», «Cambiar» contraseña, «Cerrar sesión», «Exportar», «Eliminar cuenta», «Permitir en el navegador».
- «Ayuda y contacto» (deshabilitada, como en el DS).
- Cambios en `shared/components` (sin sección demo nueva).

## Requisitos (EARS)

Ruta:

- **R1.** `/configuracion` deberá redirigir a `/configuracion/perfil`; cada sección deberá montar `SettingsPage` con `data.layout = 'settings'` y el destino «Configuración» del riel activo.
- **R2.** El servidor deberá renderizar las rutas de configuración en cada petición (`RenderMode.Server`) sin leer datos; cuando `SettingsPage` se ha renderizado en el navegador (`afterNextRender`), deberá llamar a `load()`.

Datos y facade (`SettingsFacade`, lo único que inyecta la página):

- **R3.** `load()` deberá leer `agenda:v2:/settings`; si no existe, deberá usar los defaults del DS (César Hohner, Semana, Lunes, 24 h, 08:00–18:00, 30 min, 15 min antes, Cómoda, Normal…); `status` pasará de `idle` a `loading` y a `ready`.
- **R4.** Si el JSON guardado es inválido o localStorage falla, entonces `status` deberá ser `'error'`.
- **R5.** `form` (Signal Forms sobre `draft`) deberá reflejar los ajustes cargados; `dirty` deberá ser `true` mientras `draft` difiera de lo guardado.
- **R6.** Cuando se llama a `save()`, deberá poner `saving`, persistir `draft`, actualizar lo guardado y poner `saved`; si falla, `saveError` deberá ser `true` y `dirty` se mantendrá.
- **R7.** Cuando se llama a `cancel()`, `draft` deberá volver a lo guardado.
- **R8.** Mientras haya cambios sin guardar, cambiar de sección deberá conservarlos (un único draft para todas las secciones).

Página (`SettingsPage`, smart):

- **R9.** `.l-shell__nav` deberá contener `app-sidebar-nav` (label «Configuración», secciones Cuenta · Preferencias · Soporte con los iconos del DS, «Ayuda y contacto» `disabled`, `user` = nombre del draft + «Organizador») con la sección actual activa; cuando el usuario elige un ítem, deberá navegar a su ruta.
- **R10.** `.l-shell__content panel l-stack` `data-gap="m"` deberá renderizar `app-breadcrumb` (Inicio `home` › Configuración › <Sección>), `h1.page-title` <Sección>, `p.page-lead` «Ajusta cómo se ve y se comporta tu agenda. Los cambios se aplican en todos tus dispositivos.», el cuerpo de la sección y `app-save-bar` con `dirty`/`saving`/`saved` del facade.
- **R11.** Mientras `status` no sea `'ready'` ni `'error'`, la página deberá mostrar `app-skeleton-list` `card` en lugar del cuerpo; si es `'error'`, `app-alert` `danger` «No se pudo cargar tu configuración» / «Revisa el almacenamiento del navegador e inténtalo de nuevo.» con «Reintentar» que llama a `load()`.
- **R12.** Si `saveError`, entonces la página deberá mostrar `app-alert` `danger` descartable «No se pudieron guardar los cambios.».

Secciones (dumb: reciben el sub-`FieldTree` por input; no inyectan facade, router ni repositorio):

- **R13.** Perfil deberá renderizar Card «Tu perfil» (Avatar `xl` con el nombre, «Foto o iniciales · JPG o PNG, máx. 2 MB», «Cambiar foto» `secondary` y «Quitar» `ghost-danger`; Nombre y Apellido en `l-form-grid`; Correo `disabled` con hint «El correo de la cuenta no se puede cambiar aquí.»; Zona horaria e Idioma `app-select`) y Card «Cuenta conectada» (SettingRow Google + Badge `success` «Conectada»).
- **R14.** Seguridad deberá renderizar Card «Acceso» (`button[app-setting-row]` «Contraseña» con valor «Cambiar»; Switch «Verificación en dos pasos»), Card «Sesiones activas» (las 2 filas del DS) y Card `tone="danger"` «Zona de peligro» (Exportar, Eliminar cuenta con `tone="danger"`).
- **R15.** Calendario deberá renderizar Card «Vista y formato» (SegmentedControl «Vista por defecto» Día · Semana · Mes, Select «Inicio de semana», SegmentedControl «Formato de hora» 24 h · 12 h, Switches «Mostrar fines de semana» y «Mostrar citas canceladas») y Card «Horario y citas nuevas» (TimeField Inicio y Fin en `l-cluster` `data-nowrap`, Select «Duración», Switch «Añadir enlace de videollamada»).
- **R16.** Notificaciones deberá renderizar Alert «Permiso de notificaciones» con «Permitir en el navegador», Card «Recordatorios» (Select «Recordatorio», Switches «Tareas con vencimiento» y «Resumen diario») y Card «Canales» (Switches Navegador, Correo, Notificaciones en el móvil).
- **R17.** Apariencia deberá renderizar Card «Apariencia» (SegmentedControl «Densidad» Cómoda · Compacta, «Tamaño del texto» Normal · Grande; Switch «Reducir animaciones»).
- **R18.** Cuando el usuario cambia un control de una sección, la SaveBar deberá aparecer; «Guardar cambios» deberá persistir y los valores se mantendrán tras recargar; «Descartar» deberá revertirlos.
- **R19.** Sin `styleUrl`; CSS solo tokens y logical properties; copy en español, sentence case, 24 h, sin emojis.

## Data model

```ts
// features/settings/domain/settings.model.ts
export type SettingsSection = 'perfil' | 'seguridad' | 'calendario' | 'notificaciones' | 'apariencia';
export type SettingsStatus = 'idle' | 'loading' | 'ready' | 'error';
export interface UserSettings {
  profile: { firstName: string; lastName: string; timeZone: string; language: string };
  security: { twoFactor: boolean };
  calendar: {
    defaultView: string; weekStart: string; timeFormat: string; showWeekends: boolean;
    showCancelled: boolean; workStart: string; workEnd: string; defaultDuration: string;
    videoLink: boolean;
  };
  notifications: {
    eventReminder: string; dueTasks: boolean; dailySummary: boolean;
    browser: boolean; email: boolean; mobile: boolean;
  };
  appearance: { density: string; textSize: string; reduceMotion: boolean };
}

// domain/settings-repository.ts
export abstract class SettingsRepository {
  abstract load(): Promise<UserSettings>;
  abstract save(settings: UserSettings): Promise<void>;
}
```

## Implementation plan

1. Modelo, opciones/defaults, repositorio local + spec (R3, R4, R6).
2. `SettingsFacade` + spec (R3–R8).
3. Cinco componentes de sección dumb + specs (R13–R17), con `[formField]` sobre el sub-árbol.
4. `SettingsPage`, `settings-page.css`, rutas, `app.routes.server.ts`; spec de página (R1, R2, R9–R12, R18).
5. Playwright sobre `npm start` a 1440 px: menú, navegación, SaveBar, guardar/recargar, descartar, JSON corrupto ⇒ Alert; consola sin errores de hidratación.
6. `npm run build`, `curl` en `serve:ssr:calendar`, `npm test -- --watch=false`; `TODO.md`.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa, con ≥1 test por requisito R1–R18. (887/887)
- [x] `npm run build` sin errores ni warnings de budget; no existe `browser/configuracion/*/index.html` (R2).
- [x] `curl` `/configuracion/perfil` devuelve «Perfil · Configuración · Agenda» y `skeleton-list` (R2, R11).
- [x] Playwright: menú con sección activa y navegación entre las 5; `/configuracion` redirige a perfil (R1, R9, R10).
- [x] Playwright: cambiar un control muestra la SaveBar; guardar muestra «Cambios guardados» y persiste al recargar; descartar revierte; cambiar de sección conserva el cambio (R5–R8, R18).
- [x] Playwright: JSON corrupto en `agenda:v2:/settings` muestra Alert y «Reintentar» (R4, R11).
- [x] Riel «Configuración» activo; sin errores de hidratación (R1).
- [x] Sin `styles`/`styleUrl`; sin emojis; copy en español (R19).
- [x] `TODO.md`: «Configuración» marcado `(SPEC 68)`.

## Decisions

- **Sí:** las 5 secciones del DS (respuesta del usuario).
- **Sí:** persistir en localStorage, `agenda:v2:/settings` (respuesta del usuario); los ajustes aún no afectan a otras pantallas.
- **Sí:** rutas hijas por sección (respuesta del usuario); `/configuracion` redirige a `perfil`.
- **Sí:** un draft común; cambiar de sección no descarta los cambios (el DS sí los descarta). Evita perder cambios.
- **Sí:** `saved` se activa al terminar `save()`, sin el retardo simulado de 900 ms del DS.
- **Sí:** TimeField no tiene `ariaLabel`/`hideLabel`: labels «Inicio» y «Fin» visibles (sin tocar shared).
- **Sí:** `max-inline-size: 48rem` (inline en el DS) como clase en `settings-page.css`.
- **Sí:** correo fijo del DS, no editable ni persistido.

## Risks

- Signal Forms sobre un objeto anidado: `dirty` se calcula comparando `JSON.stringify` de draft y guardado (orden de claves estable al venir de los mismos defaults).

## What is not in this spec

Móvil Ajustes, efectos de los ajustes en el resto de la app, acciones de cuenta/seguridad reales.
