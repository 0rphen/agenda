import { Component, signal } from '@angular/core';
import { email, form, FormField, max, min, required } from '@angular/forms/signals';
import { Alert, AlertAction } from '../shared/alert/alert';
import { Breadcrumb, BreadcrumbItem } from '../shared/breadcrumb/breadcrumb';
import { Fab } from '../shared/fab/fab';
import { Menu, MenuEntry } from '../shared/menu/menu';
import { DayPill } from '../shared/day-pill/day-pill';
import { AgendaItem } from '../shared/agenda-item/agenda-item';
import { TaskItem } from '../shared/task-item/task-item';
import { Avatar } from '../shared/avatar/avatar';
import { AvatarGroup, AvatarPerson } from '../shared/avatar/avatar-group';
import { Badge } from '../shared/badge/badge';
import { Button, ButtonVariant } from '../shared/button/button';
import { Card, CardActions } from '../shared/card/card';
import { Checkbox } from '../shared/checkbox/checkbox';
import { Switch } from '../shared/switch/switch';
import { SegmentedControl, SegmentedOption } from '../shared/segmented-control/segmented-control';
import { EmptyState, EmptyStateAction } from '../shared/empty-state/empty-state';
import { DateField } from '../shared/date-field/date-field';
import { NumberField } from '../shared/number-field/number-field';
import { SelectField, SelectOption } from '../shared/select/select';
import { TextareaField } from '../shared/textarea/textarea';
import { TextField } from '../shared/text-field/text-field';
import { TimeField } from '../shared/time-field/time-field';
import { ButtonLink } from '../shared/button-link/button-link';
import { Icon } from '../shared/icon/icon';
import { IconButton, IconButtonVariant } from '../shared/icon-button/icon-button';
import { Progress } from '../shared/progress/progress';
import { Skeleton } from '../shared/skeleton/skeleton';
import { SkeletonList, SkeletonListVariant } from '../shared/skeleton/skeleton-list';
import { Spinner } from '../shared/spinner/spinner';
import { Category, Size, Tone } from '../shared/types/ui';
import { fieldError } from '../shared/validation/field-error';
import { dniNie, phone } from '../shared/validation/validators';

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
  { heading: 'Consultar al contador', list: 'Lista 1', listColor: 'mustard', subtasks: 3 },
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
  protected readonly cardClicks = signal(0);
  protected readonly alertVisible = signal(true);

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
