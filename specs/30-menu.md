# SPEC 30 — Componente Menu

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 02, SPEC 15, SPEC 17
> **Date:** 2026-10-24
> **Objective:** Crear `app-menu` como menú de acciones contextuales que refleja el Menu del DS Agenda (disparador IconButton «más acciones», ítems con icono, atajo, tono destructivo, deshabilitados, selección única, divisores y secciones, teclado ↑ ↓ Inicio Fin Esc Tab y clic fuera).

## Scope

**In:**

- Bloque CSS `src/styles/blocks/menu.css`: copia literal del DS (`project/assets/Code/styles/blocks/menu.css`). Importado en `src/styles.css` tras `fab.css`.
- `src/app/shared/menu/menu.ts` — componente `Menu` (selector `app-menu`, template externo `menu.html`) y tipos exportados `MenuItem`, `MenuEntry`.
- `IconButton`: inputs opcionales `expanded` y `haspopup` para `aria-expanded` / `aria-haspopup` del `button` interno (+ tests).
- Test Vitest `menu.spec.ts`.
- `src/app/demo/demo-page.html` + `demo-page.ts` + `demo-page.spec.ts`: sección Menu e índice.
- Marcar «Menu» en `TODO.md`.

**Out of scope:**

- `onClick` por ítem: la acción llega por la salida `itemSelected`.
- Estados forzados `data-force` (hover/active/focus del preview DS). La regla viene en el CSS copiado, pero el componente no la expone.
- Submenús y límite de ~8 ítems (reglas de uso del DS).
- Reposicionar el panel si se sale de la pantalla.

## Requisitos (EARS)

- **R1.** El `app-menu` deberá tener en el host `class="menu"`; donde `static` sea verdadero, `data-static`; donde `align` sea `'start'`, `data-align="start"` (con `'end'`, valor por defecto, sin atributo).
- **R2.** Mientras `static` sea falso, el `Menu` deberá renderizar un `app-icon-button` disparador con `icon` (por defecto `more_horiz`), `label` igual a `triggerLabel` (por defecto «Más acciones»), `variant` y `size`, con `aria-haspopup="menu"` y `aria-expanded` igual a `open`.
- **R3.** Mientras `static` sea verdadero, el `Menu` deberá renderizar solo el panel, siempre visible, sin disparador.
- **R4.** Mientras `static` sea falso y `open` sea falso (por defecto), el `Menu` no deberá renderizar el panel.
- **R5.** Cuando el usuario hace clic en el disparador, el `Menu` deberá alternar `open` (model, emite `openChange`).
- **R6.** El panel deberá ser `<div class="menu__panel" role="menu">` con `aria-label` igual a `label` (por defecto «Acciones»).
- **R7.** El `Menu` deberá renderizar cada `MenuItem` de `items` como `<button type="button" class="menu__item" role="menuitem">`, en orden, con `app-icon` si hay `icon`, `<span>` con `label`, `<span class="menu__shortcut">` si hay `shortcut`, `data-tone="danger"` si `tone` es `'danger'` y `disabled` nativo si `disabled`.
- **R8.** El `Menu` deberá renderizar `{ divider: true }` como `<div class="menu__divider" role="separator">` y `{ section }` como `<div class="menu__label" role="presentation">` con ese texto.
- **R9.** Donde un ítem tenga `selected` definido, el `button` deberá tener `role="menuitemradio"` y `aria-checked` igual a `selected`; mientras `selected` sea verdadero, `data-selected` y un `app-icon` `check` con clase `menu__check` al final.
- **R10.** Cuando el usuario hace clic en un ítem habilitado, el `Menu` deberá emitir `itemSelected` con el ítem; mientras `static` sea falso, además deberá cerrar y devolver el foco al disparador.
- **R11.** Cuando el panel se abre (sin `static`), el `Menu` deberá llevar el foco al primer ítem habilitado.
- **R12.** Cuando el usuario pulsa ↓ / ↑ / Inicio / Fin dentro del panel, el `Menu` deberá mover el foco al siguiente / anterior (cíclico) / primer / último ítem habilitado.
- **R13.** Mientras `static` sea falso, cuando el usuario pulsa Esc dentro del panel, el `Menu` deberá cerrar y devolver el foco al disparador; cuando pulsa Tab, deberá cerrar.
- **R14.** Mientras el panel está abierto (sin `static`), cuando hay `mousedown` fuera del host, el `Menu` deberá cerrar.
- **R15.** Donde `IconButton` reciba `expanded` / `haspopup`, el `button` interno deberá pintar `aria-expanded` (`"true"`/`"false"`) / `aria-haspopup`; sin ellos, sin atributos.
- **R16.** El `Menu` no deberá usar `styleUrl` ni estilos de componente; todo el aspecto viene de `menu.css`.

## Data model

```ts
// src/app/shared/menu/menu.ts
export type MenuItem = {
  label: string;
  icon?: string;
  shortcut?: string;
  tone?: 'danger';
  disabled?: boolean;
  selected?: boolean;
};
export type MenuEntry = MenuItem | { divider: true } | { section: string };

export class Menu {
  // inputs: items: MenuEntry[] (required) · label = 'Acciones' · align: 'end' | 'start' = 'end'
  //         icon = 'more_horiz' · triggerLabel = 'Más acciones' · variant: IconButtonVariant = 'ghost'
  //         size: 's' | 'm' | 'l' = 'm' · static: boolean = false (booleanAttribute, alias de isStatic)
  // model: open = false · output: itemSelected: MenuItem
  // host: class 'menu', data-static, data-align, (document:mousedown)
}

// src/app/shared/icon-button/icon-button.ts (nuevo)
// inputs: expanded?: boolean · haspopup?: 'menu'
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md`. Copiar `menu.css` del DS a `src/styles/blocks/`, sin cambios; `@import` en `src/styles.css` tras `fab.css` (R16).
2. `IconButton`: tests R15 en `icon-button.spec.ts`; inputs `expanded` y `haspopup` con `[attr.aria-expanded]`/`[attr.aria-haspopup]`. Verde.
3. `menu.spec.ts` con host de test (`static` sin valor, `[(open)]`, `(itemSelected)`): un test por R1–R14. Fallan.
4. Crear `Menu` (`templateUrl: './menu.html'`, `imports: [Icon, IconButton]`). Template: disparador `@if (!isStatic())`; panel `@if (isStatic() || open())`; `@for` sobre `items` distinguiendo ítem (`asItem`, `'label' in entry`) / `'section' in entry` / divisor. Teclado en `(keydown)` del panel sobre `.menu__item:not(:disabled)`; foco inicial con `afterRenderEffect`; clic fuera con `(document:mousedown)` en `host`. Tests en verde.
5. Demo: sección `menu` en `demo-page.html` (tras Fab), `{ id: 'menu', name: 'Menu' }` en `SECTIONS` y `'menu'` en `IDS`. Copy del preview DS: estático «Acciones de la cita» (Editar `E`, Duplicar `D`, Mover a otro día, divisor, Compartir, Archivar deshabilitado, divisor, Eliminar cita `danger` `⌫`); estático «Vista» con selección única (sección Vista: Día, Semana seleccionada, Mes; divisor; sección Mostrar: Citas canceladas); con disparador cerrado junto a «Lanzamiento de Bestbuy · 09:30».
6. Playwright en `/demo`: clic abre y enfoca el primer ítem, ↑ ↓ Inicio Fin saltan el deshabilitado, Esc cierra y devuelve el foco, clic fuera cierra, hover/active/focus-visible del ítem, consola limpia.
7. Marcar «Menu» en `TODO.md`. `npm test -- --watch=false` y `npm run build` en verde.

## Acceptance criteria

- [x] `npm test -- --watch=false` pasa y hay al menos un test por cada requisito R1–R15.
- [x] `npm run build` termina sin errores ni warnings de budget.
- [x] `diff` entre `src/styles/blocks/menu.css` y el original del DS no muestra diferencias.
- [x] `src/app/shared/menu/` no declara `styles` ni `styleUrl` (R16).
- [x] Host `class="menu"`, `data-static` con `static`, `data-align="start"` solo con `align="start"` (R1).
- [x] Disparador `app-icon-button` con `more_horiz`, «Más acciones», `aria-haspopup="menu"` y `aria-expanded` que sigue a `open`; clic alterna `open` (R2, R5, R15).
- [x] `static` sin disparador y panel visible; sin `static` y cerrado, sin panel (R3, R4).
- [x] Panel `div.menu__panel[role=menu]` con `aria-label` (R6).
- [x] Ítems, atajos, `danger`, `disabled`, divisores y secciones según R7–R8.
- [x] `selected` da `menuitemradio`, `aria-checked`, `data-selected` y `check` (R9).
- [x] Clic en ítem emite `itemSelected`, cierra y devuelve foco al disparador (R10).
- [x] Teclado: foco inicial, ↑ ↓ Inicio Fin, Esc, Tab y clic fuera según R11–R14.
- [x] `/demo` muestra la sección Menu con las variantes del paso 5 y aparece en el índice.
- [x] Ítem «Menu» marcado en `TODO.md`.
- [x] Sin emojis ni copy en inglés.

## Decisions

- **Sí:** inputs `expanded`/`haspopup` en `IconButton` (decidido con el usuario). **No:** `button.icon-button` propio en `Menu`.
- **Sí:** salida `itemSelected(item)` (decidido con el usuario). **No:** `onClick` por ítem. **No:** nombre `select` (choca con el evento DOM).
- **Sí:** `open` como `model()`: cubre `defaultOpen` y `open` + `onOpenChange` del DS.
- **Sí:** input `static` con alias (propiedad `isStatic`, `static` es palabra reservada en clases).
- **Sí:** tras clic en un ítem (sin `static`), el foco vuelve al disparador. El DS no lo hace; sin ello el foco se pierde al desmontar el panel.
- **Sí:** ↑ sin foco en un ítem va al último (el DS va al penúltimo por aritmética modular).
- **No:** `data-force`: ningún componente del repo lo soporta; la demo usa estados reales.
- **No:** `defaultOpen` en la demo: el foco inicial movería el scroll de `/demo` al cargar.
- **Sí:** CSS copiado literal (incluye reglas `data-force` sin uso y el `outline-offset` duplicado).

## Risks

- `afterRenderEffect` solo corre en navegador: en SSR no hay foco inicial (correcto, no hay usuario).

## What is **not** in this spec

- `onClick` por ítem; `data-force`; submenús; reposicionar el panel en bordes de pantalla.
