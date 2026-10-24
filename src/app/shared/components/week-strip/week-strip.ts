import { Component, input, model } from '@angular/core';
import { DayPill } from '@shared/components/day-pill/day-pill';
import { WeekDay } from '@shared/interfaces';
import { capitalize, LONG_DAY } from '@shared/utils';

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
    const date = LONG_DAY.format(new Date(`${day.iso}T00:00:00Z`)).replace(',', '');
    const parts = [capitalize(date)];
    if (day.today) parts.push('hoy');
    if (day.hasEvents) parts.push('con eventos');
    return parts.join(', ');
  }
}
