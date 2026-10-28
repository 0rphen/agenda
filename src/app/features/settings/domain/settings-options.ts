import { SegmentedOption, SelectOption } from '@shared/interfaces';
import { SidebarNavEntry } from '@shared/types';
import { SettingsSection, UserSettings } from './settings.model';

const options = (...labels: string[]): SelectOption[] =>
  labels.map((label) => ({ value: label, label }));

export const SETTINGS_EMAIL = 'hohner.rojas@gmail.com';

export const SETTINGS_DEFAULTS: UserSettings = {
  profile: {
    firstName: 'César',
    lastName: 'Hohner',
    timeZone: 'GMT-5 · Bogotá',
    language: 'Español',
    photo: '',
  },
  security: { twoFactor: true },
  calendar: {
    defaultView: 'Semana',
    weekStart: 'Lunes',
    timeFormat: '24 h',
    showWeekends: true,
    showCancelled: false,
    workStart: '08:00',
    workEnd: '18:00',
    defaultDuration: '30 min',
    videoLink: true,
  },
  notifications: {
    eventReminder: '15 min antes',
    dueTasks: true,
    dailySummary: true,
    browser: false,
    email: true,
    mobile: true,
  },
  appearance: { density: 'Cómoda', textSize: 'Normal', reduceMotion: false },
};

export const SETTINGS_TITLES: Record<SettingsSection, string> = {
  perfil: 'Perfil',
  seguridad: 'Seguridad',
  calendario: 'Calendario',
  notificaciones: 'Notificaciones',
  apariencia: 'Apariencia',
};

export const SETTINGS_NAV: SidebarNavEntry[] = [
  { section: 'Cuenta' },
  { icon: 'person_outline', label: 'Perfil' },
  { icon: 'lock_outline', label: 'Seguridad' },
  { section: 'Preferencias' },
  { icon: 'calendar_month', label: 'Calendario' },
  { icon: 'notifications_none', label: 'Notificaciones' },
  { icon: 'tune', label: 'Apariencia' },
  { section: 'Soporte' },
  { icon: 'help_outline', label: 'Ayuda y contacto', disabled: true },
];

export const TIME_ZONES = options(
  'GMT-5 · Bogotá',
  'GMT-6 · Ciudad de México',
  'GMT-3 · Buenos Aires',
  'GMT+1 · Madrid',
);
export const LANGUAGES = options('Español', 'English', 'Português');
export const WEEK_STARTS = options('Lunes', 'Domingo');
export const DURATIONS = options('15 min', '30 min', '45 min', '1 hora');
/** Minutes of a `DURATIONS` label: «1 hora» → 60, «30 min» → 30. */
export const durationMinutes = (duration: string) =>
  duration === '1 hora' ? 60 : parseInt(duration, 10);

export const REMINDERS = options(
  'Sin recordatorio',
  '5 min antes',
  '15 min antes',
  '1 hora antes',
  '1 día antes',
);
export const DEFAULT_VIEWS: SegmentedOption[] = options('Día', 'Semana', 'Mes');
export const TIME_FORMATS: SegmentedOption[] = options('24 h', '12 h');
export const DENSITIES: SegmentedOption[] = options('Cómoda', 'Compacta');
export const TEXT_SIZES: SegmentedOption[] = options('Normal', 'Grande');
