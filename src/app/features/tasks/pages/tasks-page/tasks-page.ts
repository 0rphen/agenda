import { Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { Alert } from '@shared/components/alert/alert';
import { AppBar } from '@shared/components/app-bar/app-bar';
import { Dialog } from '@shared/components/dialog/dialog';
import { TaskForm } from '@shared/components/task-form/task-form';
import { TaskFormValue } from '@shared/interfaces';
import { isNarrow, plural } from '@shared/utils';
import { taskToForm } from '../../../agenda/agenda-forms';
import { AgendaDialogs } from '../../../agenda/components/agenda-dialogs/agenda-dialogs';
import { TasksMain } from '../../components/tasks-main/tasks-main';
import { TasksSide } from '../../components/tasks-side/tasks-side';
import { TasksFacade } from '../../tasks.facade';

@Component({
  selector: 'app-tasks-page',
  imports: [AgendaDialogs, Alert, AppBar, Dialog, TaskForm, TasksMain, TasksSide],
  templateUrl: './tasks-page.html',
  host: { class: 'tasks-page screen l-screen' },
})
export class TasksPage {
  protected readonly facade = inject(TasksFacade);
  protected readonly plural = plural;

  /** Mobile only: the detail opens full screen; on desktop it lives in the side panel. */
  protected readonly detailOpen = signal(false);

  // Stable reference: a new object on every check would reset what the user typed.
  protected readonly taskDefaults = computed(() => {
    const task = this.facade.selectedTask();
    return task ? taskToForm(task) : {};
  });

  constructor() {
    // Data lives in the browser's localStorage: the server renders skeletons only.
    afterNextRender(() => this.facade.load());
  }

  protected openTask(id: string): void {
    this.facade.selectTask(id);
    this.detailOpen.set(isNarrow());
  }

  protected closeDetail(): void {
    this.detailOpen.set(false);
    this.facade.clearSelection();
  }

  protected async save(value: TaskFormValue): Promise<void> {
    await this.facade.saveTask(value);
    if (!this.facade.detailError()) this.detailOpen.set(false);
  }
}
