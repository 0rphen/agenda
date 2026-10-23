import { isDevMode } from '@angular/core';
import { Routes } from '@angular/router';

export const routes: Routes = [
  ...(isDevMode()
    ? [{ path: 'demo', loadComponent: () => import('./demo/demo-page').then((m) => m.DemoPage) }]
    : []),
];
