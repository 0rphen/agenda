import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AgendaStatus } from '../../../agenda/domain/agenda-view.model';
import { CalendarEvent } from '../../../agenda/domain/calendar-event.model';
import { Task } from '../../../agenda/domain/task.model';
import { OverviewStats } from '../../domain/overview-view.model';
import { OverviewMain } from './overview-main';

const stats: OverviewStats = {
  eventsToday: 3,
  nextStart: '13:00',
  pending: 4,
  dueToday: 2,
  reservedHours: '6,3 h',
  completed: 2,
  planned: 5,
};
const next: CalendarEvent = {
  id: 'e1',
  title: 'Configurar repositorio',
  date: '2026-10-22',
  start: '14:30',
  end: '16:20',
  tint: 'sky',
  location: 'Oficina',
  people: ['Ana Ruiz', 'Luis Gil'],
  confirmed: false,
};
const todayEvents: CalendarEvent[] = [
  { id: 'a', title: 'Festivo', date: '2026-10-22', people: [], confirmed: false },
  { ...next, category: 'blue', categoryLabel: 'Desarrollo' },
];
const dueTasks: Task[] = [
  { id: 't1', title: 'Renovar licencia', done: false, due: '2026-10-20', list: 'Personal' },
  { id: 't2', title: 'Consultar al contador', done: false, due: '2026-10-22' },
];

type Inputs = Partial<{
  status: AgendaStatus;
  stats: OverviewStats;
  nextEvent: CalendarEvent | undefined;
  nextEventBadge: string | undefined;
  dueTasks: Task[];
  todayEvents: CalendarEvent[];
  saveError: boolean;
}>;

function render(inputs: Inputs = {}) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(OverviewMain);
  const values: Inputs = {
    status: 'ready',
    stats,
    nextEvent: next,
    nextEventBadge: 'En 1 h 20 min',
    dueTasks,
    todayEvents,
    ...inputs,
  };
  fixture.componentRef.setInput('today', '2026-10-22');
  fixture.componentRef.setInput('greeting', 'Buenos días, César');
  for (const [key, value] of Object.entries(values)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const card = (heading: string) =>
    Array.from(el.querySelectorAll('app-card')).find(
      (c) => c.querySelector('.card__title')?.textContent?.trim() === heading,
    )!;
  return { fixture, el, card, component: fixture.componentInstance };
}

const text = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim();

describe('OverviewMain', () => {
  it('R32: host l-shell__main panel l-stack con gap m', () => {
    const { el } = render();
    expect(el.className).toBe('l-shell__main panel l-stack');
    expect(el.getAttribute('data-gap')).toBe('m');
  });

  it('R14: breadcrumb, cabecera con saludo y «Nueva cita» accent', () => {
    const { el } = render();
    const crumbs = Array.from(el.querySelectorAll('app-breadcrumb li')).map(text);
    expect(crumbs.join(' ')).toContain('Inicio');
    expect(crumbs.join(' ')).toContain('Resumen');
    const head = el.querySelector('app-breadcrumb + .l-cluster')!;
    expect(text(head.querySelector('h1.page-title'))).toBe('Buenos días, César');
    const button = head.querySelector('app-button')!;
    expect(text(button)).toContain('Nueva cita');
    expect(button.querySelector('button')?.getAttribute('data-variant')).toBe('accent');
  });

  it('R15: lead con día largo y recuento cuando ready', () => {
    expect(text(render().el.querySelector('p.page-lead'))).toBe(
      'Jueves 22 de octubre · tienes 3 citas hoy y 2 tareas que vencen.',
    );
  });

  it('R15: lead en singular', () => {
    const { el } = render({ stats: { ...stats, eventsToday: 1, dueToday: 1 } });
    expect(text(el.querySelector('p.page-lead'))).toBe(
      'Jueves 22 de octubre · tienes 1 cita hoy y 1 tarea que vence.',
    );
  });

  it('R15, R27: cargando muestra solo el día y skeleton agenda', () => {
    const { el } = render({ status: 'loading' });
    expect(text(el.querySelector('p.page-lead'))).toBe('Jueves 22 de octubre');
    expect(el.querySelector('app-skeleton-list')?.getAttribute('data-variant')).toBe('agenda');
    expect(el.querySelector('.stat-card, app-card')).toBeNull();
  });

  it('R16: cuatro StatCard con valores y hints', () => {
    const cards = Array.from(render().el.querySelectorAll('.l-grid[data-min="s"] > .stat-card'));
    expect(cards.map((c) => c.localName)).toEqual([
      'button',
      'button',
      'app-stat-card',
      'app-stat-card',
    ]);
    expect(cards.map((c) => text(c.querySelector('.stat-card__label')))).toEqual([
      'Citas hoy',
      'Pendientes',
      'Reservadas',
      'Completadas',
    ]);
    expect(cards.map((c) => text(c.querySelector('.stat-card__value')))).toEqual([
      '3',
      '4',
      '6,3 h',
      '2',
    ]);
    expect(cards.map((c) => text(c.querySelector('.stat-card__hint')))).toEqual([
      'Próxima a las 13:00',
      '2 vencen hoy',
      'De 8 h disponibles',
      'De 5 planificadas',
    ]);
    expect(cards.map((c) => c.getAttribute('data-tone'))).toEqual([
      null,
      'accent',
      'info',
      'success',
    ]);
  });

  it('R16: hints sin próxima cita y una que vence', () => {
    const { el } = render({ stats: { ...stats, nextStart: undefined, dueToday: 1 } });
    const hints = Array.from(el.querySelectorAll('.stat-card__hint')).map(text);
    expect(hints.slice(0, 2)).toEqual(['Sin más citas hoy', '1 vence hoy']);
  });

  it('R17, R20: StatCards y EventCard emiten la navegación', () => {
    const { el, component } = render();
    const day = vi.fn();
    const tasks = vi.fn();
    component.dayOpened.subscribe(day);
    component.tasksOpened.subscribe(tasks);
    const [events, pending] = el.querySelectorAll<HTMLButtonElement>('button.stat-card');
    events.click();
    pending.click();
    el.querySelector<HTMLButtonElement>('app-event-card button')!.click();
    expect(day).toHaveBeenCalledTimes(2);
    expect(tasks).toHaveBeenCalledTimes(1);
  });

  it('R18, R19: grid con «Próxima cita» (EventCard + badge) y «Tareas que vencen»', () => {
    const { el, card } = render();
    const grid = el.querySelector('.l-grid[data-min="l"][data-gap="m"][data-align="start"]')!;
    expect(Array.from(grid.children).map((c) => text(c.querySelector('.card__title')))).toEqual([
      'Próxima cita',
      'Tareas que vencen',
    ]);
    const nextCard = card('Próxima cita');
    const badge = nextCard.querySelector('.card__head app-badge')!;
    expect(badge.getAttribute('data-tone')).toBe('info');
    expect(text(badge)).toContain('En 1 h 20 min');
    const event = nextCard.querySelector('app-event-card')!;
    expect(text(event.querySelector('.event-card__time'))).toBe('14:30 – 16:20');
    expect(event.querySelector('.event-card')?.getAttribute('data-tint')).toBe('sky');
    expect(text(event.querySelector('.event-card__meta'))).toContain('Oficina');
    expect(event.querySelector('app-avatar-group')).not.toBeNull();
  });

  it('R21: sin nextEvent, EmptyState', () => {
    const nextCard = render({ nextEvent: undefined, nextEventBadge: undefined }).card(
      'Próxima cita',
    );
    expect(nextCard.querySelector('app-badge')).toBeNull();
    expect(text(nextCard.querySelector('app-empty-state'))).toContain('Sin próximas citas');
    expect(text(nextCard.querySelector('app-empty-state'))).toContain(
      'No tienes citas pendientes.',
    );
  });

  it('R22: «Ver todas» a /tareas; TaskItem con día corto y overdue', () => {
    const { card } = render();
    const tasksCard = card('Tareas que vencen');
    const link = tasksCard.querySelector<HTMLAnchorElement>('.card__head a')!;
    expect(text(link)).toBe('Ver todas');
    expect(link.getAttribute('href')).toBe('/tareas');
    const items = tasksCard.querySelectorAll('app-task-item');
    expect(items).toHaveLength(2);
    expect(text(items[0].querySelector('.task-item__due'))).toContain('20 oct');
    expect(items[0].hasAttribute('data-overdue')).toBe(true);
    expect(items[1].hasAttribute('data-overdue')).toBe(false);
  });

  it('R23: marcar tarea emite toggled', () => {
    const { el, component } = render();
    const spy = vi.fn();
    component.toggled.subscribe(spy);
    el.querySelector<HTMLInputElement>('app-task-item input[type="checkbox"]')!.click();
    expect(spy).toHaveBeenCalledWith({ id: 't1', done: true });
  });

  it('R24: sin dueTasks, EmptyState', () => {
    const tasksCard = render({ dueTasks: [] }).card('Tareas que vencen');
    expect(text(tasksCard.querySelector('app-empty-state'))).toContain('Nada vence hoy');
    expect(text(tasksCard.querySelector('app-empty-state'))).toContain(
      'Estás al día con tus tareas.',
    );
  });

  it('R25: saveError muestra Alert danger que al cerrar emite', () => {
    const { card, component } = render({ saveError: true });
    const spy = vi.fn();
    component.saveErrorDismissed.subscribe(spy);
    const alert = card('Tareas que vencen').querySelector('app-alert')!;
    expect(alert.getAttribute('data-tone')).toBe('danger');
    expect(text(alert)).toContain('No se pudo guardar la tarea.');
    alert.querySelector<HTMLButtonElement>('app-icon-button button')!.click();
    expect(spy).toHaveBeenCalled();
  });

  it('R26: «Agenda de hoy» con «Abrir día» y AgendaItem por evento', () => {
    const { el, card } = render();
    const agenda = card('Agenda de hoy');
    expect(el.lastElementChild).toBe(agenda);
    const link = agenda.querySelector('.card__head a')!;
    expect(text(link)).toContain('Abrir día');
    expect(link.getAttribute('href')).toBe('/calendario/dia');
    const items = agenda.querySelectorAll('app-agenda-item');
    expect(items).toHaveLength(2);
    expect(text(items[0])).toContain('Todo el día');
    expect(text(items[1])).toContain('Configurar repositorio');
  });

  it('R26: sin eventos de hoy, EmptyState', () => {
    const agenda = render({ todayEvents: [] }).card('Agenda de hoy');
    expect(text(agenda.querySelector('app-empty-state'))).toContain('Sin citas hoy');
    expect(text(agenda.querySelector('app-empty-state'))).toContain('No tienes nada para hoy.');
  });

  it('R28: error muestra Alert y Reintentar emite retry', () => {
    const { el, component } = render({ status: 'error' });
    const spy = vi.fn();
    component.retry.subscribe(spy);
    const alert = el.querySelector('app-alert')!;
    expect(alert.getAttribute('data-tone')).toBe('danger');
    expect(text(alert)).toContain('No se pudo cargar tu agenda');
    expect(text(alert)).toContain('Revisa el almacenamiento del navegador e inténtalo de nuevo.');
    expect(el.querySelector('app-skeleton-list, .stat-card')).toBeNull();
    alert.querySelector<HTMLButtonElement>('app-button button')!.click();
    expect(spy).toHaveBeenCalled();
  });
});
