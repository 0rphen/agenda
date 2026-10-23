# SPEC 01 — Fundación CSS del design system Agenda

> **Status:** Approved
> **Depends on:** —
> **Date:** 2026-10-22
> **Objective:** Montar la base CSS global del design system Agenda (capas, tokens generados desde `tokens.json`, reset, contexto, utilidades y fuentes) para que los componentes posteriores solo añadan su bloque.

## Por qué existe este spec

El `tokens.css` publicado en el DS está desfasado respecto a `tokens.json` y a los bloques CSS (usa `--brand`, `--space-4` en px y un tema oscuro que el DS ya no tiene). Copiarlo rompería todos los bloques. Por eso los tokens se generan con un script a partir de `tokens.json`.

## Scope

**In:**

- Copia de `project/tokens.json` del DS en `design-system/tokens.json`.
- Script `scripts/build-tokens.mjs` que genera `src/styles/tokens.css` desde ese JSON.
- Script npm `"tokens": "node scripts/build-tokens.mjs"`.
- `src/styles.css` como entrada única: declaración de capas e imports.
- Copias literales del DS: `reset/reset.css`, `tokens/context.css`, `utilities/visually-hidden.css`, `utilities/reduced-motion.css`, `utilities/category.css` bajo `src/styles/`.
- Carpeta `src/styles/blocks/` vacía (con `.gitkeep`) como destino de bloques futuros.
- `src/index.html`: `lang="es"`, `class="app"` en `<body>`, tres `<link>` de Google Fonts (Asap Sharp 400–700, Material Icons Outlined, Material Icons).
- `body` con fondo `--color-surface-page`, color `--color-ink`, fuente `--font-sans` (regla en `@layer reset`).
- Vaciar el placeholder de `src/app/app.html` (queda solo `<router-outlet />`) y ajustar `src/app/app.spec.ts`.

**Out of scope (para specs futuros):**

- Componentes Angular (Input, Icon, Button…) y sus bloques CSS — SPEC 02 en adelante.
- Composition (`.l-shell`, `.l-stack`, `.l-cluster`, `.l-grid`, `.l-screen`) — llega con el spec que la use.
- Clases tipográficas (`.h1`, `.body`…) — no hay consumidor aún.
- Sincronización automática con el artifact (descargar `tokens.json` por red).
- Self-hosting de fuentes.

## Data model

Entrada (`design-system/tokens.json`, forma real del DS):

```json
{
  "color":   { "themes": [{ "id": "default" }], "tokens": [{ "name": "color-brand", "value": "oklch(...)", "usage": "..." }] },
  "spacing": { "tokens": [{ "name": "space-3xs", "value": "0.25rem", "usage": "..." }] },
  "type":    { "families": { "sans": "\"Asap Sharp\", ...", "icon": "\"Material Icons Outlined\", ..." }, "groups": [...] }
}
```

Salida (`src/styles/tokens.css`):

```css
/* Generado por scripts/build-tokens.mjs desde design-system/tokens.json — no editar */
:root {
  --color-brand: oklch(...);
  --space-3xs: 0.25rem;
  --font-sans: "Asap Sharp", ...;
  --font-icon: "Material Icons Outlined", ...;
}
```

Reglas del script:

- Recorre todo grupo de primer nivel con array `tokens` y emite `--<name>: <value>;`.
- Familias de `type.families` emiten `--font-<clave>`.
- `type.groups` (estilos tipográficos) se ignora.
- Sin bloque `[data-theme]`: tema único.
- Sin `@layer` dentro del archivo; la capa la pone el `@import ... layer(tokens)`.

Entrada CSS (`src/styles.css`):

```css
@layer reset, tokens, composition, block, utility, exception;
@import url('./styles/tokens.css') layer(tokens);
@import url('./styles/reset/reset.css');
@import url('./styles/tokens/context.css');
@import url('./styles/utilities/category.css');
@import url('./styles/utilities/reduced-motion.css');
@import url('./styles/utilities/visually-hidden.css');
```

## Implementation plan

1. Copiar `project/tokens.json` del DS a `design-system/tokens.json`.
2. Crear `scripts/build-tokens.mjs` y el script npm `tokens`. El script incluye una autocomprobación con `assert` (existen `--color-brand`, `--space-3xs`, `--l-step-hover`, `--font-sans`, `--font-icon`; ningún valor contiene `px` salvo `--border-hairline` y sombras). Ejecutar `npm run tokens` y commitear `src/styles/tokens.css`.
3. Copiar literalmente reset, context y las tres utilidades del DS a `src/styles/`. Crear `src/styles/blocks/.gitkeep`.
4. Reescribir `src/styles.css` con capas e imports. Añadir en `reset.css` la regla de `body` (fondo, color, fuente). `npm run build` sin errores.
5. Editar `src/index.html` (`lang="es"`, `class="app"`, links de fuentes).
6. Dejar `src/app/app.html` en `<router-outlet />`. Quitar el test «should render title» de `app.spec.ts`. `npm test -- --watch=false` en verde.

## Acceptance criteria

- [ ] `npm run tokens` termina con código 0 y la autocomprobación pasa.
- [ ] Ejecutar `npm run tokens` dos veces seguidas no produce diff en `src/styles/tokens.css`.
- [ ] `src/styles/tokens.css` no contiene `--brand:`, `--space-4:` ni `[data-theme`.
- [ ] `npm run build` termina sin errores ni warnings de budget.
- [ ] `npm test -- --watch=false` pasa.
- [ ] En `npm start`, el `<body>` tiene clase `app`, `lang="es"` en `<html>`, y `getComputedStyle(document.body).backgroundColor` corresponde a `--color-surface-page`.
- [ ] En DevTools, `document.styleSheets` muestra las capas en el orden `reset, tokens, composition, block, utility, exception`.
- [ ] Las fuentes Asap Sharp y Material Icons Outlined cargan (pestaña Network, 200).
- [ ] Ningún archivo de `src/styles/` (salvo `tokens.css` generado) contiene colores literales.

## Decisions

- **Sí:** generar tokens desde `tokens.json` con script en repo. El `tokens.css` publicado está desfasado y el script se re-ejecuta cuando cambie el DS.
- **No:** copiar `tokens.css` publicado. Nombres viejos; rompería los bloques.
- **No:** esperar a que el DS regenere `tokens.css`. Bloquearía el proyecto.
- **Sí:** CSS global en `src/styles/`, bloques futuros en `src/styles/blocks/` importados desde `src/styles.css`. Respeta CUBE y el orden de capas; la encapsulación emulada rompería selectores como `.field[data-invalid] > &`.
- **No:** `styleUrl` por componente con `ViewEncapsulation.None`. Orden de capas dependiente de la carga y cuenta para el budget de 4 kB.
- **Sí:** fundación mínima (layers, tokens, reset, context, utilities). Composition y blocks llegan con su consumidor.
- **Sí:** `class="app"` en `<body>` y fuentes vía `<link>` en `index.html`, como indica el DS.
- **Sí:** `src/styles.css` sigue como entrada; no se toca `angular.json`.
- **No:** clases tipográficas del `type.groups`. Sin consumidor.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `tokens.json` del DS cambia de forma | La autocomprobación del script falla y lo hace visible. |
| `@import ... layer()` no soportado por el builder | Paso 4 verifica con `npm run build`; si falla, envolver el contenido generado en `@layer tokens {}` desde el script. |
| Google Fonts bloqueado o lento | `--font-sans` tiene fallback `system-ui`; los íconos mostrarían el nombre de ligadura. |

## What is **not** in this spec

- Componentes Angular y sus bloques CSS.
- Composition / layout (`.l-shell` y demás).
- Clases tipográficas.
- Sincronización automática con el artifact.
- Fuentes self-hosted.

Cada uno, si llega, va en su propio spec.
