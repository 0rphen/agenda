import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Badge } from '@shared/components/badge/badge';
import { Icon } from '@shared/components/icon/icon';
import { Placed, WeekDay, WeekViewAllDay, WeekViewEvent, WeekViewSlot } from '@shared/interfaces';
import { dayLanes, pad2, toMin } from '@shared/utils';

@Component({
  selector: 'app-week-view',
  imports: [Badge, Icon],
  templateUrl: './week-view.html',
  host: {
    class: 'week-view',
    role: 'region',
    '[attr.aria-label]': 'label()',
    '[style.--hours]': 'endHour() - startHour()',
    '[style.--visible-hours]': 'visibleHours()',
  },
})
export class WeekView {
  readonly days = input.required<WeekDay[]>();
  readonly events = input<WeekViewEvent[]>([]);
  readonly allDay = input<WeekViewAllDay[]>([]);
  readonly label = input('Semana');
  readonly startHour = input(0);
  readonly endHour = input(24);
  readonly visibleHours = input(10);
  readonly scrollToHour = input(8);
  readonly now = input<string>();

  readonly eventSelected = output<WeekViewEvent>();
  readonly slotClicked = output<WeekViewSlot>();

  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body');

  constructor() {
    // Browser only: open the scroll window one hour before now (if today is shown), or at scrollToHour
    afterNextRender(() => {
      const body = this.body().nativeElement;
      const row = body.querySelector<HTMLElement>('.week-view__time')?.offsetHeight ?? 0;
      const now = this.days().some((d) => d.today) ? this.nowAt() : null;
      const top = now === null ? this.scrollToHour() - this.startHour() : Math.floor(now) - 1;
      body.scrollTop = Math.max(0, top) * row;
    });
  }

  protected readonly hours = computed(() => {
    const hours: string[] = [];
    for (let h = this.startHour(); h < this.endHour(); h++) hours.push(pad2(h));
    return hours;
  });
  protected readonly byDay = computed(() => {
    const map = new Map<string, WeekViewEvent[]>();
    for (const e of this.events()) map.set(e.day, [...(map.get(e.day) ?? []), e]);
    return new Map<string, Placed<WeekViewEvent>[]>(
      [...map].map(([day, events]) => [day, dayLanes(events)]),
    );
  });
  protected readonly allDayByDay = computed(() => {
    const map = new Map<string, WeekViewAllDay[]>();
    for (const e of this.allDay()) map.set(e.day, [...(map.get(e.day) ?? []), e]);
    return map;
  });
  protected readonly nowAt = computed(() => {
    const now = this.now();
    return now ? (toMin(now) - this.startHour() * 60) / 60 : null;
  });

  protected offset(minutes: number): number {
    return (minutes - this.startHour() * 60) / 60;
  }
}
