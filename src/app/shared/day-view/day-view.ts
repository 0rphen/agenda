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
import { Badge } from '../badge/badge';
import { Icon } from '../icon/icon';
import { Category, Tint } from '../types/ui';

export interface DayViewEvent {
  start: string;
  end: string;
  title: string;
  tint?: Tint;
  category?: string;
  location?: string;
  locationIcon?: string;
  people?: string[];
  selected?: boolean;
  cancelled?: boolean;
  state?: 'hover' | 'focus';
}

export interface DayViewAllDay {
  title: string;
  category?: Category;
}

interface Placed {
  event: DayViewEvent;
  start: number;
  end: number;
  lane: number;
  lanes: number;
}

const pad2 = (n: number) => String(n).padStart(2, '0');
const toMin = (t: string) => {
  const [h, m] = t.split(':');
  return +h * 60 + +m;
};

// Port of the DS dayLanes: overlapping events form a cluster and share its lane count
function dayLanes(events: DayViewEvent[]): Placed[] {
  const list = events
    .map((event) => ({
      event,
      start: toMin(event.start),
      end: toMin(event.end),
      lane: 0,
      lanes: 1,
    }))
    .sort((a, b) => a.start - b.start || b.end - a.end);
  let cluster: Placed[] = [];
  let laneEnds: number[] = [];
  let end = -1;
  const close = () => {
    cluster.forEach((x) => (x.lanes = laneEnds.length || 1));
    cluster = [];
    laneEnds = [];
  };
  for (const x of list) {
    if (cluster.length && x.start >= end) {
      close();
      end = -1;
    }
    let lane = 0;
    while (laneEnds[lane] !== undefined && laneEnds[lane] > x.start) lane++;
    laneEnds[lane] = x.end;
    x.lane = lane;
    end = Math.max(end, x.end);
    cluster.push(x);
  }
  close();
  return list;
}

@Component({
  selector: 'app-day-view',
  imports: [Badge, Icon],
  templateUrl: './day-view.html',
  host: {
    class: 'day-view',
    role: 'region',
    '[attr.aria-label]': 'heading()',
    '[style.--visible-hours]': 'visibleHours()',
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
  readonly slotState = input<number>();

  readonly eventSelected = output<DayViewEvent>();
  readonly slotClicked = output<string>();

  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body');

  constructor() {
    // Browser only: open the scroll window at scrollToHour
    afterNextRender(() => {
      const body = this.body().nativeElement;
      const row = body.querySelector<HTMLElement>('.day-view__slot')?.offsetHeight ?? 0;
      body.scrollTop = (this.scrollToHour() - this.startHour()) * row;
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

  protected offset(minutes: number): number {
    return (minutes - this.startHour() * 60) / 60;
  }
}
