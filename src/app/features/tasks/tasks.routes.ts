import { Routes } from '@angular/router';
import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

export const TASKS_ROUTES: Routes = [
  { path: '', component: PlaceholderPage, title: 'Tareas · Agenda', data: { heading: 'Tareas' } },
];
