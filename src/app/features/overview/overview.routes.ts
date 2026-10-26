import { Routes } from '@angular/router';
import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

export const OVERVIEW_ROUTES: Routes = [
  { path: '', component: PlaceholderPage, title: 'Resumen · Agenda', data: { heading: 'Resumen' } },
];
