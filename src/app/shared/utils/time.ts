import { TimeFormat } from '@shared/types';
import { capitalize } from './text';

export const pad2 = (n: number) => String(n).padStart(2, '0');
export const toMin = (t: string) => {
  const [h, m] = t.split(':');
  return +h * 60 + +m;
};

export function localIso(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function addDays(iso: string, n: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + n)).toISOString().slice(0, 10);
}

/** Same day `n` months later; clamps to the last day when the target month is shorter. */
export function addMonths(iso: string, n: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, month + n, 0)).getUTCDate();
  return new Date(Date.UTC(year, month - 1 + n, Math.min(day, lastDay))).toISOString().slice(0, 10);
}

/** `YYYY-MM-DD` of a real date: the UTC round trip rejects overflow like `2026-02-30`. */
export function isIsoDay(value: string | null | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && addDays(value, 0) === value;
}

/** Monday (`firstDay` 1) or Sunday (0) of the week containing `iso`. */
export function weekStart(iso: string, firstDay: 0 | 1 = 1): string {
  return addDays(iso, -((new Date(`${iso}T00:00:00Z`).getUTCDay() + 7 - firstDay) % 7));
}

/** `HH:mm` as shown to the user: unchanged in 24 h, `8:30 AM` in 12 h. */
export function formatTime(hhmm: string, format: TimeFormat): string {
  if (format === '24 h') return hhmm;
  const [h, m] = hhmm.split(':');
  return `${+h % 12 || 12}:${m} ${+h < 12 ? 'AM' : 'PM'}`;
}

// UTC so server and browser render the same dates regardless of their time zone
export const MONTH_YEAR = new Intl.DateTimeFormat('es-ES', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
export const LONG_DATE = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
export const LONG_DAY = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

export const SHORT_DAY = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

export const WEEKDAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
export const WEEKDAYS_SHORT = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

/** «lun» … «dom» of `iso`. */
export const weekdayShort = (iso: string) =>
  WEEKDAYS_SHORT[(new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7];

const MONTH = new Intl.DateTimeFormat('es-ES', { month: 'long', timeZone: 'UTC' });

/** ISO 8601 week number: the week belongs to the year of its Thursday. */
export function isoWeek(iso: string): number {
  const thursday = addDays(weekStart(iso), 3);
  const jan1 = Date.UTC(+thursday.slice(0, 4), 0, 1);
  return Math.floor((Date.parse(thursday) - jan1) / 86_400_000 / 7) + 1;
}

/** «19 – 25 de octubre, 2026»; repeats month/year only when the week crosses them. */
export function weekRangeLabel(start: string): string {
  const end = addDays(start, 6);
  const parts = (iso: string) => {
    const date = new Date(`${iso}T00:00:00Z`);
    return { d: date.getUTCDate(), m: MONTH.format(date), y: date.getUTCFullYear() };
  };
  const a = parts(start);
  const b = parts(end);
  if (a.y !== b.y) return `${a.d} de ${a.m}, ${a.y} – ${b.d} de ${b.m}, ${b.y}`;
  if (a.m !== b.m) return `${a.d} de ${a.m} – ${b.d} de ${b.m}, ${b.y}`;
  return `${a.d} – ${b.d} de ${b.m}, ${b.y}`;
}

/** End of a one-hour slot starting at `HH:00`; the last slot stops at 23:59. */
export function slotEnd(hour: string): string {
  const next = +hour.slice(0, 2) + 1;
  return next === 24 ? '23:59' : `${pad2(next)}:00`;
}

/** `hhmm` plus `minutes`, capped at `23:59` so the event stays on its day. */
export function addMinutes(hhmm: string, minutes: number): string {
  const total = Math.min(toMin(hhmm) + minutes, 23 * 60 + 59);
  return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
}

/** «Jueves 22 de octubre». */
export const dayTitle = (iso: string) =>
  capitalize(LONG_DAY.format(new Date(`${iso}T00:00:00Z`)).replace(',', ''));

/** «Octubre 2026». */
export const monthTitle = (iso: string) =>
  capitalize(MONTH_YEAR.format(new Date(`${iso}T00:00:00Z`)).replace(' de ', ' '));
