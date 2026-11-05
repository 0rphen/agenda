# TODO — Agenda implementation

Ordered from lowest to highest level: each level depends only on the previous ones. Each checkbox block is a candidate spec (`/spec`), in EARS format (see CLAUDE.md). Source: DS **Agenda** (`project/components/<Comp>/README.md`, `project/api/components/<Comp>.md`, `project/assets/Code/styles/blocks/*.css`).

Composition is already in place: `.l-cluster` (SPEC 26), `.l-grid` (SPEC 35), `.l-stack` (SPEC 42) and `.l-shell`/`.l-screen` (SPEC 55).

## 0. Foundation

- [x] SPEC 01: CSS foundation (layers, tokens, reset, utilities, fonts)
- [x] Demo page /demo (SPEC 15)

## 1. Atoms (no dependencies on other components)

- [x] Input + Icon (SPEC 02; decisions already made, see memory)
- [x] Split Input: TextField, TextareaField, SelectField, DateField, TimeField (SPEC 04)
- [x] Text validations (phone, DNI/NIE, `fieldError`) + NumberField (SPEC 05)
- [x] NumberField: typing `1e` (or another non-numeric intermediate value) after a number erases the text, because `value` becomes `null` and `[value]` writes `''`. Write to the DOM only when the control does not match the model, without losing the value in SSR (SPEC 09)
- [x] Spinner (SPEC 03)
- [x] Badge (SPEC 06)
- [x] Avatar + AvatarGroup (SPEC 07)
- [x] Progress (SPEC 10)
- [x] Progress: `heading` input instead of `title`, no native tooltip on the host (SPEC 24)
- [x] Skeleton + SkeletonList (SPEC 11)

## 2. Controls

- [x] Button (Icon, Spinner for `loading`) (SPEC 12)
- [x] ButtonLink: `<a class="button">` for navigation (same CSS block as Button) (SPEC 13)
- [x] IconButton (Icon) (SPEC 17)
- [x] Checkbox (SPEC 18)
- [x] Checkbox: when standalone, `label.check` stretches to the full width of the host `.field` (flex column) and the click area covers the whole row. Fix the label width (e.g. `align-items: start`) without breaking `.field__hint` (risk from SPEC 18) (SPEC 19)
- [x] Switch (SPEC 20)
- [x] SegmentedControl (SPEC 21)

## 3. Molecules

- [x] Card (SPEC 22)
- [x] Card: `heading` input instead of `title`, no native tooltip on the host (SPEC 23)
- [x] Alert (SPEC 25)
- [x] EmptyState (SPEC 26)
- [x] EmptyState: `data-justify="center"` on `.l-cluster` has no rule in the DS `cluster.css` (only `end`/`between`); today it centers `align-items` of `.empty-state`. Decide whether to drop the attribute or ask the DS for the `center` rule (SPEC 27)
- [x] Breadcrumb (Icon)
- [x] Fab (Icon) (SPEC 29)
- [x] Menu (IconButton trigger, keyboard) (SPEC 30)
- [x] DayPill (SPEC 31)
- [x] AgendaItem (`u-category`) (SPEC 32)
- [x] TaskItem (Checkbox) (SPEC 33)
- [x] EventCard (Badge `glass`, AvatarGroup, `u-tint`) (SPEC 34)
- [x] StatCard (Icon) + `.l-grid` composition (SPEC 35)
- [x] SettingRow (Icon, Switch, TextField/SelectField, SegmentedControl) (SPEC 36)

## 4. Organisms

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

## 4b. Fixes from PENDING.md

- [x] Dialog: scroll lock when modal, close on scrim, Escape in Menu does not close the Dialog (SPEC 48)
- [x] Arrow keys + roving tabindex in WeekStrip and MiniCalendar, `aria-live` on the month title (SPEC 49)
- [x] Menu with automatic alignment + SaveBar hides «Cambios guardados» by itself (SPEC 50)
- [x] DS CSS cleanup (touch target with `pointer: coarse`, `outline-offset`) + prettier (SPEC 51)
- [x] `overview-page.spec.ts` test R9/R27 independent of the time of day: alternating the three greetings + fixed clock 09:00/15:00/22:00 (SPEC 65)
- [x] MonthView: `data-selected` cell is painted gray, similar to out-of-month cells; selected number in brand like MiniCalendar (SPEC 66)

## 5. Application layout

- [x] `.l-shell` (rail + areas via container query) and `.l-screen` (`top` / `main` / `bottom` / `fab`) (SPEC 55)
- [x] Routes and navigation per NavigationMap: desktop with SidebarNav, mobile with BottomNav (the choice depends on container width) (SPEC 56)

## 6. Screens

Desktop (`.l-shell`):

- [x] Inicio: AppShell (rail, calendar, agenda, tasks) (SPEC 57)
- [x] Resumen: OverviewPage (`data-layout="week"`) (SPEC 59)
- [x] Resumen and Inicio: clicking a TaskItem opens a Dialog with TaskForm and saves; «Nueva cita» opens EventForm and creates an event; repository with `create`/`update` (SPEC 60)
- [x] Dialog: clicking a `type="submit"` button inside `app-dialog` does not submit the form. The `<dialog>` `(click)` (`$event.target === $event.currentTarget && closable() && open.set(false)`) returns `false` outside the scrim and Angular calls `preventDefault()`. Blocks saving TaskForm/EventForm with the button in Inicio and Resumen (risk from SPEC 60). Move to a method with no return value and add a submit-inside-Dialog test (SPEC 61)
- [x] Calendario · Día: DayPage at `/calendario/dia?fecha=` and shared Dialogs in `app-agenda-dialogs` (SPEC 62)
- [x] Calendario · Semana: WeekPage at `/calendario/semana?fecha=`, empty slots in WeekView and week tasks panel (SPEC 63)
- [x] Calendario · Mes: MonthPage at `/calendario/mes?fecha=` with MonthView and day panel; common `CalendarFacade` base (SPEC 64)
- [x] Tareas: TasksPage (`data-layout="week"`) with filter, quick add, groups by due date and detail in the panel (SPEC 67)
- [x] Configuración: SettingsPage (`data-layout="settings"`) with sections in child routes and saving to localStorage (SPEC 68)

Mobile (`.l-screen`):

- [x] Hoy · Mes · Tareas · «Nueva cita» sheet: MobileScreens (SPEC 75)
- [x] Mobile overview: MobileOverview (with data, loading, empty) (SPEC 76)
- [x] Mobile settings: MobileSettings (list → detail, SaveBar) (SPEC 77)

## 7. Pending fixes from PENDING.md

- [x] Breadcrumb: «Inicio» crumb links to `/inicio` from Resumen, Calendario, Tareas and Configuración; seed tasks with tags (key `agenda:v3`) so the detail shows them checked (SPEC 69)
- [x] Components: TimeField `ariaLabel`/`hideLabel` (and «Horario laboral» without a visible label); TaskForm Enter adds a subtask, remove and edit subtasks; SaveBar «Guardando»; MonthView «, N eventos» in the accessible name; WeekView «Todo el día» with ellipsis and `title` (SPEC 70)
- [x] Tareas, Inicio and appointments: delete task with confirmation; quick add in Inicio; «Editar»/«Eliminar» menu next to EventCard/AgendaItem (`updateEvent`/`deleteEvent`); Tareas filter in `?filtro=` and «Cancelar» in the detail (SPEC 71)
- [x] Live clock (`now`/`today` every minute in Inicio, Resumen and Calendario) and unsaved-changes warning in Configuración (`canDeactivate` + `beforeunload`) (SPEC 72)
- [x] Apply Calendar settings (default view, working hours, duration) and Appearance settings (density, large text, reduce motion); dropped ones without data go to PENDING (SPEC 73)
- [x] Account actions: profile photo, export JSON, delete account with confirmation, notification permission; password and sign out «No disponible» (SPEC 74)
- [x] Apply Calendar settings: week start Monday/Sunday (WeekView, MonthView, MiniCalendar, WeekStrip), 12 h format in visible times, hide weekends in WeekView and MonthView (SPEC 78)
- [x] Clicking an appointment in Resumen, Inicio and Calendario (Day, Week, Month) opens «Editar cita» with «Eliminar cita» (EventForm `deletable`); replaces the «Editar»/«Eliminar» menu (SPEC 79)
- [x] TaskForm: each subtask only has «Quitar subtarea»; «Editar subtarea» and inline editing removed (reverts SPEC 70 R7/R8) (SPEC 80)
- [x] TaskItem `action="remove"`: the «Quitar subtarea» X goes inside the row instead of the chevron; external `app-icon-button` and `task-form.css` removed (SPEC 81)
- [x] Inicio: the agenda «Buscar» magnifier opens a field that filters the range's appointments in real time by title, location and people (case- and accent-insensitive); X/Esc close it; changing range or day closes it (SPEC 82)
- [x] Remove demo-only preview props: forced states (`state`, `forceState`, `slotState`, `data-force` in blocks) and `static` mode of Dialog, Menu and SaveBar (SPEC 83)
- [x] Pending fixes: clock aligned to the minute, live «today» in Tareas, `prefers-reduced-motion` on `:root`, `slotEnd` removed, weeks honoring «Inicio de semana» in Inicio/Resumen, pending badge on «Tareas» and «Horario laboral» shaded in Day/Week with End > Start in Settings (SPEC 84)

## Out of scope

- NavigationMap: it is documentation; used only as a reference for routes.
- Cover: DS cover page.
- Radio and Slider: they do not exist in the DS. To pick 1 of a few options, use SegmentedControl.
- Ask the DS for the `center` rule in `cluster.css` (today a local divergence, SPEC 27).
- Other requests to the DS to return to a literal copy: `[suggestion]`/`[done]` «Ask the DS…» entries in `PENDING.md` (SPEC 31, 32, 44, 45, 51, 52, 54, 66, 67).
