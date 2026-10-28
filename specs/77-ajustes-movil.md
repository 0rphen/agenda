# SPEC 77 — Ajustes móvil: MobileSettings

> **Status:** Implemented
> **Depends on:** SPEC 36 (SettingRow), SPEC 41 (AppBar), SPEC 43 (SaveBar), SPEC 55 (`.l-screen`), SPEC 68 (Configuración), SPEC 75 (`u-mobile-only`/`u-desktop-only`, `shell-screen.css`)
> **Date:** 2026-10-27
> **Objective:** Adaptar `/configuracion` para que, con `.l-shell` por debajo de 48rem, sea la pantalla MobileSettings del DS: lista de secciones en `/configuracion` (AppBar grande «Ajustes») y cada sección en su ruta con AppBar con flecha de vuelta a la lista y la SaveBar dentro del contenido.

## Scope

**In:**

- `SETTINGS_ROUTES`: `/configuracion` deja de redirigir a `perfil` y pinta `SettingsPage` sin sección.
- `SettingsPage`: host `settings-page screen l-screen`; menú lateral, breadcrumb, título y lead `u-desktop-only`; `div.l-screen__top.u-mobile-only` con AppBar; lista móvil (`u-mobile-only`) en `/configuracion`; contenido `l-screen__main`.
- `shell-screen.css` (divergencia local existente): `.l-shell__content` ocupa el área `main` dentro de `.l-screen`.
- Tests de `SettingsPage`; `PENDING.md`; marcar el ítem en `TODO.md`.

**Out of scope:**

- Cambios en `shared/components` (la fila de perfil usa icono, no Avatar): sin sección nueva en `/demo`.
- Acciones de «Cerrar sesión» y «Ayuda y contacto» (SPEC 74 / sin destino): filas deshabilitadas.
- Aviso de cambios sin guardar al salir (SPEC 72).

## Requisitos (EARS)

Rutas:

- **R1.** La ruta `/configuracion` deberá renderizar `SettingsPage` con `data: { layout: 'settings' }`, sin `section` y título «Configuración · Agenda», sin redirigir.
- **R2.** Mientras no hay `section`, el `SettingsPage` deberá mostrar en escritorio la sección Perfil (título «Perfil», «Perfil» activo en el menú, `app-settings-profile`).

Estructura:

- **R3.** El `SettingsPage` deberá tener las clases de host `settings-page screen l-screen`, marcar `.l-shell__nav`, el breadcrumb, `h1.page-title` y `p.page-lead` con `u-desktop-only` y añadir `l-screen__main` a `.l-shell__content`.
- **R4.** Mientras el ancho de `.l-shell` sea al menos 48rem, `/configuracion/*` deberá verse como antes de este spec.
- **R5.** Mientras el ancho de `.l-shell` sea menor que 48rem, `.l-shell__content` deberá ocupar el área `main` de `.l-screen` y solo `.l-screen__main` hará scroll.

Lista:

- **R6.** Mientras no hay `section`, el `SettingsPage` deberá renderizar `div.l-screen__top.u-mobile-only` > `app-app-bar` `large` con heading «Ajustes».
- **R7.** Mientras no hay `section` y `status` es `ready`, el `SettingsPage` deberá renderizar un bloque `u-mobile-only` con tres `app-card`: (1) fila de perfil `person_outline` con el nombre del usuario y el correo como descripción; (2) «Calendario» (`calendar_month`, valor vista por defecto), «Notificaciones» (`notifications_none`, valor «Activas» si algún canal está activo, si no «Desactivadas»), «Apariencia» (`tune`, valor densidad) y «Seguridad» (`lock_outline`); (3) «Ayuda y contacto» (`help_outline`) y «Cerrar sesión» (`logout`, `tone="danger"`, `noChevron`), ambas deshabilitadas.
- **R8.** Cuando el usuario pulsa una fila habilitada de la lista, el `SettingsPage` deberá navegar a `/configuracion/<sección>` (perfil, calendario, notificaciones, apariencia, seguridad).
- **R9.** Mientras no hay `section`, el `SettingsPage` deberá marcar el cuerpo de Perfil y la SaveBar con `u-desktop-only`.

Detalle:

- **R10.** Mientras hay `section`, el `SettingsPage` deberá renderizar `div.l-screen__top.u-mobile-only` > `app-app-bar` con heading el título de la sección, `back` y `backLabel` «Volver a Ajustes».
- **R11.** Cuando el usuario pulsa la flecha del AppBar, el `SettingsPage` deberá navegar a `/configuracion` conservando el draft sin guardar.
- **R12.** Mientras hay `section`, el `SettingsPage` deberá mostrar en ambos anchos el cuerpo de la sección y la SaveBar.

Cargando:

- **R13.** Mientras `status` no es `ready` ni `error`, el `SettingsPage` deberá renderizar `app-skeleton-list` `variant="card"` en ambos anchos, también en la lista.

## Data model

```ts
// SettingsPage
readonly section = input<SettingsSection>(); // undefined en /configuracion
protected readonly current = computed(() => this.section() ?? 'perfil');
protected readonly notificationsValue = computed(() => { const n = this.facade.draft().notifications; return n.browser || n.email || n.mobile ? 'Activas' : 'Desactivadas'; });
```

## Implementation plan

1. `settings.routes.ts`: ruta índice con `SettingsPage`, `title` y `data: { layout: 'settings' }` (R1).
2. `SettingsPage`: `section` opcional + `current`, host, clases `u-desktop-only`, AppBar (lista/detalle), lista móvil con `button[app-setting-row]` en `app-card`, `open(section)`, `back()` (R2, R3, R6–R13).
3. `shell-screen.css`: `.l-screen > .l-shell__content { grid-area: main; }` en la container query (R5).
4. Tests en `settings-page.spec.ts` (R1–R3, R6–R13); actualizar el test de redirección.
5. Playwright en `npm start` a 390 px y 1440 px: lista, detalle con flecha, SaveBar en Perfil, scroll solo en `main`, escritorio sin cambios, consola sin errores (R4, R5).
6. `npx ng test --watch=false`, `npm run build`; `PENDING.md`; marcar el ítem en `TODO.md`.

## Acceptance criteria

- [x] `npx ng test --watch=false` pasa con tests de R1–R3, R6–R13 (949 tests; `app.spec.ts` actualizado: `/configuracion` ya no redirige).
- [x] `npm run build` sin errores ni warnings de budget.
- [x] Playwright a 390 px: lista «Ajustes» con tres Cards; fila abre la sección con AppBar y flecha; flecha vuelve a la lista; SaveBar en Perfil al cambiar un campo; solo `.l-screen__main` hace scroll; «Ajustes» activo en la BottomNav (R5–R12).
- [x] Playwright a 1440 px: `/configuracion` muestra Perfil y `/configuracion/*` como antes (R2, R4).
- [x] Sin `styles`/`styleUrl` en componentes; CSS solo en la divergencia `shell-screen.css`.
- [x] Sin sección nueva en `/demo`: no cambia `shared/components`.
- [x] Ítem marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** fila de perfil con icono `person_outline` en vez de Avatar (respuesta del usuario: sin tocar SettingRow).
- **Sí:** `/configuracion` sin redirección: lista en móvil, Perfil en escritorio, todo por CSS (respuesta del usuario).
- **Sí:** volver a la lista conserva el draft (el DS lo descarta), como el cambio de sección de SPEC 68.
- **Sí:** «Ayuda y contacto» y «Cerrar sesión» deshabilitadas: sin destino ni acción todavía.
- **Sí:** «Notificaciones» con valor «Activas»/«Desactivadas» según los canales (navegador, correo, móvil).
- **No:** SaveBar en la lista móvil; solo en el detalle.

## Risks

- DOM duplicado (AppBar/lista móviles vs menú/cabecera de escritorio): los tests buscan dentro de `.u-mobile-only`/`.u-desktop-only`.
- jsdom no evalúa container queries: R4 y R5 solo con Playwright.

## What is **not** in this spec

Avatar en SettingRow, acciones de cuenta, aviso de cambios sin guardar, Inicio y Semana móviles.
