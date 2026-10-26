import { Routes } from '@angular/router';
import { AgendaRepository } from './domain/agenda-repository';
import { HomeFacade } from './home.facade';
import { HomePage } from './pages/home-page/home-page';
import { HomeStore } from './store/home.store';
import { AgendaLocalRepository } from './structure/agenda-local-repository';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    component: HomePage,
    title: 'Inicio · Agenda',
    providers: [
      { provide: AgendaRepository, useClass: AgendaLocalRepository },
      HomeStore,
      HomeFacade,
    ],
  },
];
