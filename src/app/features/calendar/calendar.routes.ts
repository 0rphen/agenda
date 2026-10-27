import { Routes } from '@angular/router';
import { provideAgenda } from '../agenda/agenda.providers';
import { CalendarDayFacade } from './calendar-day.facade';
import { CalendarMonthFacade } from './calendar-month.facade';
import { CalendarWeekFacade } from './calendar-week.facade';
import { CalendarDayPage } from './pages/calendar-day-page/calendar-day-page';
import { CalendarMonthPage } from './pages/calendar-month-page/calendar-month-page';
import { CalendarWeekPage } from './pages/calendar-week-page/calendar-week-page';

export const CALENDAR_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dia' },
  {
    path: 'dia',
    component: CalendarDayPage,
    title: 'Día · Agenda',
    data: { layout: 'week' },
    providers: [...provideAgenda(), CalendarDayFacade],
  },
  {
    path: 'semana',
    component: CalendarWeekPage,
    title: 'Semana · Agenda',
    data: { layout: 'week' },
    providers: [...provideAgenda(), CalendarWeekFacade],
  },
  {
    path: 'mes',
    component: CalendarMonthPage,
    title: 'Mes · Agenda',
    data: { layout: 'week' },
    providers: [...provideAgenda(), CalendarMonthFacade],
  },
];
