import { Injectable, computed, linkedSignal } from '@angular/core';
import { DayViewAllDay, DayViewEvent } from '@shared/interfaces';
import { CalendarFacade } from './calendar.facade';

@Injectable()
export class CalendarDayFacade extends CalendarFacade {
  readonly isToday = computed(() => this.day() === this.today());
  readonly now = computed(() => (this.isToday() ? this.nowState() : undefined));

  private readonly selectedEventIdState = linkedSignal<string, string | undefined>({
    source: this.day,
    computation: () => undefined,
  });
  readonly selectedEventId = this.selectedEventIdState.asReadonly();

  private readonly events = computed(() =>
    this.store.events().filter((event) => event.date === this.day()),
  );

  readonly dayEvents = computed<DayViewEvent[]>(() =>
    this.events()
      .filter((event) => event.start)
      .map((event) => ({
        id: event.id,
        start: event.start!,
        // shortcut: an event without end paints as zero length, until the form requires it
        end: event.end ?? event.start!,
        title: event.title,
        tint: event.tint,
        category: event.categoryLabel,
        location: event.location,
        people: event.people,
        selected: event.id === this.selectedEventId(),
      })),
  );

  readonly allDayEvents = computed<DayViewAllDay[]>(() =>
    this.events()
      .filter((event) => !event.start)
      .map((event) => ({ title: event.title, category: event.category })),
  );

  readonly dayTasks = this.tasksBetween(this.day, this.day);

  readonly pendingCount = computed(() => this.dayTasks().filter((task) => !task.done).length);

  selectEvent(id: string): void {
    this.selectedEventIdState.set(id);
    this.editEvent(id);
  }

  /** `hour` is `HH:00`; the last slot ends at 23:59 to stay within the day. */
  openSlot(hour: string): void {
    this.dialogs.openNewEvent({ date: this.day(), start: hour });
  }
}
