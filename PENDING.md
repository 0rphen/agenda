# PENDING — candidatos para TODO.md

## SPEC 29 — Fab (2026-10-24)

- [duda] En `extended`, el `aria-label` repite el texto visible (opción tomada: mantenerlo, igual que el DS; inofensivo para lectores de pantalla).
- [pendiente] Anclar el Fab en `.l-screen__fab` (sobre `BottomNav`, área segura) cuando exista la composición de pantalla móvil.

## SPEC 30 — Menu (2026-10-24)

- [duda] Tras elegir un ítem, el DS no devuelve el foco al disparador (opción tomada: devolverlo, porque al desmontar el panel el foco se perdía).
- [duda] ↑ sin foco en un ítem: el DS salta al penúltimo por aritmética modular (opción tomada: ir al último).
- [hecho] Reposicionar el panel (`align` automático) cuando se sale del borde de la pantalla o del contenedor (SPEC 50: solo horizontal y contra el viewport, no contenedores con `overflow`).
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
- [hecho] `label.check` tiene `min-block-size: var(--touch-target)` sin condición `pointer: coarse`, así que la fila mide ~61 px en vez de `control-l` (48 px). Pedir al DS que lo limite a puntero grueso (SPEC 51: zona táctil solo con `pointer: coarse`; con puntero fino el check mide 20 px y la fila 55 px por contenido: título + meta + `padding-block`).
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

- [hecho] El bloque DS `setting-row.css` declara `outline-offset` dos veces en `:focus-visible` (la segunda gana, offset negativo) (SPEC 51: una sola `outline-offset`, la negativa).
- [duda] Con `wide`, el `.field` del select y el `.segmented` no llenan `.setting-row__trail` (16rem / 100% en estrecho): miden por contenido, igual que en el DS (opción tomada: fiel al DS).
- [pendiente] Prop `leading` del DS (cabecera libre en lugar de `icon`) cuando la pida alguna pantalla.
- [pendiente] Pantalla de Ajustes (`data-layout="settings"`) con `SettingRow` en `Card` y `SaveBar`.

## SPEC 37 — WeekStrip (2026-10-24)

- [duda] El DS no da nombre accesible a cada `DayPill` de la tira (opción tomada: `WeekStrip` lo deriva de `iso` con `Intl` `es-ES` en UTC, «Jueves 22 de octubre, hoy, con eventos»).
- [duda] El DS expone `selected` + `onSelect` (opción tomada: `model()` con `[(selected)]`, como `done` en TaskItem).
- [pendiente] Calcular los siete días (lunes a domingo) de la semana visible y navegar entre semanas en la pantalla móvil `WeekStrip` + `DayView`.
- [hecho] Navegación con flechas entre píldoras (roving tabindex); el DS no la define (SPEC 49: ←/→ e Inicio/Fin mueven el foco sin seleccionar).

## SPEC 38 — MiniCalendar (2026-10-24)

- [duda] El DS pone `role="grid"` en la rejilla con hijos `columnheader` y botones sin `row`/`gridcell`, ARIA inválido (opción tomada: `role="group"` con `aria-label` = mes, cabeceras DOW `aria-hidden`; cada día lleva su fecha completa).
- [duda] El DS fija el mes visible solo al montar (opción tomada: `linkedSignal` que sigue a `selected`; al pulsar un día de otro mes la rejilla salta a ese mes).
- [duda] El DS expone `selected` + `defaultSelected` + `onSelect` (opción tomada: `model()` con `[(selected)]`; sin selección se marca `today`, como el DS).
- [duda] `today` por defecto es la fecha local al renderizar: en prerender queda la del build hasta hidratar (opción tomada: igual que el DS; las pantallas deberán pasar `today`).
- [hecho] `calendar.css` del DS pone `min-block-size: var(--touch-target)` en `.calendar__day` sin `pointer: coarse` y tiene un `outline-offset` mal indentado (SPEC 51: zona táctil solo con `pointer: coarse`; indentación corregida).
- [hecho] Navegación con flechas entre días (roving tabindex) y `aria-live` en el título al cambiar de mes; el DS no lo define (SPEC 49: flechas ±1/±7 días saltando deshabilitados y cambiando de mes; título `aria-live="polite"`).
- [pendiente] Salida de cambio de mes visible (p. ej. para cargar eventos del mes) cuando la pida la pantalla.
- [hecho] Comprobación visual en Playwright de `/demo#mini-calendar`: rejilla, foco visible, flechas y cambio de mes correctos, consola sin errores (SPEC 49).

## SPEC 39 — SidebarNav (2026-10-24)

- [duda] El DS pone `title` en los botones del `rail` (tooltip nativo además del `aria-label`) (opción tomada: fiel al DS).
- [duda] En `panel`, el contador entra en el nombre accesible del botón («Tareas 5») sin decir qué cuenta (opción tomada: fiel al DS; valorar «Tareas, 5 pendientes» con texto oculto).
- [hecho] `sidebar-nav.css` del DS amplía el área de toque con `::after` sin condición `pointer: coarse` y tiene un `outline-offset` mal indentado (SPEC 51: `::after` solo con `pointer: coarse`; indentación corregida).
- [pendiente] Ítems como enlaces de router (`routerLink` + `aria-current` por ruta activa) cuando lleguen las rutas de NavigationMap.
- [hecho] Comprobación visual en Playwright de `/demo#sidebar-nav`: el navegador MCP estaba ocupado por otra sesión (verificado por SSR: 14 ítems, «Seleccionado: Calendario») (SPEC 51: hecha).

## SPEC 40 — BottomNav (2026-10-24)

- [duda] `TODO.md` cita Badge, pero el DS pinta el contador con su propio `span.bottom-nav__badge` (opción tomada: fiel al DS; `badge: 0` no se muestra).
- [duda] El contador entra en el nombre accesible del botón («5 Tareas») sin decir qué cuenta (opción tomada: fiel al DS).
- [hecho] `bottom-nav.css` del DS declara `outline-offset` dos veces en `:focus-visible` (gana el negativo, anillo hacia dentro, como dice el README) (SPEC 51: una sola `outline-offset`, la negativa).
- [pendiente] Ítems como enlaces de router y barra en `.l-screen__bottom` cuando lleguen el layout y las rutas.
- [hecho] Comprobación visual en Playwright de `/demo#bottom-nav`: tres barras, contador 5, activo y estados forzados correctos, consola sin errores.
- [hecho] `src/app/shared/sidebar-nav/sidebar-nav.spec.ts` (SPEC 39) no pasa `prettier --check` (SPEC 51: ya formateado en `src/app/shared/components/sidebar-nav/`; `prettier --check` limpio).

## SPEC 41 — AppBar (2026-10-24)

- [duda] El DS expone `title` y `onBack` (opción tomada: `heading`, como `Card`, e input `back` + output `backClicked`, elegido por el usuario).
- [duda] El AppBar pinta `h1`; en `/demo` conviven tres `h1` dentro de la página (opción tomada: fiel al DS; en pantallas reales habrá un único AppBar).
- [pendiente] Colocar el AppBar en `.l-screen__top` y conectar «Volver» a la navegación cuando lleguen el layout y las rutas.
- [hecho] Comprobación visual en Playwright de `/demo#app-bar`: tres barras, título truncado, volver y acciones correctos, consola sin errores.

## SPEC 42 — Dialog (2026-10-24)

- [duda] `.dialog__body` usa `.l-stack`, que aún no existía (opción tomada: copiar `composition/stack.css` del DS en este spec; las 13 `.l-stack` ya presentes en `/demo` pasan a columna flex con hueco).
- [duda] `contained` no puede usar `showModal()` (capa superior) (opción tomada: `show()` no modal; sin fondo inerte, Escape lo gestiona el componente).
- [duda] Con `show()`/`showModal()` el navegador enfoca el primer enfocable; si el cuerpo no tiene controles es el botón «Cerrar». Una hoja `contained` abierta al cargar puede robar el foco (opción tomada: comportamiento nativo).
- [hecho] Escape dentro de un `Menu` abierto en el diálogo cierra también el diálogo (SPEC 48: `Menu` corta la propagación de Escape; solo se cierra el menú).
- [hecho] Bloquear el scroll del documento con un diálogo modal abierto (SPEC 48: `html:has(.scrim:modal)`).
- [hecho] Cerrar al pulsar el scrim (SPEC 48: clic con `target === currentTarget`; sin `closedby="any"` por Safari).
- [hecho] Comprobación visual en Playwright de `/demo#dialog`: estático, hoja contenida, modal/hoja/pantalla completa, foco en «Título», Escape cierra y devuelve el foco, consola sin errores.

## SPEC 43 — SaveBar (2026-10-24)

- [duda] `position: sticky` se acota a la caja del padre y el host `app-save-bar` la limitaría (opción tomada: host con `display: contents` y `div.save-bar` interno; CSS literal del DS y sin render cuando no hay estado).
- [duda] El botón de guardar en carga anuncia «Cargando» (`loadingLabel` por defecto de `Button`); «Guardando» sería más preciso (opción tomada: fiel al DS, que no lo cambia).
- [hecho] Ocultar «Cambios guardados» pasado un tiempo (SPEC 50: input `savedTimeout`, 1800 ms por defecto, `0` lo desactiva; la demo ya no usa `setTimeout` para apagarlo).
- [sugerencia] Avisar al salir de la pantalla con cambios sin guardar (guard de ruta o `beforeunload`).
- [hecho] Comprobación en Playwright de `/demo#save-bar`: host `display: contents`, barra `sticky` a `--space-s` del borde inferior dentro de un contenedor con scroll.

## SPEC 44 — DayView (2026-10-24)

- [duda] `TODO.md` cita `AvatarGroup` como dependencia, pero el DayView del DS muestra «N asistentes» con ícono `group` (opción tomada: fiel al DS, sin `AvatarGroup`; `people` solo se cuenta).
- [duda] El DS no anuncia el estado de los eventos a lectores de pantalla (opción tomada: `aria-pressed` y texto oculto «Cancelado.», como `EventCard`).
- [duda] `now` posterior a `endHour` dibuja la línea fuera del track (opción tomada: como el DS; la recorta `overflow: hidden`).
- [hecho] `day-view.css` del DS tiene `outline-offset` con indentación rota en `.day-view__slot:focus-visible` (repetido) y `.day-view__event:focus-visible` (SPEC 51: `__slot` con una sola `outline-offset`; `__event` reindentada).
- [sugerencia] En eventos de 1 h con lugar y asistentes, la línea de asistentes queda recortada por el alto (p. ej. «Revisión de diseño»); igual en el DS.
- [pendiente] Calcular `heading`, `today` y `now` (en vivo) desde la fecha en la pantalla DayPage.
- [hecho] Comprobación en Playwright de `/demo#day-view`: carriles, compacto, seleccionado, cancelado, línea de ahora y pasado coinciden con el preview del DS.
- [sugerencia] Pedir al DS quitar la franja `border-inline-start` de `.day-view__event` (quitada en local a pedido del usuario) para volver a copia literal.
- [sugerencia] Pedir al DS margen superior en `.day-view__body`: la primera hora («08:00», `translateY(-0.5em)`) pisa el borde de la cabecera (en local: `padding-block-start: var(--space-2xs)`).
- [duda] DayView ahora muestra 0–24 con scroll y abre en 08:00 (pedido del usuario; el DS no tiene scroll). En SSR/prerender el scroll inicial no existe: se ve desde 00:00 hasta hidratar (opción tomada: `afterNextRender`; alternativa futura, CSS `scroll-snap`/ancla).
- [sugerencia] Al abrir «hoy», hacer scroll a `now` en vez de a una hora fija.
- [hecho] Scroll inicial a `now` (una hora antes, para dar contexto); sin `now` sigue en `scrollToHour`.

## SPEC 45 — WeekView (2026-10-24)

- [duda] El DS pone `role="grid"` con `columnheader`/`gridcell` sin filas, ARIA inválido (opción tomada: host `role="region"`, columnas `role="group"` con «dow num», sin roles en la cabecera).
- [duda] Con scroll, la barra desalinea cabecera y columnas (opción tomada: `scrollbar-gutter: stable` en cabecera con `overflow: hidden` y en cuerpo; divergencia del DS).
- [hecho] `week-view.css` del DS tiene `outline-offset` con indentación rota en `.week-view__event:focus-visible` (SPEC 51: ya reindentada en `fd8bd5a`).
- [duda] Eventos solapados el mismo día se superponen: el DS no reparte carriles en semana (opción tomada: fiel al DS).
- [sugerencia] Reutilizar `dayLanes` de `DayView` para repartir solapes en WeekView.
- [sugerencia] Chip de eventos de todo el día sobre la rejilla (lo recomienda el README del DS, sin markup).
- [sugerencia] Pedir al DS el rango 0–24 con scroll en WeekView/DayView para volver a copia literal.
- [pendiente] Calcular `days`, `now` (en vivo) y navegación entre semanas en la pantalla WeekPage.
- [hecho] Comprobación en Playwright de `/demo#week-view`: columnas alineadas con la cabecera, hoy resaltado, línea de ahora en jueves, scroll inicial a 12:00 (now 13:10), consola sin errores.
- [hecho] Carriles para solapes en WeekView reutilizando `dayLanes` (exportada y genérica desde `day-view.ts`).
- [hecho] Fila «Todo el día» en WeekView con `app-badge` por categoría bajo la cabecera.
- [duda] En la fila «Todo el día» un título largo queda recortado por la celda (opción tomada: `overflow: hidden`; alternativa: elipsis o `title` con el texto completo).
- [duda] Con carriles, en columnas de semana (~7.5 rem) cada evento queda muy estrecho y la hora y el título se cortan (opción tomada: como en DayView, sin modo compacto).
- [sugerencia] Pedir al DS el markup/CSS de «Todo el día» en WeekView para volver a copia literal.

## SPEC 51 — Limpieza de CSS copiado del DS (2026-10-25)

- [sugerencia] Pedir al DS las correcciones hechas en local para volver a copia literal: zona táctil solo con `@media (pointer: coarse)` en `check.css`, `calendar.css` y `sidebar-nav.css`; una sola `outline-offset` en `setting-row.css`, `bottom-nav.css` y `day-view.css`; indentación de `outline-offset` en `calendar.css`, `sidebar-nav.css`, `day-view.css` y `week-view.css`.

## SPEC 52 — MonthView (2026-10-25)

- [duda] Tras mover el foco con flechas a un día de otro mes y cambiar `year`/`month`, el tab stop se queda en ese día si sigue en la rejilla, en vez de volver a `selected`/`today`/día 1 (opción tomada: conservar el día enfocado; R11 lo admite).
- [duda] En ancho estrecho (~480 px) los chips solo muestran el punto y uno o dos caracteres (opción tomada: fiel al DS, elipsis).
- [sugerencia] Bajo 40rem mostrar solo los puntos de categoría en vez de chips con texto, como en apps de calendario móviles.
- [sugerencia] Pedir al DS la cabecera abreviada (`__dow-long`/`__dow-short`) y `[data-force]` en `.month-view__chip` para volver a copia literal; e indentación de `outline-offset` en `month-view.css`.
- [pendiente] Navegación entre meses, popover de «+N más» y cálculo de `today` en vivo en la pantalla de mes.
- [hecho] Comprobación en Playwright de `/demo#month-view`: rejilla 7×6 desde el lunes 28, hoy 22 y seleccionado 27, «+2 más», cancelado tachado, cabecera «lun…dom» a 560 px sin scroll horizontal, flecha abajo mueve el foco y cambio de mes; consola sin errores.
