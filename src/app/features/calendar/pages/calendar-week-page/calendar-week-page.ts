import { Component, afterNextRender, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AgendaDialogs } from '../../../agenda/components/agenda-dialogs/agenda-dialogs';
import { CalendarWeekFacade } from '../../calendar-week.facade';
import { DaySide } from '../../components/day-side/day-side';
import { WeekMain } from '../../components/week-main/week-main';

@Component({
  selector: 'app-calendar-week-page',
  imports: [WeekMain, DaySide, AgendaDialogs],
  templateUrl: './calendar-week-page.html',
  host: { class: 'calendar-week-page' },
})
export class CalendarWeekPage {
  protected readonly facade = inject(CalendarWeekFacade);
  private readonly router = inject(Router);

  constructor() {
    // Data lives in the browser's localStorage: the server renders skeletons only.
    afterNextRender(() => this.facade.load());
  }

  protected goTo(view: 'dia' | 'semana' | 'mes', fecha: string): void {
    this.router.navigate(['/calendario', view], { queryParams: { fecha } });
  }
}
