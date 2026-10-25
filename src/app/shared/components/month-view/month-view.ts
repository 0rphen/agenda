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
import { capitalize, localIso, LONG_DATE, WEEKDAYS, WEEKDAYS_SHORT } from '@shared/utils';

@Component({
  selector: 'app-month-view',
  templateUrl: './month-view.html',
  host: {
    class: 'month-view',
    role: 'region',
    '[attr.aria-label]': 'label()',
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
  readonly selected = model<string>();
  readonly eventSelected = output<MonthViewEvent>();
  readonly moreSelected = output<string>();

  protected readonly dows = WEEKDAYS.map((long, i) => ({ long, short: WEEKDAYS_SHORT[i] }));

  protected readonly days = computed<MonthViewDay[]>(() => {
    const year = this.year();
    const month = this.month();
    const max = this.maxPerDay();
    const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
    const byDay = new Map<string, MonthViewEvent[]>();
    for (const event of this.events())
      byDay.set(event.day, [...(byDay.get(event.day) ?? []), event]);
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(Date.UTC(year, month, 1 - offset + i));
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

  protected select(iso: string): void {
    this.selected.set(iso);
    this.focused.set(iso);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[event.key];
    if (!step || !(event.target as HTMLElement).classList.contains('month-view__num')) return;
    event.preventDefault();
    const days = this.days();
    const target = days[days.findIndex((day) => day.iso === this.focusIso()) + step];
    if (!target) return;
    this.focused.set(target.iso);
    this.keyboardMove = true;
  }
}
