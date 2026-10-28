import { Component, afterNextRender, inject, signal } from '@angular/core';
import { AgendaPanel } from '../../components/agenda-panel/agenda-panel';
import { CalendarPanel } from '../../components/calendar-panel/calendar-panel';
import { TasksPanel } from '../../components/tasks-panel/tasks-panel';
import { AgendaDialogs } from '../../../agenda/components/agenda-dialogs/agenda-dialogs';
import { HomeFacade } from '../../home.facade';

@Component({
  selector: 'app-home-page',
  imports: [AgendaPanel, CalendarPanel, TasksPanel, AgendaDialogs],
  templateUrl: './home-page.html',
  host: { class: 'home-page' },
})
export class HomePage {
  protected readonly facade = inject(HomeFacade);
  protected readonly taskDraft = signal('');

  constructor() {
    // Data lives in the browser's localStorage: the server renders skeletons only.
    afterNextRender(() => this.facade.load());
  }

  protected async addTask(title: string): Promise<void> {
    if (await this.facade.addTask(title)) this.taskDraft.set('');
  }
}
