import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Datos en localStorage del navegador: el servidor pinta mes y esqueletos en cada petición.
  { path: 'inicio', renderMode: RenderMode.Server },
  { path: 'resumen', renderMode: RenderMode.Server },
  // la vista por defecto vive en localStorage: el servidor no puede elegir a dónde redirigir
  { path: 'calendario', renderMode: RenderMode.Client },
  { path: 'calendario/dia', renderMode: RenderMode.Server },
  { path: 'calendario/semana', renderMode: RenderMode.Server },
  { path: 'calendario/mes', renderMode: RenderMode.Server },
  { path: 'tareas', renderMode: RenderMode.Server },
  { path: 'configuracion', renderMode: RenderMode.Server },
  { path: 'configuracion/**', renderMode: RenderMode.Server },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
