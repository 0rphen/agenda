# SPEC 25 — Componente Alert

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 14, SPEC 15, SPEC 17, SPEC 22
> **Date:** 2026-10-23
> **Objective:** Crear `app-alert` como aviso en línea tonto que refleja el Alert del DS Agenda (tono, icono, título, texto, acción proyectada y cierre opcional).

## Scope

**In:**

- Bloque CSS `src/styles/blocks/alert.css`: copia literal del DS (`project/assets/Code/styles/blocks/alert.css`). Importado en `src/styles.css` tras `card.css`.
- `src/app/shared/alert/alert.ts` — componente `Alert` (selector `app-alert`, template externo `alert.html`) y directiva `AlertAction` (selector `[alertAction]`).
- Test Vitest `alert.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts`: sección Alert.
- Marcar «Alert» en `TODO.md`.

**Out of scope:**

- Autoocultarse al cerrar (el consumidor quita el `app-alert`).
- Avisos efímeros / toast, temporizadores, animaciones de entrada o salida.
- Nivel de encabezado para el título (el DS usa `<p>`).
- Detectar texto vacío (el `<p class="alert__text">` se pinta siempre).
- `role="alert"` en `warning`.

## Requisitos (EARS)

- **R1.** El `app-alert` deberá tener en el host `class="alert"`.
- **R2.** Donde `tone` sea `'success' | 'warning' | 'danger'`, el host deberá tener `data-tone` = `tone`; con `'info'` (valor por defecto), sin atributo.
- **R3.** Mientras `tone` sea `'danger'`, el host deberá tener `role="alert"`; con cualquier otro tono, `role="status"`.
- **R4.** El `Alert` deberá renderizar como primer hijo un `app-icon` decorativo (`aria-hidden="true"`) con `icon` si tiene valor; si no, `info`, `check_circle`, `warning_amber` o `error_outline` según `tone` (`info`, `success`, `warning`, `danger`).
- **R5.** El `Alert` deberá renderizar `<div class="alert__body">` tras el icono.
- **R6.** Donde `heading` tenga valor, el `Alert` deberá renderizar `<p class="alert__title">` con ese texto como primer hijo de `.alert__body`; sin `heading`, no deberá renderizarlo.
- **R7.** El `Alert` no deberá declarar input `title` y el host no deberá tener atributo `title`.
- **R8.** El `Alert` deberá proyectar el contenido por defecto dentro de `<p class="alert__text">` en `.alert__body`, tras el título.
- **R9.** Donde el consumidor proyecte un elemento con `alertAction`, el `Alert` deberá colocarlo dentro de `<div class="alert__action">` al final de `.alert__body`; sin `alertAction`, no deberá renderizar `.alert__action`.
- **R10.** Mientras `dismissible` sea `true`, el `Alert` deberá renderizar tras `.alert__body` un `app-icon-button` con `icon="close"`, `label="Cerrar aviso"` y `size="s"`; si no, no deberá renderizarlo.
- **R11.** Donde `dismissible` se pase como atributo suelto, el `Alert` deberá tratarlo como `true` (`booleanAttribute`).
- **R12.** Cuando el usuario activa el botón de cierre, el `Alert` deberá emitir `closed` (`void`).
- **R13.** Cuando el usuario cierra, el `Alert` no deberá ocultarse por sí mismo; el host deberá seguir en el DOM hasta que el consumidor lo quite.
- **R14.** El `Alert` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `alert.css`.

## Data model

Sin tipos compartidos nuevos.

```ts
// src/app/shared/alert/alert.ts
export type AlertTone = Extract<Tone, 'info' | 'success' | 'warning' | 'danger'>;

@Directive({ selector: '[alertAction]' })
export class AlertAction {}

export class Alert {
  // inputs: tone: AlertTone = 'info' · heading?: string · icon?: string
  //         dismissible = false (booleanAttribute)
  // output: closed = output<void>()
  // action = contentChild(AlertAction)
  // iconName = computed(() => icon() ?? ICONS[tone()])
  // host: class 'alert', data-tone, role
}
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `alert.css` del DS a `src/styles/blocks/` sin cambios; `@import` en `src/styles.css` tras `card.css`. `npm run build` sin errores (R14).
2. `alert.spec.ts` con host de test: un test por R1–R13 (R7: `heading="..."` estático y `[heading]` sin atributo `title`). Fallan.
3. Crear `Alert` + `AlertAction` (`templateUrl: './alert.html'`, `imports: [Icon, IconButton]`). Template: `<app-icon [name]="iconName()" />`; `.alert__body` con `@if (heading())` título, `<p class="alert__text"><ng-content /></p>`, `@if (action())` `.alert__action` con `<ng-content select="[alertAction]" />`; `@if (dismissible())` `app-icon-button` que emite `closed`. Tests en verde.
4. Demo: sección `alert` en `demo-page.html` (tras Card) y `{ id: 'alert', name: 'Alert' }` en `SECTIONS`, copy del preview DS: info «Permiso de notificaciones» con `app-button` `size="s"` `variant="secondary"` «Permitir en el navegador»; success «Cambios guardados» `dismissible` que se quita al cerrar (signal) con botón «Mostrar de nuevo»; warning «Tienes citas en conflicto»; danger «No pudimos guardar» con `app-button` `size="s"` `icon="refresh"` «Reintentar»; info solo texto.
5. Playwright en `/demo`: colores e icono por tono, roles, Tab llega a acción y cierre, cerrar quita el aviso y «Mostrar de nuevo» lo repone, consola limpia.
6. Marcar «Alert» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [ ] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R13.
- [ ] `npm run build` termina sin errores ni warnings de budget.
- [ ] `diff` entre `src/styles/blocks/alert.css` y el del DS no muestra diferencias.
- [ ] `src/app/shared/alert/` no declara `styles` ni `styleUrl` (R14).
- [ ] `<app-alert>Texto</app-alert>` renderiza `.alert[role=status]` sin `data-tone`, icono `info` y `.alert__body > p.alert__text` «Texto» (R1–R5, R8).
- [ ] `tone="danger"` pone `data-tone="danger"`, `role="alert"` e icono `error_outline`; `tone="warning"` pone `role="status"` e icono `warning_amber` (R2–R4).
- [ ] `icon="schedule"` sustituye el icono del tono (R4).
- [ ] `heading="Cambios guardados"` renderiza `p.alert__title` antes de `.alert__text`; host sin atributo `title` (R6, R7).
- [ ] `<app-button alertAction>` queda dentro de `.alert__action`; sin él no hay `.alert__action` (R9).
- [ ] `dismissible` (atributo suelto) pinta `app-icon-button` «Cerrar aviso»; clic emite `closed` y el host sigue en el DOM (R10–R13).
- [ ] `/demo` muestra la sección Alert con las variantes del paso 4 y aparece en el índice.
- [ ] Ítem «Alert» marcado en `TODO.md`.
- [ ] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** input `heading`, como Card (SPEC 23) y Progress (SPEC 24). **No:** `title` (tooltip nativo en el host).
- **Sí:** acción por slot `[alertAction]` con directiva `AlertAction` + `contentChild`, patrón de `cardActions`. **No:** inputs `actionLabel`/`actionIcon` (menos flexible).
- **Sí:** `dismissible` + output `closed`; el consumidor decide quitarlo (componente tonto). **No:** autoocultarse (estado interno duplicado con el del consumidor).
- **Sí:** `role="alert"` solo en `danger` (README del DS). **No:** `alert` también en `warning` como el bundle (interrumpe al lector de pantalla por conflictos no urgentes).
- **Sí:** texto por proyección dentro de `<p class="alert__text">` siempre; admite markup. **No:** input `text` (sin markup).
- **Sí:** input `icon` opcional (existe en `AlertProps`).
- **Sí:** `AlertTone` local con `Extract<Tone, …>`. **No:** tipo nuevo en `ui.ts` (sin otros consumidores).
- **Sí:** CSS copiado literal.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Aviso solo con título deja `<p class="alert__text">` vacío y suma `gap` 3xs | Aceptado; el DS siempre muestra texto en sus ejemplos. Revisar si aparece un caso real. |
| `role="alert"` en un aviso presente desde la carga (SSR) no se anuncia | Lectores anuncian cambios; el consumidor inserta el aviso tras el error. Aceptado. |
| `contentChild(AlertAction)` solo detecta la directiva en el elemento raíz proyectado | Demo y tests la ponen en `app-button` directo. |

## What is **not** in this spec

- Autoocultar; toast/efímeros; animaciones; `h*` para el título; detección de texto vacío; `role="alert"` en `warning`.
