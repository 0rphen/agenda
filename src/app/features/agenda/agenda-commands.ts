import { Injectable, inject, signal } from '@angular/core';
import { EventFormValue, TaskFormValue } from '@shared/interfaces';
import { formToEvent, formToTask, TASK_LIST_COLORS } from './agenda-forms';
import { Task } from './domain/task.model';
import { AgendaRepository } from './domain/agenda-repository';
import { AgendaStore } from './store/agenda.store';

/** Agenda reads and writes shared by every screen; screen state stays in each facade. */
@Injectable()
export class AgendaCommands {
  private readonly store = inject(AgendaStore);
  private readonly repository = inject(AgendaRepository);

  private readonly saveErrorState = signal(false);

  readonly saveError = this.saveErrorState.asReadonly();

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

  async createEvent(value: EventFormValue): Promise<void> {
    this.store.addEvent(await this.repository.createEvent(formToEvent(value)));
  }

  async createTask(title: string, due: string): Promise<Task | undefined> {
    this.saveErrorState.set(false);
    try {
      const task = await this.repository.createTask({
        title: title.trim(),
        done: false,
        due,
        list: 'Personal',
        listColor: TASK_LIST_COLORS['Personal'],
      });
      this.store.addTask(task);
      return task;
    } catch {
      this.saveErrorState.set(true);
      return undefined;
    }
  }

  async updateTask(id: string, value: TaskFormValue): Promise<void> {
    const current = this.store.tasks().find((task) => task.id === id);
    if (!current) throw new Error(`Tarea ${id} no existe`);
    const task = formToTask(current, value);
    await this.repository.updateTask(task);
    this.store.replaceTask(task);
  }

  async deleteTask(id: string): Promise<void> {
    await this.repository.deleteTask(id);
    this.store.removeTask(id);
  }

  async updateEvent(id: string, value: EventFormValue): Promise<void> {
    const current = this.store.events().find((event) => event.id === id);
    if (!current) throw new Error(`Cita ${id} no existe`);
    // The form knows nothing of tint or confirmation: keep them.
    const event = { ...current, ...formToEvent(value), id, confirmed: current.confirmed };
    await this.repository.updateEvent(event);
    this.store.replaceEvent(event);
  }

  async deleteEvent(id: string): Promise<void> {
    await this.repository.deleteEvent(id);
    this.store.removeEvent(id);
  }
}
