import { Component, ElementRef, inject, input, linkedSignal, model } from '@angular/core';
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
    '(keydown)': 'onKeydown($event)',
  },
})
export class WeekStrip {
  readonly days = input.required<WeekDay[]>();
  readonly label = input('Días de la semana');
  readonly selected = model<string>();

  // Roving tabindex: the only pill reachable with Tab
  protected readonly focused = linkedSignal(
    () => this.selected() ?? this.days().find((d) => d.today)?.iso ?? this.days()[0]?.iso,
  );

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;

  protected dayLabel(day: WeekDay): string {
    const date = LONG_DAY.format(new Date(`${day.iso}T00:00:00Z`)).replace(',', '');
    const parts = [capitalize(date)];
    if (day.today) parts.push('hoy');
    if (day.hasEvents) parts.push('con eventos');
    return parts.join(', ');
  }

  protected onKeydown(event: KeyboardEvent): void {
    const pills = [...this.host.querySelectorAll<HTMLButtonElement>('button.day-pill')];
    const items = pills.filter((pill) => !pill.disabled);
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const n = items.length;
    if (i < 0) return;
    const target = {
      ArrowRight: items[Math.min(i + 1, n - 1)],
      ArrowLeft: items[Math.max(i - 1, 0)],
      Home: items[0],
      End: items[n - 1],
    }[event.key];
    if (!target) return;
    event.preventDefault();
    target.focus();
    this.focused.set(this.days()[pills.indexOf(target)].iso);
  }
}
