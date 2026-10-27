import { Routes } from '@angular/router';
import { provideAgenda } from '../agenda/agenda.providers';
import { OverviewFacade } from './overview.facade';
import { OverviewPage } from './pages/overview-page/overview-page';

export const OVERVIEW_ROUTES: Routes = [
  {
    path: '',
    component: OverviewPage,
    title: 'Resumen · Agenda',
    data: { layout: 'week' },
    providers: [...provideAgenda(), OverviewFacade],
  },
];
