import { Injectable, computed, inject, signal } from '@angular/core';
import { EventFormValue, TaskFormValue } from '@shared/interfaces';
import { addDays, capitalize, localIso, LONG_DAY, weekStart } from '@shared/utils';
import { weekProgress } from '../agenda/agenda-queries';
import { ListProgress } from '../agenda/domain/agenda-view.model';
import { CalendarEvent } from '../agenda/domain/calendar-event.model';
import { AgendaCommands } from '../agenda/agenda-commands';
import { AgendaStore } from '../agenda/store/agenda.store';
import { AgendaGroup, AgendaRange } from './domain/home-view.model';

@Injectable()
export class HomeFacade {
  private readonly store = inject(AgendaStore);
  private readonly commands = inject(AgendaCommands);

  private readonly selectedDayState = signal(localIso(new Date()));
  private readonly rangeState = signal<AgendaRange>('day');
  private readonly editingTaskId = signal<string | undefined>(undefined);
  private readonly eventDraftState = signal<Partial<EventFormValue> | undefined>(undefined);
  private readonly dialogErrorState = signal(false);

  readonly today = this.selectedDayState();
  readonly selectedDay = this.selectedDayState.asReadonly();
  readonly range = this.rangeState.asReadonly();
  readonly status = this.store.status;
  readonly saveError = this.commands.saveError;
  readonly editingTask = computed(() =>
    this.store.tasks().find((task) => task.id === this.editingTaskId()),
  );
  readonly eventDraft = this.eventDraftState.asReadonly();
  readonly dialogError = this.dialogErrorState.asReadonly();

  readonly agendaGroups = computed<AgendaGroup[]>(() => {
    const day = this.selectedDay();
    const [from, to] = {
      day: [day, day],
      week: [weekStart(day), addDays(weekStart(day), 6)],
      next: [addDays(weekStart(day), 7), addDays(weekStart(day), 13)],
    }[this.range()];
    const groups = new Map<string, CalendarEvent[]>();
    for (const event of this.store.events()) {
      if (event.date < from || event.date > to) continue;
      groups.set(event.date, [...(groups.get(event.date) ?? []), event]);
    }
    return [...groups]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, events]) => ({
        day: date,
        title: capitalize(
          LONG_DAY.format(new Date(`${date}T00:00:00Z`))
            .replace(',', '')
            .replace(' de ', ' '),
        ),
        // All-day events have no start, so '' sorts them first.
        events: events.sort((a, b) => (a.start ?? '').localeCompare(b.start ?? '')),
      }));
  });

  readonly eventDays = computed(() => [...new Set(this.store.events().map((event) => event.date))]);

  readonly dayTasks = computed(() =>
    this.store
      .tasks()
      .filter((task) => task.due === this.selectedDay())
      .sort((a, b) => Number(a.done) - Number(b.done)),
  );

  readonly pendingCount = computed(() => this.dayTasks().filter((task) => !task.done).length);

  readonly weekProgress = computed<ListProgress[]>(() =>
    weekProgress(this.store.tasks(), this.selectedDay()),
  );

  load(): Promise<void> {
    return this.commands.load();
  }

  selectDay(iso: string): void {
    this.selectedDayState.set(iso);
  }

  setRange(range: AgendaRange): void {
    this.rangeState.set(range);
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
    this.eventDraftState.set({ date: this.selectedDay() });
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
}
