import { Component, afterNextRender, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppBar, AppBarActions } from '@shared/components/app-bar/app-bar';
import { Fab } from '@shared/components/fab/fab';
import { IconButton } from '@shared/components/icon-button/icon-button';
import { addMonths, monthTitle } from '@shared/utils';
import { AgendaDialogs } from '../../../agenda/components/agenda-dialogs/agenda-dialogs';
import { CalendarMonthFacade } from '../../calendar-month.facade';
import { DaySide } from '../../components/day-side/day-side';
import { MonthMain } from '../../components/month-main/month-main';

@Component({
  selector: 'app-calendar-month-page',
  imports: [AppBar, AppBarActions, MonthMain, DaySide, AgendaDialogs, Fab, IconButton],
  templateUrl: './calendar-month-page.html',
  host: { class: 'calendar-month-page screen l-screen' },
})
export class CalendarMonthPage {
  protected readonly facade = inject(CalendarMonthFacade);
  private readonly router = inject(Router);

  protected readonly title = computed(() => monthTitle(this.facade.day()));

  constructor() {
    // Data lives in the browser's localStorage: the server renders skeletons only.
    afterNextRender(() => this.facade.load());
  }

  protected goTo(view: 'dia' | 'semana' | 'mes', fecha: string): void {
    this.router.navigate(['/calendario', view], { queryParams: { fecha } });
  }

  protected move(months: number): void {
    this.goTo('mes', addMonths(this.facade.day(), months));
  }
}
