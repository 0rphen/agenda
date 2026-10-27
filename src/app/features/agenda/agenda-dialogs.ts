import { Injectable, computed, inject, signal } from '@angular/core';
import { EventFormValue, TaskFormValue } from '@shared/interfaces';
import { AgendaCommands } from './agenda-commands';
import { AgendaStore } from './store/agenda.store';

/** Task and event Dialog state shared by every screen; each facade decides the draft. */
@Injectable()
export class AgendaDialogs {
  private readonly store = inject(AgendaStore);
  private readonly commands = inject(AgendaCommands);

  private readonly editingTaskId = signal<string | undefined>(undefined);
  private readonly eventDraftState = signal<Partial<EventFormValue> | undefined>(undefined);
  private readonly dialogErrorState = signal(false);

  readonly editingTask = computed(() =>
    this.store.tasks().find((task) => task.id === this.editingTaskId()),
  );
  readonly eventDraft = this.eventDraftState.asReadonly();
  readonly dialogError = this.dialogErrorState.asReadonly();

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

  openNewEvent(draft: Partial<EventFormValue>): void {
    this.dialogErrorState.set(false);
    this.eventDraftState.set(draft);
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
