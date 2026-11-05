# PENDING — candidates for TODO.md

## SPEC 29 — Fab (2026-10-24)

- [done] In `extended`, the `aria-label` repeats the visible text (chosen option: keep it, same as the DS; harmless for screen readers).
- [pending] Anchor the Fab in `.l-screen__fab` (above `BottomNav`, safe area) once the mobile screen composition exists.

## SPEC 30 — Menu (2026-10-24)

- [done] After picking an item, the DS does not return focus to the trigger (chosen option: return it, because focus was lost when the panel unmounted).
- [done] ↑ with no item focused: the DS jumps to the second-to-last via modular arithmetic (chosen option: go to the last one).
- [done] Reposition the panel (automatic `align`) when it overflows the screen or container edge (SPEC 50: horizontal only and against the viewport, not containers with `overflow`).
- [pending] Use `app-menu` in AppBar (TODO §6 mobile) and in the EventCard/AgendaItem appointment cards (SPEC 71).

## SPEC 31 — DayPill (2026-10-24)

- [done] `.day-pill` hover almost invisible: `--color-brand-soft` (oklch 0.91 0.008 241.7) and `--color-surface-sunken` (oklch 0.917 0.005 247.9), the resting background, are nearly identical. Ask the DS for more contrast or another hover token. (DS sync 2026-10-27)
- [done] `WeekStrip` must build each `DayPill`'s `label` with the full date («Jueves 22 de octubre, hoy, con eventos»). (SPEC 37: `WeekStrip` derives the label from `iso`)

## SPEC 32 — AgendaItem (2026-10-24)

- [done] The DS preview uses `21.25rem` columns (chosen option: reuse `.demo__narrow`, `max-inline-size: 22rem`, to avoid adding CSS to the demo).
- [done] Ask the DS to rename AgendaItem's `title` prop (and review EventCard/TaskItem) to `heading`: it clashes with the global HTML attribute in Angular. (DS sync 2026-10-27)
- [done] `AgendaGroup` component or composition (`.agenda-group__title` + list sorted by time) when the agenda screen arrives. (SPEC 57: `.agenda-group__title` + events by time in `agenda-panel`)

## SPEC 33 — TaskItem (2026-10-24)

- [done] The chevron suggests the row opens the detail, but the DS defines no row click (chosen option: decorative chevron, no click output).
- [done] The DS always writes «N subtareas» (chosen option: singular «1 subtarea»).
- [done] `label.check` has `min-block-size: var(--touch-target)` without a `pointer: coarse` condition, so the row is ~61 px instead of `control-l` (48 px). Ask the DS to limit it to coarse pointers (SPEC 51: touch target only with `pointer: coarse`; with a fine pointer the check is 20 px and the row 55 px from content: title + meta + `padding-block`).
- [done] Navigate to the task detail (click on the row or chevron) once the tasks screen exists. (SPEC 58/67: clickable row and «Abrir detalle» chevron, `opened` output)

## SPEC 34 — EventCard (2026-10-24)

- [done] The DS nests `h4` (title) and `p` (location) inside the `button`, invalid HTML (chosen option: `span` with the same classes).
- [done] The button's accessible name includes the names of all visible attendees (avatars `role="img"`) and «N más» (chosen option: leave it, faithful to the DS).
- [done] In `AvatarGroup` on a card, the overlapped avatar's initials («MG») are clipped by the next one; review the overlap or size `s` with the DS. (DS sync 2026-10-27)
- [pending] Actions menu (`app-menu`) in EventCard when a screen needs it. (SPEC 71)

## SPEC 35 — StatCard (2026-10-24)

- [done] The DS preview labels the forced states «Hover», «Active», «Focus» (chosen option: copy the DS text in the demo, same as the Card demo).
- [done] Resumen (OverviewPage/MobileOverview): four `StatCard` in `.l-grid data-min="s"` (`data-cols="2"` on mobile) that navigate to their view with `(clicked)`. (SPEC 59: desktop Resumen; the mobile version goes in MobileOverview, TODO §6)

## SPEC 36 — SettingRow (2026-10-24)

- [done] The DS block `setting-row.css` declares `outline-offset` twice in `:focus-visible` (the second wins, negative offset) (SPEC 51: a single `outline-offset`, the negative one).
- [done] With `wide`, the select's `.field` and `.segmented` do not fill `.setting-row__trail` (16rem / 100% when narrow): they size to content, same as in the DS (chosen option: faithful to the DS).
- [pending] DS `leading` prop (free header instead of `icon`) when a screen needs it.
- [done] Settings screen (`data-layout="settings"`) with `SettingRow` in `Card` and `SaveBar`. (SPEC 68)

## SPEC 37 — WeekStrip (2026-10-24)

- [done] The DS gives no accessible name to each `DayPill` in the strip (chosen option: `WeekStrip` derives it from `iso` with `Intl` `es-ES` in UTC, «Jueves 22 de octubre, hoy, con eventos»).
- [done] The DS exposes `selected` + `onSelect` (chosen option: `model()` with `[(selected)]`, like `done` in TaskItem).
- [pending] Compute the seven days (Monday to Sunday) of the visible week and navigate between weeks on the mobile `WeekStrip` + `DayView` screen.
- [done] Arrow-key navigation between pills (roving tabindex); the DS does not define it (SPEC 49: ←/→ and Home/End move focus without selecting).

## SPEC 38 — MiniCalendar (2026-10-24)

- [done] The DS puts `role="grid"` on the grid with `columnheader` children and buttons without `row`/`gridcell`, invalid ARIA (chosen option: `role="group"` with `aria-label` = month, DOW headers `aria-hidden`; each day carries its full date).
- [done] The DS sets the visible month only on mount (chosen option: `linkedSignal` following `selected`; clicking a day from another month jumps the grid to that month).
- [done] The DS exposes `selected` + `defaultSelected` + `onSelect` (chosen option: `model()` with `[(selected)]`; with no selection `today` is marked, like the DS).
- [question] Default `today` is the local date at render time: in prerender it stays at the build date until hydration (chosen option: same as the DS; screens must pass `today`). (SPEC 72)
- [done] The DS `calendar.css` puts `min-block-size: var(--touch-target)` on `.calendar__day` without `pointer: coarse` and has a badly indented `outline-offset` (SPEC 51: touch target only with `pointer: coarse`; indentation fixed).
- [done] Arrow-key navigation between days (roving tabindex) and `aria-live` on the title when the month changes; the DS does not define it (SPEC 49: arrows ±1/±7 days skipping disabled ones and changing month; title `aria-live="polite"`).
- [pending] Visible-month-change output (e.g. to load the month's events) when a screen needs it.
- [done] Playwright visual check of `/demo#mini-calendar`: grid, visible focus, arrows and month change correct, console without errors (SPEC 49).

## SPEC 39 — SidebarNav (2026-10-24)

- [done] The DS puts `title` on the `rail` buttons (native tooltip besides `aria-label`) (chosen option: faithful to the DS).
- [done] In `panel`, the counter entered the accessible name without saying what it counts (DS sync 2026-10-27: `countLabel()` + `badgeLabel`, «Tareas, 5 pendientes»).
- [done] The DS `sidebar-nav.css` enlarges the touch area with `::after` without a `pointer: coarse` condition and has a badly indented `outline-offset` (SPEC 51: `::after` only with `pointer: coarse`; indentation fixed).
- [done] Items as router links (`routerLink` + `aria-current` for the active route) once the NavigationMap routes arrive. (SPEC 56: `App.navigate()` per destination; active by route)
- [done] Playwright visual check of `/demo#sidebar-nav`: the MCP browser was busy with another session (verified via SSR: 14 items, «Seleccionado: Calendario») (SPEC 51: done).

## SPEC 40 — BottomNav (2026-10-24)

- [done] `TODO.md` cites Badge, but the DS paints the counter with its own `span.bottom-nav__badge` (chosen option: faithful to the DS; `badge: 0` is not shown).
- [done] The counter entered the accessible name without saying what it counts (DS sync 2026-10-27: «Tareas, 5 pendientes»).
- [done] The DS `bottom-nav.css` declares `outline-offset` twice in `:focus-visible` (the negative one wins, ring inward, as the README says) (SPEC 51: a single `outline-offset`, the negative one).
- [done] Items as router links and bar in `.l-screen__bottom` once the layout and routes arrive. (SPEC 56: route navigation in `.l-shell__bottom`)
- [done] Playwright visual check of `/demo#bottom-nav`: three bars, counter 5, active and forced states correct, console without errors.
- [done] `src/app/shared/sidebar-nav/sidebar-nav.spec.ts` (SPEC 39) does not pass `prettier --check` (SPEC 51: already formatted in `src/app/shared/components/sidebar-nav/`; `prettier --check` clean).

## SPEC 41 — AppBar (2026-10-24)

- [done] The DS exposes `title` and `onBack` (chosen option: `heading`, like `Card`, and `back` input + `backClicked` output, chosen by the user).
- [done] The AppBar renders an `h1`; in `/demo` three `h1` coexist on the page (chosen option: faithful to the DS; real screens will have a single AppBar).
- [pending] Place the AppBar in `.l-screen__top` and wire «Volver» to navigation once the layout and routes arrive.
- [done] Playwright visual check of `/demo#app-bar`: three bars, truncated title, back and actions correct, console without errors.

## SPEC 42 — Dialog (2026-10-24)

- [done] `.dialog__body` uses `.l-stack`, which did not exist yet (chosen option: copy the DS `composition/stack.css` in this spec; the 13 `.l-stack` already present in `/demo` become a flex column with gap).
- [done] `contained` cannot use `showModal()` (top layer) (chosen option: non-modal `show()`; no inert background, Escape handled by the component).
- [done] With `show()`/`showModal()` the browser focuses the first focusable element; if the body has no controls it is the «Cerrar» button. A `contained` sheet open on load can steal focus (chosen option: native behavior).
- [done] Escape inside an open `Menu` in the dialog also closes the dialog (SPEC 48: `Menu` stops Escape propagation; only the menu closes).
- [done] Lock document scroll while a modal dialog is open (SPEC 48: `html:has(.scrim:modal)`).
- [done] Close when clicking the scrim (SPEC 48: click with `target === currentTarget`; no `closedby="any"` because of Safari).
- [done] Playwright visual check of `/demo#dialog`: static, contained sheet, modal/sheet/full screen, focus on «Título», Escape closes and returns focus, console without errors.

## SPEC 43 — SaveBar (2026-10-24)

- [done] `position: sticky` is bounded by the parent box and the `app-save-bar` host would limit it (chosen option: host with `display: contents` and an inner `div.save-bar`; literal DS CSS and no render when there is no state).
- [question] The save button while loading announces «Cargando» (`Button`'s default `loadingLabel`); «Guardando» would be more accurate (chosen option: faithful to the DS, which does not change it). (SPEC 70)
- [done] Hide «Cambios guardados» after a while (SPEC 50: `savedTimeout` input, 1800 ms by default, `0` disables it; the demo no longer uses `setTimeout` to turn it off).
- [suggestion] Warn when leaving the screen with unsaved changes (route guard or `beforeunload`). (SPEC 72)
- [done] Playwright check of `/demo#save-bar`: host `display: contents`, bar `sticky` at `--space-s` from the bottom edge inside a scrolling container.

## SPEC 44 — DayView (2026-10-24)

- [done] `TODO.md` cites `AvatarGroup` as a dependency, but the DS DayView shows «N asistentes» with the `group` icon (chosen option: faithful to the DS, no `AvatarGroup`; `people` is only counted).
- [done] The DS does not announce event state to screen readers (chosen option: `aria-pressed` and hidden text «Cancelado.», like `EventCard`).
- [done] `now` after `endHour` draws the line outside the track (chosen option: like the DS; `overflow: hidden` clips it).
- [done] The DS `day-view.css` has `outline-offset` with broken indentation in `.day-view__slot:focus-visible` (duplicated) and `.day-view__event:focus-visible` (SPEC 51: `__slot` with a single `outline-offset`; `__event` reindented).
- [done] In 1 h events with location and attendees, the attendees line is clipped by the height (e.g. «Revisión de diseño»); same in the DS. (DS sync 2026-10-27)
- [pending] Compute `heading`, `today` and (live) `now` from the date in the DayPage screen (heading/today done in SPEC 62; live `now`: SPEC 72).
- [done] Playwright check of `/demo#day-view`: lanes, compact, selected, cancelled, now line and past match the DS preview.
- [done] Ask the DS to remove the `border-inline-start` stripe from `.day-view__event` (removed locally at the user's request) to return to a literal copy. (DS sync 2026-10-27)
- [done] Ask the DS for top margin on `.day-view__body`: the first hour («08:00», `translateY(-0.5em)`) overlaps the header border (locally: `padding-block-start: var(--space-2xs)`). (DS sync 2026-10-27)
- [done] DayView now shows 0–24 with scroll and opens at 08:00 (user request; the DS has no scroll). In SSR/prerender the initial scroll does not exist: it shows from 00:00 until hydration (chosen option: `afterNextRender`; future alternative, CSS `scroll-snap`/anchor).
- [done] When opening «hoy», scroll to `now` instead of a fixed hour.
- [done] Initial scroll to `now` (one hour earlier, for context); without `now` it stays at `scrollToHour`.

## SPEC 45 — WeekView (2026-10-24)

- [done] The DS puts `role="grid"` with `columnheader`/`gridcell` without rows, invalid ARIA (chosen option: host `role="region"`, columns `role="group"` with «dow num», no roles in the header).
- [done] With scroll, the scrollbar misaligns header and columns (chosen option: `scrollbar-gutter: stable` on the header with `overflow: hidden` and on the body; divergence from the DS).
- [done] The DS `week-view.css` has `outline-offset` with broken indentation in `.week-view__event:focus-visible` (SPEC 51: already reindented in `fd8bd5a`).
- [done] Overlapping events on the same day stack on top of each other: the DS does not split lanes in week view (chosen option: faithful to the DS).
- [done] Reuse `DayView`'s `dayLanes` to split overlaps in WeekView. (DS sync 2026-10-27)
- [done] All-day events chip above the grid (recommended by the DS README, without markup). (SPEC 45: «Todo el día» row)
- [done] Ask the DS for the 0–24 range with scroll in WeekView/DayView to return to a literal copy. (DS sync 2026-10-27)
- [pending] Compute `days`, (live) `now` and week navigation in the WeekPage screen (days and navigation done in SPEC 63; live `now`: SPEC 72).
- [done] Playwright check of `/demo#week-view`: columns aligned with the header, today highlighted, now line on Thursday, initial scroll to 12:00 (now 13:10), console without errors.
- [done] Lanes for overlaps in WeekView reusing `dayLanes` (exported and generic from `day-view.ts`).
- [done] «Todo el día» row in WeekView with an `app-badge` per category under the header.
- [question] In the «Todo el día» row a long title is clipped by the cell (chosen option: `overflow: hidden`; alternative: ellipsis or `title` with the full text). (SPEC 70)
- [done] With lanes, in week columns (~7.5 rem) each event is very narrow and time and title get cut (chosen option: as in DayView, no compact mode).
- [done] Ask the DS for the «Todo el día» markup/CSS in WeekView to return to a literal copy. (DS sync 2026-10-27)

## SPEC 51 — Cleanup of CSS copied from the DS (2026-10-25)

- [done] Ask the DS for the fixes made locally to return to a literal copy: touch target only with `@media (pointer: coarse)` in `check.css`, `calendar.css` and `sidebar-nav.css`; a single `outline-offset` in `setting-row.css`, `bottom-nav.css` and `day-view.css`; `outline-offset` indentation in `calendar.css`, `sidebar-nav.css`, `day-view.css` and `week-view.css`. (DS sync 2026-10-27)

## SPEC 52 — MonthView (2026-10-25)

- [done] After moving focus with arrows to a day of another month and changing `year`/`month`, the tab stop stays on that day if it is still in the grid, instead of returning to `selected`/`today`/day 1 (chosen option: keep the focused day; R11 allows it).
- [done] At narrow width (~480 px) chips show only the dot and one or two characters (chosen option: faithful to the DS, ellipsis).
- [done] Below 40rem show only the category dots instead of text chips, like mobile calendar apps. (DS sync 2026-10-27)
- [done] Ask the DS for the abbreviated header (`__dow-long`/`__dow-short`) and `[data-force]` on `.month-view__chip` to return to a literal copy; and `outline-offset` indentation in `month-view.css`. (DS sync 2026-10-27)
- [pending] Month navigation, «+N más» popover and live `today` in the month screen (navigation done in SPEC 64; «+N más» opens the day instead of a popover; live `today`: SPEC 72).
- [done] Playwright check of `/demo#month-view`: 7×6 grid from Monday 28, today 22 and selected 27, «+2 más», cancelled struck through, «lun…dom» header at 560 px without horizontal scroll, down arrow moves focus and month change; console without errors.

## SPEC 53 — EventForm (2026-10-25)

- [done] The DS defines no `.form` block (chosen option: `form` class only as a hook on the `<form>`, like the DS; layout with `.l-stack`/`.l-form-grid`).
- [done] DS errors only after saving, not on blur (chosen option: own `submitted` instead of `fieldError()`, which shows with `touched`).
- [done] Map the category (name) to `Category`/`Tint` in a single place when the screen saves events. (`EVENT_CATEGORY_COLORS`/`TASK_LIST_COLORS` in `features/agenda/agenda-forms.ts`)
- [suggestion] Guests as chips or a validated email list instead of free text.
- [done] Mount EventForm in the WeekPage panel and in a mobile `Dialog`; reset after saving by passing a new `defaultValues`. (SPEC 60/62: `AgendaDialogs` with EventForm in Dialog; reset with a new `defaultValues`)
- [done] Playwright check of `/demo#event-form`: title and date errors when saving empty, fixed while typing, «Todo el día» hides the times, `saved` emits, «Editar cita» shows the end error; console without errors.

## SPEC 54 — TaskForm (2026-10-25)

- [done] The DS leaves «Agregar subtarea» without a label (chosen option: `TextField` with `hideLabel`, label «Agregar subtarea» with `u-visually-hidden`).
- [question] Enter in «Agregar subtarea» submits the whole form, like the DS (chosen option: faithful to the DS). (SPEC 70)
- [suggestion] Enter in «Agregar subtarea» adds the subtask instead of saving the task. (SPEC 70)
- [done] The DS `tag-button.css` enlarges the touch area unconditionally (chosen option: `::after` `inset-block` inside `@media (pointer: coarse)`, SPEC 51 criterion; `outline-offset` reindented).
- [done] Ask the DS for those two changes in `tag-button.css` to return to a literal copy. (DS sync 2026-10-27)
- [done] Signal Forms adds tracking `Symbol` keys to the `subtasks` objects; `saved` emits them (chosen option: leave them, they are not enumerable by `JSON.stringify` or `Object.keys`).
- [done] `TaskItem` subtasks show a chevron, like the DS, even though they do not navigate in the form (chosen option: faithful to the DS).
- [suggestion] Remove or edit existing subtasks (the DS does not have it). (SPEC 70)
- [done] Mount TaskForm in the tasks screen and in a mobile `Dialog`; map `list` to a color. (SPEC 67: detail in the `/tareas` panel; `list` to color with `TASK_LIST_COLORS`)
- [done] Playwright check of `/demo#task-form`: error when saving empty, tag toggles `aria-pressed`, subtask added, `saved`/`deleted` emit; console without errors. In a first run, right after loading, «Pagar derechos» appeared unchecked and focused; it did not reproduce in 4 attempts (possible hydration race in the test).

## SPEC 66 — MonthView selected day (2026-10-27)

- [done] Ask the DS for MonthView's selected day number to use `--color-brand` / `--color-on-brand` (or a higher-contrast `--color-brand-soft`: today ≈ `--color-surface-sunken`) to return to a literal copy of `month-view.css`. (DS sync 2026-10-27)
- [done] Playwright check of `/demo#month-view`: selected number brand/on-brand, also when it is today and out of month; hover keeps it; brand-soft cell; console without errors.

## SPEC 67 — Tareas (2026-10-27)

- [question] The DS shows «Cancelar» in the detail (deselects); the local TaskForm does not have it (chosen option: no cancel or deselect). (SPEC 71)
- [question] Filter kept in state, lost on reload (chosen option: like the DS). (SPEC 71)
- [done] «N pendientes · M vencen hoy» only with loaded data; in SSR/loading it is not painted to avoid showing «0 pendientes» (chosen option: hide until `ready`).
- [done] With `status = 'error'` the panel stays empty (the Alert goes in the main area), instead of the skeleton (R21 adjusted during implementation).
- [done] Checking a task with its detail open resets unsaved changes in the TaskForm (new `defaultValues`), same as in `AgendaDialogs`.
- [done] Ask the DS for `data-align='end'` in `cluster.css` to return to a literal copy. (DS sync 2026-10-27)
- [done] Pluralize «1 pendientes» / «1 vencen hoy» (the DS does not). (DS sync 2026-10-27)
- [pending] Delete tasks from the detail (`deletable` in TaskForm + `deleteTask` in the repository). (SPEC 71)
- [pending] Working quick add in Inicio reusing `AgendaCommands.createTask`. (SPEC 71)
- [done] Playwright check of `/tareas` at 1440 px: groups Vencidas (danger badge, «20 oct»), Hoy, Próximas, Completadas; filters; empty with «Ver todas»; Enter adds to Hoy, clears the field and opens the detail; checking updates «N pendientes» and «X de Y completadas»; saving the detail changes the title, keeps the selection and persists on reload; corrupt JSON shows an Alert with «Reintentar»; «Tareas» rail item active; grid `rail main panel`; console without hydration errors.

## SPEC 68 — Configuración (2026-10-27)

- [done] One draft shared by all sections: switching section keeps unsaved changes (chosen option: keep them; the DS discards them when switching section).
- [done] `saved` turns on when `save()` finishes, without the DS's simulated 900 ms delay (chosen option: no delay; the button shows `loading` meanwhile).
- [question] TimeField has no `ariaLabel`/`hideLabel`: «Inicio» and «Fin» with visible labels in «Horario laboral» (chosen option: visible labels, without touching shared). (SPEC 70)
- [done] In `wide` rows the selects do not take the trail's `--size-control` width, only their content's (chosen option: as it comes out of `setting-row.css` + `select.css`).
- [done] Fixed DS email, not editable or persisted (chosen option: `SETTINGS_EMAIL` constant).
- [done] Tests for the five sections in a single `components/settings-sections.spec.ts` with a shared helper (chosen option: one file, instead of one per component).
- [suggestion] Add `ariaLabel`/`hideLabel` to TimeField to follow the DS («Inicio»/«Fin» only as aria-label). (SPEC 70)
- [pending] Apply the settings to the rest of the app: default Calendar view, week start, 12 h format, weekends, cancelled appointments, working hours, default duration, density, text size, reduce motion. (SPEC 73)
- [pending] Account actions with no effect: «Cambiar foto», «Quitar», «Cambiar» password, «Cerrar sesión», «Exportar», «Eliminar cuenta» (with confirmation Dialog), «Permitir en el navegador» (`Notification.requestPermission`). (SPEC 74)
- [pending] Warn about unsaved changes when leaving `/configuracion` (`canDeactivate` guard). (SPEC 72)
- [done] Playwright check of `/configuracion` at 1440 px: redirects to `/perfil`; menu with active section and navigation; toggling a Switch shows the SaveBar; saving shows «Cambios guardados» and persists on reload; corrupt JSON shows an Alert and «Reintentar» recovers; console without errors or warnings.

## DS sync (2026-10-27)

- [done] The DS MonthView brings its own header (`heading`, arrows, `onNavigate`); locally the screen provides it (chosen option: component without header, only `.month-view__grid` + `.month-view__chips`).
- [question] The DS adds «, N eventos» to the accessible name of the day number in MonthView (chosen option: not applied). (SPEC 70)
- [done] `--visible-hours` becomes `--visible` in DayView/WeekView, like the DS.

## SPEC 70 — Component fixes (2026-10-27)

- [done] `app-task-item` does not grow inside `l-cluster` (chosen option: local block `task-form.css` with `.task-form__subtask` as a `minmax(0, 1fr) auto auto` grid; the DS does not remove or edit subtasks). SPEC 81 removes the wrapper and `task-form.css`: the X goes inside the TaskItem, which takes the field's width without a grid.
- [question] When finishing a subtask edit with Enter or Escape, focus returns to its «Editar» button; on blur it does not move (chosen option: this way, to avoid losing focus when the field leaves the DOM).
- [suggestion] Ask the DS for the rule `.week-view__allday-cell .badge > span { overflow: hidden; text-overflow: ellipsis; }`: on `.badge` (`inline-flex`) the DS ellipsis does not work. Today it is a local divergence in `week-view.css`.
- [done] The subtask TaskItem shows the «Abrir detalle» chevron with no action; consider `disabled` or hiding it in TaskForm. (SPEC 81: `action="remove"`, the chevron becomes «Quitar subtarea»)
- [done] Playwright at 1440 px: `/demo#week-view` long title with ellipsis and `title`; `/demo#task-form` Enter with a real keyboard adds and clears without submitting, edit with focus on the field and back to the button, remove; `/configuracion/calendario` «Inicio»/«Fin» hidden and associated with the input; console without errors or warnings.

## SPEC 75 — Mobile screens (2026-10-27)

- [question] The DS puts the «Agregar nueva tarea» field above the filter in mobile Tareas (chosen option: filter on top, desktop DOM order; no `order`, to avoid separating visual and tab order).
- [question] DS mobile Tareas Card «Avance de la semana» with one Progress per list (chosen option: the panel's «Progreso» Card, with all tasks).
- [question] Hoy AppBar when the day is not today (chosen option: heading with the date, no subtitle; «Hoy» only if it is today).
- [done] Local divergence `blocks/shell-screen.css`: `.l-screen` page at fixed height below 48rem (`:has()` on `.l-shell__grid`), mobile padding of `main` and Fab at `--space-s` from the edge because the BottomNav lives in `App`, outside the `.l-screen`.
- [done] Playwright at 390 px: Hoy (AppBar, WeekStrip with dots, DayView, Fab), Mes (AppBar with arrows, MiniCalendar in Card, the day's AgendaItem), Tareas (AppBar «N pendientes», filter, field, flat list, Progreso); no document scroll; Fab 1rem above the BottomNav; Fab opens «Nueva cita» as a sheet; tapping a task opens «Detalle de la tarea» full and closing removes it. At 1440 px: Tareas and Día as before, «Nueva cita» centered; console without errors.
- [done] Pending badge on «Tareas» in the BottomNav (the DS shows 5): `App` has no agenda data. (SPEC 84: root `AgendaStore`/`AgendaCommands`; badge in BottomNav and rail)
- [pending] «Buscar» and «Citas canceladas» in the Hoy AppBar (DS): no search or cancelled filter (SPEC 73).
- [pending] Mobile Inicio and Semana: still use the desktop layout stacked below 48rem; Hoy's «Vista» menu leads to Semana.
- [suggestion] Full `npx ng test --watch=false` gives random timeouts (5000 ms) when the machine is loaded, also on `master`; consider a higher `testTimeout` or fewer workers.

## SPEC 76 — Mobile overview (2026-10-27)

- [question] The DS paints a free day as a Card without heading replacing «Próxima cita» and «Agenda de hoy» (chosen option: EmptyState «Hoy no tienes citas» with «Nueva cita» inside «Agenda de hoy»; «Próxima cita» still shows the next one even if it is another day).
- [question] Mobile order of «Avance de la semana» and the conflict, which the DS does not fix next to «Tareas que vencen» (chosen option: after «Agenda de hoy», the conflict at the end).
- [question] Mobile StatCards duplicated in the DOM with the DS short labels («Citas», «Hechas», «De 8 h») (chosen option: second grid `u-mobile-only` with `data-cols="2"`; the desktop one stays `u-desktop-only`).
- [done] Playwright at 390 px: Hoy's «Resumen» IconButton opens `/resumen`; AppBar with the day and «Volver a Hoy» arrow returning to `/calendario/dia`; StatCards in 2 columns; Próxima cita, Tareas que vencen, Agenda de hoy and Avance; no document scroll; «Hoy» active in the BottomNav. At 1440 px as before; console without errors.
- [pending] Check the free day and mobile skeleton in Playwright (no appointments today in the seed data; localStorage loading is instant).

## SPEC 77 — Mobile settings (2026-10-27)

- [question] Profile row in the list with an Avatar in the DS (chosen option: `person_outline` icon, without touching SettingRow; user's answer).
- [question] The DS discards changes when going back from Perfil to the list (chosen option: the draft is kept, as when switching section in SPEC 68; the SaveBar is not visible in the list).
- [question] «Notificaciones» in the list: the DS fixes «Activas» (chosen option: «Activas» if browser, email or mobile is enabled; otherwise «Desactivadas»).
- [question] The SaveBar sits in its own `div.settings-page__body`, so `position: sticky` does not anchor it to the edge of `.l-screen__main` and it ends up after the content (chosen option: like the DS, which also wraps it).
- [done] Playwright at 390 px: `/configuracion` with AppBar «Ajustes» and three Cards; the profile row opens `/configuracion/perfil` with AppBar «Perfil» and «Volver a Ajustes»; editing shows the SaveBar; only `.l-screen__main` scrolls; going back keeps the edited name in the list; «Ajustes» active in the BottomNav. At 1440 px `/configuracion` shows Perfil as before; console without errors or warnings.
- [pending] «Ayuda y contacto» and «Cerrar sesión» disabled in the mobile list (no destination; SPEC 74).
- [suggestion] `leading` slot in SettingRow to put an Avatar in the profile row, like the DS.

## SPEC 71 — Delete tasks, quick add and appointment actions (2026-10-27)

- [question] Focus after deleting: the control that requested it disappears (chosen option: first visible `h1`/`h2` outside Dialogs with `tabindex="-1"`).
- [question] Layout of the menu next to the appointment (chosen option: local block `.event-actions`, grid `1fr auto`, instead of `l-cluster data-nowrap`).
- [pending] «Editar»/«Eliminar» menu in the mobile AgendaItem list of `/calendario/mes` (`month-main`) and in DayView/WeekView/MonthView.
- [suggestion] «Cancelar» (`cancelable`) also in the «Detalle de tarea» Dialog of Inicio, Resumen and Calendario, like the DS `onCancel`.
- [suggestion] Delete error copy («No se pudo eliminar. Inténtalo de nuevo.») without a DS card: confirm with design.

## SPEC 72 — Live clock and unsaved-changes warning (2026-10-27)

- [question] Calendario without `?fecha=`: `day` comes from `today()`, so at midnight it moves to the new day by itself (chosen option: follow the clock; without a date in the URL the screen means «hoy». Inicio does keep its `selectedDay`).
- [question] Browser «back» button cancelled by the guard: Angular restores the URL with the default `canceledNavigationResolution` (chosen option: default router behavior).
- [done] Playwright at 1440 px: `/calendario/dia` with `page.clock` +5 min, «Ahora 10:30» becomes «Ahora 10:35» and the line moves down; `/configuracion/apariencia` with changes, the «Calendario» rail item opens the Dialog; «Seguir editando» stays with the SaveBar; «Descartar» navigates without saving; switching to «Perfil» does not open the Dialog; «Guardar y salir» saves and navigates; reloading with changes fires `beforeunload`; console without errors or warnings.
- [done] `TasksFacade.today` (Tareas) stays fixed when the screen is created: «Hoy»/«Vencidas» groups do not change at midnight. (SPEC 84: `computed` from `Clock`)
- [done] Align the `Clock` tick to the minute change (first `setTimeout` until second 0) so the now line is not up to 59 s late. (SPEC 84)

## SPEC 73 — Apply settings (2026-10-27)

- [pending] «Mostrar citas canceladas» has no effect: `CalendarEvent` has no `cancelled` field nor a «Cancelar cita» action; a field, action and seed data (new key) are needed before filtering.
- [done] «Horario laboral · Fin» has no effect (only «Inicio» sets the DayView/WeekView scroll). (SPEC 84: DayView/WeekView shade outside working hours; Settings validates End > Start)
- [question] The default duration also applies when clicking a slot (previously a fixed 1 h with `slotEnd`) (chosen option: yes, R6; `slotEnd` remains in the facades but its end is overwritten in `AgendaDialogs.openNewEvent`).
- [question] `/calendario` becomes `RenderMode.Client` so the redirect can read `localStorage` (chosen option: client; the server would always redirect to Semana).
- [done] `utilities/reduced-motion.css` (DS copy) targets `.app`, which does not exist locally: `prefers-reduced-motion` removes no animations except in Spinner. Apply it to `:root` like `data-reduce-motion` or ask the DS for the selector. (SPEC 84: `:root`)
- [suggestion] With Compacta/Grande saved there is a visual jump on hydration (SSR paints with defaults); consider a cookie or an inline script in `index.html`.
- [done] Remove `slotEnd` from `CalendarDayFacade.openSlot`/`CalendarWeekFacade.openSlot` if nobody else uses it (`AgendaDialogs` already sets the end). (SPEC 84: also deleted from `shared/utils/time.ts`)
- [done] Playwright (SSR build): with saved settings `/calendario` goes to Mes; `<html>` with `data-density="compact"`, `data-text-size="large"` (root 18px), `data-reduce-motion` (0 elements with transition/animation); Semana outside today opens at 06:00; slot 10:00 opens «Nueva cita» 10:00–10:45. Without reloading: saving «Día» and clicking the «Calendario» rail item goes to `/calendario/dia`; saving Cómoda/Normal removes the attributes. Console without errors or warnings.

## SPEC 74 — Account actions (2026-10-27)

- [question] `profile.photo` optional in the spec (chosen option: `photo: string` with `''` by default; Signal Forms needs the key and merging with defaults adds it to old settings).
- [question] Alert tone for permission denied and unsupported, which the spec does not fix (chosen option: `warning` and `info`).
- [question] Export reads the raw DTOs from `LocalStorageApi` in the settings facade (chosen option: relative import from `features/agenda/structure`; if keys are missing, it seeds like the rest of the app).
- [done] Playwright (SSR build, 1440 px): PNG photo is saved and persists after reload; GIF shows the Alert; «Quitar» goes back to initials; «Exportar» downloads `agenda-export-2026-10-27.json` with `events`, `tasks`, `settings`, `exportedAt`; «¿Eliminar tu cuenta?» Dialog cancelled does not delete, confirmed goes to `/inicio` with the seed (6 tasks); «Cambiar» and «Cerrar sesión» warn in their Card. At 390 px the list's «Cerrar sesión» warns. Console without errors or warnings.
- [pending] Test «Permitir en el navegador» with a real granted/denied permission in a browser (only covered by tests with a mocked `Notification`).
- [pending] The mobile profile row Avatar and the SidebarNav one do not use the photo (SettingRow without `leading` slot; SidebarNav `user` without `src`).
- [suggestion] Large photo near the localStorage limit: consider resizing with `<canvas>` before saving.

## SPEC 78 — Week start, 12 h and weekends (2026-10-27)

- [question] Shape of `firstDay` in the components (chosen option: `0 | 1` like `Intl.Locale.weekInfo`; the store translates «Lunes»/«Domingo»).
- [question] WeekView without a weekends input (chosen option: the facade passes 5 `days` and the host sets `data-weekdays-only` when `days().length === 5`).
- [question] Semana title with hidden weekends (chosen option: follows the full week, e.g. «18 – 24 de octubre»; «Semana N» is the ISO week of the shown Wednesday/Thursday).
- [question] MonthView without weekends and day 1 on Saturday/Sunday: the first row can be entirely out of month (chosen option: keep the 6-week grid).
- [done] Playwright (SSR build, 1440 px): save Domingo, 12 h and no weekends; `/calendario/semana` with 5 columns Mon–Fri, times «10:00 PM», appointments «5:00 PM – 6:00 PM», MiniCalendar from «D»; `/calendario/mes` 5 columns and 30 cells; `/inicio` and `/resumen` with 12 h times; at 390 px the `/calendario/dia` WeekStrip starts on Sunday. Console without errors or warnings.
- [done] Inicio's «Esta semana»/«Próxima» ranges, Resumen's «Avance de la semana» and `weekTasks` stay Monday–Sunday even when «Inicio de semana» is Domingo. (SPEC 84: `weekProgress` with `firstDay`; `weekTasks` already honored it)
- [pending] TimeField/EventForm: native `input type="time"` follows the browser, not «Formato de hora».
- [suggestion] Ask the DS for configurable columns (`--days`) in `week-view.css`/`month-view.css` to remove `exceptions/weekdays-only.css`.
- [suggestion] «AM»/«PM» copy (chosen by the user) vs es-ES «a. m.»/«p. m.»: confirm with design.
- [pending] Eyeball the new `/demo` controls (only in `npm start`; covered by build, not by Playwright).

## SPEC 81 — Remove subtask inside TaskItem (2026-10-28)

- [question] Divergence from the DS: the DS does not remove subtasks; `app-task-item` gains `action: 'open' | 'remove'` and in `'remove'` the `.task-item__open` button shows `close` with «Quitar subtarea: <título>» and the row is not interactive (chosen option: same style and brand hover, no danger).
- [done] Playwright at 1440 px: `/demo#task-form` each subtask with only the X inside the row (no chevron or external X), 398 px like the field; X removes; clicking the title does nothing; checkbox checks; adding works. `/demo#task-item` `remove` example shows «Quitada: Pedir cita en tránsito» and the `open` ones still show «Abierto: <título>». Console without errors or warnings.
- [done] `/demo#task-form`: after adding with the «Añadir subtarea» button the «Agregar subtarea» input still shows the text (with Enter it does clear). Does not touch SPEC 81 code (`text-field`, `task-form.ts`); review TextField's `[value]`. (SPEC 84: does not reproduce; see its section)

## SPEC 82 — Search in the Inicio agenda (2026-10-28)

- [done] Local divergence in `blocks/home-page.css`: `app-agenda-panel .input__control::-webkit-search-cancel-button { appearance: none; }`. Chromium paints its native X on `type="search"` and duplicated «Cerrar búsqueda» (chosen option: hide it only in the panel, without touching `app-text-field`).
- [question] R10 with `linkedSignal` on the `range|selectedDay` key, not `signal` as the data model says: on load it only gives the initial value and does not reopen or clear anything.
- [question] At 390 px the field shrinks to ~121 px on the same row (the `flex: 1` from `data-grow` has a 0 basis) instead of wrapping to another line; usable, but narrow. A `min-inline-size` would need a DS value.
- [done] Playwright at 1440 px on `/inicio` («Esta semana» range): the magnifier opens a focused field + X with «Tu agenda» and «Nueva cita» visible; «REUNION» key by key leaves «Reunión de equipo» and only its group; «videollamada» (location) and «perez» (person, without accent) filter; «zzz» shows «Sin resultados» with «No hay citas que coincidan con «zzz».»; Esc and X close, clear and focus the magnifier; Enter on the magnifier opens; «Próxima» and clicking day 29 close the search; clicking the filtered «Clase de yoga» opens «Editar cita» and the search stays open. Console without errors or warnings.

## SPEC 83 — Remove demo-only forced states and static mode (2026-11-04)

- [question] The spec counts 82 occurrences of `data-force` in 22 blocks; the real grep gave 84 lines in those 22 (chosen option: remove them all). No `[data-force='focus']` stood alone: all accompanied `:focus-visible`/`:focus-within`, so none was converted.
- [done] `menu.css`: `&:not([data-static]) > .menu__panel` becomes `& > .menu__panel` (specificity 0,3,0 to 0,2,0; no other rule touches `.menu__panel`). `dialog.html` without `ng-template`: content goes directly inside `<dialog>`.
- [done] Demo: also removed `MENU_VIEW` and `DIALOG_CATEGORIES`, used only by the static samples. SettingRow «Apariencia» is left without `state`; the states BottomNav keeps «Deshabilitado».
- [done] Playwright (dev server, 1440 px): in `/demo` hover changes background/shadow and Tab paints a solid outline on button, card, setting-row, mini-calendar day, month-view chip and sidebar-nav; menu opens with an `absolute` panel under the trigger, aligned to the end, Esc closes; the `align="start"` one stuck to the edge flips and stays inside the viewport; dialog opens `:modal` and Esc closes; «Interactivo» save-bar goes through «Guardando», «Cambios guardados» and back; note «Pasa el ratón o usa Tab…» in the 9 sections of R9. `/inicio`, `/calendario/mes`, `/calendario/dia`, `/configuracion`: hover and Tab work. Console without errors or warnings (except a `SelectField` error during a hot reload mid-edit, which does not repeat on reload).
- [pending] `npx ng test --watch=false`: 1 of 6 runs gave 5 failures that did not repeat (only jsdom's `dialog.show is not a function` was seen); watch whether it comes back.
- [pending] R5 «como antes» checked as «there is hover/focus», not with before/after screenshots; the CSS only changes selectors with the same specificity.

## SPEC 84 — Pending fixes: clock, cleanup, week, badge and working hours (2026-11-04)

- [done] `Clock`: first `setTimeout` until second 0 and then a 60 s `setInterval`. Specs that fake the clock (Inicio, Resumen, Día, Semana, Mes) add `setTimeout`/`clearTimeout` to `toFake`.
- [question] Subtask (R5): does not reproduce. Tested in `/demo#task-form` and in the `/tareas` panel at 1440 px, with `fill` and real typing, Enter then button and the same text twice: the button clears the field. With only spaces it does not add and leaves the spaces (expected). Chosen option: no code change; regression test in `task-form.spec.ts` (button leaves the field empty).
- [question] Local DS divergence in `utilities/reduced-motion.css`: `.app` → `:root`. Ask the DS for the selector to return to a literal copy.
- [question] `AgendaStore`/`AgendaCommands` move to root and `AgendaRepository` to `app.config.ts`; `provideAgenda()` only provides `AgendaDialogs`. Each screen still calls `load()`: on entering, the badge disappears while status is `loading` (instant with localStorage).
- [done] «Tareas» badge in BottomNav and rail («Tareas, N pendientes»); no badge if the agenda is not `ready` or there are no pending tasks. `App` clears `saveError` on every `NavigationEnd`.
- [question] Local DS divergence in `blocks/day-view.css` and `blocks/week-view.css`: `.day-view__off`/`.week-view__off` layers with `--color-surface-sunken`, under the slots (`isolation: isolate` on track/column, `z-index: -1`). In DayView lines and hover are visible; in WeekView the hour lines (column background) are covered outside working hours and so is today's `brand-soft` (chosen option by the user: 2 of 3; option 3 repeated the gradient in the layer).
- [question] Settings «Horario laboral»: removed `data-nowrap` from the «Inicio»/«Fin» cluster; with the error, «Fin» wraps to a new line and grows to full width (~252 px) instead of shrinking «Inicio» (chosen option by the user).
- [done] The guard's «Guardar y salir» only leaves if no changes remain after saving (`!dirty()`): covers save errors and an invalid form.
- [suggestion] `OverviewFacade.stats` (week `completed`/`planned`) still uses Monday–Sunday `weekStart(today)`; align it with «Inicio de semana» if those figures are «of the week».
- [done] Playwright: badge at 1440 px («Tareas, 5 pendientes» in `/configuracion` and `/tareas`; checking with a real click drops it to 4) and at 390 px (BottomNav «5» → «4»); `/calendario/dia` and `/calendario/semana` shaded outside 08:00–18:00 and slot 07:00 opens «Nueva cita» 07:00; `/demo#day-view`/`#week-view` with the working-hours example; `/configuracion/calendario` End 07:00 shows the error and does not save; slot 10:00 in Día and Semana opens «Nueva cita» 10:00–10:30; `/demo` with `reducedMotion: 'reduce'` goes from 926 to 0 elements with transition (only the 12 Spinners keep spinning, as with `data-reduce-motion`). Console without errors or warnings.
- [pending] Full `npx ng test --watch=false`: some runs give isolated failures that pass on retry (timeouts with the machine loaded, as in SPEC 76/83).
