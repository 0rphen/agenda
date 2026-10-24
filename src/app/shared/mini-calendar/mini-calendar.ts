import { Component, computed, input, linkedSignal, model } from '@angular/core';
import { IconButton } from '../icon-button/icon-button';

export type MiniCalendarForcedState = 'hover' | 'active' | 'focus';

interface CalendarDay {
  iso: string;
  num: number;
  out: boolean;
  today: boolean;
  events: boolean;
  disabled: boolean;
  label: string;
}

// UTC so server and browser render the same dates regardless of their time zone
const TITLE = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const DATE = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function localIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

@Component({
  selector: 'app-mini-calendar',
  imports: [IconButton],
  templateUrl: './mini-calendar.html',
  host: { class: 'calendar' },
})
export class MiniCalendar {
  readonly today = input(localIso(new Date()));
  readonly events = input<string[]>([]);
  readonly isDisabled = input<(iso: string) => boolean>();
  readonly forceState = input<Record<string, MiniCalendarForcedState>>();
  readonly selected = model<string>();

  protected readonly dows = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  protected readonly current = computed(() => this.selected() ?? this.today());

  // Visible month as year * 12 + month; follows the selection, arrows move it
  private readonly view = linkedSignal(() => {
    const [year, month] = this.current().split('-').map(Number);
    return year * 12 + month - 1;
  });

  protected readonly title = computed(() =>
    capitalize(TITLE.format(Date.UTC(Math.floor(this.view() / 12), this.view() % 12, 1))),
  );

  protected readonly days = computed<CalendarDay[]>(() => {
    const year = Math.floor(this.view() / 12);
    const month = this.view() % 12;
    const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
    const events = this.events();
    const isDisabled = this.isDisabled();
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(Date.UTC(year, month, 1 - offset + i));
      const iso = date.toISOString().slice(0, 10);
      const today = iso === this.today();
      const hasEvents = events.includes(iso);
      const label = [capitalize(DATE.format(date).replace(',', ''))];
      if (today) label.push('hoy');
      if (hasEvents) label.push('con eventos');
      return {
        iso,
        num: date.getUTCDate(),
        out: date.getUTCMonth() !== month,
        today,
        events: hasEvents,
        disabled: !!isDisabled?.(iso),
        label: label.join(', '),
      };
    });
  });

  protected go(delta: number): void {
    this.view.update((view) => view + delta);
  }
}
