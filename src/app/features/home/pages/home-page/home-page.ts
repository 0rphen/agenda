import { Component, afterNextRender, computed, inject } from '@angular/core';
import { Alert } from '@shared/components/alert/alert';
import { Dialog } from '@shared/components/dialog/dialog';
import { EventForm } from '@shared/components/event-form/event-form';
import { TaskForm } from '@shared/components/task-form/task-form';
import { AgendaPanel } from '../../components/agenda-panel/agenda-panel';
import { CalendarPanel } from '../../components/calendar-panel/calendar-panel';
import { TasksPanel } from '../../components/tasks-panel/tasks-panel';
import { taskToForm } from '../../../agenda/agenda-forms';
import { HomeFacade } from '../../home.facade';

@Component({
  selector: 'app-home-page',
  imports: [AgendaPanel, CalendarPanel, TasksPanel, Alert, Dialog, EventForm, TaskForm],
  templateUrl: './home-page.html',
  host: { class: 'home-page' },
})
export class HomePage {
  protected readonly facade = inject(HomeFacade);

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
