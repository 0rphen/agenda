import { Component, computed, signal } from '@angular/core';
import { email, form, FormField, max, min, required } from '@angular/forms/signals';
import { Alert, AlertAction } from '@shared/components/alert/alert';
import { Breadcrumb } from '@shared/components/breadcrumb/breadcrumb';
import { Fab } from '@shared/components/fab/fab';
import { Menu } from '@shared/components/menu/menu';
import { DayPill } from '@shared/components/day-pill/day-pill';
import { AgendaItem } from '@shared/components/agenda-item/agenda-item';
import { TaskItem } from '@shared/components/task-item/task-item';
import { EventCard, EventCardBadge } from '@shared/components/event-card/event-card';
import { StatCard } from '@shared/components/stat-card/stat-card';
import { SettingRow, SettingRowControl } from '@shared/components/setting-row/setting-row';
import { WeekStrip } from '@shared/components/week-strip/week-strip';
import { MiniCalendar } from '@shared/components/mini-calendar/mini-calendar';
import { SidebarNav } from '@shared/components/sidebar-nav/sidebar-nav';
import { BottomNav } from '@shared/components/bottom-nav/bottom-nav';
import { AppBar, AppBarActions } from '@shared/components/app-bar/app-bar';
import { Dialog, DialogFooter } from '@shared/components/dialog/dialog';
import { SaveBar } from '@shared/components/save-bar/save-bar';
import { DayView } from '@shared/components/day-view/day-view';
import { WeekView } from '@shared/components/week-view/week-view';
import { MonthView } from '@shared/components/month-view/month-view';
import { EventForm } from '@shared/components/event-form/event-form';
import { TaskForm } from '@shared/components/task-form/task-form';
import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';
import { Avatar } from '@shared/components/avatar/avatar';
import { AvatarGroup } from '@shared/components/avatar/avatar-group';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { Card, CardActions } from '@shared/components/card/card';
import { Checkbox } from '@shared/components/checkbox/checkbox';
import { Switch } from '@shared/components/switch/switch';
import { SegmentedControl } from '@shared/components/segmented-control/segmented-control';
import { EmptyState, EmptyStateAction } from '@shared/components/empty-state/empty-state';
import { DateField } from '@shared/components/date-field/date-field';
import { NumberField } from '@shared/components/number-field/number-field';
import { SelectField } from '@shared/components/select/select';
import { TextareaField } from '@shared/components/textarea/textarea';
import { TextField } from '@shared/components/text-field/text-field';
import { TimeField } from '@shared/components/time-field/time-field';
import { ButtonLink } from '@shared/components/button-link/button-link';
import { Icon } from '@shared/components/icon/icon';
import { IconButton } from '@shared/components/icon-button/icon-button';
import { Progress } from '@shared/components/progress/progress';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { SkeletonList } from '@shared/components/skeleton/skeleton-list';
import { Spinner } from '@shared/components/spinner/spinner';
import {
  BottomNavItem,
  BreadcrumbItem,
  ButtonVariant,
  Category,
  IconButtonVariant,
  MenuEntry,
  MiniCalendarForcedState,
  SidebarNavEntry,
  SidebarNavItem,
  Size,
  SkeletonListVariant,
  StatCardTone,
  Tint,
  Tone,
} from '@shared/types';
import { capitalize, MONTH_YEAR } from '@shared/utils';
import { fieldError } from '../shared/validation/field-error';
import { dniNie, phone } from '../shared/validation/validators';
import {
  AvatarPerson,
  DayViewAllDay,
  DayViewEvent,
  EventFormValue,
  MonthViewEvent,
  SegmentedOption,
  SelectOption,
  TaskFormValue,
  WeekDay,
  WeekViewAllDay,
  WeekViewEvent,
} from '@shared/interfaces';

interface DemoModel {
  name: string;
  mail: string;
  phone: string;
  dni: string;
  notes: string;
  calendar: string;
  date: string;
  time: string;
  guests: number | null;
  terms: boolean;
  notify: boolean;
  priority: string;
}

const SIZES: Size[] = ['s', 'm', 'l', 'xl'];
const BUTTON_VARIANTS: ButtonVariant[] = [
  'primary',
  'accent',
  'secondary',
  'ghost',
  'ghost-danger',
  'danger',
];
const ICON_BUTTONS: { variant: IconButtonVariant; icon: string; label: string }[] = [
  { variant: 'ghost', icon: 'more_horiz', label: 'Más opciones' },
  { variant: 'tonal', icon: 'edit', label: 'Editar' },
  { variant: 'solid', icon: 'add', label: 'Nuevo evento' },
];
const BADGE_TONES: Exclude<Tone, 'accent'>[] = [
  'neutral',
  'brand',
  'success',
  'warning',
  'danger',
  'info',
  'inverse',
  'glass',
  'count',
];
const CATEGORIES: Category[] = ['orange', 'violet', 'red', 'blue', 'green', 'mustard', 'cyan'];
const PEOPLE: AvatarPerson[] = [
  { name: 'Lucía Martín' },
  { name: 'Javier Ruiz' },
  { name: 'Marta Gómez' },
  { name: 'Pablo Sanz' },
  { name: 'Elena Torres' },
];
const EVENT_TINTS: { tint: Tint; heading: string }[] = [
  { tint: 'periwinkle', heading: 'Pervinca' },
  { tint: 'cream', heading: 'Crema' },
  { tint: 'rose', heading: 'Rosa' },
  { tint: 'mint', heading: 'Menta' },
  { tint: 'sky', heading: 'Cielo' },
  { tint: 'lilac', heading: 'Lila' },
  { tint: 'lime', heading: 'Lima' },
];
const STATS: { icon: string; label: string; value: string; hint: string; tone: StatCardTone }[] = [
  { icon: 'event', label: 'Citas hoy', value: '5', hint: 'Próxima a las 14:30', tone: 'brand' },
  { icon: 'task_alt', label: 'Pendientes', value: '7', hint: '2 vencen hoy', tone: 'accent' },
  {
    icon: 'schedule',
    label: 'Reservadas',
    value: '6,3 h',
    hint: 'De 8 h disponibles',
    tone: 'info',
  },
  {
    icon: 'check_circle',
    label: 'Completadas',
    value: '12',
    hint: 'De 15 planificadas',
    tone: 'success',
  },
];
const DAY_EVENTS: DayViewEvent[] = [
  {
    start: '08:30',
    end: '09:00',
    title: '3 categorías de rocas',
    tint: 'cream',
    category: 'Marketing',
  },
  {
    start: '09:30',
    end: '11:45',
    title: 'Lanzamiento de Bestbuy',
    tint: 'mint',
    category: 'Estrategia',
    location: 'Sala 3',
    people: ['a', 'b', 'c', 'd'],
  },
  {
    start: '10:00',
    end: '11:00',
    title: 'Revisión de diseño',
    tint: 'lilac',
    category: 'Desarrollo',
    location: 'Videollamada',
    locationIcon: 'videocam',
    people: ['a', 'b'],
  },
  {
    start: '12:00',
    end: '13:00',
    title: 'Almuerzo con cliente',
    tint: 'rose',
    category: 'Clientes',
    location: 'Restaurante Central',
    state: 'hover',
  },
  {
    start: '14:30',
    end: '16:20',
    title: 'Configurar repositorio',
    tint: 'sky',
    category: 'Desarrollo',
    location: 'Oficina',
    people: ['a'],
  },
  { start: '15:00', end: '15:30', title: 'Llamada cancelada', tint: 'rose', cancelled: true },
  { start: '16:30', end: '17:30', title: 'Planeación semanal', tint: 'periwinkle', state: 'focus' },
];
const DAY_ALL_DAY: DayViewAllDay[] = [
  { title: 'Cumpleaños de Jill', category: 'green' },
  { title: 'Entrega de informe', category: 'red' },
];
const WEEK_VIEW_DAYS: WeekDay[] = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].map(
  (dow, i) => ({ iso: `2026-10-${19 + i}`, dow, num: 19 + i, today: i === 3 }),
);
const WEEK_EVENTS: WeekViewEvent[] = [
  {
    day: '2026-10-19',
    start: '09:00',
    end: '10:30',
    title: 'Planeación semanal',
    tint: 'periwinkle',
  },
  {
    day: '2026-10-20',
    start: '08:30',
    end: '09:00',
    title: '3 categorías de rocas',
    tint: 'cream',
  },
  {
    day: '2026-10-20',
    start: '14:00',
    end: '15:30',
    title: 'Revisión de diseño',
    tint: 'lilac',
    state: 'hover',
  },
  { day: '2026-10-21', start: '11:00', end: '12:00', title: 'Proyecto financiero', tint: 'rose' },
  {
    day: '2026-10-22',
    start: '09:30',
    end: '11:45',
    title: 'Lanzamiento de Bestbuy',
    tint: 'mint',
  },
  {
    day: '2026-10-22',
    start: '10:00',
    end: '11:00',
    title: 'Revisión de presupuesto',
    tint: 'lilac',
  },
  { day: '2026-10-22', start: '14:30', end: '16:20', title: 'Configurar repositorio', tint: 'sky' },
  {
    day: '2026-10-23',
    start: '10:00',
    end: '11:00',
    title: 'Reunión cancelada',
    tint: 'rose',
    cancelled: true,
  },
  {
    day: '2026-10-23',
    start: '15:00',
    end: '16:00',
    title: 'Cena con cliente',
    tint: 'lime',
    state: 'focus',
  },
  { day: '2026-10-24', start: '12:00', end: '14:00', title: 'Almuerzo familiar', tint: 'cream' },
];
const MONTH_EVENTS: MonthViewEvent[] = [
  { day: '2026-10-02', category: 'orange', title: 'Campaña de otoño', start: '10:00' },
  { day: '2026-10-06', category: 'violet', title: 'Estrategia Q4', start: '09:00' },
  { day: '2026-10-06', category: 'blue', title: 'Sprint review', start: '16:00', state: 'hover' },
  { day: '2026-10-14', category: 'red', title: 'Taller de descubrimiento', start: '11:00' },
  { day: '2026-10-22', category: 'orange', title: '3 categorías de rocas', start: '08:30' },
  { day: '2026-10-22', category: 'violet', title: 'Lanzamiento de Bestbuy', start: '09:30' },
  { day: '2026-10-22', category: 'blue', title: 'Configurar repositorio', start: '14:30' },
  { day: '2026-10-22', category: 'green', title: 'Dentista', start: '17:00' },
  { day: '2026-10-22', category: 'mustard', title: 'Pagar impuestos', start: '18:00' },
  {
    day: '2026-10-23',
    category: 'red',
    title: 'Reunión cancelada',
    start: '10:00',
    cancelled: true,
  },
  {
    day: '2026-10-27',
    category: 'cyan',
    title: 'Demo con cliente',
    start: '15:00',
    state: 'focus',
  },
];
const WEEK_ALL_DAY: WeekViewAllDay[] = [
  { day: '2026-10-22', title: 'Cumpleaños de Jill', category: 'green' },
  { day: '2026-10-24', title: 'Entrega del informe trimestral de resultados', category: 'red' },
];
const SECTIONS = [
  { id: 'icon', name: 'Icon' },
  { id: 'spinner', name: 'Spinner' },
  { id: 'badge', name: 'Badge' },
  { id: 'avatar', name: 'Avatar' },
  { id: 'progress', name: 'Progress' },
  { id: 'skeleton', name: 'Skeleton' },
  { id: 'button', name: 'Button' },
  { id: 'button-link', name: 'ButtonLink' },
  { id: 'icon-button', name: 'IconButton' },
  { id: 'checkbox', name: 'Checkbox' },
  { id: 'switch', name: 'Switch' },
  { id: 'segmented-control', name: 'SegmentedControl' },
  { id: 'text-field', name: 'TextField' },
  { id: 'textarea-field', name: 'TextareaField' },
  { id: 'select-field', name: 'SelectField' },
  { id: 'date-field', name: 'DateField' },
  { id: 'time-field', name: 'TimeField' },
  { id: 'number-field', name: 'NumberField' },
  { id: 'card', name: 'Card' },
  { id: 'alert', name: 'Alert' },
  { id: 'empty-state', name: 'EmptyState' },
  { id: 'breadcrumb', name: 'Breadcrumb' },
  { id: 'fab', name: 'Fab' },
  { id: 'menu', name: 'Menu' },
  { id: 'day-pill', name: 'DayPill' },
  { id: 'agenda-item', name: 'AgendaItem' },
  { id: 'task-item', name: 'TaskItem' },
  { id: 'event-card', name: 'EventCard' },
  { id: 'stat-card', name: 'StatCard' },
  { id: 'setting-row', name: 'SettingRow' },
  { id: 'week-strip', name: 'WeekStrip' },
  { id: 'mini-calendar', name: 'MiniCalendar' },
  { id: 'sidebar-nav', name: 'SidebarNav' },
  { id: 'bottom-nav', name: 'BottomNav' },
  { id: 'app-bar', name: 'AppBar' },
  { id: 'dialog', name: 'Dialog' },
  { id: 'save-bar', name: 'SaveBar' },
  { id: 'day-view', name: 'DayView' },
  { id: 'week-view', name: 'WeekView' },
  { id: 'month-view', name: 'MonthView' },
  { id: 'event-form', name: 'EventForm' },
  { id: 'task-form', name: 'TaskForm' },
  { id: 'placeholder-page', name: 'PlaceholderPage' },
];
const EDIT_EVENT: Partial<EventFormValue> = {
  title: 'Revisión de sprint',
  category: 'Desarrollo',
  date: '2026-10-23',
  start: '15:00',
  end: '14:00',
  location: 'Sala 3',
  people: 'Adrian, Jill',
  reminder: '1 hora antes',
};
const EDIT_TASK: Partial<TaskFormValue> = {
  title: 'Renovar licencia de conducción',
  notes: 'Llevar cédula y comprobante de pago.',
  list: 'Personal',
  due: '2026-11-03',
  priority: 'alta',
  tags: ['Urgente'],
  subtasks: [
    { title: 'Pagar derechos', done: true },
    { title: 'Pedir cita en tránsito', done: false },
  ],
};
const NAV_ITEMS: SidebarNavEntry[] = [
  { section: 'Menú principal' },
  { icon: 'dashboard', label: 'Resumen' },
  { icon: 'calendar_month', label: 'Calendario' },
  { icon: 'task_alt', label: 'Tareas', badge: 5 },
  { icon: 'groups', label: 'Reuniones', state: 'hover' },
  { icon: 'chat_bubble_outline', label: 'Mensajes', badge: 2 },
  { icon: 'insights', label: 'Analítica', state: 'focus' },
  { icon: 'lock', label: 'Reportes', disabled: true },
  { section: 'Ajustes y noticias' },
  { icon: 'tune', label: 'Configuración' },
];
const NAV_RAIL: SidebarNavEntry[] = [
  { icon: 'dashboard', label: 'Resumen' },
  { icon: 'calendar_month', label: 'Calendario', active: true },
  { icon: 'task_alt', label: 'Tareas' },
  { icon: 'groups', label: 'Reuniones', state: 'hover' },
  { icon: 'insights', label: 'Analítica', state: 'focus' },
  { icon: 'lock', label: 'Reportes', disabled: true },
];
const BOTTOM_ITEMS: BottomNavItem[] = [
  { icon: 'today', label: 'Hoy' },
  { icon: 'calendar_month', label: 'Mes' },
  { icon: 'task_alt', label: 'Tareas', badge: 5 },
  { icon: 'settings', label: 'Ajustes' },
];
const BOTTOM_STATES: BottomNavItem[] = [
  { icon: 'today', label: 'Hoy', state: 'hover' },
  { icon: 'calendar_month', label: 'Mes', state: 'active' },
  { icon: 'task_alt', label: 'Tareas', state: 'focus' },
  { icon: 'settings', label: 'Ajustes', disabled: true },
];
const APP_BAR_MENU: MenuEntry[] = [
  { icon: 'settings', label: 'Ajustes' },
  { icon: 'help_outline', label: 'Ayuda' },
];
const CRUMBS: BreadcrumbItem[] = [
  { label: 'Inicio', icon: 'home', link: '/demo' },
  { label: 'Calendario', link: '/demo' },
  { label: 'Octubre 2026' },
];
const CRUMBS_BAR: BreadcrumbItem[] = [
  { label: 'Maham' },
  { label: 'Exámenes', icon: 'edit_calendar' },
];
const CRUMBS_EXTERNAL: BreadcrumbItem[] = [
  { label: 'Ayuda', href: 'https://example.com' },
  { label: 'Atajos de teclado' },
];
const MENU_ACTIONS: MenuEntry[] = [
  { icon: 'edit', label: 'Editar', shortcut: 'E' },
  { icon: 'content_copy', label: 'Duplicar', shortcut: 'D' },
  { icon: 'event_repeat', label: 'Mover a otro día' },
  { divider: true },
  { icon: 'share', label: 'Compartir' },
  { icon: 'archive', label: 'Archivar', disabled: true },
  { divider: true },
  { icon: 'delete_outline', label: 'Eliminar cita', tone: 'danger', shortcut: '⌫' },
];
const MENU_VIEW: MenuEntry[] = [
  { section: 'Vista' },
  { icon: 'today', label: 'Día', selected: false },
  { icon: 'view_week', label: 'Semana', selected: true },
  { icon: 'calendar_view_month', label: 'Mes', selected: false },
  { divider: true },
  { section: 'Mostrar' },
  { icon: 'cancel', label: 'Citas canceladas', selected: false },
];
const WEEK_DAYS = [
  { dow: 'L', num: 19, name: 'Lunes', disabled: true },
  { dow: 'M', num: 20, name: 'Martes', hasEvents: true },
  { dow: 'X', num: 21, name: 'Miércoles' },
  { dow: 'J', num: 22, name: 'Jueves', today: true, hasEvents: true },
  { dow: 'V', num: 23, name: 'Viernes', hasEvents: true },
  { dow: 'S', num: 24, name: 'Sábado' },
  { dow: 'D', num: 25, name: 'Domingo' },
].map((d) => ({
  ...d,
  label: `${d.name} ${d.num} de octubre${d.today ? ', hoy' : ''}${d.hasEvents ? ', con eventos' : ''}`,
}));
const CALENDAR_EVENTS = [
  '2026-10-02',
  '2026-10-06',
  '2026-10-10',
  '2026-10-14',
  '2026-10-22',
  '2026-10-27',
];
const CALENDAR_FORCE: Record<string, MiniCalendarForcedState> = {
  '2026-10-14': 'hover',
  '2026-10-10': 'focus',
};
const isWeekend = (iso: string) => [0, 6].includes(new Date(`${iso}T00:00:00Z`).getUTCDay());
const STRIP_DAYS: WeekDay[] = WEEK_DAYS.map(({ dow, num, today, hasEvents }) => ({
  iso: `2026-10-${num}`,
  dow,
  num,
  today,
  hasEvents,
}));
const AGENDA_ITEMS: {
  start: string;
  end: string;
  category: Category;
  categoryLabel: string;
  heading: string;
}[] = [
  {
    start: '08:30',
    end: '09:00',
    category: 'orange',
    categoryLabel: 'Marketing',
    heading: '3 categorías de rocas',
  },
  {
    start: '09:30',
    end: '11:45',
    category: 'violet',
    categoryLabel: 'Estrategia',
    heading: 'Lanzamiento de Bestbuy',
  },
  {
    start: '11:00',
    end: '12:00',
    category: 'red',
    categoryLabel: 'Descubrimiento',
    heading: 'Proyecto financiero',
  },
  {
    start: '14:30',
    end: '16:20',
    category: 'blue',
    categoryLabel: 'Desarrollo',
    heading: 'Configurar repositorio GitHub',
  },
  {
    start: '17:00',
    end: '17:15',
    category: 'green',
    categoryLabel: 'Personal',
    heading: 'Dentista · Calle 85',
  },
];
const TASKS: {
  heading: string;
  due?: string;
  subtasks?: number;
  list: string;
  listColor: Category;
  done?: boolean;
}[] = [
  { heading: 'Investigar ideas de contenido', list: 'Trabajo', listColor: 'cyan' },
  { heading: 'Crear base de datos de autores invitados', list: 'Trabajo', listColor: 'cyan' },
  {
    heading: 'Renovar licencia de conducción',
    due: '22 oct',
    subtasks: 3,
    list: 'Personal',
    listColor: 'red',
  },
  { heading: 'Consultar al contador', list: 'Casa', listColor: 'green', subtasks: 3 },
  { heading: 'Imprimir tarjetas de presentación', list: 'Trabajo', listColor: 'cyan', done: true },
];
const CALENDARS: SelectOption[] = [
  { value: 'personal', label: 'Personal' },
  { value: 'trabajo', label: 'Trabajo' },
  { value: 'familia', label: 'Familia' },
];
const RANGES: SegmentedOption[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'sem', label: 'Esta semana' },
  { value: 'prox', label: 'Próxima semana' },
];
const VIEWS: SegmentedOption[] = [
  { value: 'dia', label: 'Día' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
  { value: 'anio', label: 'Año', disabled: true },
];
const DIALOG_CATEGORIES: SelectOption[] = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'estrategia', label: 'Estrategia' },
  { value: 'descubrimiento', label: 'Descubrimiento' },
  { value: 'desarrollo', label: 'Desarrollo' },
];
const WEEK_STARTS: SelectOption[] = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'domingo', label: 'Domingo' },
];
const HOUR_FORMATS: SegmentedOption[] = [
  { value: '24', label: '24 h' },
  { value: '12', label: '12 h' },
];
const PRIORITIES: SegmentedOption[] = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
];

@Component({
  selector: 'app-demo-page',
  imports: [
    Icon,
    Spinner,
    Badge,
    Avatar,
    AvatarGroup,
    Progress,
    Skeleton,
    SkeletonList,
    Button,
    ButtonLink,
    IconButton,
    Checkbox,
    Switch,
    SegmentedControl,
    TextField,
    TextareaField,
    SelectField,
    DateField,
    TimeField,
    NumberField,
    Card,
    CardActions,
    Alert,
    AlertAction,
    EmptyState,
    EmptyStateAction,
    Breadcrumb,
    Fab,
    Menu,
    DayPill,
    AgendaItem,
    TaskItem,
    EventCard,
    EventCardBadge,
    StatCard,
    SettingRow,
    SettingRowControl,
    WeekStrip,
    MiniCalendar,
    SidebarNav,
    BottomNav,
    AppBar,
    AppBarActions,
    Dialog,
    DialogFooter,
    SaveBar,
    DayView,
    WeekView,
    MonthView,
    EventForm,
    TaskForm,
    PlaceholderPage,
    FormField,
  ],
  templateUrl: './demo-page.html',
  styleUrl: './demo-page.css',
})
export class DemoPage {
  protected readonly sections = SECTIONS;
  protected readonly sizes = SIZES;
  protected readonly spinnerSizes = SIZES.filter((s) => s !== 'xl') as Exclude<Size, 'xl'>[];
  protected readonly buttonVariants = BUTTON_VARIANTS;
  protected readonly iconButtons = ICON_BUTTONS;
  protected readonly badgeTones = BADGE_TONES;
  protected readonly categories = CATEGORIES;
  protected readonly people = PEOPLE;
  protected readonly progressTones = ['brand', 'success', 'accent'] as const;
  protected readonly skeletonVariants: SkeletonListVariant[] = ['agenda', 'task', 'card'];
  protected readonly crumbs = CRUMBS;
  protected readonly crumbsBar = CRUMBS_BAR;
  protected readonly crumbsExternal = CRUMBS_EXTERNAL;
  protected readonly menuActions = MENU_ACTIONS;
  protected readonly menuView = MENU_VIEW;
  protected readonly weekDays = WEEK_DAYS;
  protected readonly selectedDay = signal(23);
  protected readonly agendaItems = AGENDA_ITEMS;
  protected readonly selectedAgendaItem = signal('09:30');
  protected readonly tasks = TASKS.map((task) => ({ ...task, done: signal(!!task.done) }));
  protected readonly calendars = CALENDARS;
  protected readonly ranges = RANGES;
  protected readonly views = VIEWS;
  protected readonly priorities = PRIORITIES;
  protected readonly eventTints = EVENT_TINTS;
  protected readonly eventSelected = signal(true);
  protected readonly cardClicks = signal(0);
  protected readonly stats = STATS;
  protected readonly statClicks = signal(0);
  protected readonly settingClicks = signal(0);
  protected readonly stripDays = STRIP_DAYS;
  protected readonly stripSelected = signal('2026-10-23');
  protected readonly calendarEvents = CALENDAR_EVENTS;
  protected readonly calendarForce = CALENDAR_FORCE;
  protected readonly calendarSelected = signal('2026-10-27');
  protected readonly isWeekend = isWeekend;
  protected readonly navActive = signal('Calendario');
  protected readonly taskOpened = signal('');
  protected readonly navItems = computed(() =>
    NAV_ITEMS.map((e) => ('label' in e ? { ...e, active: e.label === this.navActive() } : e)),
  );
  protected readonly navRail = NAV_RAIL;
  protected readonly appBarMenu = APP_BAR_MENU;
  protected readonly appBarBacks = signal(0);
  protected readonly bottomActive = signal('Hoy');
  protected readonly bottomItems = computed(() =>
    BOTTOM_ITEMS.map((item) => ({ ...item, active: item.label === this.bottomActive() })),
  );
  protected readonly bottomTasks = BOTTOM_ITEMS.map((item) => ({
    ...item,
    active: item.label === 'Tareas',
  }));
  protected readonly bottomStates = BOTTOM_STATES;
  protected readonly weekStarts = WEEK_STARTS;
  protected readonly hourFormats = HOUR_FORMATS;
  protected readonly alertVisible = signal(true);
  protected readonly dialogCategories = DIALOG_CATEGORIES;
  protected readonly sheetOpen = signal(true);
  protected readonly daySelected = signal('Lanzamiento de Bestbuy');
  protected readonly dayEvents = computed(() =>
    DAY_EVENTS.map((e) => ({ ...e, selected: e.title === this.daySelected() })),
  );
  protected readonly dayAllDay = DAY_ALL_DAY;
  protected readonly daySlot = signal('');
  protected readonly weekViewDays = WEEK_VIEW_DAYS;
  protected readonly weekAllDay = WEEK_ALL_DAY;
  protected readonly weekSelected = signal('Lanzamiento de Bestbuy');
  protected readonly weekSlot = signal('');
  protected readonly weekEvents = computed(() =>
    WEEK_EVENTS.map((e) => ({ ...e, selected: e.title === this.weekSelected() })),
  );
  protected readonly monthEvents = MONTH_EVENTS;
  // Mes visible como year * 12 + month, para que los botones crucen de año
  protected readonly monthView = signal(2026 * 12 + 9);
  protected readonly monthYear = computed(() => Math.floor(this.monthView() / 12));
  protected readonly monthTitle = computed(() =>
    capitalize(MONTH_YEAR.format(Date.UTC(this.monthYear(), this.monthView() % 12))),
  );
  protected readonly monthSelected = signal('2026-10-27');
  protected readonly monthAction = signal('');
  protected readonly editEvent = EDIT_EVENT;
  protected readonly formAction = signal('');
  protected readonly editTask = EDIT_TASK;
  protected readonly taskAction = signal('');
  protected readonly modalOpen = signal(false);
  protected readonly modalVariant = signal<'sheet' | 'full' | undefined>(undefined);

  protected openModal(variant?: 'sheet' | 'full'): void {
    this.modalVariant.set(variant);
    this.modalOpen.set(true);
  }

  protected readonly saveDirty = signal(true);
  protected readonly saveSaving = signal(false);
  protected readonly saveSaved = signal(false);

  // Mismo ciclo que el preview del DS: la barra oculta «Cambios guardados» y vuelve a dirty.
  protected save(): void {
    this.saveSaving.set(true);
    this.saveSaved.set(false);
    setTimeout(() => {
      this.saveSaving.set(false);
      this.saveSaved.set(true);
    }, 900);
  }

  protected discard(): void {
    this.saveDirty.set(false);
    setTimeout(() => this.saveDirty.set(true), 1200);
  }

  readonly model = signal<DemoModel>({
    name: '',
    mail: '',
    phone: '',
    dni: '',
    notes: '',
    calendar: '',
    date: '',
    time: '',
    guests: null,
    terms: false,
    notify: false,
    priority: 'media',
  });
  readonly demoForm = form(this.model, (path) => {
    required(path.name);
    required(path.mail);
    email(path.mail);
    required(path.phone);
    phone(path.phone);
    required(path.dni);
    dniNie(path.dni);
    required(path.notes);
    required(path.calendar);
    required(path.date);
    required(path.time);
    required(path.guests);
    min(path.guests, 1);
    max(path.guests, 20);
    required(path.terms);
    required(path.notify);
  });
  protected readonly fieldError = fieldError;
}
