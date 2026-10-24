import { Component, input, model } from '@angular/core';
import { DayPill } from '../day-pill/day-pill';

export interface WeekDay {
  iso: string;
  dow: string;
  num: number;
  today?: boolean;
  hasEvents?: boolean;
}

// UTC so server and browser render the same label regardless of their time zone
const DATE = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

@Component({
  selector: 'app-week-strip',
  imports: [DayPill],
  templateUrl: './week-strip.html',
  host: {
    class: 'week-strip',
    role: 'group',
    '[attr.aria-label]': 'label()',
  },
})
export class WeekStrip {
  readonly days = input.required<WeekDay[]>();
  readonly label = input('Días de la semana');
  readonly selected = model<string>();

  protected dayLabel(day: WeekDay): string {
    const date = DATE.format(new Date(`${day.iso}T00:00:00Z`)).replace(',', '');
    const parts = [date.charAt(0).toUpperCase() + date.slice(1)];
    if (day.today) parts.push('hoy');
    if (day.hasEvents) parts.push('con eventos');
    return parts.join(', ');
  }
}
