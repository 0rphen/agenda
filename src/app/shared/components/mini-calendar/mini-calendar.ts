import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
} from '@angular/core';
import { IconButton } from '@shared/components/icon-button/icon-button';
import { CalendarDay } from '@shared/interfaces';
import { addDays, capitalize, localIso, LONG_DATE, MONTH_YEAR, pad2 } from '@shared/utils';

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
  readonly selected = model<string>();
  /** First column: 1 Monday, 0 Sunday. */
  readonly firstDay = input<0 | 1>(1);

  protected readonly dows = computed(() =>
    this.firstDay() ? ['L', 'M', 'X', 'J', 'V', 'S', 'D'] : ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  );
  protected readonly current = computed(() => this.selected() ?? this.today());

  // Visible month as year * 12 + month; follows the selection, arrows move it
  private readonly view = linkedSignal(() => {
    const [year, month] = this.current().split('-').map(Number);
    return year * 12 + month - 1;
  });

  protected readonly title = computed(() =>
    capitalize(MONTH_YEAR.format(Date.UTC(Math.floor(this.view() / 12), this.view() % 12, 1))),
  );

  protected readonly days = computed<CalendarDay[]>(() => {
    const year = Math.floor(this.view() / 12);
    const month = this.view() % 12;
    const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 7 - this.firstDay()) % 7;
    const events = this.events();
    const isDisabled = this.isDisabled();
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(Date.UTC(year, month, 1 - offset + i));
      const iso = date.toISOString().slice(0, 10);
      const today = iso === this.today();
      const hasEvents = events.includes(iso);
      const label = [capitalize(LONG_DATE.format(date).replace(',', ''))];
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

  // Roving tabindex: the only day reachable with Tab, kept inside the visible month
  private readonly focused = linkedSignal(() => this.current());
  protected readonly focusIso = computed(() => {
    const month = this.days().filter((day) => !day.out && !day.disabled);
    return (month.find((day) => day.iso === this.focused()) ?? month[0])?.iso;
  });

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private keyboardMove = false;

  constructor() {
    // The target button may only exist after the month re-renders
    afterRenderEffect(() => {
      this.focusIso();
      if (!this.keyboardMove) return;
      this.keyboardMove = false;
      this.host.querySelector<HTMLButtonElement>('.calendar__day[tabindex="0"]')?.focus();
    });
  }

  protected select(iso: string): void {
    this.selected.set(iso);
    this.focused.set(iso);
  }

  protected go(delta: number): void {
    const view = this.view() + delta;
    const year = Math.floor(view / 12);
    const month = view % 12;
    const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const day = Math.min(Number(this.focused().slice(8)), last);
    this.view.set(view);
    this.focused.set(`${year}-${pad2(month + 1)}-${pad2(day)}`);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[event.key];
    const from = this.focusIso();
    if (!step || !from) return;
    event.preventDefault();
    const isDisabled = this.isDisabled();
    let iso = from;
    // Cap the skip so a fully disabled range leaves the focus where it was
    for (let i = 0; i < 42; i++) {
      iso = addDays(iso, step);
      if (isDisabled?.(iso)) continue;
      const [year, month] = iso.split('-').map(Number);
      this.view.set(year * 12 + month - 1);
      this.focused.set(iso);
      this.keyboardMove = true;
      return;
    }
  }
}
