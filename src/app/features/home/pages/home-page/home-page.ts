import { Component, afterNextRender, inject } from '@angular/core';
import { AgendaPanel } from '../../components/agenda-panel/agenda-panel';
import { CalendarPanel } from '../../components/calendar-panel/calendar-panel';
import { TasksPanel } from '../../components/tasks-panel/tasks-panel';
import { HomeFacade } from '../../home.facade';

@Component({
  selector: 'app-home-page',
  imports: [AgendaPanel, CalendarPanel, TasksPanel],
  templateUrl: './home-page.html',
  host: { class: 'home-page' },
})
export class HomePage {
  protected readonly facade = inject(HomeFacade);

  constructor() {
    // Data lives in the browser's localStorage: the server renders skeletons only.
    afterNextRender(() => this.facade.load());
  }
}
