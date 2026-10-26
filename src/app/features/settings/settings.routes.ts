import { Routes } from '@angular/router';
import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    component: PlaceholderPage,
    title: 'Configuración · Agenda',
    data: { heading: 'Configuración' },
  },
];
