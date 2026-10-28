import { afterNextRender, Component, computed, inject, Injector } from '@angular/core';
import { Alert } from '@shared/components/alert/alert';
import { Button } from '@shared/components/button/button';
import { Dialog, DialogFooter } from '@shared/components/dialog/dialog';
import { EventForm } from '@shared/components/event-form/event-form';
import { TaskForm } from '@shared/components/task-form/task-form';
import { isNarrow } from '@shared/utils';
import { AgendaDialogs as AgendaDialogsState } from '../../agenda-dialogs';
import { eventToForm, taskToForm } from '../../agenda-forms';

/** Task and event Dialogs of every agenda screen; the only feature component that injects state. */
@Component({
  selector: 'app-agenda-dialogs',
  imports: [Alert, Button, Dialog, DialogFooter, EventForm, TaskForm],
  templateUrl: './agenda-dialogs.html',
})
export class AgendaDialogs {
  protected readonly dialogs = inject(AgendaDialogsState);
  private readonly injector = inject(Injector);

  // Stable reference: a new object on every check would reset what the user typed.
  protected readonly taskDefaults = computed(() => {
    const task = this.dialogs.editingTask();
    return task ? taskToForm(task) : {};
  });

  protected readonly eventDefaults = computed(() => {
    const event = this.dialogs.editingEvent();
    return event ? eventToForm(event) : {};
  });

  // Read when a Dialog opens (only in the browser): sheet and full screen on mobile.
  protected readonly narrow = computed(
    () =>
      !!(this.dialogs.editingTask() || this.dialogs.eventDraft() || this.dialogs.editingEvent()) &&
      isNarrow(),
  );

  protected async confirmDelete(): Promise<void> {
    if (!(await this.dialogs.confirmDelete())) return;
    // The control that asked for the delete is gone with the item: focus the page heading.
    afterNextRender(
      () => {
        const heading = [...document.querySelectorAll<HTMLElement>('h1, h2')].find(
          (item) => !item.closest('dialog') && (item.checkVisibility?.() ?? true),
        );
        heading?.setAttribute('tabindex', '-1');
        heading?.focus();
      },
      { injector: this.injector },
    );
  }
}
