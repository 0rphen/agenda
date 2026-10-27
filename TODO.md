# TODO — Implementación de Agenda

Orden de menor a mayor: cada nivel solo depende de los anteriores. Cada bloque de casillas es un spec candidato (`/spec`), en formato EARS (ver CLAUDE.md). Fuente: DS **Agenda** (`project/components/<Comp>/README.md`, `project/api/components/<Comp>.md`, `project/assets/Code/styles/blocks/*.css`).

La composición ya está: `.l-cluster` (SPEC 26), `.l-grid` (SPEC 35), `.l-stack` (SPEC 42) y `.l-shell`/`.l-screen` (SPEC 55).

## 0. Fundación

- [x] SPEC 01: fundación CSS (capas, tokens, reset, utilidades, fuentes)
- [x] Página demo /demo (SPEC 15)

## 1. Átomos (sin dependencias de otros componentes)

- [x] Input + Icon (SPEC 02; decisiones ya tomadas, ver memoria)
- [x] Separar Input: TextField, TextareaField, SelectField, DateField, TimeField (SPEC 04)
- [x] Validaciones de texto (teléfono, DNI/NIE, `fieldError`) + NumberField (SPEC 05)
- [x] NumberField: escribir `1e` (u otro valor intermedio no numérico) tras un número borra el texto, porque `value` pasa a `null` y `[value]` escribe `''`. Escribir en el DOM solo si el control no coincide con el modelo, sin perder el valor en SSR (SPEC 09)
- [x] Spinner (SPEC 03)
- [x] Badge (SPEC 06)
- [x] Avatar + AvatarGroup (SPEC 07)
- [x] Progress (SPEC 10)
- [x] Progress: input `heading` en lugar de `title`, sin tooltip nativo en el host (SPEC 24)
- [x] Skeleton + SkeletonList (SPEC 11)

## 2. Controles

- [x] Button (Icon, Spinner para `loading`) (SPEC 12)
- [x] ButtonLink: `<a class="button">` para navegación (mismo bloque CSS que Button) (SPEC 13)
- [x] IconButton (Icon) (SPEC 17)
- [x] Checkbox (SPEC 18)
- [x] Checkbox: cuando va sola, `label.check` se estira a todo el ancho del host `.field` (flex column) y la zona de clic ocupa toda la fila. Ajustar el ancho del label (p. ej. `align-items: start`) sin romper `.field__hint` (riesgo de SPEC 18) (SPEC 19)
- [x] Switch (SPEC 20)
- [x] SegmentedControl (SPEC 21)

## 3. Moléculas

- [x] Card (SPEC 22)
- [x] Card: input `heading` en lugar de `title`, sin tooltip nativo en el host (SPEC 23)
- [x] Alert (SPEC 25)
- [x] EmptyState (SPEC 26)
- [x] EmptyState: `data-justify="center"` en `.l-cluster` no tiene regla en el `cluster.css` del DS (solo `end`/`between`); hoy centra `align-items` de `.empty-state`. Decidir si se quita el atributo o se pide al DS la regla `center` (SPEC 27)
- [x] Breadcrumb (Icon)
- [x] Fab (Icon) (SPEC 29)
- [x] Menu (IconButton disparador, teclado) (SPEC 30)
- [x] DayPill (SPEC 31)
- [x] AgendaItem (`u-category`) (SPEC 32)
- [x] TaskItem (Checkbox) (SPEC 33)
- [x] EventCard (Badge `glass`, AvatarGroup, `u-tint`) (SPEC 34)
- [x] StatCard (Icon) + composición `.l-grid` (SPEC 35)
- [x] SettingRow (Icon, Switch, TextField/SelectField, SegmentedControl) (SPEC 36)

## 4. Organismos

- [x] WeekStrip (DayPill) (SPEC 37)
- [x] MiniCalendar (IconButton) (SPEC 38)
- [x] SidebarNav (panel / rail) (Icon, Badge, Avatar) (SPEC 39)
- [x] BottomNav (Icon, Badge) (SPEC 40)
- [x] AppBar (IconButton, Menu) (SPEC 41)
- [x] Dialog + Sheet (`variant="sheet" | "full"`) (IconButton, Button) (SPEC 42)
- [x] SaveBar (Button) (SPEC 43)
- [x] DayView (Badge, AvatarGroup) (SPEC 44)
- [x] WeekView (SPEC 45)
- [x] MonthView (SPEC 52)
- [x] EventForm (TextField, TextareaField, DateField, TimeField, Switch, Button) (SPEC 53)
- [x] TaskForm (TextField, DateField, TaskItem, Button) (SPEC 54)

## 4b. Ajustes desde PENDING.md

- [x] Dialog: bloqueo de scroll con modal, cierre por scrim, Escape en Menu no cierra el Dialog (SPEC 48)
- [x] Flechas + roving tabindex en WeekStrip y MiniCalendar, `aria-live` en el título del mes (SPEC 49)
- [x] Menu con alineación automática + SaveBar oculta «Cambios guardados» sola (SPEC 50)
- [x] Limpieza CSS del DS (zona táctil con `pointer: coarse`, `outline-offset`) + prettier (SPEC 51)
- [x] Test `overview-page.spec.ts` R9/R27 independiente de la hora: alternancia de los tres saludos + reloj fijo 09:00/15:00/22:00 (SPEC 65)
- [x] MonthView: celda `data-selected` se pinta gris, parecida a las celdas fuera de mes; número seleccionado brand como MiniCalendar (SPEC 66)

## 5. Layout de aplicación

- [x] `.l-shell` (riel + áreas por container query) y `.l-screen` (`top` / `main` / `bottom` / `fab`) (SPEC 55)
- [x] Rutas y navegación según NavigationMap: escritorio con SidebarNav, móvil con BottomNav (la elección depende del ancho del contenedor) (SPEC 56)

## 6. Pantallas

Escritorio (`.l-shell`):

- [x] Inicio: AppShell (riel, calendario, agenda, tareas) (SPEC 57)
- [x] Resumen: OverviewPage (`data-layout="week"`) (SPEC 59)
- [x] Resumen e Inicio: clic en TaskItem abre Dialog con TaskForm y guarda; «Nueva cita» abre EventForm y crea evento; repositorio con `create`/`update` (SPEC 60)
- [x] Dialog: el clic en un botón `type="submit"` dentro de `app-dialog` no envía el form. El `(click)` del `<dialog>` (`$event.target === $event.currentTarget && closable() && open.set(false)`) devuelve `false` fuera del scrim y Angular hace `preventDefault()`. Bloquea guardar TaskForm/EventForm con el botón en Inicio y Resumen (riesgo de SPEC 60). Pasar a un método sin valor de retorno y test de submit dentro del Dialog (SPEC 61)
- [x] Calendario · Día: DayPage en `/calendario/dia?fecha=` y Dialogs comunes en `app-agenda-dialogs` (SPEC 62)
- [x] Calendario · Semana: WeekPage en `/calendario/semana?fecha=`, huecos en WeekView y panel de tareas de la semana (SPEC 63)
- [x] Calendario · Mes: MonthPage en `/calendario/mes?fecha=` con MonthView y panel del día; base `CalendarFacade` común (SPEC 64)
- [x] Tareas: TasksPage (`data-layout="week"`) con filtro, agregado rápido, grupos por vencimiento y detalle en el panel (SPEC 67)
- [x] Configuración: SettingsPage (`data-layout="settings"`) con secciones en rutas hijas y guardado en localStorage (SPEC 68)

Móvil (`.l-screen`):

- [x] Hoy · Mes · Tareas · hoja «Nueva cita»: MobileScreens (SPEC 75)
- [ ] Resumen móvil: MobileOverview (con datos, cargando, vacío)
- [ ] Ajustes móvil: MobileSettings (lista → detalle, SaveBar)

## 7. Ajustes pendientes desde PENDING.md

- [x] Breadcrumb: crumb «Inicio» enlaza a `/inicio` desde Resumen, Calendario, Tareas y Configuración; tareas seed con etiquetas (clave `agenda:v3`) para que el detalle las muestre marcadas (SPEC 69)
- [x] Componentes: TimeField `ariaLabel`/`hideLabel` (y «Horario laboral» sin label visible); TaskForm Enter añade subtarea, quitar y editar subtareas; SaveBar «Guardando»; MonthView «, N eventos» en el nombre accesible; WeekView «Todo el día» con elipsis y `title` (SPEC 70)
- [ ] Tareas, Inicio y citas: borrar tarea con confirmación; agregado rápido en Inicio; menú «Editar»/«Eliminar» junto a EventCard/AgendaItem (`updateEvent`/`deleteEvent`); filtro de Tareas en `?filtro=` y «Cancelar» en el detalle (SPEC 71)
- [ ] Reloj en vivo (`now`/`today` cada minuto en Inicio, Resumen y Calendario) y aviso de cambios sin guardar en Configuración (`canDeactivate` + `beforeunload`) (SPEC 72)
- [ ] Aplicar ajustes de Calendario (vista por defecto, inicio de semana, 12 h, fines de semana, canceladas, horario laboral, duración) y Apariencia (densidad, texto grande, reducir animaciones) (SPEC 73)
- [ ] Acciones de cuenta: foto de perfil, exportar JSON, eliminar cuenta con confirmación, permiso de notificaciones; contraseña y cerrar sesión «No disponible» (SPEC 74)

## Fuera de alcance

- NavigationMap: es documentación; sirve solo de referencia para las rutas.
- Cover: portada del DS.
- Radio y Slider: no existen en el DS. Para elegir 1 de pocas opciones, usar SegmentedControl.
- Pedir al DS la regla `center` en `cluster.css` (hoy es divergencia local, SPEC 27).
- Resto de peticiones al DS para volver a copia literal: entradas `[sugerencia] Pedir al DS…` de `PENDING.md` (SPEC 31, 32, 44, 45, 51, 52, 54, 66, 67).
