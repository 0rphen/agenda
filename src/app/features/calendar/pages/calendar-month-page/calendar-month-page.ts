import { Component, afterNextRender, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AgendaDialogs } from '../../../agenda/components/agenda-dialogs/agenda-dialogs';
import { CalendarMonthFacade } from '../../calendar-month.facade';
import { DaySide } from '../../components/day-side/day-side';
import { MonthMain } from '../../components/month-main/month-main';

@Component({
  selector: 'app-calendar-month-page',
  imports: [MonthMain, DaySide, AgendaDialogs],
  templateUrl: './calendar-month-page.html',
  host: { class: 'calendar-month-page' },
})
export class CalendarMonthPage {
  protected readonly facade = inject(CalendarMonthFacade);
  private readonly router = inject(Router);

  constructor() {
    // Data lives in the browser's localStorage: the server renders skeletons only.
    afterNextRender(() => this.facade.load());
  }

  protected goTo(view: 'dia' | 'semana' | 'mes', fecha: string): void {
    this.router.navigate(['/calendario', view], { queryParams: { fecha } });
  }
}
