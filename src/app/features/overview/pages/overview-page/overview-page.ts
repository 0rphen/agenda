import { Component, afterNextRender, computed, inject } from '@angular/core';
import { Alert } from '@shared/components/alert/alert';
import { Dialog } from '@shared/components/dialog/dialog';
import { EventForm } from '@shared/components/event-form/event-form';
import { TaskForm } from '@shared/components/task-form/task-form';
import { Router } from '@angular/router';
import { OverviewMain } from '../../components/overview-main/overview-main';
import { OverviewSide } from '../../components/overview-side/overview-side';
import { taskToForm } from '../../../agenda/agenda-forms';
import { OverviewFacade } from '../../overview.facade';

@Component({
  selector: 'app-overview-page',
  imports: [OverviewMain, OverviewSide, Alert, Dialog, EventForm, TaskForm],
  templateUrl: './overview-page.html',
  host: { class: 'overview-page' },
})
export class OverviewPage {
  protected readonly facade = inject(OverviewFacade);
  protected readonly router = inject(Router);

  // Stable reference: a new object on every check would reset what the user typed.
  protected readonly taskDefaults = computed(() => {
    const task = this.facade.editingTask();
    return task ? taskToForm(task) : {};
  });

  constructor() {
    // Data lives in the browser's localStorage: the server renders skeletons only.
    afterNextRender(() => this.facade.load());
  }
}
