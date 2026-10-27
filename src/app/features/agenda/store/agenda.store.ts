import { Injectable, signal } from '@angular/core';
import { CalendarEvent } from '../domain/calendar-event.model';
import { AgendaStatus } from '../domain/agenda-view.model';
import { Task } from '../domain/task.model';

@Injectable()
export class AgendaStore {
  private readonly eventsState = signal<CalendarEvent[]>([]);
  private readonly tasksState = signal<Task[]>([]);
  private readonly statusState = signal<AgendaStatus>('idle');

  readonly events = this.eventsState.asReadonly();
  readonly tasks = this.tasksState.asReadonly();
  readonly status = this.statusState.asReadonly();

  startLoading(): void {
    this.statusState.set('loading');
  }

  loaded(events: CalendarEvent[], tasks: Task[]): void {
    this.eventsState.set(events);
    this.tasksState.set(tasks);
    this.statusState.set('ready');
  }

  failed(): void {
    this.statusState.set('error');
  }

  setTaskDone(id: string, done: boolean): void {
    this.tasksState.update((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, done } : task)),
    );
  }
}
