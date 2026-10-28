import { Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { WeekDay } from '@shared/interfaces';
import { addDays, isIsoDay, localIso, pad2, weekdayShort, weekStart } from '@shared/utils';
import { AgendaCommands } from '../agenda/agenda-commands';
import { AgendaDialogs } from '../agenda/agenda-dialogs';
import { Clock } from '../agenda/clock';
import { Task } from '../agenda/domain/task.model';
import { UserSettingsStore } from '../settings/store/user-settings.store';
import { AgendaStore } from '../agenda/store/agenda.store';

/** Shared state of the calendar pages: `?fecha=`, agenda store, commands and dialogs. */
export abstract class CalendarFacade {
  protected readonly store = inject(AgendaStore);
  protected readonly commands = inject(AgendaCommands);
  protected readonly dialogs = inject(AgendaDialogs);
  // Query params are shared by the whole tree, so the root route injected here is enough.
  private readonly params = toSignal(inject(ActivatedRoute).queryParamMap, { requireSync: true });

  private readonly clock = inject(Clock).now;
  private readonly userSettings = inject(UserSettingsStore);
  private readonly settings = this.userSettings.settings;
  readonly firstDay = this.userSettings.firstDay;
  readonly timeFormat = this.userSettings.timeFormat;
  readonly showWeekends = this.userSettings.showWeekends;

  /** `HH:mm` of the clock. */
  protected readonly nowState = computed(() => {
    const now = this.clock();
    return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  });

  readonly today = computed(() => localIso(this.clock()));
  readonly day = computed(() => {
    const fecha = this.params().get('fecha');
    return isIsoDay(fecha) ? fecha : this.today();
  });
  readonly status = this.store.status;
  /** Hour of «Horario laboral · Inicio»: DayView/WeekView open there when today is not shown. */
  readonly workStartHour = computed(() => +this.settings().calendar.workStart.slice(0, 2));
  readonly saveError = this.commands.saveError;
  readonly editingTask = this.dialogs.editingTask;

  readonly eventDays = computed(() => [...new Set(this.store.events().map((event) => event.date))]);

  readonly weekStart = computed(() => weekStart(this.day(), this.firstDay()));
  readonly weekDays = computed<WeekDay[]>(() =>
    Array.from({ length: 7 }, (_, i) => {
      const iso = addDays(this.weekStart(), i);
      const hasEvents = this.eventDays().includes(iso);
      const dow = weekdayShort(iso);
      return { iso, dow, num: +iso.slice(8), today: iso === this.today(), hasEvents };
    }),
  );

  /** Tasks due between `start` and `end` (inclusive), pending first. */
  protected tasksBetween(start: () => string, end: () => string): Signal<Task[]> {
    return computed(() =>
      this.store
        .tasks()
        .filter((task) => !!task.due && task.due >= start() && task.due <= end())
        .sort((a, b) => Number(a.done) - Number(b.done)),
    );
  }

  load(): Promise<void> {
    return this.commands.load();
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

  editEvent(id: string): void {
    this.dialogs.openEditEvent(id);
  }
}
