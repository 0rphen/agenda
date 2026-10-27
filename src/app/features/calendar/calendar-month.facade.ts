import { Injectable, computed } from '@angular/core';
import { MonthViewEvent } from '@shared/interfaces';
import { addDays, weekStart } from '@shared/utils';
import { CalendarFacade } from './calendar.facade';

@Injectable()
export class CalendarMonthFacade extends CalendarFacade {
  readonly year = computed(() => +this.day().slice(0, 4));
  /** 0–11, as `MonthView` expects. */
  readonly month = computed(() => +this.day().slice(5, 7) - 1);

  // The 42 cells of the MonthView grid: Monday of the week of day 1, plus 41 days.
  private readonly gridStart = computed(() => weekStart(`${this.day().slice(0, 7)}-01`));
  private readonly gridEnd = computed(() => addDays(this.gridStart(), 41));

  readonly monthEvents = computed<MonthViewEvent[]>(() =>
    this.store
      .events()
      .filter((event) => event.date >= this.gridStart() && event.date <= this.gridEnd())
      // All-day events ('' start) first, then by start time within each day.
      .sort((a, b) => a.date.localeCompare(b.date) || (a.start ?? '').localeCompare(b.start ?? ''))
      .map((event) => ({
        day: event.date,
        title: event.title,
        start: event.start,
        category: event.category,
      })),
  );

  /** Events of the selected day: all-day ('' start) first, then by start time. */
  readonly dayEvents = computed(() =>
    this.store
      .events()
      .filter((event) => event.date === this.day())
      .sort((a, b) => (a.start ?? '').localeCompare(b.start ?? '')),
  );

  readonly dayTasks = this.tasksBetween(this.day, this.day);

  readonly pendingCount = computed(() => this.dayTasks().filter((task) => !task.done).length);
}
