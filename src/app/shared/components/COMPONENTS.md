# Shared components

Reference for every reusable component in `src/app/shared/components/`. Read it before using or creating a component; update it whenever a spec adds or changes one (inputs, outputs, slots, CSS block).

Live showcase: `/demo` (`src/app/demo/demo-page.html`, dev only).

## Conventions

- Standalone components, selector prefix `app-`. Import from `@shared/components/<dir>/<file>` (e.g. `import { Button } from '@shared/components/button/button';`).
- Signal APIs: `input()`, `model()` (two-way, `[(x)]`), `output()`. Boolean inputs marked _(bool attr)_ use `booleanAttribute`, so a bare attribute works (`<app-button disabled>`).
- Titles are `heading`, never `title` (avoids the native tooltip on the host).
- Types come from `@shared/types` (`Size`, `Tone`, `Category`, `Tint`, `TimeFormat`, item types…) and `@shared/interfaces` (event/day models, form values, options).
  - `Size` = `'s' | 'm' | 'l' | 'xl'`
  - `Category` = `'orange' | 'violet' | 'red' | 'blue' | 'green' | 'mustard' | 'cyan'`
  - `Tint` = `'periwinkle' | 'cream' | 'rose' | 'mint' | 'sky' | 'lilac' | 'lime'`
  - `TimeFormat` = `'24 h' | '12 h'`
- Styles are global block CSS in `src/styles/blocks/<block>.css` (no `styleUrl`). Variants go through `data-*` attributes (`data-variant`, `data-size`, `data-tone`…).
- Dates are ISO `YYYY-MM-DD`, times `HH:MM` 24 h. Default copy is Spanish.
- Content-projection slots use marker directives (e.g. `cardActions`) exported from the same file as the component; add the directive to `imports` too.
- Form fields implement `FormValueControl` (value) or `FormCheckboxControl` (checked) from `@angular/forms/signals`: bind with `[formField]="form.x"`, or use `[(value)]` / `[(checked)]` standalone. Each generates its own `id` (`app-<field>-N`); don't put a static `id` on the host.
- Icon names are Material Icons Outlined ligatures (`add`, `event`, `more_horiz`…).

## Index

| Level     | Components                                                                                                                                                                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Atoms     | [Icon](#icon), [Spinner](#spinner), [Badge](#badge), [Avatar](#avatar), [AvatarGroup](#avatargroup), [Progress](#progress), [Skeleton](#skeleton), [SkeletonList](#skeletonlist)                                                                                                           |
| Controls  | [Button](#button), [ButtonLink](#buttonlink), [IconButton](#iconbutton), [Checkbox](#checkbox), [Switch](#switch), [SegmentedControl](#segmentedcontrol)                                                                                                                                   |
| Fields    | [TextField](#textfield), [TextareaField](#textareafield), [SelectField](#selectfield), [DateField](#datefield), [TimeField](#timefield), [NumberField](#numberfield)                                                                                                                       |
| Molecules | [Card](#card), [Alert](#alert), [EmptyState](#emptystate), [Breadcrumb](#breadcrumb), [Fab](#fab), [Menu](#menu), [DayPill](#daypill), [AgendaItem](#agendaitem), [TaskItem](#taskitem), [EventCard](#eventcard), [StatCard](#statcard), [SettingRow](#settingrow)                         |
| Organisms | [WeekStrip](#weekstrip), [MiniCalendar](#minicalendar), [SidebarNav](#sidebarnav), [BottomNav](#bottomnav), [AppBar](#appbar), [Dialog](#dialog), [SaveBar](#savebar), [DayView](#dayview), [WeekView](#weekview), [MonthView](#monthview), [EventForm](#eventform), [TaskForm](#taskform) |
| Pages     | [PlaceholderPage](#placeholderpage)                                                                                                                                                                                                                                                        |

---

## Atoms

### Icon

`<app-icon>` · `Icon` · `icon/icon` · CSS `icon.css`

Material Icons Outlined glyph. Decorative (`aria-hidden`) unless `label` is set.

| Input    | Type     | Default    |
| -------- | -------- | ---------- |
| `name`   | `string` | _required_ |
| `size`   | `Size`   | `'m'`      |
| `filled` | `bool`   | `false`    |
| `label`  | `string` | —          |

```html
<app-icon name="event" size="s" /> <app-icon name="warning" label="Atención" />
```

### Spinner

`<app-spinner>` · `Spinner` · `spinner/spinner` · CSS `spinner.css`

Indeterminate loader with `role="status"`.

| Input   | Type                  | Default      |
| ------- | --------------------- | ------------ |
| `size`  | `Exclude<Size, 'xl'>` | `'m'`        |
| `label` | `string`              | `'Cargando'` |

```html
<app-spinner size="s" label="Guardando" />
```

### Badge

`<app-badge>` · `Badge` · `badge/badge` · CSS `badge.css` · uses Icon

Small status/label pill. Text is projected content.

| Input      | Type                      | Default     | Notes                                                           |
| ---------- | ------------------------- | ----------- | --------------------------------------------------------------- |
| `tone`     | `Exclude<Tone, 'accent'>` | `'neutral'` | `neutral brand success warning danger info inverse glass count` |
| `icon`     | `string`                  | —           | leading icon                                                    |
| `dot`      | `bool`                    | `false`     | leading dot                                                     |
| `category` | `Category`                | —           | category-colored dot                                            |
| `label`    | `string`                  | —           | `aria-label` on host (e.g. for counters)                        |

```html
<app-badge tone="success" icon="check_circle">Confirmada</app-badge>
<app-badge [category]="'blue'">Trabajo</app-badge>
<app-badge tone="count" label="3 pendientes">3</app-badge>
```

### Avatar

`<app-avatar>` · `Avatar` · `avatar/avatar` · CSS `avatar.css`

Photo or initials (tinted from the name) when `src` is missing or fails.

| Input  | Type     | Default    |
| ------ | -------- | ---------- |
| `name` | `string` | _required_ |
| `src`  | `string` | —          |
| `size` | `Size`   | `'m'`      |

```html
<app-avatar name="Laura Gómez" size="l" />
```

### AvatarGroup

`<app-avatar-group>` · `AvatarGroup` · `avatar/avatar-group` · CSS `avatar.css` · uses Avatar

Overlapping avatars with a `+N` overflow.

| Input    | Type             | Default    | Notes                      |
| -------- | ---------------- | ---------- | -------------------------- |
| `people` | `AvatarPerson[]` | _required_ | `{ name; src? }`           |
| `max`    | `number`         | `3`        | visible before `+N`        |
| `size`   | `Size`           | `'s'`      |                            |
| `onTint` | `boolean`        | `false`    | border for tinted surfaces |

```html
<app-avatar-group [people]="[{ name: 'Ana' }, { name: 'Luis' }]" />
```

### Progress

`<app-progress>` · `Progress` · `progress/progress` · CSS `progress.css`

Determinate progress bar (0–100) with optional heading and value label.

| Input       | Type                               | Default    |
| ----------- | ---------------------------------- | ---------- |
| `value`     | `number`                           | _required_ |
| `heading`   | `string`                           | —          |
| `label`     | `string`                           | —          |
| `tone`      | `'brand' \| 'success' \| 'accent'` | —          |
| `showLabel` | `boolean`                          | `true`     |

```html
<app-progress heading="Tareas de hoy" [value]="60" tone="success" />
```

### Skeleton

`<app-skeleton>` · `Skeleton` · `skeleton/skeleton` · CSS `skeleton.css`

Single placeholder shape while loading.

| Input    | Type                  | Default       |
| -------- | --------------------- | ------------- |
| `width`  | `string` (CSS length) | —             |
| `height` | `string` (CSS length) | —             |
| `shape`  | `'circle' \| 'block'` | — (text line) |

```html
<app-skeleton width="60%" /> <app-skeleton shape="circle" width="2.5rem" height="2.5rem" />
```

### SkeletonList

`<app-skeleton-list>` · `SkeletonList` · `skeleton/skeleton-list` · CSS `skeleton.css` · uses Skeleton

Preset list of skeleton rows mimicking agenda/task/card lists, with `role="status"`.

| Input     | Type                           | Default    |
| --------- | ------------------------------ | ---------- |
| `variant` | `'agenda' \| 'task' \| 'card'` | `'agenda'` |
| `rows`    | `number` (integer ≥ 1)         | `4`        |
| `label`   | `string`                       | —          |

```html
<app-skeleton-list variant="task" [rows]="3" label="Cargando tareas" />
```

---

## Controls

### Button

`<app-button>` · `Button` · `button/button` · CSS `button.css` · uses Icon, Spinner

Action button (renders a native `<button>`). Label is projected content. While `loading` it keeps focus (`aria-disabled`) and blocks clicks/submit.

| Input          | Type                   | Default      | Notes                                                |
| -------------- | ---------------------- | ------------ | ---------------------------------------------------- |
| `variant`      | `ButtonVariant`        | `'primary'`  | `primary accent secondary ghost ghost-danger danger` |
| `size`         | `Exclude<Size, 'xl'>`  | `'m'`        |                                                      |
| `type`         | `'button' \| 'submit'` | `'button'`   |                                                      |
| `icon`         | `string`               | —            | leading icon                                         |
| `iconEnd`      | `string`               | —            | trailing icon                                        |
| `block`        | bool attr              | `false`      | full width                                           |
| `disabled`     | bool attr              | `false`      |                                                      |
| `loading`      | bool attr              | `false`      | shows Spinner                                        |
| `loadingLabel` | `string`               | `'Cargando'` |                                                      |

| Output    | Payload      |
| --------- | ------------ |
| `clicked` | `MouseEvent` |

```html
<app-button icon="add" (clicked)="create()">Nueva cita</app-button>
<app-button type="submit" [loading]="saving()">Guardar</app-button>
```

### ButtonLink

`<a app-button-link>` · `ButtonLink` · `button-link/button-link` · CSS `button.css` · uses Icon

Navigation styled as Button (host is the `<a>`, class `button`). Use with `routerLink` or `href`.

Inputs: `variant`, `size`, `icon`, `iconEnd`, `block` — same as Button. No outputs.

```html
<a app-button-link variant="secondary" icon="calendar_month" routerLink="/calendario"
  >Ver calendario</a
>
```

### IconButton

`<app-icon-button>` · `IconButton` · `icon-button/icon-button` · CSS `icon-button.css` · uses Icon, Spinner

Icon-only button; `label` is its accessible name (required).

| Input      | Type                            | Default    | Notes           |
| ---------- | ------------------------------- | ---------- | --------------- |
| `icon`     | `string`                        | _required_ |                 |
| `label`    | `string`                        | _required_ | `aria-label`    |
| `variant`  | `'ghost' \| 'tonal' \| 'solid'` | `'ghost'`  |                 |
| `size`     | `Exclude<Size, 'xl'>`           | `'m'`      |                 |
| `type`     | `'button' \| 'submit'`          | `'button'` |                 |
| `filled`   | bool attr                       | `false`    | filled glyph    |
| `disabled` | bool attr                       | `false`    |                 |
| `loading`  | bool attr                       | `false`    |                 |
| `expanded` | `boolean`                       | —          | `aria-expanded` |
| `haspopup` | `'menu'`                        | —          | `aria-haspopup` |

| Output    | Payload      |
| --------- | ------------ |
| `clicked` | `MouseEvent` |

```html
<app-icon-button icon="chevron_left" label="Semana anterior" (clicked)="prev()" />
```

### Checkbox

`<app-checkbox>` · `Checkbox` · `checkbox/checkbox` · CSS `check.css`, `field.css` · uses Icon · `FormCheckboxControl`

| Model / Input   | Type      | Default          | Notes                          |
| --------------- | --------- | ---------------- | ------------------------------ |
| `checked`       | model     | `false`          |                                |
| `touched`       | model     | `false`          |                                |
| `indeterminate` | model     | `false`          |                                |
| `label`         | `string`  | —                | visible label                  |
| `ariaLabel`     | `string`  | —                | when there is no visible label |
| `id`            | `string`  | `app-checkbox-N` |                                |
| `name`          | `string`  | `''`             |                                |
| `hint`          | `string`  | —                |                                |
| `error`         | `string`  | —                |                                |
| `disabled`      | bool attr | `false`          |                                |
| `required`      | bool attr | `false`          |                                |

```html
<app-checkbox label="Todo el día" [(checked)]="allDay" />
<app-checkbox label="Acepto" [formField]="form.accept" />
```

### Switch

`<app-switch>` · `Switch` · `switch/switch` · CSS `switch.css`, `field.css` · uses Icon · `FormCheckboxControl`

On/off toggle. Same API as Checkbox minus `indeterminate`: models `checked`, `touched`; inputs `label`, `ariaLabel`, `id`, `name`, `hint`, `error`, `disabled`, `required`.

```html
<app-switch label="Recordatorios" [(checked)]="reminders" />
```

### SegmentedControl

`<app-segmented-control>` · `SegmentedControl` · `segmented-control/segmented-control` · CSS `segmented.css` · `FormValueControl<string>`

Pick one of a few options (replaces radios; the DS has no Radio). Arrow keys move inside the group.

| Model / Input | Type                | Default    | Notes                         |
| ------------- | ------------------- | ---------- | ----------------------------- |
| `value`       | model `string`      | `''`       | selected option `value`       |
| `touched`     | model               | `false`    |                               |
| `label`       | `string`            | _required_ | group accessible name         |
| `options`     | `SegmentedOption[]` | _required_ | `{ value; label; disabled? }` |
| `disabled`    | bool attr           | `false`    |                               |

```html
<app-segmented-control
  label="Vista"
  [options]="[{ value: 'dia', label: 'Día' }, { value: 'semana', label: 'Semana' }]"
  [(value)]="view"
/>
```

---

## Fields

All fields render `.field` (label, control, `hint`, `error`) from `field.css`, accept `[formField]` (Signal Forms) or `[(value)]`, and share: models `value`, `touched`; inputs `id` (auto), `name`, `hint`, `error`, `disabled`, `icon` (leading, except Textarea). Use `fieldError()` from `shared/validation/` to build Spanish `error` messages.

### TextField

`<app-text-field>` · `TextField` · `text-field/text-field` · `FormValueControl<string>`

| Input         | Type                                     | Default    | Notes                         |
| ------------- | ---------------------------------------- | ---------- | ----------------------------- |
| `label`       | `string`                                 | _required_ |                               |
| `type`        | `'text' \| 'search' \| 'email' \| 'tel'` | `'text'`   |                               |
| `placeholder` | `string`                                 | —          |                               |
| `hideLabel`   | bool attr                                | `false`    | label only for screen readers |
| `grow`        | bool attr                                | `false`    | fills the row                 |

```html
<app-text-field label="Título" [formField]="form.title" [error]="titleError()" />
```

### TextareaField

`<app-textarea>` · `TextareaField` · `textarea/textarea` · `FormValueControl<string>`

Inputs: `label` (required), `rows` (`3`), `placeholder`. No `icon`.

```html
<app-textarea label="Notas" [rows]="4" [formField]="form.notes" />
```

### SelectField

`<app-select>` · `SelectField` · `select/select` · `FormValueControl<string>`

Native `<select>`.

| Input       | Type             | Default    | Notes                          |
| ----------- | ---------------- | ---------- | ------------------------------ |
| `options`   | `SelectOption[]` | _required_ | `{ value; label }`             |
| `label`     | `string`         | —          | visible label                  |
| `ariaLabel` | `string`         | —          | when there is no visible label |

```html
<app-select label="Recordatorio" [options]="reminderOptions" [formField]="form.reminder" />
```

### DateField

`<app-date-field>` · `DateField` · `date-field/date-field` · `FormValueControl<string>` (`YYYY-MM-DD`)

Inputs: `label` (required), `minDate`, `maxDate`.

```html
<app-date-field label="Fecha" [formField]="form.date" />
```

### TimeField

`<app-time-field>` · `TimeField` · `time-field/time-field` · `FormValueControl<string>` (`HH:MM` 24 h)

Inputs: `label` (required), `minTime`, `maxTime`, `step` (seconds), `ariaLabel`, `hideLabel` (bool attr).

```html
<app-time-field label="Inicio" [formField]="form.start" />
```

### NumberField

`<app-number-field>` · `NumberField` · `number-field/number-field` · `FormValueControl<number | null>`

Inputs: `label` (required), `placeholder`, `min`, `max`, `step`. Value is `null` while the text is empty or not a number; intermediate text (e.g. `1e`) is kept.

```html
<app-number-field label="Duración (min)" [min]="5" [step]="5" [formField]="form.duration" />
```

---

## Molecules

### Card

`<app-card>` or `<button app-card>` · `Card`, `CardActions` · `card/card` · CSS `card.css`

Surface container. Use the `button[app-card]` selector for a clickable card.

| Input      | Type                      | Default     |
| ---------- | ------------------------- | ----------- |
| `heading`  | `string`                  | —           |
| `variant`  | `'default' \| 'elevated'` | `'default'` |
| `tone`     | `'danger'`                | —           |
| `tint`     | `Tint`                    | —           |
| `selected` | bool attr                 | `false`     |
| `disabled` | bool attr                 | `false`     |

Output `clicked: MouseEvent`. Slots: default content; `[cardActions]` (header actions, next to heading).

```html
<app-card heading="Notas recientes">
  <app-icon-button cardActions icon="more_horiz" label="Más" size="s" />
  <p>Revisar presupuesto del viaje.</p>
</app-card>
```

### Alert

`<app-alert>` · `Alert`, `AlertAction` · `alert/alert` · CSS `alert.css` · uses Icon, IconButton

Inline message with tone icon (word + icon, never color alone).

| Input         | Type                                           | Default  | Notes              |
| ------------- | ---------------------------------------------- | -------- | ------------------ |
| `tone`        | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` |                    |
| `heading`     | `string`                                       | —        |                    |
| `icon`        | `string`                                       | per tone | override           |
| `dismissible` | bool attr                                      | `false`  | shows close button |

Output `closed: void`. Slots: default content (body); `[alertAction]`.

```html
<app-alert tone="danger" heading="No pudimos guardar">
  Revisa tu conexión e inténtalo de nuevo.
  <app-button alertAction size="s" icon="refresh">Reintentar</app-button>
</app-alert>
```

### EmptyState

`<app-empty-state>` · `EmptyState`, `EmptyStateAction` · `empty-state/empty-state` · CSS `empty-state.css` · uses Icon

| Input         | Type         | Default    |
| ------------- | ------------ | ---------- |
| `heading`     | `string`     | _required_ |
| `description` | `string`     | —          |
| `icon`        | `string`     | —          |
| `size`        | `'s' \| 'm'` | `'m'`      |

Slot `[emptyStateAction]` (one or more buttons).

```html
<app-empty-state
  icon="event_available"
  heading="No tienes citas hoy"
  description="Disfruta el día libre."
>
  <app-button emptyStateAction icon="add">Nueva cita</app-button>
</app-empty-state>
```

### Breadcrumb

`<app-breadcrumb>` · `Breadcrumb` · `breadcrumb/breadcrumb` · CSS `breadcrumb.css` · uses Icon, RouterLink

| Input     | Type                 | Default     | Notes                                                        |
| --------- | -------------------- | ----------- | ------------------------------------------------------------ |
| `items`   | `BreadcrumbItem[]`   | _required_  | `{ label; icon?; link? \| href? }`; last item = current page |
| `variant` | `'default' \| 'bar'` | `'default'` |                                                              |

```html
<app-breadcrumb
  [items]="[{ label: 'Inicio', icon: 'home', link: '/inicio' }, { label: 'Tareas' }]"
/>
```

### Fab

`<app-fab>` · `Fab` · `fab/fab` · CSS `fab.css` · uses Icon

Floating action button (mobile `.l-screen__fab`).

| Input      | Type      | Default    | Notes                           |
| ---------- | --------- | ---------- | ------------------------------- |
| `label`    | `string`  | _required_ | accessible name / extended text |
| `icon`     | `string`  | `'add'`    |                                 |
| `extended` | bool attr | `false`    | shows the label                 |

Output `clicked: MouseEvent`.

```html
<app-fab label="Nueva cita" extended (clicked)="openNew()" />
```

### Menu

`<app-menu>` · `Menu` · `menu/menu` · CSS `menu.css` · uses Icon, IconButton

IconButton trigger + popup menu with keyboard (arrows, Home/End, Escape) and automatic alignment.

| Model / Input  | Type                  | Default          | Notes                                                                                                             |
| -------------- | --------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `items`        | `MenuEntry[]`         | _required_       | `MenuItem { label; icon?; shortcut?; tone?: 'danger'; disabled?; selected? }`, `{ divider: true }`, `{ section }` |
| `label`        | `string`              | `'Acciones'`     | menu accessible name                                                                                              |
| `align`        | `'end' \| 'start'`    | `'end'`          |                                                                                                                   |
| `icon`         | `string`              | `'more_horiz'`   | trigger icon                                                                                                      |
| `triggerLabel` | `string`              | `'Más acciones'` |                                                                                                                   |
| `variant`      | `IconButtonVariant`   | `'ghost'`        | trigger                                                                                                           |
| `size`         | `Exclude<Size, 'xl'>` | `'m'`            | trigger                                                                                                           |
| `open`         | model `boolean`       | `false`          |                                                                                                                   |

Output `itemSelected: MenuItem`.

```html
<app-menu
  [items]="[{ label: 'Editar', icon: 'edit' }, { divider: true }, { label: 'Eliminar', icon: 'delete', tone: 'danger' }]"
  (itemSelected)="onAction($event)"
/>
```

### DayPill

`<app-day-pill>` · `DayPill` · `day-pill/day-pill` · CSS `day-pill.css`

Day button (weekday + number) used by WeekStrip.

| Input       | Type               | Default    | Notes                       |
| ----------- | ------------------ | ---------- | --------------------------- |
| `dow`       | `string`           | _required_ | weekday abbreviation        |
| `num`       | `number \| string` | _required_ | day of month                |
| `label`     | `string`           | —          | full accessible name        |
| `selected`  | bool attr          | `false`    |                             |
| `today`     | bool attr          | `false`    |                             |
| `hasEvents` | bool attr          | `false`    | dot                         |
| `disabled`  | bool attr          | `false`    |                             |
| `fluid`     | bool attr          | `false`    | stretches to its cell       |
| `tabIndex`  | `number`           | —          | roving tabindex from parent |

Output `clicked: MouseEvent`.

```html
<app-day-pill dow="lun" [num]="4" today hasEvents />
```

### AgendaItem

`<app-agenda-item>` · `AgendaItem` · `agenda-item/agenda-item` · CSS `agenda-item.css` (+ `u-category`)

Agenda list row: time column, title, category.

| Input           | Type       | Default    |
| --------------- | ---------- | ---------- |
| `start`         | `string`   | _required_ |
| `end`           | `string`   | —          |
| `heading`       | `string`   | _required_ |
| `category`      | `Category` | —          |
| `categoryLabel` | `string`   | —          |
| `selected`      | bool attr  | `false`    |
| `cancelled`     | bool attr  | `false`    |
| `disabled`      | bool attr  | `false`    |

Output `clicked: MouseEvent`.

```html
<app-agenda-item
  start="09:00"
  end="10:00"
  heading="Reunión de equipo"
  category="blue"
  categoryLabel="Trabajo"
  (clicked)="edit(item)"
/>
```

### TaskItem

`<app-task-item>` · `TaskItem` · `task-item/task-item` · CSS `task-item.css` · uses Checkbox, Icon

Task row: checkbox toggles `done` (never opens detail); row click opens or removes depending on `action`.

| Model / Input | Type                 | Default    | Notes                                                       |
| ------------- | -------------------- | ---------- | ----------------------------------------------------------- |
| `heading`     | `string`             | _required_ |                                                             |
| `done`        | model `boolean`      | `false`    |                                                             |
| `due`         | `string`             | —          | due text                                                    |
| `subtasks`    | `number`             | —          | subtask count                                               |
| `list`        | `string`             | —          | list name                                                   |
| `listColor`   | `Category`           | `'blue'`   |                                                             |
| `disabled`    | bool attr            | `false`    |                                                             |
| `selected`    | bool attr            | `false`    |                                                             |
| `overdue`     | bool attr            | `false`    |                                                             |
| `action`      | `'open' \| 'remove'` | `'open'`   | `remove`: X «Quitar subtarea» in the row instead of chevron |

Outputs `opened: void`, `removed: void`.

```html
<app-task-item
  heading="Pagar alquiler"
  due="Hoy"
  list="Casa"
  [(done)]="task.done"
  (opened)="open(task)"
/>
```

### EventCard

`<app-event-card>` · `EventCard`, `EventCardStatus`, `EventCardBadge` · `event-card/event-card` · CSS `event-card.css` (+ `u-tint`) · uses AvatarGroup, Icon

Tinted event card (button) with time, title, location and people.

| Input       | Type             | Default                        |
| ----------- | ---------------- | ------------------------------ |
| `time`      | `string`         | _required_ (`'08:00 – 09:00'`) |
| `heading`   | `string`         | _required_                     |
| `tint`      | `Tint`           | `'periwinkle'`                 |
| `location`  | `string`         | —                              |
| `people`    | `AvatarPerson[]` | `[]`                           |
| `selected`  | bool attr        | `false`                        |
| `cancelled` | bool attr        | `false`                        |
| `disabled`  | bool attr        | `false`                        |

Output `clicked: MouseEvent`. Slots: `[eventCardStatus]` (next to time), `[eventCardBadge]` (footer, usually a `glass` Badge).

```html
<app-event-card
  time="08:00 – 09:00"
  heading="Revisión de diseño"
  location="Sala 2"
  [people]="people"
>
  <app-badge eventCardBadge tone="glass" icon="check_circle">Confirmada</app-badge>
</app-event-card>
```

### StatCard

`<app-stat-card>` or `<button app-stat-card>` · `StatCard` · `stat-card/stat-card` · CSS `stat-card.css` · uses Icon

KPI tile; lay several out with `.l-grid`.

| Input   | Type                                                     | Default    |
| ------- | -------------------------------------------------------- | ---------- |
| `icon`  | `string`                                                 | _required_ |
| `label` | `string`                                                 | _required_ |
| `value` | `string \| number`                                       | _required_ |
| `hint`  | `string`                                                 | —          |
| `tone`  | `'brand' \| 'accent' \| 'success' \| 'info' \| 'danger'` | `'brand'`  |

Output `clicked: MouseEvent` (button form).

```html
<div class="l-grid">
  <app-stat-card icon="event" label="Citas hoy" [value]="4" hint="2 por la tarde" />
</div>
```

### SettingRow

`<app-setting-row>` or `<button app-setting-row>` · `SettingRow`, `SettingRowControl` · `setting-row/setting-row` · CSS `setting-row.css` · uses Icon

Settings line: icon, label, description and a control or value + chevron (button form navigates to a detail).

| Input         | Type       | Default    | Notes                                      |
| ------------- | ---------- | ---------- | ------------------------------------------ |
| `label`       | `string`   | _required_ |                                            |
| `icon`        | `string`   | —          |                                            |
| `description` | `string`   | —          |                                            |
| `value`       | `string`   | —          | current value text (button form)           |
| `wide`        | bool attr  | `false`    | wide control, drops below text when narrow |
| `noChevron`   | bool attr  | `false`    |                                            |
| `disabled`    | bool attr  | `false`    |                                            |
| `tone`        | `'danger'` | —          |                                            |

Output `clicked: MouseEvent`. Slot `[settingRowControl]` (Switch, SelectField, SegmentedControl, TimeField…; give it an `ariaLabel`).

```html
<app-setting-row
  icon="notifications"
  label="Recordatorios"
  description="Avisaremos antes de cada cita."
>
  <app-switch settingRowControl ariaLabel="Recordatorios" [(checked)]="reminders" />
</app-setting-row>
<button
  app-setting-row
  icon="person"
  label="Perfil"
  value="Laura"
  (clicked)="go('perfil')"
></button>
```

---

## Organisms

### WeekStrip

`<app-week-strip>` · `WeekStrip` · `week-strip/week-strip` · CSS `week-strip.css` · uses DayPill

Row of DayPills with roving tabindex and arrow keys.

| Model / Input | Type           | Default               | Notes                                   |
| ------------- | -------------- | --------------------- | --------------------------------------- |
| `days`        | `WeekDay[]`    | _required_            | `{ iso; dow; num; today?; hasEvents? }` |
| `label`       | `string`       | `'Días de la semana'` |                                         |
| `selected`    | model `string` | —                     | ISO date                                |

```html
<app-week-strip [days]="week()" [(selected)]="day" />
```

### MiniCalendar

`<app-mini-calendar>` · `MiniCalendar` · `mini-calendar/mini-calendar` · CSS `calendar.css` · uses IconButton

Month grid date picker with prev/next, roving tabindex, `aria-live` month title. Visible month follows `selected`.

| Model / Input | Type                       | Default     | Notes               |
| ------------- | -------------------------- | ----------- | ------------------- |
| `today`       | `string`                   | local today | ISO                 |
| `events`      | `string[]`                 | `[]`        | ISO days with a dot |
| `isDisabled`  | `(iso: string) => boolean` | —           |                     |
| `selected`    | model `string`             | —           | ISO                 |
| `firstDay`    | `0 \| 1`                   | `1`         | 1 Monday, 0 Sunday  |

```html
<app-mini-calendar
  [today]="today()"
  [events]="eventDays()"
  [firstDay]="firstDay()"
  [(selected)]="date"
/>
```

### SidebarNav

`<app-sidebar-nav>` · `SidebarNav` · `sidebar-nav/sidebar-nav` · CSS `sidebar-nav.css` · uses Avatar, Badge, Icon

Desktop navigation, `panel` (full) or `rail` (icons). The app shell uses `rail`.

| Input     | Type                             | Default       | Notes                                                                                      |
| --------- | -------------------------------- | ------------- | ------------------------------------------------------------------------------------------ |
| `items`   | `SidebarNavEntry[]`              | _required_    | `SidebarNavItem { icon; label; active?; badge?; badgeLabel?; disabled? }` or `{ section }` |
| `variant` | `'panel' \| 'rail'`              | `'panel'`     |                                                                                            |
| `user`    | `{ name: string; role: string }` | —             | footer with Avatar                                                                         |
| `label`   | `string`                         | `'Principal'` | nav accessible name                                                                        |

Output `itemSelected: SidebarNavItem`. Destinations: `RAIL_DESTINATIONS` in `@shared/utils`.

```html
<app-sidebar-nav variant="rail" [items]="railItems()" (itemSelected)="navigate($event)" />
```

### BottomNav

`<app-bottom-nav>` · `BottomNav` · `bottom-nav/bottom-nav` · CSS `bottom-nav.css` · uses Icon

Mobile tab bar (`.l-shell__bottom`).

| Input   | Type              | Default                  | Notes                                                      |
| ------- | ----------------- | ------------------------ | ---------------------------------------------------------- |
| `items` | `BottomNavItem[]` | _required_               | `{ icon; label; active?; badge?; badgeLabel?; disabled? }` |
| `label` | `string`          | `'Navegación principal'` |                                                            |

Output `itemSelected: BottomNavItem`. Destinations: `BOTTOM_DESTINATIONS` in `@shared/utils`.

```html
<app-bottom-nav [items]="bottomItems()" (itemSelected)="navigate($event)" />
```

### AppBar

`<app-app-bar>` · `AppBar`, `AppBarActions` · `app-bar/app-bar` · CSS `app-bar.css` · uses IconButton

Mobile top bar (`.l-screen__top`) with optional back button.

| Input       | Type      | Default    | Notes             |
| ----------- | --------- | ---------- | ----------------- |
| `heading`   | `string`  | _required_ |                   |
| `subtitle`  | `string`  | —          |                   |
| `back`      | bool attr | `false`    | shows back button |
| `backLabel` | `string`  | `'Volver'` |                   |
| `large`     | bool attr | `false`    | large title       |

Output `backClicked: MouseEvent`. Slot `[appBarActions]` (IconButtons, Menu).

```html
<app-app-bar heading="Tareas" back (backClicked)="goBack()">
  <app-icon-button appBarActions icon="search" label="Buscar" />
</app-app-bar>
```

### Dialog

`<app-dialog>` · `Dialog`, `DialogFooter` · `dialog/dialog` · CSS `dialog.css` · uses IconButton, Button

Native `<dialog>`: modal (`showModal`, scroll lock, close by scrim/Escape) or `contained` (non-modal, inside its container). `variant="sheet"` is a bottom sheet, `"full"` full screen.

| Model / Input | Type                | Default      | Notes                       |
| ------------- | ------------------- | ------------ | --------------------------- |
| `heading`     | `string`            | _required_   |                             |
| `description` | `string`            | —            |                             |
| `variant`     | `'sheet' \| 'full'` | — (centered) |                             |
| `contained`   | bool attr           | `false`      | `show()` instead of modal   |
| `closable`    | bool attr           | `true`       | close button, scrim, Escape |
| `open`        | model `boolean`     | `false`      |                             |

Slots: default content; `[dialogFooter]`. A `type="submit"` button inside the dialog submits its form normally.

```html
<app-dialog heading="Eliminar tarea" [(open)]="confirmOpen">
  <p>Esta acción no se puede deshacer.</p>
  <app-button dialogFooter variant="ghost" (clicked)="confirmOpen.set(false)">Cancelar</app-button>
  <app-button dialogFooter variant="danger" (clicked)="remove()">Eliminar</app-button>
</app-dialog>
```

### SaveBar

`<app-save-bar>` · `SaveBar` · `save-bar/save-bar` · CSS `save-bar.css` · uses Button, Icon

Sticky bar for unsaved changes (Settings). Shows while `dirty`/`saving`; «Cambios guardados» hides by itself after `savedTimeout` (`saved` must go back to `false` to show again).

| Input          | Type          | Default                        |
| -------------- | ------------- | ------------------------------ |
| `dirty`        | bool attr     | `false`                        |
| `saving`       | bool attr     | `false`                        |
| `saved`        | bool attr     | `false`                        |
| `message`      | `string`      | `'Tienes cambios sin guardar'` |
| `savedMessage` | `string`      | `'Cambios guardados'`          |
| `saveLabel`    | `string`      | `'Guardar cambios'`            |
| `savedTimeout` | `number` (ms) | `1800`                         |

Outputs `saveClicked: MouseEvent`, `cancelClicked: MouseEvent`.

```html
<app-save-bar
  [dirty]="dirty()"
  [saving]="saving()"
  [saved]="saved()"
  (saveClicked)="save()"
  (cancelClicked)="reset()"
/>
```

### DayView

`<app-day-view>` · `DayView` · `day-view/day-view` · CSS `day-view.css` · uses Badge, Icon

Single-day hour grid with overlapping lanes, all-day row, now line and working-hours shading. Scrolls to one hour before `now` (browser only).

| Input          | Type              | Default    | Notes                                                                                                    |
| -------------- | ----------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| `heading`      | `string`          | _required_ |                                                                                                          |
| `today`        | bool attr         | `false`    |                                                                                                          |
| `events`       | `DayViewEvent[]`  | `[]`       | `{ id?; start; end; title; tint?; category?; location?; locationIcon?; people?; selected?; cancelled? }` |
| `allDay`       | `DayViewAllDay[]` | `[]`       | `{ title; category? }`                                                                                   |
| `startHour`    | `number`          | `0`        |                                                                                                          |
| `endHour`      | `number`          | `24`       |                                                                                                          |
| `visibleHours` | `number`          | `10`       | viewport height in hours                                                                                 |
| `scrollToHour` | `number`          | `8`        | without `now`                                                                                            |
| `now`          | `string`          | —          | `HH:MM`, draws the now line                                                                              |
| `timeFormat`   | `TimeFormat`      | `'24 h'`   |                                                                                                          |
| `workStart`    | `string`          | —          | `HH:MM`; with `workEnd`, shades outside hours                                                            |
| `workEnd`      | `string`          | —          |                                                                                                          |

Outputs `eventSelected: DayViewEvent`, `slotClicked: string` (`HH:00`).

```html
<app-day-view
  heading="Martes 4"
  today
  [events]="events()"
  [now]="now()"
  (eventSelected)="edit($event)"
  (slotClicked)="create($event)"
/>
```

### WeekView

`<app-week-view>` · `WeekView` · `week-view/week-view` · CSS `week-view.css` · uses Badge, Icon

Week hour grid. Same hour/scroll/format/work inputs as DayView (`startHour`, `endHour`, `visibleHours`, `scrollToHour`, `now`, `timeFormat`, `workStart`, `workEnd`).

| Input    | Type               | Default    | Notes                                                           |
| -------- | ------------------ | ---------- | --------------------------------------------------------------- |
| `days`   | `WeekDay[]`        | _required_ | columns (5 or 7)                                                |
| `events` | `WeekViewEvent[]`  | `[]`       | `{ id?; day; start; end; title; tint?; selected?; cancelled? }` |
| `allDay` | `WeekViewAllDay[]` | `[]`       | `{ day; title; category? }`                                     |
| `label`  | `string`           | `'Semana'` |                                                                 |

Outputs `eventSelected: WeekViewEvent`, `slotClicked: WeekViewSlot` (`{ day; hour }`).

```html
<app-week-view [days]="days()" [events]="events()" [now]="now()" (slotClicked)="create($event)" />
```

### MonthView

`<app-month-view>` · `MonthView` · `month-view/month-view` · CSS `month-view.css`

Month grid with event chips, «+N» overflow, roving tabindex and selection.

| Model / Input  | Type               | Default     | Notes                                                |
| -------------- | ------------------ | ----------- | ---------------------------------------------------- |
| `year`         | `number`           | _required_  |                                                      |
| `month`        | `number`           | _required_  | 0-based (JS `Date`)                                  |
| `today`        | `string`           | local today | ISO                                                  |
| `events`       | `MonthViewEvent[]` | `[]`        | `{ id?; day; title; start?; category?; cancelled? }` |
| `maxPerDay`    | `number`           | `3`         | chips before «+N»                                    |
| `label`        | `string`           | `'Mes'`     |                                                      |
| `firstDay`     | `0 \| 1`           | `1`         | 1 Monday, 0 Sunday                                   |
| `showWeekends` | `boolean`          | `true`      | `false`: Mon–Fri, 5 columns                          |
| `timeFormat`   | `TimeFormat`       | `'24 h'`    |                                                      |
| `selected`     | model `string`     | —           | ISO                                                  |

Outputs `eventSelected: MonthViewEvent`, `moreSelected: string` (ISO day).

```html
<app-month-view
  [year]="2026"
  [month]="10"
  [events]="events()"
  [(selected)]="day"
  (moreSelected)="openDay($event)"
/>
```

### EventForm

`<app-event-form>` · `EventForm` · `event-form/event-form` · uses TextField, TextareaField, SelectField, DateField, TimeField, Switch, Button (Signal Forms)

Create/edit appointment. Errors show only after the first save (or with `showErrors`). Defaults/options in `@shared/utils` (`event-form.ts`).

| Input           | Type                      | Default          |
| --------------- | ------------------------- | ---------------- |
| `defaultValues` | `Partial<EventFormValue>` | `{}`             |
| `saveLabel`     | `string`                  | `'Guardar cita'` |
| `showErrors`    | bool attr                 | `false`          |
| `deletable`     | bool attr                 | `false`          |
| `cancelable`    | bool attr                 | `false`          |

Outputs `saved: EventFormValue`, `deleted: void` («Eliminar cita»), `cancelled: void`.
`EventFormValue`: `title, category, date, start, end, allDay, location, people, notes, reminder, repeat` (all strings except `allDay`).

```html
<app-dialog heading="Editar cita" [(open)]="editOpen">
  <app-event-form
    [defaultValues]="event()"
    deletable
    cancelable
    (saved)="update($event)"
    (deleted)="remove()"
    (cancelled)="editOpen.set(false)"
  />
</app-dialog>
```

### TaskForm

`<app-task-form>` · `TaskForm` · `task-form/task-form` · uses TextField, TextareaField, SelectField, DateField, SegmentedControl, TaskItem, IconButton, Button (Signal Forms)

Create/edit task with list, due date, priority, tags and subtasks (Enter adds a subtask; each subtask row uses TaskItem `action="remove"`). Defaults/options in `@shared/utils` (`task-form.ts`).

Inputs `defaultValues: Partial<TaskFormValue>` (`{}`), `showErrors`, `deletable`, `cancelable` (bool attr). Outputs `saved: TaskFormValue`, `deleted: void`, `cancelled: void`.
`TaskFormValue`: `title, notes, list, due, priority ('baja' | 'media' | 'alta'), tags: string[], subtasks: { title; done }[]`.

```html
<app-task-form [defaultValues]="task()" deletable (saved)="save($event)" (deleted)="remove()" />
```

---

## Pages

### PlaceholderPage

`<app-placeholder-page>` · `PlaceholderPage` · `placeholder-page/placeholder-page` · CSS `placeholder-page.css` · uses EmptyState

Panel with an EmptyState for screens not built yet. Input `heading` (required).

```html
<app-placeholder-page heading="Próximamente" />
```
