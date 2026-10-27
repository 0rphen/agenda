import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { DayViewAllDay, DayViewEvent } from '@shared/interfaces';
import { isIsoDay, localIso, pad2, slotEnd } from '@shared/utils';
import { AgendaCommands } from '../agenda/agenda-commands';
import { AgendaDialogs } from '../agenda/agenda-dialogs';
import { AgendaStore } from '../agenda/store/agenda.store';

@Injectable()
export class CalendarDayFacade {
  private readonly store = inject(AgendaStore);
  private readonly commands = inject(AgendaCommands);
  private readonly dialogs = inject(AgendaDialogs);
  // Query params are shared by the whole tree, so the root route injected here is enough.
  private readonly params = toSignal(inject(ActivatedRoute).queryParamMap, { requireSync: true });

  private readonly nowState = signal<string | undefined>(undefined);

  readonly today = localIso(new Date());
  readonly day = computed(() => {
    const fecha = this.params().get('fecha');
    return isIsoDay(fecha) ? fecha : this.today;
  });
  readonly isToday = computed(() => this.day() === this.today);
  readonly now = computed(() => (this.isToday() ? this.nowState() : undefined));
  readonly status = this.store.status;
  readonly saveError = this.commands.saveError;
  readonly editingTask = this.dialogs.editingTask;

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

  readonly eventDays = computed(() => [...new Set(this.store.events().map((event) => event.date))]);

  readonly dayTasks = computed(() =>
    this.store
      .tasks()
      .filter((task) => task.due === this.day())
      .sort((a, b) => Number(a.done) - Number(b.done)),
  );

  readonly pendingCount = computed(() => this.dayTasks().filter((task) => !task.done).length);

  load(): Promise<void> {
    const now = new Date();
    this.nowState.set(`${pad2(now.getHours())}:${pad2(now.getMinutes())}`);
    return this.commands.load();
  }

  selectEvent(id: string): void {
    this.selectedEventIdState.set(id);
  }

  toggleTask(id: string, done: boolean): Promise<void> {
    return this.commands.toggleTask(id, done);
  }

  dismissSaveError(): void {
    this.commands.dismissSaveError();
  }

  openTask(id: string): void {
    this.dialogs.openTask(id);
  }

  openNewEvent(): void {
    this.dialogs.openNewEvent({ date: this.day() });
  }

  /** `hour` is `HH:00`; the last slot ends at 23:59 to stay within the day. */
  openSlot(hour: string): void {
    this.dialogs.openNewEvent({ date: this.day(), start: hour, end: slotEnd(hour) });
  }
}
