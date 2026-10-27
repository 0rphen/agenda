import { Injectable, computed, inject, signal } from '@angular/core';
import { EventFormValue, TaskFormValue } from '@shared/interfaces';
import { addDays, localIso, pad2, weekStart } from '@shared/utils';
import { eventMinutes, startsIn, weekProgress } from '../agenda/agenda-queries';
import { ListProgress } from '../agenda/domain/agenda-view.model';
import { CalendarEvent } from '../agenda/domain/calendar-event.model';
import { AgendaCommands } from '../agenda/agenda-commands';
import { AgendaStore } from '../agenda/store/agenda.store';
import { AgendaConflict, OverviewStats } from './domain/overview-view.model';

@Injectable()
export class OverviewFacade {
  private readonly store = inject(AgendaStore);
  private readonly commands = inject(AgendaCommands);

  // shortcut: fixed name until there is a user model
  private readonly userName = 'César';
  private readonly hours = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 });

  private readonly nowState = signal(new Date());
  private readonly editingTaskId = signal<string | undefined>(undefined);
  private readonly eventDraftState = signal<Partial<EventFormValue> | undefined>(undefined);
  private readonly dialogErrorState = signal(false);

  readonly today = computed(() => localIso(this.nowState()));
  readonly status = this.store.status;
  readonly saveError = this.commands.saveError;
  readonly editingTask = computed(() =>
    this.store.tasks().find((task) => task.id === this.editingTaskId()),
  );
  readonly eventDraft = this.eventDraftState.asReadonly();
  readonly dialogError = this.dialogErrorState.asReadonly();

  readonly greeting = computed(() => {
    const hour = this.nowState().getHours();
    const salute = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
    return `${salute}, ${this.userName}`;
  });

  readonly todayEvents = computed(() =>
    this.store
      .events()
      .filter((event) => event.date === this.today())
      // All-day events have no start, so '' sorts them first.
      .sort((a, b) => (a.start ?? '').localeCompare(b.start ?? '')),
  );

  readonly eventDays = computed(() => [...new Set(this.store.events().map((event) => event.date))]);

  readonly nextEvent = computed<CalendarEvent | undefined>(() => {
    const now = this.nowKey();
    return this.store
      .events()
      .filter((event) => event.start && `${event.date}T${event.start}` >= now)
      .sort((a, b) => `${a.date}T${a.start}`.localeCompare(`${b.date}T${b.start}`))[0];
  });

  readonly nextEventBadge = computed(() => {
    const event = this.nextEvent();
    return event ? startsIn(event, this.nowState()) : undefined;
  });

  readonly dueTasks = computed(() =>
    this.store
      .tasks()
      .filter((task) => !task.done && !!task.due && task.due <= this.today())
      .sort((a, b) => a.due!.localeCompare(b.due!))
      .slice(0, 5),
  );

  readonly stats = computed<OverviewStats>(() => {
    const today = this.today();
    const time = this.nowKey().slice(11);
    const events = this.todayEvents();
    const tasks = this.store.tasks();
    const from = weekStart(today);
    const to = addDays(from, 6);
    const week = tasks.filter((task) => !!task.due && task.due >= from && task.due <= to);
    const minutes = events.reduce((sum, event) => sum + eventMinutes(event), 0);
    return {
      eventsToday: events.length,
      nextStart: events.find((event) => event.start && event.start >= time)?.start,
      pending: tasks.filter((task) => !task.done).length,
      dueToday: tasks.filter((task) => !task.done && task.due === today).length,
      reservedHours: `${this.hours.format(minutes / 60)} h`,
      completed: week.filter((task) => task.done).length,
      planned: week.length,
    };
  });

  readonly weekProgress = computed<ListProgress[]>(() =>
    weekProgress(this.store.tasks(), this.today()),
  );

  readonly conflict = computed<AgendaConflict | undefined>(() => {
    const timed = this.todayEvents().filter((event) => event.start && event.end);
    for (const [i, a] of timed.entries()) {
      const b = timed.slice(i + 1).find((other) => a.start! < other.end! && other.start! < a.end!);
      if (b) return { time: b.start!, first: a.title, second: b.title };
    }
    return undefined;
  });

  load(): Promise<void> {
    this.nowState.set(new Date());
    return this.commands.load();
  }

  toggleTask(id: string, done: boolean): Promise<void> {
    return this.commands.toggleTask(id, done);
  }

  dismissSaveError(): void {
    this.commands.dismissSaveError();
  }

  openTask(id: string): void {
    this.dialogErrorState.set(false);
    this.editingTaskId.set(id);
  }

  closeTask(): void {
    this.editingTaskId.set(undefined);
    this.dialogErrorState.set(false);
  }

  async saveTask(value: TaskFormValue): Promise<void> {
    const id = this.editingTaskId();
    if (!id) return;
    this.dialogErrorState.set(false);
    try {
      await this.commands.updateTask(id, value);
      this.closeTask();
    } catch {
      this.dialogErrorState.set(true);
    }
  }

  openNewEvent(): void {
    this.dialogErrorState.set(false);
    this.eventDraftState.set({ date: this.today() });
  }

  closeNewEvent(): void {
    this.eventDraftState.set(undefined);
    this.dialogErrorState.set(false);
  }

  async saveEvent(value: EventFormValue): Promise<void> {
    this.dialogErrorState.set(false);
    try {
      await this.commands.createEvent(value);
      this.closeNewEvent();
    } catch {
      this.dialogErrorState.set(true);
    }
  }

  /** `YYYY-MM-DDTHH:MM` of now, comparable with `${date}T${start}`. */
  private nowKey(): string {
    const now = this.nowState();
    return `${localIso(now)}T${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  }
}
