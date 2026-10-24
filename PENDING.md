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
