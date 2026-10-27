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

/** `YYYY-MM-DD` of a real date: the UTC round trip rejects overflow like `2026-02-30`. */
export function isIsoDay(value: string | null | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && addDays(value, 0) === value;
}

/** Monday of the week containing `iso`. */
export function weekStart(iso: string): string {
  return addDays(iso, -((new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7));
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
