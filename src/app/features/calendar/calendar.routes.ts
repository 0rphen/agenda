import { Routes } from '@angular/router';
import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

export const CALENDAR_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dia' },
  { path: 'dia', component: PlaceholderPage, title: 'Día · Agenda', data: { heading: 'Día' } },
  {
    path: 'semana',
    component: PlaceholderPage,
    title: 'Semana · Agenda',
    data: { heading: 'Semana' },
  },
  { path: 'mes', component: PlaceholderPage, title: 'Mes · Agenda', data: { heading: 'Mes' } },
];
