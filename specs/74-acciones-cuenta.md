# SPEC 74 — Acciones de cuenta en Configuración

> **Status:** Implemented
> **Depends on:** SPEC 07 (Avatar), SPEC 25 (Alert), SPEC 42 (Dialog), SPEC 68 (Configuración), SPEC 69 (clave `agenda:v3`)
> **Date:** 2026-10-27
> **Objective:** Dar efecto local a los botones de cuenta de Configuración que hoy no hacen nada: foto de perfil, exportar datos, eliminar cuenta y permiso de notificaciones; avisar «No disponible» en contraseña y cierre de sesión.

## Scope

**In:**

- `UserSettings.profile.photo: string` (dataURL, `''` sin foto) persistido con el resto de ajustes.
- Perfil: «Cambiar foto» abre `input[type=file]` (`accept="image/png,image/jpeg"`, máx. 2 MB) y la muestra en `app-avatar` `src`; «Quitar» la borra. Entra en el draft (SaveBar).
- Seguridad: «Exportar» descarga `agenda-export-AAAA-MM-DD.json` con citas, tareas y ajustes; «Eliminar cuenta» con Dialog de confirmación borra las claves `agenda:*` de localStorage y recarga en `/inicio` (re-siembra).
- Seguridad: «Cambiar» contraseña y «Cerrar sesión» muestran `app-alert` «No disponible en esta versión.»; también «Cerrar sesión» de la lista móvil (hoy `disabled`, SPEC 77).
- Notificaciones: «Permitir en el navegador» llama a `Notification.requestPermission()`; el Alert refleja el estado (`granted`/`denied`/sin soporte).
- Tests; `PENDING.md`.

**Out of scope:**

- Backend, autenticación real, cambio de contraseña real.
- Enviar notificaciones (solo pedir permiso).
- Recortar o redimensionar la foto.
- Importar el JSON exportado.

## Requisitos (EARS)

Foto:

- **R1.** Cuando el usuario pulsa «Cambiar foto» y elige un PNG/JPG de hasta 2 MB, la app deberá guardar el dataURL en `draft.profile.photo`, mostrarlo en el Avatar y activar la SaveBar.
- **R2.** Si el archivo no es PNG/JPG o pasa de 2 MB, entonces la app no deberá cambiar el draft y deberá mostrar `app-alert` `danger` «La foto debe ser JPG o PNG de hasta 2 MB.».
- **R3.** Mientras hay foto, «Quitar» deberá borrar `draft.profile.photo` y el Avatar volverá a las iniciales; sin foto, «Quitar» deberá estar `disabled`.

Exportar:

- **R4.** Cuando el usuario pulsa «Exportar», la app deberá descargar `agenda-export-<fecha local ISO>.json` con `{ events, tasks, settings, exportedAt }` leídos del almacenamiento.
- **R5.** Si la lectura falla, entonces deberá mostrar `app-alert` `danger` «No se pudieron exportar tus datos.».

Eliminar cuenta:

- **R6.** Cuando el usuario pulsa «Eliminar cuenta», la app deberá abrir `app-dialog` «¿Eliminar tu cuenta?» con «Se borran tus citas, tareas y ajustes. No se puede deshacer.», «Cancelar» (`ghost`) y «Eliminar cuenta» (`danger`).
- **R7.** Cuando el usuario confirma, la app deberá borrar todas las claves de localStorage que empiezan por `agenda:` y navegar a `/inicio` con recarga completa; cuando cancela, no deberá borrar nada.

No disponible:

- **R8.** Cuando el usuario pulsa «Cambiar» (contraseña) o «Cerrar sesión», la app deberá mostrar `app-alert` `info` descartable «No disponible en esta versión.» en esa Card.
- **R12.** Cuando el usuario pulsa «Cerrar sesión» en la lista móvil de `/configuracion`, la app deberá mostrar el mismo `app-alert` encima de esa Card; la fila deberá dejar de estar `disabled`.

Notificaciones:

- **R9.** Cuando el usuario pulsa «Permitir en el navegador», la app deberá llamar a `Notification.requestPermission()`.
- **R10.** Mientras `Notification.permission` es `granted`, el Alert deberá decir «Notificaciones permitidas en este navegador.» (tono `success`, sin botón); si es `denied`, «Bloqueaste las notificaciones. Actívalas en los ajustes del navegador.» (sin botón); si el navegador no tiene `Notification`, «Tu navegador no admite notificaciones.».
- **R11.** El servidor no deberá leer `Notification` ni `localStorage` (estado leído tras `afterNextRender`).

## Data model

```ts
// settings.model.ts
profile: { firstName: string; lastName: string; timeZone: string; language: string; photo: string };

// SettingsFacade
exportData(): Promise<void>;
exportError: Signal<boolean>;
deleteAccount(): void;
notificationPermission: Signal<NotificationStatus | undefined>; // NotificationPermission | 'unsupported'
readNotificationPermission(): void; // afterNextRender
requestNotifications(): Promise<void>;
```

## Implementation plan

1. `photo` en el modelo y el repositorio; Perfil con input de archivo oculto, validación y `src` del Avatar (R1–R3).
2. `exportData()` (Blob + `a[download]`) y error (R4, R5).
3. Dialog de eliminar cuenta y borrado de `agenda:*` (R6, R7).
4. Alerts «No disponible» en Seguridad y en la lista móvil (R8, R12).
5. Permiso de notificaciones con estado en facade (R9–R11).
6. Playwright `/configuracion/*`; `npm test -- --watch=false`; `npm run build`.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa, con ≥1 test por requisito R1–R12.
- [x] `npm run build` sin errores ni warnings de budget.
- [x] Playwright: subir foto, guardar y recargar la mantiene; «Quitar» vuelve a iniciales (R1, R3).
- [x] Playwright: «Exportar» descarga JSON válido con `events`, `tasks`, `settings` (R4).
- [x] Playwright: «Eliminar cuenta» confirmado deja `/inicio` con el seed; cancelado no borra (R6, R7).
- [x] Sin errores de hidratación; copy en español; sin emojis.

## Decisions

- **Sí:** acciones locales + aviso «No disponible» para contraseña y sesión (usuario).
- **Sí:** foto como dataURL en ajustes (límite 2 MB del copy del DS; cabe en localStorage).
- **Sí:** eliminar cuenta = borrar `agenda:*` y recargar (re-siembra el seed).
- **No:** importar datos: nadie lo pidió.
- **Sí:** export lee los DTO crudos con `LocalStorageApi.get('/events' | '/tasks')` (si faltan las claves, siembra como el resto de la app) y ajustes con `SettingsRepository.load()`.
- **Sí:** `photo: string` con default `''` en vez de opcional: el FieldTree de Signal Forms necesita la clave y el merge por grupo la rellena en ajustes viejos.
- **Sí:** «Bloqueaste…» con tono `warning`; «no admite» con `info`.
- **Sí:** «Ayuda y contacto» sigue `disabled` en la lista móvil (sin destino).

## Risks

- Foto de 2 MB en base64 (~2.7 MB) cerca del límite de localStorage (~5 MB); `save()` puede fallar y mostrará el Alert de error existente.
- `Notification.requestPermission` en Safari antiguo usa callback; solo la forma Promise.

## What is not in this spec

Backend, contraseña real, envío de notificaciones, recorte de foto, importación.
