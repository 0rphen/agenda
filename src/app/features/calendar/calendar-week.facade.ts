import { Injectable, computed, linkedSignal } from '@angular/core';
import { WeekViewAllDay, WeekViewEvent, WeekViewSlot } from '@shared/interfaces';
import { addDays, slotEnd } from '@shared/utils';
import { CalendarFacade } from './calendar.facade';

@Injectable()
export class CalendarWeekFacade extends CalendarFacade {
  private readonly weekEnd = computed(() => addDays(this.weekStart(), 6));
  /** WeekView columns: the week, or Monday to Friday without weekends. */
  readonly viewDays = computed(() =>
    this.showWeekends()
      ? this.weekDays()
      : this.weekDays().filter((day) => day.dow !== 'sáb' && day.dow !== 'dom'),
  );
  readonly now = computed(() =>
    this.today() >= this.weekStart() && this.today() <= this.weekEnd()
      ? this.nowState()
      : undefined,
  );

  private readonly selectedEventIdState = linkedSignal<string, string | undefined>({
    source: this.weekStart,
    computation: () => undefined,
  });
  readonly selectedEventId = this.selectedEventIdState.asReadonly();

  private readonly events = computed(() =>
    this.store
      .events()
      .filter((event) => event.date >= this.weekStart() && event.date <= this.weekEnd()),
  );

  readonly weekEvents = computed<WeekViewEvent[]>(() =>
    this.events()
      .filter((event) => event.start)
      .map((event) => ({
        id: event.id,
        day: event.date,
        start: event.start!,
        // shortcut: an event without end paints as zero length, until the form requires it
        end: event.end ?? event.start!,
        title: event.title,
        tint: event.tint,
        selected: event.id === this.selectedEventId(),
      })),
  );

  readonly weekAllDay = computed<WeekViewAllDay[]>(() =>
    this.events()
      .filter((event) => !event.start)
      .map((event) => ({ day: event.date, title: event.title, category: event.category })),
  );

  readonly weekTasks = this.tasksBetween(this.weekStart, this.weekEnd);

  readonly pendingCount = computed(() => this.weekTasks().filter((task) => !task.done).length);

  selectEvent(id: string): void {
    this.selectedEventIdState.set(id);
  }

  openSlot(slot: WeekViewSlot): void {
    this.dialogs.openNewEvent({ date: slot.day, start: slot.hour, end: slotEnd(slot.hour) });
  }
}
