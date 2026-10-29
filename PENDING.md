# PENDING — candidatos para TODO.md

## SPEC 29 — Fab (2026-10-24)

- [hecho] En `extended`, el `aria-label` repite el texto visible (opción tomada: mantenerlo, igual que el DS; inofensivo para lectores de pantalla).
- [pendiente] Anclar el Fab en `.l-screen__fab` (sobre `BottomNav`, área segura) cuando exista la composición de pantalla móvil.

## SPEC 30 — Menu (2026-10-24)

- [hecho] Tras elegir un ítem, el DS no devuelve el foco al disparador (opción tomada: devolverlo, porque al desmontar el panel el foco se perdía).
- [hecho] ↑ sin foco en un ítem: el DS salta al penúltimo por aritmética modular (opción tomada: ir al último).
- [hecho] Reposicionar el panel (`align` automático) cuando se sale del borde de la pantalla o del contenedor (SPEC 50: solo horizontal y contra el viewport, no contenedores con `overflow`).
- [pendiente] Usar `app-menu` en AppBar (TODO §6 móvil) y en las tarjetas de cita EventCard/AgendaItem (SPEC 71).

## SPEC 31 — DayPill (2026-10-24)

- [hecho] Hover de `.day-pill` casi invisible: `--color-brand-soft` (oklch 0.91 0.008 241.7) y `--color-surface-sunken` (oklch 0.917 0.005 247.9), el fondo en reposo, son casi iguales. Pedir al DS más contraste o otro token de hover. (sync DS 2026-10-27)
- [hecho] `WeekStrip` debe construir el `label` de cada `DayPill` con la fecha completa («Jueves 22 de octubre, hoy, con eventos»). (SPEC 37: `WeekStrip` deriva el label de `iso`)

## SPEC 32 — AgendaItem (2026-10-24)

- [hecho] El preview DS usa columnas de `21.25rem` (opción tomada: reutilizar `.demo__narrow`, `max-inline-size: 22rem`, para no añadir CSS a la demo).
- [hecho] Pedir al DS que renombre la prop `title` de AgendaItem (y revisar EventCard/TaskItem) a `heading`: choca con el atributo global HTML en Angular. (sync DS 2026-10-27)
- [hecho] Componente o composición `AgendaGroup` (`.agenda-group__title` + lista ordenada por hora) cuando llegue la pantalla de agenda. (SPEC 57: `.agenda-group__title` + eventos por hora en `agenda-panel`)

## SPEC 33 — TaskItem (2026-10-24)

- [hecho] El chevron sugiere que la fila abre el detalle, pero el DS no define clic en la fila (opción tomada: chevron decorativo, sin salida de clic).
- [hecho] El DS escribe siempre «N subtareas» (opción tomada: «1 subtarea» en singular).
- [hecho] `label.check` tiene `min-block-size: var(--touch-target)` sin condición `pointer: coarse`, así que la fila mide ~61 px en vez de `control-l` (48 px). Pedir al DS que lo limite a puntero grueso (SPEC 51: zona táctil solo con `pointer: coarse`; con puntero fino el check mide 20 px y la fila 55 px por contenido: título + meta + `padding-block`).
- [hecho] Navegación al detalle de tarea (clic en la fila o en el chevron) cuando exista la pantalla de tareas. (SPEC 58/67: fila clicable y chevron «Abrir detalle», output `opened`)

## SPEC 34 — EventCard (2026-10-24)

- [hecho] El DS anida `h4` (título) y `p` (lugar) dentro del `button`, HTML inválido (opción tomada: `span` con las mismas clases).
- [hecho] El nombre accesible del botón incluye los nombres de todos los asistentes visibles (avatares `role="img"`) y «N más» (opción tomada: dejarlo, fiel al DS).
- [hecho] En `AvatarGroup` sobre tarjeta, las iniciales del avatar solapado («MG») quedan recortadas por el siguiente; revisar con el DS el solape o el tamaño `s`. (sync DS 2026-10-27)
- [pendiente] Menú de acciones (`app-menu`) en EventCard cuando lo pida la pantalla. (SPEC 71)

## SPEC 35 — StatCard (2026-10-24)

- [hecho] El preview DS etiqueta los estados forzados como «Hover», «Active», «Focus» (opción tomada: copiar el texto del DS en la demo, igual que la demo de Card).
- [hecho] Resumen (OverviewPage/MobileOverview): cuatro `StatCard` en `.l-grid data-min="s"` (`data-cols="2"` en móvil) que navegan a su vista con `(clicked)`. (SPEC 59: Resumen de escritorio; la versión móvil va en MobileOverview, TODO §6)

## SPEC 36 — SettingRow (2026-10-24)

- [hecho] El bloque DS `setting-row.css` declara `outline-offset` dos veces en `:focus-visible` (la segunda gana, offset negativo) (SPEC 51: una sola `outline-offset`, la negativa).
- [hecho] Con `wide`, el `.field` del select y el `.segmented` no llenan `.setting-row__trail` (16rem / 100% en estrecho): miden por contenido, igual que en el DS (opción tomada: fiel al DS).
- [pendiente] Prop `leading` del DS (cabecera libre en lugar de `icon`) cuando la pida alguna pantalla.
- [hecho] Pantalla de Ajustes (`data-layout="settings"`) con `SettingRow` en `Card` y `SaveBar`. (SPEC 68)

## SPEC 37 — WeekStrip (2026-10-24)

- [hecho] El DS no da nombre accesible a cada `DayPill` de la tira (opción tomada: `WeekStrip` lo deriva de `iso` con `Intl` `es-ES` en UTC, «Jueves 22 de octubre, hoy, con eventos»).
- [hecho] El DS expone `selected` + `onSelect` (opción tomada: `model()` con `[(selected)]`, como `done` en TaskItem).
- [pendiente] Calcular los siete días (lunes a domingo) de la semana visible y navegar entre semanas en la pantalla móvil `WeekStrip` + `DayView`.
- [hecho] Navegación con flechas entre píldoras (roving tabindex); el DS no la define (SPEC 49: ←/→ e Inicio/Fin mueven el foco sin seleccionar).

## SPEC 38 — MiniCalendar (2026-10-24)

- [hecho] El DS pone `role="grid"` en la rejilla con hijos `columnheader` y botones sin `row`/`gridcell`, ARIA inválido (opción tomada: `role="group"` con `aria-label` = mes, cabeceras DOW `aria-hidden`; cada día lleva su fecha completa).
- [hecho] El DS fija el mes visible solo al montar (opción tomada: `linkedSignal` que sigue a `selected`; al pulsar un día de otro mes la rejilla salta a ese mes).
- [hecho] El DS expone `selected` + `defaultSelected` + `onSelect` (opción tomada: `model()` con `[(selected)]`; sin selección se marca `today`, como el DS).
- [duda] `today` por defecto es la fecha local al renderizar: en prerender queda la del build hasta hidratar (opción tomada: igual que el DS; las pantallas deberán pasar `today`). (SPEC 72)
- [hecho] `calendar.css` del DS pone `min-block-size: var(--touch-target)` en `.calendar__day` sin `pointer: coarse` y tiene un `outline-offset` mal indentado (SPEC 51: zona táctil solo con `pointer: coarse`; indentación corregida).
- [hecho] Navegación con flechas entre días (roving tabindex) y `aria-live` en el título al cambiar de mes; el DS no lo define (SPEC 49: flechas ±1/±7 días saltando deshabilitados y cambiando de mes; título `aria-live="polite"`).
- [pendiente] Salida de cambio de mes visible (p. ej. para cargar eventos del mes) cuando la pida la pantalla.
- [hecho] Comprobación visual en Playwright de `/demo#mini-calendar`: rejilla, foco visible, flechas y cambio de mes correctos, consola sin errores (SPEC 49).

## SPEC 39 — SidebarNav (2026-10-24)

- [hecho] El DS pone `title` en los botones del `rail` (tooltip nativo además del `aria-label`) (opción tomada: fiel al DS).
- [hecho] En `panel`, el contador entraba en el nombre accesible sin decir qué cuenta (sync DS 2026-10-27: `countLabel()` + `badgeLabel`, «Tareas, 5 pendientes»).
- [hecho] `sidebar-nav.css` del DS amplía el área de toque con `::after` sin condición `pointer: coarse` y tiene un `outline-offset` mal indentado (SPEC 51: `::after` solo con `pointer: coarse`; indentación corregida).
- [hecho] Ítems como enlaces de router (`routerLink` + `aria-current` por ruta activa) cuando lleguen las rutas de NavigationMap. (SPEC 56: `App.navigate()` por destino; activo según la ruta)
- [hecho] Comprobación visual en Playwright de `/demo#sidebar-nav`: el navegador MCP estaba ocupado por otra sesión (verificado por SSR: 14 ítems, «Seleccionado: Calendario») (SPEC 51: hecha).

## SPEC 40 — BottomNav (2026-10-24)

- [hecho] `TODO.md` cita Badge, pero el DS pinta el contador con su propio `span.bottom-nav__badge` (opción tomada: fiel al DS; `badge: 0` no se muestra).
- [hecho] El contador entraba en el nombre accesible sin decir qué cuenta (sync DS 2026-10-27: «Tareas, 5 pendientes»).
- [hecho] `bottom-nav.css` del DS declara `outline-offset` dos veces en `:focus-visible` (gana el negativo, anillo hacia dentro, como dice el README) (SPEC 51: una sola `outline-offset`, la negativa).
- [hecho] Ítems como enlaces de router y barra en `.l-screen__bottom` cuando lleguen el layout y las rutas. (SPEC 56: navegación por ruta en `.l-shell__bottom`)
- [hecho] Comprobación visual en Playwright de `/demo#bottom-nav`: tres barras, contador 5, activo y estados forzados correctos, consola sin errores.
- [hecho] `src/app/shared/sidebar-nav/sidebar-nav.spec.ts` (SPEC 39) no pasa `prettier --check` (SPEC 51: ya formateado en `src/app/shared/components/sidebar-nav/`; `prettier --check` limpio).

## SPEC 41 — AppBar (2026-10-24)

- [hecho] El DS expone `title` y `onBack` (opción tomada: `heading`, como `Card`, e input `back` + output `backClicked`, elegido por el usuario).
- [hecho] El AppBar pinta `h1`; en `/demo` conviven tres `h1` dentro de la página (opción tomada: fiel al DS; en pantallas reales habrá un único AppBar).
- [pendiente] Colocar el AppBar en `.l-screen__top` y conectar «Volver» a la navegación cuando lleguen el layout y las rutas.
- [hecho] Comprobación visual en Playwright de `/demo#app-bar`: tres barras, título truncado, volver y acciones correctos, consola sin errores.

## SPEC 42 — Dialog (2026-10-24)

- [hecho] `.dialog__body` usa `.l-stack`, que aún no existía (opción tomada: copiar `composition/stack.css` del DS en este spec; las 13 `.l-stack` ya presentes en `/demo` pasan a columna flex con hueco).
- [hecho] `contained` no puede usar `showModal()` (capa superior) (opción tomada: `show()` no modal; sin fondo inerte, Escape lo gestiona el componente).
- [hecho] Con `show()`/`showModal()` el navegador enfoca el primer enfocable; si el cuerpo no tiene controles es el botón «Cerrar». Una hoja `contained` abierta al cargar puede robar el foco (opción tomada: comportamiento nativo).
- [hecho] Escape dentro de un `Menu` abierto en el diálogo cierra también el diálogo (SPEC 48: `Menu` corta la propagación de Escape; solo se cierra el menú).
- [hecho] Bloquear el scroll del documento con un diálogo modal abierto (SPEC 48: `html:has(.scrim:modal)`).
- [hecho] Cerrar al pulsar el scrim (SPEC 48: clic con `target === currentTarget`; sin `closedby="any"` por Safari).
- [hecho] Comprobación visual en Playwright de `/demo#dialog`: estático, hoja contenida, modal/hoja/pantalla completa, foco en «Título», Escape cierra y devuelve el foco, consola sin errores.

## SPEC 43 — SaveBar (2026-10-24)

- [hecho] `position: sticky` se acota a la caja del padre y el host `app-save-bar` la limitaría (opción tomada: host con `display: contents` y `div.save-bar` interno; CSS literal del DS y sin render cuando no hay estado).
- [duda] El botón de guardar en carga anuncia «Cargando» (`loadingLabel` por defecto de `Button`); «Guardando» sería más preciso (opción tomada: fiel al DS, que no lo cambia). (SPEC 70)
- [hecho] Ocultar «Cambios guardados» pasado un tiempo (SPEC 50: input `savedTimeout`, 1800 ms por defecto, `0` lo desactiva; la demo ya no usa `setTimeout` para apagarlo).
- [sugerencia] Avisar al salir de la pantalla con cambios sin guardar (guard de ruta o `beforeunload`). (SPEC 72)
- [hecho] Comprobación en Playwright de `/demo#save-bar`: host `display: contents`, barra `sticky` a `--space-s` del borde inferior dentro de un contenedor con scroll.

## SPEC 44 — DayView (2026-10-24)

- [hecho] `TODO.md` cita `AvatarGroup` como dependencia, pero el DayView del DS muestra «N asistentes» con ícono `group` (opción tomada: fiel al DS, sin `AvatarGroup`; `people` solo se cuenta).
- [hecho] El DS no anuncia el estado de los eventos a lectores de pantalla (opción tomada: `aria-pressed` y texto oculto «Cancelado.», como `EventCard`).
- [hecho] `now` posterior a `endHour` dibuja la línea fuera del track (opción tomada: como el DS; la recorta `overflow: hidden`).
- [hecho] `day-view.css` del DS tiene `outline-offset` con indentación rota en `.day-view__slot:focus-visible` (repetido) y `.day-view__event:focus-visible` (SPEC 51: `__slot` con una sola `outline-offset`; `__event` reindentada).
- [hecho] En eventos de 1 h con lugar y asistentes, la línea de asistentes queda recortada por el alto (p. ej. «Revisión de diseño»); igual en el DS. (sync DS 2026-10-27)
- [pendiente] Calcular `heading`, `today` y `now` (en vivo) desde la fecha en la pantalla DayPage (heading/today hechos en SPEC 62; `now` en vivo: SPEC 72).
- [hecho] Comprobación en Playwright de `/demo#day-view`: carriles, compacto, seleccionado, cancelado, línea de ahora y pasado coinciden con el preview del DS.
- [hecho] Pedir al DS quitar la franja `border-inline-start` de `.day-view__event` (quitada en local a pedido del usuario) para volver a copia literal. (sync DS 2026-10-27)
- [hecho] Pedir al DS margen superior en `.day-view__body`: la primera hora («08:00», `translateY(-0.5em)`) pisa el borde de la cabecera (en local: `padding-block-start: var(--space-2xs)`). (sync DS 2026-10-27)
- [hecho] DayView ahora muestra 0–24 con scroll y abre en 08:00 (pedido del usuario; el DS no tiene scroll). En SSR/prerender el scroll inicial no existe: se ve desde 00:00 hasta hidratar (opción tomada: `afterNextRender`; alternativa futura, CSS `scroll-snap`/ancla).
- [hecho] Al abrir «hoy», hacer scroll a `now` en vez de a una hora fija.
- [hecho] Scroll inicial a `now` (una hora antes, para dar contexto); sin `now` sigue en `scrollToHour`.

## SPEC 45 — WeekView (2026-10-24)

- [hecho] El DS pone `role="grid"` con `columnheader`/`gridcell` sin filas, ARIA inválido (opción tomada: host `role="region"`, columnas `role="group"` con «dow num», sin roles en la cabecera).
- [hecho] Con scroll, la barra desalinea cabecera y columnas (opción tomada: `scrollbar-gutter: stable` en cabecera con `overflow: hidden` y en cuerpo; divergencia del DS).
- [hecho] `week-view.css` del DS tiene `outline-offset` con indentación rota en `.week-view__event:focus-visible` (SPEC 51: ya reindentada en `fd8bd5a`).
- [hecho] Eventos solapados el mismo día se superponen: el DS no reparte carriles en semana (opción tomada: fiel al DS).
- [hecho] Reutilizar `dayLanes` de `DayView` para repartir solapes en WeekView. (sync DS 2026-10-27)
- [hecho] Chip de eventos de todo el día sobre la rejilla (lo recomienda el README del DS, sin markup). (SPEC 45: fila «Todo el día»)
- [hecho] Pedir al DS el rango 0–24 con scroll en WeekView/DayView para volver a copia literal. (sync DS 2026-10-27)
- [pendiente] Calcular `days`, `now` (en vivo) y navegación entre semanas en la pantalla WeekPage (días y navegación hechos en SPEC 63; `now` en vivo: SPEC 72).
- [hecho] Comprobación en Playwright de `/demo#week-view`: columnas alineadas con la cabecera, hoy resaltado, línea de ahora en jueves, scroll inicial a 12:00 (now 13:10), consola sin errores.
- [hecho] Carriles para solapes en WeekView reutilizando `dayLanes` (exportada y genérica desde `day-view.ts`).
- [hecho] Fila «Todo el día» en WeekView con `app-badge` por categoría bajo la cabecera.
- [duda] En la fila «Todo el día» un título largo queda recortado por la celda (opción tomada: `overflow: hidden`; alternativa: elipsis o `title` con el texto completo). (SPEC 70)
- [hecho] Con carriles, en columnas de semana (~7.5 rem) cada evento queda muy estrecho y la hora y el título se cortan (opción tomada: como en DayView, sin modo compacto).
- [hecho] Pedir al DS el markup/CSS de «Todo el día» en WeekView para volver a copia literal. (sync DS 2026-10-27)

## SPEC 51 — Limpieza de CSS copiado del DS (2026-10-25)

- [hecho] Pedir al DS las correcciones hechas en local para volver a copia literal: zona táctil solo con `@media (pointer: coarse)` en `check.css`, `calendar.css` y `sidebar-nav.css`; una sola `outline-offset` en `setting-row.css`, `bottom-nav.css` y `day-view.css`; indentación de `outline-offset` en `calendar.css`, `sidebar-nav.css`, `day-view.css` y `week-view.css`. (sync DS 2026-10-27)

## SPEC 52 — MonthView (2026-10-25)

- [hecho] Tras mover el foco con flechas a un día de otro mes y cambiar `year`/`month`, el tab stop se queda en ese día si sigue en la rejilla, en vez de volver a `selected`/`today`/día 1 (opción tomada: conservar el día enfocado; R11 lo admite).
- [hecho] En ancho estrecho (~480 px) los chips solo muestran el punto y uno o dos caracteres (opción tomada: fiel al DS, elipsis).
- [hecho] Bajo 40rem mostrar solo los puntos de categoría en vez de chips con texto, como en apps de calendario móviles. (sync DS 2026-10-27)
- [hecho] Pedir al DS la cabecera abreviada (`__dow-long`/`__dow-short`) y `[data-force]` en `.month-view__chip` para volver a copia literal; e indentación de `outline-offset` en `month-view.css`. (sync DS 2026-10-27)
- [pendiente] Navegación entre meses, popover de «+N más» y cálculo de `today` en vivo en la pantalla de mes (navegación hecha en SPEC 64; «+N más» abre el día en vez de popover; `today` en vivo: SPEC 72).
- [hecho] Comprobación en Playwright de `/demo#month-view`: rejilla 7×6 desde el lunes 28, hoy 22 y seleccionado 27, «+2 más», cancelado tachado, cabecera «lun…dom» a 560 px sin scroll horizontal, flecha abajo mueve el foco y cambio de mes; consola sin errores.

## SPEC 53 — EventForm (2026-10-25)

- [hecho] El DS no define bloque `.form` (opción tomada: clase `form` solo como gancho en el `<form>`, como el DS; layout con `.l-stack`/`.l-form-grid`).
- [hecho] Errores del DS solo tras guardar, no al salir del campo (opción tomada: `submitted` propio en vez de `fieldError()`, que muestra con `touched`).
- [hecho] Mapear la categoría (nombre) a `Category`/`Tint` en un único sitio cuando la pantalla guarde eventos. (`EVENT_CATEGORY_COLORS`/`TASK_LIST_COLORS` en `features/agenda/agenda-forms.ts`)
- [sugerencia] Invitados como chips o lista de correos validada en vez de texto libre.
- [hecho] Montar EventForm en el panel de WeekPage y en `Dialog` móvil; reiniciar tras guardar pasando un `defaultValues` nuevo. (SPEC 60/62: `AgendaDialogs` con EventForm en Dialog; reinicio con `defaultValues` nuevo)
- [hecho] Comprobación en Playwright de `/demo#event-form`: errores de título y fecha al guardar vacío, se corrigen al escribir, «Todo el día» oculta las horas, `saved` emite, «Editar cita» muestra el error de fin; consola sin errores.

## SPEC 54 — TaskForm (2026-10-25)

- [hecho] El DS deja «Agregar subtarea» sin label (opción tomada: `TextField` con `hideLabel`, label «Agregar subtarea» con `u-visually-hidden`).
- [duda] Enter en «Agregar subtarea» envía el formulario entero, como el DS (opción tomada: fiel al DS). (SPEC 70)
- [sugerencia] Enter en «Agregar subtarea» añade la subtarea en vez de guardar la tarea. (SPEC 70)
- [hecho] `tag-button.css` del DS amplía la zona táctil sin condición (opción tomada: `inset-block` del `::after` dentro de `@media (pointer: coarse)`, criterio de SPEC 51; reindentada `outline-offset`).
- [hecho] Pedir al DS esos dos cambios en `tag-button.css` para volver a copia literal. (sync DS 2026-10-27)
- [hecho] Signal Forms añade claves `Symbol` de tracking a los objetos de `subtasks`; `saved` las emite (opción tomada: se dejan, no son enumerables por `JSON.stringify` ni `Object.keys`).
- [hecho] Las subtareas de `TaskItem` muestran chevron, como el DS, aunque en el formulario no navegan (opción tomada: fiel al DS).
- [sugerencia] Quitar o editar subtareas existentes (el DS no lo tiene). (SPEC 70)
- [hecho] Montar TaskForm en pantalla de tareas y en `Dialog` móvil; mapear `list` a color. (SPEC 67: detalle en el panel de `/tareas`; `list` a color con `TASK_LIST_COLORS`)
- [hecho] Comprobación en Playwright de `/demo#task-form`: error al guardar vacío, etiqueta alterna `aria-pressed`, subtarea añadida, `saved`/`deleted` emiten; consola sin errores. En una primera ejecución, nada más cargar, «Pagar derechos» apareció desmarcada y con foco; no se reprodujo en 4 intentos (posible carrera de hidratación en la prueba).

## SPEC 66 — MonthView día seleccionado (2026-10-27)

- [hecho] Pedir al DS que el número del día seleccionado de MonthView use `--color-brand` / `--color-on-brand` (o un `--color-brand-soft` más contrastado: hoy ≈ `--color-surface-sunken`) para volver a copia literal de `month-view.css`. (sync DS 2026-10-27)
- [hecho] Comprobación en Playwright de `/demo#month-view`: número seleccionado brand/on-brand, también siendo hoy y fuera de mes; hover lo mantiene; celda brand-soft; consola sin errores.

## SPEC 67 — Tareas (2026-10-27)

- [duda] El DS muestra «Cancelar» en el detalle (deselecciona); el TaskForm local no lo tiene (opción tomada: sin cancelar ni deseleccionar). (SPEC 71)
- [duda] Filtro en estado, se pierde al recargar (opción tomada: como el DS). (SPEC 71)
- [hecho] «N pendientes · M vencen hoy» solo con datos cargados; en SSR/carga no se pinta para no mostrar «0 pendientes» (opción tomada: ocultar hasta `ready`).
- [hecho] Con `status = 'error'` el panel queda vacío (el Alert va en el área principal), en vez del esqueleto (R21 ajustado al implementar).
- [hecho] Marcar una tarea con su detalle abierto reinicia lo no guardado en el TaskForm (nuevo `defaultValues`), igual que en `AgendaDialogs`.
- [hecho] Pedir al DS `data-align='end'` en `cluster.css` para volver a copia literal. (sync DS 2026-10-27)
- [hecho] Pluralizar «1 pendientes» / «1 vencen hoy» (el DS no lo hace). (sync DS 2026-10-27)
- [pendiente] Borrar tareas desde el detalle (`deletable` en TaskForm + `deleteTask` en repositorio). (SPEC 71)
- [pendiente] Agregado rápido funcional en Inicio reutilizando `AgendaCommands.createTask`. (SPEC 71)
- [hecho] Comprobación en Playwright de `/tareas` a 1440 px: grupos Vencidas (badge danger, «20 oct»), Hoy, Próximas, Completadas; filtros; vacío con «Ver todas»; Enter añade en Hoy, vacía el campo y abre el detalle; marcar actualiza «N pendientes» y «X de Y completadas»; guardar el detalle cambia el título, mantiene la selección y persiste al recargar; JSON corrupto muestra Alert con «Reintentar»; riel «Tareas» activo; grid `rail main panel`; consola sin errores de hidratación.

## SPEC 68 — Configuración (2026-10-27)

- [hecho] Un draft común a todas las secciones: cambiar de sección conserva los cambios sin guardar (opción tomada: conservarlos; el DS los descarta al cambiar de sección).
- [hecho] `saved` se activa al terminar `save()`, sin el retardo simulado de 900 ms del DS (opción tomada: sin retardo; el botón muestra `loading` mientras dura).
- [duda] TimeField no tiene `ariaLabel`/`hideLabel`: «Inicio» y «Fin» con label visible en «Horario laboral» (opción tomada: labels visibles, sin tocar shared). (SPEC 70)
- [hecho] En filas `wide` los selects no ocupan el ancho `--size-control` del trail, solo el de su contenido (opción tomada: como sale de `setting-row.css` + `select.css`).
- [hecho] Correo fijo del DS, no editable ni persistido (opción tomada: constante `SETTINGS_EMAIL`).
- [hecho] Tests de las cinco secciones en un único `components/settings-sections.spec.ts` con helper común (opción tomada: un fichero, en vez de uno por componente).
- [sugerencia] Añadir `ariaLabel`/`hideLabel` a TimeField para seguir al DS («Inicio»/«Fin» solo como aria-label). (SPEC 70)
- [pendiente] Aplicar los ajustes al resto de la app: vista por defecto del Calendario, inicio de semana, formato 12 h, fines de semana, citas canceladas, horario laboral, duración predeterminada, densidad, tamaño de texto, reducir animaciones. (SPEC 73)
- [pendiente] Acciones de cuenta sin efecto: «Cambiar foto», «Quitar», «Cambiar» contraseña, «Cerrar sesión», «Exportar», «Eliminar cuenta» (con Dialog de confirmación), «Permitir en el navegador» (`Notification.requestPermission`). (SPEC 74)
- [pendiente] Avisar de cambios sin guardar al salir de `/configuracion` (guard `canDeactivate`). (SPEC 72)
- [hecho] Comprobación en Playwright de `/configuracion` a 1440 px: redirige a `/perfil`; menú con sección activa y navegación; cambiar Switch muestra SaveBar; guardar muestra «Cambios guardados» y persiste al recargar; JSON corrupto muestra Alert y «Reintentar» recupera; consola sin errores ni warnings.

## Sync DS (2026-10-27)

- [hecho] El MonthView del DS trae cabecera propia (`heading`, flechas, `onNavigate`); en local la pone la pantalla (opción tomada: componente sin cabecera, solo `.month-view__grid` + `.month-view__chips`).
- [duda] El DS añade «, N eventos» al nombre accesible del número del día en MonthView (opción tomada: no aplicado). (SPEC 70)
- [hecho] `--visible-hours` pasa a `--visible` en DayView/WeekView, como el DS.

## SPEC 70 — Ajustes de componentes (2026-10-27)

- [hecho] `app-task-item` no crece dentro de `l-cluster` (opción tomada: bloque local `task-form.css` con `.task-form__subtask` en grid `minmax(0, 1fr) auto auto`; el DS no quita ni edita subtareas). SPEC 81 quita el wrapper y `task-form.css`: la X va dentro del TaskItem, que ocupa el ancho del campo sin grid.
- [duda] Al terminar la edición de una subtarea con Enter o Escape, el foco vuelve a su botón «Editar»; al perder el foco no se mueve (opción tomada: así, para no perder el foco al quitar el campo del DOM).
- [sugerencia] Pedir al DS la regla `.week-view__allday-cell .badge > span { overflow: hidden; text-overflow: ellipsis; }`: sobre `.badge` (`inline-flex`) la elipsis del DS no actúa. Hoy es divergencia local en `week-view.css`.
- [hecho] El TaskItem de las subtareas muestra el chevron «Abrir detalle» sin acción; valorar `disabled` u ocultarlo en TaskForm. (SPEC 81: `action="remove"`, el chevron pasa a ser «Quitar subtarea»)
- [hecho] Playwright a 1440 px: `/demo#week-view` título largo con elipsis y `title`; `/demo#task-form` Enter con teclado real añade y vacía sin enviar, editar con foco en el campo y vuelta al botón, quitar; `/configuracion/calendario` «Inicio»/«Fin» ocultos y asociados al input; consola sin errores ni warnings.

## SPEC 75 — Pantallas móviles (2026-10-27)

- [duda] El DS pone el campo «Agregar nueva tarea» encima del filtro en Tareas móvil (opción tomada: filtro encima, orden del DOM de escritorio; sin `order` para no separar orden visual y de tabulación).
- [duda] Card móvil de Tareas «Avance de la semana» del DS con un Progress por lista (opción tomada: Card «Progreso» del panel, con todas las tareas).
- [duda] AppBar de Hoy cuando el día no es hoy (opción tomada: heading con la fecha, sin subtitle; «Hoy» solo si es hoy).
- [hecho] Divergencia local `blocks/shell-screen.css`: página `.l-screen` a alto fijo bajo 48rem (`:has()` en `.l-shell__grid`), padding móvil del `main` y Fab a `--space-s` del borde porque la BottomNav vive en `App`, fuera del `.l-screen`.
- [hecho] Playwright a 390 px: Hoy (AppBar, WeekStrip con puntos, DayView, Fab), Mes (AppBar con flechas, MiniCalendar en Card, AgendaItem del día), Tareas (AppBar «N pendientes», filtro, campo, lista plana, Progreso); sin scroll del documento; Fab a 1rem sobre la BottomNav; Fab abre «Nueva cita» como hoja; tocar una tarea abre «Detalle de la tarea» full y cerrar lo quita. A 1440 px: Tareas y Día como antes, «Nueva cita» centrado; consola sin errores.
- [pendiente] Badge de pendientes en «Tareas» de la BottomNav (el DS muestra 5): `App` no tiene datos de la agenda.
- [pendiente] «Buscar» y «Citas canceladas» en el AppBar de Hoy (DS): sin búsqueda ni filtro de canceladas (SPEC 73).
- [pendiente] Inicio y Semana móviles: siguen con la maquetación de escritorio apilada bajo 48rem; el menú «Vista» de Hoy lleva a Semana.
- [sugerencia] `npx ng test --watch=false` completo da timeouts aleatorios (5000 ms) con la máquina cargada, también en `master`; valorar `testTimeout` mayor o menos workers.

## SPEC 76 — Resumen móvil (2026-10-27)

- [duda] El DS pinta el día libre como Card sin heading que sustituye a «Próxima cita» y «Agenda de hoy» (opción tomada: EmptyState «Hoy no tienes citas» con «Nueva cita» dentro de «Agenda de hoy»; «Próxima cita» sigue mostrando la siguiente aunque sea otro día).
- [duda] Orden móvil de «Avance de la semana» y del conflicto, que el DS no fija junto a «Tareas que vencen» (opción tomada: tras «Agenda de hoy», el conflicto al final).
- [duda] StatCards móviles duplicadas en el DOM con las etiquetas cortas del DS («Citas», «Hechas», «De 8 h») (opción tomada: segundo grid `u-mobile-only` con `data-cols="2"`; el de escritorio queda `u-desktop-only`).
- [hecho] Playwright a 390 px: IconButton «Resumen» de Hoy abre `/resumen`; AppBar con día y flecha «Volver a Hoy» que vuelve a `/calendario/dia`; StatCards en 2 columnas; Próxima cita, Tareas que vencen, Agenda de hoy y Avance; sin scroll del documento; «Hoy» activo en la BottomNav. A 1440 px como antes; consola sin errores.
- [pendiente] Comprobar en Playwright el día libre y el esqueleto móvil (sin citas hoy en los datos seed; la carga de localStorage es instantánea).

## SPEC 77 — Ajustes móvil (2026-10-27)

- [duda] Fila de perfil de la lista con Avatar en el DS (opción tomada: icono `person_outline`, sin tocar SettingRow; respuesta del usuario).
- [duda] El DS descarta los cambios al volver de Perfil a la lista (opción tomada: se conserva el draft, como al cambiar de sección en SPEC 68; la SaveBar no se ve en la lista).
- [duda] «Notificaciones» en la lista: el DS fija «Activas» (opción tomada: «Activas» si navegador, correo o móvil está activo; si no, «Desactivadas»).
- [duda] La SaveBar va en su propio `div.settings-page__body`, así que `position: sticky` no la ancla al borde de `.l-screen__main` y queda al final del contenido (opción tomada: como el DS, que también la envuelve).
- [hecho] Playwright a 390 px: `/configuracion` con AppBar «Ajustes» y tres Cards; fila de perfil abre `/configuracion/perfil` con AppBar «Perfil» y «Volver a Ajustes»; editar muestra SaveBar; solo `.l-screen__main` hace scroll; volver conserva el nombre editado en la lista; «Ajustes» activo en la BottomNav. A 1440 px `/configuracion` muestra Perfil como antes; consola sin errores ni warnings.
- [pendiente] «Ayuda y contacto» y «Cerrar sesión» deshabilitadas en la lista móvil (sin destino; SPEC 74).
- [sugerencia] Slot `leading` en SettingRow para poner Avatar en la fila de perfil, como el DS.


## SPEC 71 — Borrar tareas, agregado rápido y acciones de citas (2026-10-27)

- [duda] Foco tras borrar: el control que lo pidió desaparece (opción tomada: primer `h1`/`h2` visible fuera de Dialogs con `tabindex="-1"`).
- [duda] Layout del menú junto a la cita (opción tomada: bloque local `.event-actions`, grid `1fr auto`, en lugar de `l-cluster data-nowrap`).
- [pendiente] Menú «Editar»/«Eliminar» en la lista móvil de AgendaItem de `/calendario/mes` (`month-main`) y en DayView/WeekView/MonthView.
- [sugerencia] «Cancelar» (`cancelable`) también en el Dialog «Detalle de tarea» de Inicio, Resumen y Calendario, como `onCancel` del DS.
- [sugerencia] Copy del error de borrado («No se pudo eliminar. Inténtalo de nuevo.») sin card de DS: confirmar con diseño.

## SPEC 72 — Reloj en vivo y aviso de cambios sin guardar (2026-10-27)

- [duda] Calendario sin `?fecha=`: `day` sale de `today()`, así que a medianoche pasa solo al nuevo día (opción tomada: seguir al reloj; sin fecha en la URL la pantalla significa «hoy». Inicio sí conserva su `selectedDay`).
- [duda] Botón «atrás» del navegador cancelado por el guard: Angular restaura la URL con `canceledNavigationResolution` por defecto (opción tomada: comportamiento por defecto del router).
- [hecho] Playwright a 1440 px: `/calendario/dia` con `page.clock` +5 min, «Ahora 10:30» pasa a «Ahora 10:35» y la línea baja; `/configuracion/apariencia` con cambios, riel «Calendario» abre el Dialog; «Seguir editando» se queda con SaveBar; «Descartar» navega sin guardar; cambiar a «Perfil» no abre Dialog; «Guardar y salir» guarda y navega; recargar con cambios dispara `beforeunload`; consola sin errores ni warnings.
- [pendiente] `TasksFacade.today` (Tareas) sigue fijo al crear la pantalla: grupos «Hoy»/«Vencidas» no cambian a medianoche.
- [sugerencia] Alinear el tic del `Clock` al cambio de minuto (primer `setTimeout` hasta el segundo 0) para que la línea de ahora no vaya hasta 59 s tarde.

## SPEC 73 — Aplicar ajustes (2026-10-27)

- [pendiente] «Mostrar citas canceladas» sin efecto: `CalendarEvent` no tiene `cancelled` ni acción «Cancelar cita»; hace falta campo, acción y datos seed (clave nueva) antes de filtrar.
- [pendiente] «Horario laboral · Fin» sin efecto (solo «Inicio» fija el scroll de DayView/WeekView).
- [duda] La duración predeterminada manda también al pulsar un hueco (antes 1 h fija con `slotEnd`) (opción tomada: sí, R6; `slotEnd` sigue en las facades pero su fin se sobreescribe en `AgendaDialogs.openNewEvent`).
- [duda] `/calendario` pasa a `RenderMode.Client` para que la redirección lea `localStorage` (opción tomada: cliente; el servidor redirigiría siempre a Semana).
- [sugerencia] `utilities/reduced-motion.css` (copia del DS) apunta a `.app`, que no existe en local: `prefers-reduced-motion` no quita animaciones salvo en Spinner. Aplicarlo a `:root` como `data-reduce-motion` o pedir al DS el selector.
- [sugerencia] Con Compacta/Grande guardados hay salto visual al hidratar (SSR pinta con defaults); valorar cookie o script inline en `index.html`.
- [sugerencia] Quitar `slotEnd` de `CalendarDayFacade.openSlot`/`CalendarWeekFacade.openSlot` si nadie más lo usa (el fin ya lo pone `AgendaDialogs`).
- [hecho] Playwright (build SSR): con ajustes guardados `/calendario` va a Mes; `<html>` con `data-density="compact"`, `data-text-size="large"` (raíz 18px), `data-reduce-motion` (0 elementos con transición/animación); Semana fuera de hoy abre a las 06:00; hueco 10:00 abre «Nueva cita» 10:00–10:45. Sin recargar: guardar «Día» y pulsar «Calendario» del riel va a `/calendario/dia`; guardar Cómoda/Normal quita los atributos. Consola sin errores ni warnings.

## SPEC 74 — Acciones de cuenta (2026-10-27)

- [duda] `profile.photo` opcional en el spec (opción tomada: `photo: string` con `''` por defecto; Signal Forms necesita la clave y el merge con defaults la añade a ajustes viejos).
- [duda] Tono del Alert de permiso denegado y sin soporte, que el spec no fija (opción tomada: `warning` y `info`).
- [duda] Export lee los DTO crudos de `LocalStorageApi` desde la facade de ajustes (opción tomada: import relativo a `features/agenda/structure`; si faltan claves, siembra como el resto de la app).
- [hecho] Playwright (build SSR, 1440 px): foto PNG se guarda y sigue tras recargar; GIF muestra el Alert; «Quitar» vuelve a iniciales; «Exportar» descarga `agenda-export-2026-10-27.json` con `events`, `tasks`, `settings`, `exportedAt`; Dialog «¿Eliminar tu cuenta?» cancelado no borra, confirmado va a `/inicio` con el seed (6 tareas); «Cambiar» y «Cerrar sesión» avisan en su Card. A 390 px «Cerrar sesión» de la lista avisa. Consola sin errores ni warnings.
- [pendiente] Probar «Permitir en el navegador» con permiso real concedido/denegado en un navegador (solo cubierto por tests con `Notification` simulado).
- [pendiente] El Avatar de la fila de perfil móvil y del SidebarNav no usa la foto (SettingRow sin slot `leading`; `user` del SidebarNav sin `src`).
- [sugerencia] Foto grande cerca del límite de localStorage: valorar redimensionar con `<canvas>` antes de guardar.

## SPEC 78 — Inicio de semana, 12 h y fines de semana (2026-10-27)

- [duda] Forma de `firstDay` en los componentes (opción tomada: `0 | 1` como `Intl.Locale.weekInfo`; el store traduce «Lunes»/«Domingo»).
- [duda] WeekView sin input de fines de semana (opción tomada: el facade pasa 5 `days` y el host pone `data-weekdays-only` cuando `days().length === 5`).
- [duda] Título de Semana con fines de semana ocultos (opción tomada: sigue la semana completa, p. ej. «18 – 24 de octubre»; «Semana N» es la ISO del miércoles/jueves mostrado).
- [duda] MonthView sin fines de semana y día 1 en sábado/domingo: la primera fila puede quedar entera fuera de mes (opción tomada: se mantiene la rejilla de 6 semanas).
- [hecho] Playwright (build SSR, 1440 px): guardar Domingo, 12 h y sin fines de semana; `/calendario/semana` con 5 columnas lun–vie, horas «10:00 PM», citas «5:00 PM – 6:00 PM», MiniCalendar desde «D»; `/calendario/mes` 5 columnas y 30 celdas; `/inicio` y `/resumen` con horas 12 h; a 390 px la WeekStrip de `/calendario/dia` empieza en domingo. Consola sin errores ni warnings.
- [pendiente] Rangos «Esta semana»/«Próxima» de Inicio, «Avance de la semana» de Resumen y `weekTasks` siguen lunes–domingo aunque «Inicio de semana» sea Domingo.
- [pendiente] TimeField/EventForm: `input type="time"` nativo sigue al navegador, no a «Formato de hora».
- [sugerencia] Pedir al DS columnas configurables (`--days`) en `week-view.css`/`month-view.css` para quitar `exceptions/weekdays-only.css`.
- [sugerencia] Copy «AM»/«PM» (elegido por el usuario) frente a «a. m.»/«p. m.» de es-ES: confirmar con diseño.
- [pendiente] Revisar a ojo los nuevos controles de `/demo` (solo en `npm start`; cubiertos por build, no por Playwright).

## SPEC 81 — Quitar subtarea dentro de TaskItem (2026-10-28)

- [duda] Divergencia con el DS: el DS no quita subtareas; `app-task-item` gana `action: 'open' | 'remove'` y en `'remove'` el botón `.task-item__open` muestra `close` con «Quitar subtarea: <título>» y la fila no es interactiva (opción tomada: mismo estilo y hover brand, sin danger).
- [hecho] Playwright a 1440 px: `/demo#task-form` cada subtarea con solo la X dentro de la fila (sin chevron ni X externa), 398 px como el campo; X quita; clic en el título no hace nada; checkbox marca; añadir funciona. `/demo#task-item` ejemplo `remove` muestra «Quitada: Pedir cita en tránsito» y los `open` siguen con «Abierto: <título>». Consola sin errores ni warnings.
- [pendiente] `/demo#task-form`: tras añadir con el botón «Añadir subtarea» el input «Agregar subtarea» sigue mostrando el texto (con Enter sí se vacía). No toca código de SPEC 81 (`text-field`, `task-form.ts`); revisar `[value]` de TextField.

## SPEC 82 — Buscar en la agenda de Inicio (2026-10-28)

- [hecho] Divergencia local en `blocks/home-page.css`: `app-agenda-panel .input__control::-webkit-search-cancel-button { appearance: none; }`. Chromium pinta su X nativa en `type="search"` y duplicaba «Cerrar búsqueda» (opción tomada: ocultarla solo en el panel, sin tocar `app-text-field`).
- [duda] R10 con `linkedSignal` sobre la clave `range|selectedDay`, no `signal` como dice el modelo de datos: en la carga solo da el valor inicial y no reabre ni vacía nada.
- [duda] A 390 px el campo encoge a ~121 px en la misma fila (el `flex: 1` de `data-grow` tiene base 0) en vez de envolver a otra línea; usable, pero estrecho. Un `min-inline-size` necesitaría un valor del DS.
- [hecho] Playwright a 1440 px en `/inicio` (rango «Esta semana»): lupa abre campo enfocado + X con «Tu agenda» y «Nueva cita» visibles; «REUNION» tecla a tecla deja «Reunión de equipo» y solo su grupo; «videollamada» (lugar) y «perez» (persona, sin tilde) filtran; «zzz» muestra «Sin resultados» con «No hay citas que coincidan con «zzz».»; Esc y X cierran, vacían y enfocan la lupa; Enter en la lupa abre; «Próxima» y pulsar el día 29 cierran la búsqueda; pulsar «Clase de yoga» filtrada abre «Editar cita» y la búsqueda sigue abierta. Consola sin errores ni warnings.
