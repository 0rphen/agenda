import { Component, computed, inject } from '@angular/core';
import { Alert } from '@shared/components/alert/alert';
import { Dialog } from '@shared/components/dialog/dialog';
import { EventForm } from '@shared/components/event-form/event-form';
import { TaskForm } from '@shared/components/task-form/task-form';
import { AgendaDialogs as AgendaDialogsState } from '../../agenda-dialogs';
import { taskToForm } from '../../agenda-forms';

/** Task and event Dialogs of every agenda screen; the only feature component that injects state. */
@Component({
  selector: 'app-agenda-dialogs',
  imports: [Alert, Dialog, EventForm, TaskForm],
  templateUrl: './agenda-dialogs.html',
})
export class AgendaDialogs {
  protected readonly dialogs = inject(AgendaDialogsState);

  // Stable reference: a new object on every check would reset what the user typed.
  protected readonly taskDefaults = computed(() => {
    const task = this.dialogs.editingTask();
    return task ? taskToForm(task) : {};
  });
}
