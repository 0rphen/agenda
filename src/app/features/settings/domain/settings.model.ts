export type SettingsSection =
  'perfil' | 'seguridad' | 'calendario' | 'notificaciones' | 'apariencia';

export type SettingsStatus = 'idle' | 'loading' | 'ready' | 'error';

export type NotificationStatus = NotificationPermission | 'unsupported';

export interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    timeZone: string;
    language: string;
    /** dataURL de la foto; vacío muestra las iniciales. */
    photo: string;
  };
  security: { twoFactor: boolean };
  calendar: {
    defaultView: string;
    weekStart: string;
    timeFormat: string;
    showWeekends: boolean;
    showCancelled: boolean;
    workStart: string;
    workEnd: string;
    defaultDuration: string;
    videoLink: boolean;
  };
  notifications: {
    eventReminder: string;
    dueTasks: boolean;
    dailySummary: boolean;
    browser: boolean;
    email: boolean;
    mobile: boolean;
  };
  appearance: { density: string; textSize: string; reduceMotion: boolean };
}
