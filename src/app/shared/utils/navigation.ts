import { NavDestination } from '@shared/interfaces';

export const RAIL_DESTINATIONS: NavDestination[] = [
  { icon: 'dashboard', label: 'Resumen', url: '/resumen', match: ['/resumen'] },
  { icon: 'calendar_month', label: 'Calendario', url: '/calendario', match: ['/calendario'] },
  { icon: 'task_alt', label: 'Tareas', url: '/tareas', match: ['/tareas'] },
  { icon: 'settings', label: 'Configuración', url: '/configuracion', match: ['/configuracion'] },
];

export const BOTTOM_DESTINATIONS: NavDestination[] = [
  {
    icon: 'today',
    label: 'Hoy',
    url: '/calendario/dia',
    match: ['/resumen', '/calendario/dia', '/calendario/semana'],
  },
  { icon: 'calendar_month', label: 'Mes', url: '/calendario/mes', match: ['/calendario/mes'] },
  { icon: 'task_alt', label: 'Tareas', url: '/tareas', match: ['/tareas'] },
  { icon: 'settings', label: 'Ajustes', url: '/configuracion', match: ['/configuracion'] },
];
