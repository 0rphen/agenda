import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Badge } from '@shared/components/badge/badge';
import { Icon } from '@shared/components/icon/icon';
import { DayViewAllDay, DayViewEvent } from '@shared/interfaces';
import { TimeFormat } from '@shared/types';
import { dayLanes, formatTime, pad2, toMin } from '@shared/utils';

@Component({
  selector: 'app-day-view',
  imports: [Badge, Icon],
  templateUrl: './day-view.html',
  host: {
    class: 'day-view',
    role: 'region',
    '[attr.aria-label]': 'heading()',
    '[style.--visible]': 'visibleHours()',
  },
})
export class DayView {
  readonly heading = input.required<string>();
  readonly today = input(false, { transform: booleanAttribute });
  readonly events = input<DayViewEvent[]>([]);
  readonly allDay = input<DayViewAllDay[]>([]);
  readonly startHour = input(0);
  readonly endHour = input(24);
  readonly visibleHours = input(10);
  readonly scrollToHour = input(8);
  readonly now = input<string>();
  readonly timeFormat = input<TimeFormat>('24 h');
  /** «Horario laboral» `HH:MM`: with both, hours outside it are shaded. */
  readonly workStart = input<string>();
  readonly workEnd = input<string>();

  readonly eventSelected = output<DayViewEvent>();
  readonly slotClicked = output<string>();

  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body');

  constructor() {
    // Browser only: open the scroll window one hour before now, or at scrollToHour without now
    afterNextRender(() => {
      const body = this.body().nativeElement;
      const row = body.querySelector<HTMLElement>('.day-view__slot')?.offsetHeight ?? 0;
      const now = this.nowAt();
      const top = now === null ? this.scrollToHour() - this.startHour() : Math.floor(now) - 1;
      body.scrollTop = Math.max(0, top) * row;
    });
  }

  protected readonly hours = computed(() => {
    const hours: string[] = [];
    for (let h = this.startHour(); h < this.endHour(); h++) hours.push(pad2(h));
    return hours;
  });
  protected readonly placed = computed(() => dayLanes(this.events()));
  protected readonly nowAt = computed(() => {
    const now = this.now();
    return now ? (toMin(now) - this.startHour() * 60) / 60 : null;
  });

  /** Shaded spans in hours from the top of the grid; empty without `workStart`/`workEnd`. */
  protected readonly offHours = computed(() => {
    const start = this.workStart();
    const end = this.workEnd();
    if (!start || !end) return [];
    const rows = this.endHour() - this.startHour();
    const before = this.offset(toMin(start));
    const after = this.offset(toMin(end));
    return [
      { start: 0, span: before },
      { start: after, span: rows - after },
    ].filter((off) => off.span > 0);
  });

  protected time(hhmm: string): string {
    return formatTime(hhmm, this.timeFormat());
  }

  protected offset(minutes: number): number {
    return (minutes - this.startHour() * 60) / 60;
  }
}
