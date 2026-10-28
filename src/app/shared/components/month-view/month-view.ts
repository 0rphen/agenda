import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  output,
} from '@angular/core';
import { MonthViewDay, MonthViewEvent } from '@shared/interfaces';
import { TimeFormat } from '@shared/types';
import {
  capitalize,
  formatTime,
  localIso,
  LONG_DATE,
  WEEKDAYS,
  WEEKDAYS_SHORT,
} from '@shared/utils';

@Component({
  selector: 'app-month-view',
  templateUrl: './month-view.html',
  host: {
    class: 'month-view',
    role: 'region',
    '[attr.aria-label]': 'label()',
    '[attr.data-weekdays-only]': 'showWeekends() ? null : ""',
    '(keydown)': 'onKeydown($event)',
  },
})
export class MonthView {
  readonly year = input.required<number>();
  readonly month = input.required<number>();
  readonly today = input(localIso(new Date()));
  readonly events = input<MonthViewEvent[]>([]);
  readonly maxPerDay = input(3);
  readonly label = input('Mes');
  /** First column: 1 Monday, 0 Sunday. */
  readonly firstDay = input<0 | 1>(1);
  /** `false`: Monday to Friday only, 5 columns. */
  readonly showWeekends = input(true);
  readonly timeFormat = input<TimeFormat>('24 h');
  readonly selected = model<string>();
  readonly eventSelected = output<MonthViewEvent>();
  readonly moreSelected = output<string>();

  // Monday-first list rotated to firstDay; weekdays-only keeps Monday to Friday
  protected readonly dows = computed(() => {
    const dows = WEEKDAYS.map((long, i) => ({ long, short: WEEKDAYS_SHORT[i] }));
    if (!this.showWeekends()) return dows.slice(0, 5);
    return this.firstDay() ? dows : [dows[6], ...dows.slice(0, 6)];
  });

  protected readonly days = computed<MonthViewDay[]>(() => {
    const year = this.year();
    const month = this.month();
    const max = this.maxPerDay();
    const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 7 - this.firstDay()) % 7;
    const weekends = this.showWeekends();
    const byDay = new Map<string, MonthViewEvent[]>();
    for (const event of this.events())
      byDay.set(event.day, [...(byDay.get(event.day) ?? []), event]);
    const days = Array.from({ length: 42 }, (_, i) => new Date(Date.UTC(year, month, 1 - offset + i)))
      .filter((date) => weekends || date.getUTCDay() % 6 !== 0)
      .map((date) => {
        const iso = date.toISOString().slice(0, 10);
        const events = byDay.get(iso) ?? [];
        return {
          iso,
          num: date.getUTCDate(),
          out: date.getUTCMonth() !== month,
          today: iso === this.today(),
          label: capitalize(LONG_DATE.format(date).replace(',', '')),
          events: events.slice(0, max),
          more: Math.max(0, events.length - max),
        };
      });
    if (weekends) return days;
    // Weekdays only: a month starting or ending on a weekend leaves weeks with no day of its own
    return days.filter((_, i) => days.slice(i - (i % 5), i - (i % 5) + 5).some((day) => !day.out));
  });

  // Roving tabindex: selected, else today, else day 1, unless the arrows moved it
  private readonly focused = linkedSignal(() => this.selected());
  protected readonly focusIso = computed(() => {
    const days = this.days();
    const inGrid = (iso?: string) => days.some((day) => day.iso === iso);
    return [this.focused(), this.today()].find(inGrid) ?? days.find((day) => !day.out)!.iso;
  });

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private keyboardMove = false;

  constructor() {
    afterRenderEffect(() => {
      this.focusIso();
      if (!this.keyboardMove) return;
      this.keyboardMove = false;
      this.host.querySelector<HTMLButtonElement>('.month-view__num[tabindex="0"]')?.focus();
    });
  }

  protected numLabel(day: MonthViewDay): string {
    const count = day.events.length + day.more;
    const events = count ? `, ${count} ${count === 1 ? 'evento' : 'eventos'}` : '';
    return `${day.label}${day.today ? ', hoy' : ''}${events}`;
  }

  protected chipText(event: MonthViewEvent): string {
    return `${event.start ? formatTime(event.start, this.timeFormat()) + ' ' : ''}${event.title}`;
  }

  protected select(iso: string): void {
    this.selected.set(iso);
    this.focused.set(iso);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const week = this.dows().length;
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: week, ArrowUp: -week }[event.key];
    if (!step || !(event.target as HTMLElement).classList.contains('month-view__num')) return;
    event.preventDefault();
    const days = this.days();
    const target = days[days.findIndex((day) => day.iso === this.focusIso()) + step];
    if (!target) return;
    this.focused.set(target.iso);
    this.keyboardMove = true;
  }
}
