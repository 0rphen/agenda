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

## 5. Layout de aplicación

- [x] `.l-shell` (riel + áreas por container query) y `.l-screen` (`top` / `main` / `bottom` / `fab`) (SPEC 55)
- [x] Rutas y navegación según NavigationMap: escritorio con SidebarNav, móvil con BottomNav (la elección depende del ancho del contenedor) (SPEC 56)

## 6. Pantallas

Escritorio (`.l-shell`):

- [x] Inicio: AppShell (riel, calendario, agenda, tareas) (SPEC 57)
- [ ] Resumen: OverviewPage (`data-layout="week"`)
- [ ] Calendario · Día: DayPage
- [ ] Calendario · Semana: WeekPage (+ panel EventForm)
- [ ] Calendario · Mes: MonthView dentro del shell (sin página de ejemplo en el DS; derivarla de DayPage/WeekPage)
- [ ] Tareas (sin página de ejemplo de escritorio; derivarla de AppShell y MobileScreens)
- [ ] Configuración: SettingsPage (`data-layout="settings"`)

Móvil (`.l-screen`):

- [ ] Hoy · Mes · Tareas · hoja «Nueva cita»: MobileScreens
- [ ] Resumen móvil: MobileOverview (con datos, cargando, vacío)
- [ ] Ajustes móvil: MobileSettings (lista → detalle, SaveBar)

## Fuera de alcance

- NavigationMap: es documentación; sirve solo de referencia para las rutas.
- Cover: portada del DS.
- Radio y Slider: no existen en el DS. Para elegir 1 de pocas opciones, usar SegmentedControl.
- Pedir al DS la regla `center` en `cluster.css` (hoy es divergencia local, SPEC 27).
