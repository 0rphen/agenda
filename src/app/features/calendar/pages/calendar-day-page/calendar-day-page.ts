import { Component, afterNextRender, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppBar, AppBarActions } from '@shared/components/app-bar/app-bar';
import { Fab } from '@shared/components/fab/fab';
import { Menu } from '@shared/components/menu/menu';
import { MenuEntry, MenuItem } from '@shared/types';
import { dayTitle } from '@shared/utils';
import { AgendaDialogs } from '../../../agenda/components/agenda-dialogs/agenda-dialogs';
import { CalendarDayFacade } from '../../calendar-day.facade';
import { DayMain } from '../../components/day-main/day-main';
import { DaySide } from '../../components/day-side/day-side';

@Component({
  selector: 'app-calendar-day-page',
  imports: [AppBar, AppBarActions, DayMain, DaySide, AgendaDialogs, Fab, Menu],
  templateUrl: './calendar-day-page.html',
  host: { class: 'calendar-day-page screen l-screen' },
})
export class CalendarDayPage {
  protected readonly facade = inject(CalendarDayFacade);
  private readonly router = inject(Router);

  protected readonly title = computed(() => dayTitle(this.facade.day()));

  protected readonly viewItems: MenuEntry[] = [
    { section: 'Vista' },
    { icon: 'today', label: 'Día', selected: true },
    { icon: 'view_week', label: 'Semana', selected: false },
    { icon: 'calendar_view_month', label: 'Mes', selected: false },
  ];

  constructor() {
    // Data lives in the browser's localStorage: the server renders skeletons only.
    afterNextRender(() => this.facade.load());
  }

  protected goTo(view: 'dia' | 'semana' | 'mes', fecha: string): void {
    this.router.navigate(['/calendario', view], { queryParams: { fecha } });
  }

  protected onView(item: MenuItem): void {
    if (item.label === 'Semana') this.goTo('semana', this.facade.day());
    if (item.label === 'Mes') this.goTo('mes', this.facade.day());
  }
}
