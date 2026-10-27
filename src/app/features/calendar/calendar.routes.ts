import { Routes } from '@angular/router';
import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';
import { provideAgenda } from '../agenda/agenda.providers';
import { CalendarDayFacade } from './calendar-day.facade';
import { CalendarWeekFacade } from './calendar-week.facade';
import { CalendarDayPage } from './pages/calendar-day-page/calendar-day-page';
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
  { path: 'mes', component: PlaceholderPage, title: 'Mes · Agenda', data: { heading: 'Mes' } },
];
