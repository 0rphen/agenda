import { Component, afterNextRender, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AgendaDialogs } from '../../../agenda/components/agenda-dialogs/agenda-dialogs';
import { CalendarDayFacade } from '../../calendar-day.facade';
import { DayMain } from '../../components/day-main/day-main';
import { DaySide } from '../../components/day-side/day-side';

@Component({
  selector: 'app-calendar-day-page',
  imports: [DayMain, DaySide, AgendaDialogs],
  templateUrl: './calendar-day-page.html',
  host: { class: 'calendar-day-page' },
})
export class CalendarDayPage {
  protected readonly facade = inject(CalendarDayFacade);
  private readonly router = inject(Router);

  constructor() {
    // Data lives in the browser's localStorage: the server renders skeletons only.
    afterNextRender(() => this.facade.load());
  }

  protected goTo(view: 'dia' | 'semana' | 'mes', fecha: string): void {
    this.router.navigate(['/calendario', view], { queryParams: { fecha } });
  }
}
