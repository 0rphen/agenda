import { Injectable, computed, inject, signal } from '@angular/core';
import { EventFormValue, TaskFormValue } from '@shared/interfaces';
import { addDays, capitalize, localIso, LONG_DAY, weekStart } from '@shared/utils';
import { weekProgress } from '../agenda/agenda-queries';
import { ListProgress } from '../agenda/domain/agenda-view.model';
import { CalendarEvent } from '../agenda/domain/calendar-event.model';
import { AgendaCommands } from '../agenda/agenda-commands';
import { AgendaDialogs } from '../agenda/agenda-dialogs';
import { Clock } from '../agenda/clock';
import { AgendaStore } from '../agenda/store/agenda.store';
import { UserSettingsStore } from '../settings/store/user-settings.store';
import { AgendaGroup, AgendaRange } from './domain/home-view.model';

@Injectable()
export class HomeFacade {
  private readonly store = inject(AgendaStore);
  private readonly commands = inject(AgendaCommands);
  private readonly dialogs = inject(AgendaDialogs);
  /** «Inicio de semana» for the MiniCalendar. */
  readonly firstDay = inject(UserSettingsStore).firstDay;

  private readonly clock = inject(Clock).now;

  readonly today = computed(() => localIso(this.clock()));
  private readonly selectedDayState = signal(this.today());
  private readonly rangeState = signal<AgendaRange>('day');

  readonly selectedDay = this.selectedDayState.asReadonly();
  readonly range = this.rangeState.asReadonly();
  readonly status = this.store.status;
  readonly saveError = this.commands.saveError;
  readonly editingTask = this.dialogs.editingTask;
  readonly eventDraft = this.dialogs.eventDraft;
  readonly dialogError = this.dialogs.dialogError;

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

  /** Resolves `true` once created; on failure `saveError` shows the Alert. */
  async addTask(title: string): Promise<boolean> {
    if (!title.trim()) return false;
    return !!(await this.commands.createTask(title, this.selectedDay()));
  }

  openTask(id: string): void {
    this.dialogs.openTask(id);
  }

  closeTask(): void {
    this.dialogs.closeTask();
  }

  saveTask(value: TaskFormValue): Promise<void> {
    return this.dialogs.saveTask(value);
  }

  editEvent(id: string): void {
    this.dialogs.openEditEvent(id);
  }

  askDeleteEvent(id: string): void {
    this.dialogs.askDeleteEvent(id);
  }

  openNewEvent(): void {
    this.dialogs.openNewEvent({ date: this.selectedDay() });
  }

  closeNewEvent(): void {
    this.dialogs.closeNewEvent();
  }

  saveEvent(value: EventFormValue): Promise<void> {
    return this.dialogs.saveEvent(value);
  }
}
