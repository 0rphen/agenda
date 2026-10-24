# TODO — Implementación de Agenda

Orden de menor a mayor: cada nivel solo depende de los anteriores. Cada bloque de casillas es un spec candidato (`/spec`), en formato EARS (ver CLAUDE.md). Fuente: DS **Agenda** (`project/components/<Comp>/README.md`, `project/api/components/<Comp>.md`, `project/assets/Code/styles/blocks/*.css`).

La composición (`.l-stack`, `.l-cluster`, `.l-grid`, `.l-shell`, `.l-screen`) llega con el primer spec que la consuma.

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
- [ ] Alert (Icon, Button, IconButton)
- [ ] EmptyState (Icon, Button)
- [ ] Breadcrumb (Icon)
- [ ] Fab (Icon)
- [ ] Menu (IconButton disparador, teclado)
- [ ] DayPill
- [ ] AgendaItem (`u-category`)
- [ ] TaskItem (Checkbox)
- [ ] EventCard (Badge `glass`, AvatarGroup, `u-tint`)
- [ ] StatCard (Icon) + composición `.l-grid`
- [ ] SettingRow (Icon, Switch, TextField/SelectField, SegmentedControl)

## 4. Organismos

- [ ] WeekStrip (DayPill) + composición `.l-cluster`
- [ ] MiniCalendar (IconButton)
- [ ] SidebarNav (panel / rail) (Icon, Badge, Avatar)
- [ ] BottomNav (Icon, Badge)
- [ ] AppBar (IconButton, Menu)
- [ ] Dialog + Sheet (`variant="sheet" | "full"`) (IconButton, Button)
- [ ] SaveBar (Button)
- [ ] DayView (Badge, AvatarGroup)
- [ ] WeekView
- [ ] MonthView
- [ ] EventForm (TextField, TextareaField, DateField, TimeField, Switch, Button)
- [ ] TaskForm (TextField, DateField, TaskItem, Button)

## 5. Layout de aplicación

- [ ] `.l-shell` (riel + áreas por container query) y `.l-screen` (`top` / `main` / `bottom` / `fab`)
- [ ] Rutas y navegación según NavigationMap: escritorio con SidebarNav, móvil con BottomNav (la elección depende del ancho del contenedor)

## 6. Pantallas

Escritorio (`.l-shell`):

- [ ] Inicio: AppShell (riel, calendario, agenda, tareas)
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
