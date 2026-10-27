import { Injectable, inject, signal } from '@angular/core';
import { EventFormValue, TaskFormValue } from '@shared/interfaces';
import { formToEvent, formToTask } from './agenda-forms';
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

  async updateTask(id: string, value: TaskFormValue): Promise<void> {
    const current = this.store.tasks().find((task) => task.id === id);
    if (!current) throw new Error(`Tarea ${id} no existe`);
    const task = formToTask(current, value);
    await this.repository.updateTask(task);
    this.store.replaceTask(task);
  }
}
