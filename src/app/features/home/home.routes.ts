import { Routes } from '@angular/router';
import { provideAgenda } from '../agenda/agenda.providers';
import { HomeFacade } from './home.facade';
import { HomePage } from './pages/home-page/home-page';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    component: HomePage,
    title: 'Inicio · Agenda',
    providers: [...provideAgenda(), HomeFacade],
  },
];
