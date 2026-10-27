import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Datos en localStorage del navegador: el servidor pinta mes y esqueletos en cada petición.
  { path: 'inicio', renderMode: RenderMode.Server },
  { path: 'resumen', renderMode: RenderMode.Server },
  { path: 'calendario/dia', renderMode: RenderMode.Server },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
