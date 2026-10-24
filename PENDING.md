# PENDING — candidatos para TODO.md

## SPEC 29 — Fab (2026-10-24)

- [duda] En `extended`, el `aria-label` repite el texto visible (opción tomada: mantenerlo, igual que el DS; inofensivo para lectores de pantalla).
- [pendiente] Anclar el Fab en `.l-screen__fab` (sobre `BottomNav`, área segura) cuando exista la composición de pantalla móvil.

## SPEC 30 — Menu (2026-10-24)

- [duda] Tras elegir un ítem, el DS no devuelve el foco al disparador (opción tomada: devolverlo, porque al desmontar el panel el foco se perdía).
- [duda] ↑ sin foco en un ítem: el DS salta al penúltimo por aritmética modular (opción tomada: ir al último).
- [sugerencia] Reposicionar el panel (`align` automático) cuando se sale del borde de la pantalla o del contenedor.
- [pendiente] Usar `app-menu` en AppBar y en las tarjetas de cita (EventCard/AgendaItem) cuando existan.

## SPEC 31 — DayPill (2026-10-24)

- [sugerencia] Hover de `.day-pill` casi invisible: `--color-brand-soft` (oklch 0.91 0.008 241.7) y `--color-surface-sunken` (oklch 0.917 0.005 247.9), el fondo en reposo, son casi iguales. Pedir al DS más contraste o otro token de hover.
- [pendiente] `WeekStrip` debe construir el `label` de cada `DayPill` con la fecha completa («Jueves 22 de octubre, hoy, con eventos»).

## SPEC 32 — AgendaItem (2026-10-24)

- [duda] El preview DS usa columnas de `21.25rem` (opción tomada: reutilizar `.demo__narrow`, `max-inline-size: 22rem`, para no añadir CSS a la demo).
- [sugerencia] Pedir al DS que renombre la prop `title` de AgendaItem (y revisar EventCard/TaskItem) a `heading`: choca con el atributo global HTML en Angular.
- [pendiente] Componente o composición `AgendaGroup` (`.agenda-group__title` + lista ordenada por hora) cuando llegue la pantalla de agenda.

## SPEC 33 — TaskItem (2026-10-24)

- [duda] El chevron sugiere que la fila abre el detalle, pero el DS no define clic en la fila (opción tomada: chevron decorativo, sin salida de clic).
- [duda] El DS escribe siempre «N subtareas» (opción tomada: «1 subtarea» en singular).
- [sugerencia] `label.check` tiene `min-block-size: var(--touch-target)` sin condición `pointer: coarse`, así que la fila mide ~61 px en vez de `control-l` (48 px). Pedir al DS que lo limite a puntero grueso.
- [pendiente] Navegación al detalle de tarea (clic en la fila o en el chevron) cuando exista la pantalla de tareas.

## SPEC 34 — EventCard (2026-10-24)

- [duda] El DS anida `h4` (título) y `p` (lugar) dentro del `button`, HTML inválido (opción tomada: `span` con las mismas clases).
- [duda] El nombre accesible del botón incluye los nombres de todos los asistentes visibles (avatares `role="img"`) y «N más» (opción tomada: dejarlo, fiel al DS).
- [sugerencia] En `AvatarGroup` sobre tarjeta, las iniciales del avatar solapado («MG») quedan recortadas por el siguiente; revisar con el DS el solape o el tamaño `s`.
- [pendiente] Menú de acciones (`app-menu`) en EventCard cuando lo pida la pantalla.

## SPEC 35 — StatCard (2026-10-24)

- [duda] El preview DS etiqueta los estados forzados como «Hover», «Active», «Focus» (opción tomada: copiar el texto del DS en la demo, igual que la demo de Card).
- [pendiente] Resumen (OverviewPage/MobileOverview): cuatro `StatCard` en `.l-grid data-min="s"` (`data-cols="2"` en móvil) que navegan a su vista con `(clicked)`.

## SPEC 36 — SettingRow (2026-10-24)

- [duda] El bloque DS `setting-row.css` declara `outline-offset` dos veces en `:focus-visible` (la segunda gana, offset negativo) (opción tomada: copia literal; pedir limpieza al DS).
- [duda] Con `wide`, el `.field` del select y el `.segmented` no llenan `.setting-row__trail` (16rem / 100% en estrecho): miden por contenido, igual que en el DS (opción tomada: fiel al DS).
- [pendiente] Prop `leading` del DS (cabecera libre en lugar de `icon`) cuando la pida alguna pantalla.
- [pendiente] Pantalla de Ajustes (`data-layout="settings"`) con `SettingRow` en `Card` y `SaveBar`.

## SPEC 37 — WeekStrip (2026-10-24)

- [duda] El DS no da nombre accesible a cada `DayPill` de la tira (opción tomada: `WeekStrip` lo deriva de `iso` con `Intl` `es-ES` en UTC, «Jueves 22 de octubre, hoy, con eventos»).
- [duda] El DS expone `selected` + `onSelect` (opción tomada: `model()` con `[(selected)]`, como `done` en TaskItem).
- [pendiente] Calcular los siete días (lunes a domingo) de la semana visible y navegar entre semanas en la pantalla móvil `WeekStrip` + `DayView`.
- [sugerencia] Navegación con flechas entre píldoras (roving tabindex); el DS no la define.

## SPEC 38 — MiniCalendar (2026-10-24)

- [duda] El DS pone `role="grid"` en la rejilla con hijos `columnheader` y botones sin `row`/`gridcell`, ARIA inválido (opción tomada: `role="group"` con `aria-label` = mes, cabeceras DOW `aria-hidden`; cada día lleva su fecha completa).
- [duda] El DS fija el mes visible solo al montar (opción tomada: `linkedSignal` que sigue a `selected`; al pulsar un día de otro mes la rejilla salta a ese mes).
- [duda] El DS expone `selected` + `defaultSelected` + `onSelect` (opción tomada: `model()` con `[(selected)]`; sin selección se marca `today`, como el DS).
- [duda] `today` por defecto es la fecha local al renderizar: en prerender queda la del build hasta hidratar (opción tomada: igual que el DS; las pantallas deberán pasar `today`).
- [duda] `calendar.css` del DS pone `min-block-size: var(--touch-target)` en `.calendar__day` sin `pointer: coarse` y tiene un `outline-offset` mal indentado (opción tomada: copia literal; pedir al DS que lo limite a puntero grueso).
- [sugerencia] Navegación con flechas entre días (roving tabindex) y `aria-live` en el título al cambiar de mes; el DS no lo define.
- [pendiente] Salida de cambio de mes visible (p. ej. para cargar eventos del mes) cuando la pida la pantalla.
- [pendiente] Comprobación visual en Playwright de `/demo#mini-calendar`: el navegador MCP estaba ocupado por otra sesión.

## SPEC 39 — SidebarNav (2026-10-24)

- [duda] El DS pone `title` en los botones del `rail` (tooltip nativo además del `aria-label`) (opción tomada: fiel al DS).
- [duda] En `panel`, el contador entra en el nombre accesible del botón («Tareas 5») sin decir qué cuenta (opción tomada: fiel al DS; valorar «Tareas, 5 pendientes» con texto oculto).
- [duda] `sidebar-nav.css` del DS amplía el área de toque con `::after` sin condición `pointer: coarse` y tiene un `outline-offset` mal indentado (opción tomada: copia literal; pedir limpieza al DS).
- [pendiente] Ítems como enlaces de router (`routerLink` + `aria-current` por ruta activa) cuando lleguen las rutas de NavigationMap.
- [pendiente] Comprobación visual en Playwright de `/demo#sidebar-nav`: el navegador MCP estaba ocupado por otra sesión (verificado por SSR: 14 ítems, «Seleccionado: Calendario»).

## SPEC 40 — BottomNav (2026-10-24)

- [duda] `TODO.md` cita Badge, pero el DS pinta el contador con su propio `span.bottom-nav__badge` (opción tomada: fiel al DS; `badge: 0` no se muestra).
- [duda] El contador entra en el nombre accesible del botón («5 Tareas») sin decir qué cuenta (opción tomada: fiel al DS).
- [duda] `bottom-nav.css` del DS declara `outline-offset` dos veces en `:focus-visible` (gana el negativo, anillo hacia dentro, como dice el README) (opción tomada: copia literal; pedir limpieza al DS).
- [pendiente] Ítems como enlaces de router y barra en `.l-screen__bottom` cuando lleguen el layout y las rutas.
- [hecho] Comprobación visual en Playwright de `/demo#bottom-nav`: tres barras, contador 5, activo y estados forzados correctos, consola sin errores.
- [sugerencia] `src/app/shared/sidebar-nav/sidebar-nav.spec.ts` (SPEC 39) no pasa `prettier --check`; formatearlo.

## SPEC 41 — AppBar (2026-10-24)

- [duda] El DS expone `title` y `onBack` (opción tomada: `heading`, como `Card`, e input `back` + output `backClicked`, elegido por el usuario).
- [duda] El AppBar pinta `h1`; en `/demo` conviven tres `h1` dentro de la página (opción tomada: fiel al DS; en pantallas reales habrá un único AppBar).
- [pendiente] Colocar el AppBar en `.l-screen__top` y conectar «Volver» a la navegación cuando lleguen el layout y las rutas.
- [hecho] Comprobación visual en Playwright de `/demo#app-bar`: tres barras, título truncado, volver y acciones correctos, consola sin errores.

## SPEC 42 — Dialog (2026-10-24)

- [duda] `.dialog__body` usa `.l-stack`, que aún no existía (opción tomada: copiar `composition/stack.css` del DS en este spec; las 13 `.l-stack` ya presentes en `/demo` pasan a columna flex con hueco).
- [duda] `contained` no puede usar `showModal()` (capa superior) (opción tomada: `show()` no modal; sin fondo inerte, Escape lo gestiona el componente).
- [duda] Con `show()`/`showModal()` el navegador enfoca el primer enfocable; si el cuerpo no tiene controles es el botón «Cerrar». Una hoja `contained` abierta al cargar puede robar el foco (opción tomada: comportamiento nativo).
- [duda] Escape dentro de un `Menu` abierto en el diálogo cierra también el diálogo (opción tomada: sin tratar; el DS desaconseja menús en diálogos cortos).
- [pendiente] Bloquear el scroll del documento con un diálogo modal abierto.
- [sugerencia] Cerrar al pulsar el scrim (`closedby="any"` o clic fuera de `.dialog`); el DS no lo define.
- [hecho] Comprobación visual en Playwright de `/demo#dialog`: estático, hoja contenida, modal/hoja/pantalla completa, foco en «Título», Escape cierra y devuelve el foco, consola sin errores.

## SPEC 43 — SaveBar (2026-10-24)

- [duda] `position: sticky` se acota a la caja del padre y el host `app-save-bar` la limitaría (opción tomada: host con `display: contents` y `div.save-bar` interno; CSS literal del DS y sin render cuando no hay estado).
- [duda] El botón de guardar en carga anuncia «Cargando» (`loadingLabel` por defecto de `Button`); «Guardando» sería más preciso (opción tomada: fiel al DS, que no lo cambia).
- [pendiente] Ocultar «Cambios guardados» pasado un tiempo: lo hace hoy el consumidor (la demo con `setTimeout`, como el preview del DS).
- [sugerencia] Avisar al salir de la pantalla con cambios sin guardar (guard de ruta o `beforeunload`).
- [hecho] Comprobación en Playwright de `/demo#save-bar`: host `display: contents`, barra `sticky` a `--space-s` del borde inferior dentro de un contenedor con scroll.
