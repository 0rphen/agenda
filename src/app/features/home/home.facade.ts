import { Injectable, computed, inject, signal } from '@angular/core';
import { addDays, capitalize, localIso, LONG_DAY, weekStart } from '@shared/utils';
import { AgendaRepository } from '../agenda/domain/agenda-repository';
import { weekProgress } from '../agenda/agenda-queries';
import { ListProgress } from '../agenda/domain/agenda-view.model';
import { CalendarEvent } from '../agenda/domain/calendar-event.model';
import { AgendaStore } from '../agenda/store/agenda.store';
import { AgendaGroup, AgendaRange } from './domain/home-view.model';

@Injectable()
export class HomeFacade {
  private readonly store = inject(AgendaStore);
  private readonly repository = inject(AgendaRepository);

  private readonly selectedDayState = signal(localIso(new Date()));
  private readonly rangeState = signal<AgendaRange>('day');
  private readonly saveErrorState = signal(false);

  readonly today = this.selectedDayState();
  readonly selectedDay = this.selectedDayState.asReadonly();
  readonly range = this.rangeState.asReadonly();
  readonly status = this.store.status;
  readonly saveError = this.saveErrorState.asReadonly();

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

  async load(): Promise<void> {
    this.store.startLoading();
    try {
      const [events, tasks] = await Promise.all([
        this.repository.listEvents(),
        this.repository.listTasks(),
      ]);
      this.store.loaded(events, tasks);
    } catch {
      this.store.failed();
    }
  }

  selectDay(iso: string): void {
    this.selectedDayState.set(iso);
  }

  setRange(range: AgendaRange): void {
    this.rangeState.set(range);
  }

  async toggleTask(id: string, done: boolean): Promise<void> {
    const previous = this.store.tasks().find((task) => task.id === id)?.done ?? !done;
    this.saveErrorState.set(false);
    this.store.setTaskDone(id, done);
    try {
      await this.repository.setTaskDone(id, done);
    } catch {
      this.store.setTaskDone(id, previous);
      this.saveErrorState.set(true);
    }
  }

  dismissSaveError(): void {
    this.saveErrorState.set(false);
  }
}
