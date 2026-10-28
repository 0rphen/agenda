import { Injectable, computed, inject, signal } from '@angular/core';
import { EventFormValue, TaskFormValue } from '@shared/interfaces';
import { addMinutes, EVENT_FORM_DEFAULTS } from '@shared/utils';
import { durationMinutes } from '../settings/domain/settings-options';
import { UserSettingsStore } from '../settings/store/user-settings.store';
import { AgendaCommands } from './agenda-commands';
import { PendingDelete } from './domain/agenda-view.model';
import { AgendaStore } from './store/agenda.store';

/** Task and event Dialog state shared by every screen; each facade decides the draft. */
@Injectable()
export class AgendaDialogs {
  private readonly store = inject(AgendaStore);
  private readonly commands = inject(AgendaCommands);
  private readonly settings = inject(UserSettingsStore).settings;

  private readonly editingTaskId = signal<string | undefined>(undefined);
  private readonly eventDraftState = signal<Partial<EventFormValue> | undefined>(undefined);
  private readonly dialogErrorState = signal(false);
  private readonly editingEventId = signal<string | undefined>(undefined);
  private readonly pendingDeleteState = signal<PendingDelete | undefined>(undefined);
  private readonly deleteErrorState = signal(false);

  readonly editingTask = computed(() =>
    this.store.tasks().find((task) => task.id === this.editingTaskId()),
  );
  readonly eventDraft = this.eventDraftState.asReadonly();
  readonly dialogError = this.dialogErrorState.asReadonly();
  readonly editingEvent = computed(() =>
    this.store.events().find((event) => event.id === this.editingEventId()),
  );
  readonly pendingDelete = this.pendingDeleteState.asReadonly();
  readonly deleteError = this.deleteErrorState.asReadonly();

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

  /** The end always follows «Duración predeterminada», also from a one-hour slot. */
  openNewEvent(draft: Partial<EventFormValue>): void {
    const start = draft.start ?? EVENT_FORM_DEFAULTS.start;
    const end = addMinutes(start, durationMinutes(this.settings().calendar.defaultDuration));
    this.dialogErrorState.set(false);
    this.eventDraftState.set({ ...draft, start, end });
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

  openEditEvent(id: string): void {
    this.dialogErrorState.set(false);
    this.editingEventId.set(id);
  }

  closeEditEvent(): void {
    this.editingEventId.set(undefined);
    this.dialogErrorState.set(false);
  }

  async updateEvent(value: EventFormValue): Promise<void> {
    const id = this.editingEventId();
    if (!id) return;
    this.dialogErrorState.set(false);
    try {
      await this.commands.updateEvent(id, value);
      this.closeEditEvent();
    } catch {
      this.dialogErrorState.set(true);
    }
  }

  askDeleteTask(id: string): void {
    const task = this.store.tasks().find((item) => item.id === id);
    if (task) this.askDelete({ kind: 'task', id, title: task.title });
  }

  askDeleteEvent(id: string): void {
    const event = this.store.events().find((item) => item.id === id);
    if (event) this.askDelete({ kind: 'event', id, title: event.title });
  }

  cancelDelete(): void {
    this.pendingDeleteState.set(undefined);
    this.deleteErrorState.set(false);
  }

  /** Resolves `true` once deleted; on failure the confirmation stays open with `deleteError`. */
  async confirmDelete(): Promise<boolean> {
    const pending = this.pendingDelete();
    if (!pending) return false;
    this.deleteErrorState.set(false);
    try {
      if (pending.kind === 'task') await this.commands.deleteTask(pending.id);
      else await this.commands.deleteEvent(pending.id);
    } catch {
      this.deleteErrorState.set(true);
      return false;
    }
    this.cancelDelete();
    if (this.editingTaskId() === pending.id) this.closeTask();
    if (this.editingEventId() === pending.id) this.closeEditEvent();
    return true;
  }

  private askDelete(pending: PendingDelete): void {
    this.deleteErrorState.set(false);
    this.pendingDeleteState.set(pending);
  }
}
