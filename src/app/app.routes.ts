import { isDevMode } from '@angular/core';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  {
    path: 'inicio',
    loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: 'resumen',
    loadChildren: () =>
      import('./features/overview/overview.routes').then((m) => m.OVERVIEW_ROUTES),
  },
  {
    path: 'calendario',
    loadChildren: () =>
      import('./features/calendar/calendar.routes').then((m) => m.CALENDAR_ROUTES),
  },
  {
    path: 'tareas',
    loadChildren: () => import('./features/tasks/tasks.routes').then((m) => m.TASKS_ROUTES),
  },
  {
    path: 'configuracion',
    loadChildren: () =>
      import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
  },
  ...(isDevMode()
    ? [{ path: 'demo', loadComponent: () => import('./demo/demo-page').then((m) => m.DemoPage) }]
    : []),
  { path: '**', redirectTo: 'inicio' },
];
