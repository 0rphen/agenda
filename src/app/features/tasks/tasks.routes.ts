import { Routes } from '@angular/router';
import { provideAgenda } from '../agenda/agenda.providers';
import { TasksPage } from './pages/tasks-page/tasks-page';
import { TasksFacade } from './tasks.facade';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    component: TasksPage,
    title: 'Tareas · Agenda',
    data: { layout: 'week' },
    providers: [...provideAgenda(), TasksFacade],
  },
];
