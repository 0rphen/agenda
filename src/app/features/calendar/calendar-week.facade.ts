import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { WeekDay, WeekViewAllDay, WeekViewEvent, WeekViewSlot } from '@shared/interfaces';
import {
  addDays,
  isIsoDay,
  localIso,
  pad2,
  slotEnd,
  WEEKDAYS_SHORT,
  weekStart,
} from '@shared/utils';
import { AgendaCommands } from '../agenda/agenda-commands';
import { AgendaDialogs } from '../agenda/agenda-dialogs';
import { AgendaStore } from '../agenda/store/agenda.store';

@Injectable()
export class CalendarWeekFacade {
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
  readonly weekStart = computed(() => weekStart(this.day()));
  private readonly weekEnd = computed(() => addDays(this.weekStart(), 6));
  readonly weekDays = computed<WeekDay[]>(() =>
    WEEKDAYS_SHORT.map((dow, i) => {
      const iso = addDays(this.weekStart(), i);
      return { iso, dow, num: +iso.slice(8), today: iso === this.today };
    }),
  );
  readonly now = computed(() =>
    this.today >= this.weekStart() && this.today <= this.weekEnd() ? this.nowState() : undefined,
  );
  readonly status = this.store.status;
  readonly saveError = this.commands.saveError;
  readonly editingTask = this.dialogs.editingTask;

  private readonly selectedEventIdState = linkedSignal<string, string | undefined>({
    source: this.weekStart,
    computation: () => undefined,
  });
  readonly selectedEventId = this.selectedEventIdState.asReadonly();

  private readonly inWeek = (date: string | undefined) =>
    !!date && date >= this.weekStart() && date <= this.weekEnd();

  private readonly events = computed(() =>
    this.store.events().filter((event) => this.inWeek(event.date)),
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

  readonly eventDays = computed(() => [...new Set(this.store.events().map((event) => event.date))]);

  readonly weekTasks = computed(() =>
    this.store
      .tasks()
      .filter((task) => this.inWeek(task.due))
      .sort((a, b) => Number(a.done) - Number(b.done)),
  );

  readonly pendingCount = computed(() => this.weekTasks().filter((task) => !task.done).length);

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

  openSlot(slot: WeekViewSlot): void {
    this.dialogs.openNewEvent({ date: slot.day, start: slot.hour, end: slotEnd(slot.hour) });
  }
}
