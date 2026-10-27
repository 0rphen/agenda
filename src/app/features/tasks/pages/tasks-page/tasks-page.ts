import { Component, afterNextRender, inject } from '@angular/core';
import { TasksMain } from '../../components/tasks-main/tasks-main';
import { TasksSide } from '../../components/tasks-side/tasks-side';
import { TasksFacade } from '../../tasks.facade';

@Component({
  selector: 'app-tasks-page',
  imports: [TasksMain, TasksSide],
  templateUrl: './tasks-page.html',
  host: { class: 'tasks-page' },
})
export class TasksPage {
  protected readonly facade = inject(TasksFacade);

  constructor() {
    // Data lives in the browser's localStorage: the server renders skeletons only.
    afterNextRender(() => this.facade.load());
  }
}
