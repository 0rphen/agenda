import { TestBed } from '@angular/core/testing';
import { CalendarEvent } from '../../../agenda/domain/calendar-event.model';
import { AgendaStatus } from '../../../agenda/domain/agenda-view.model';
import { AgendaGroup } from '../../domain/home-view.model';
import { AgendaPanel } from './agenda-panel';

const base: CalendarEvent = {
  id: 'a',
  title: 'A',
  date: '2026-10-22',
  people: [],
  confirmed: false,
};
const groups: AgendaGroup[] = [
  {
    day: '2026-10-22',
    title: 'Jueves 22 octubre',
    events: [
      { ...base, id: 'todo', title: 'Viaje' },
      {
        ...base,
        id: 'item',
        title: 'Dentista',
        start: '10:00',
        end: '11:00',
        categoryLabel: 'Salud',
      },
      {
        ...base,
        id: 'card',
        title: 'Reunión',
        start: '12:00',
        end: '13:00',
        location: 'Sala 2',
        tint: 'mint',
        people: ['Ana López'],
        confirmed: true,
      },
      { ...base, id: 'card2', title: 'Café', start: '16:00', end: '16:30', people: ['Luis'] },
    ],
  },
];

function render(status: AgendaStatus, value: AgendaGroup[] = groups) {
  const fixture = TestBed.createComponent(AgendaPanel);
  fixture.componentRef.setInput('status', status);
  fixture.componentRef.setInput('groups', value);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('AgendaPanel', () => {
  it('R22: cabecera con título y botones', () => {
    const { el } = render('ready');
    expect(el.querySelector('h2.section-title[data-tone="brand"]')?.textContent?.trim()).toBe(
      'Tu agenda',
    );
    const labels = [...el.querySelectorAll('app-icon-button button')].map((b) =>
      b.getAttribute('aria-label'),
    );
    expect(labels).toEqual(['Buscar', 'Nueva cita']);
  });

  it('R16: mientras carga muestra skeleton agenda', () => {
    for (const status of ['idle', 'loading'] as const) {
      const { el } = render(status);
      expect(el.querySelector('app-skeleton-list')?.getAttribute('data-variant')).toBe('agenda');
      expect(el.querySelector('app-agenda-item')).toBeNull();
    }
  });

  it('R24: título de grupo', () => {
    expect(render('ready').el.querySelector('.agenda-group__title')?.textContent?.trim()).toBe(
      'Jueves 22 octubre',
    );
  });

  it('R25–R26: agenda-item sin personas, todo el día en lugar de horas', () => {
    const items = render('ready').el.querySelectorAll('app-agenda-item');
    expect(items).toHaveLength(2);
    expect(items[0].querySelector('.agenda-item__start')?.textContent?.trim()).toBe('Todo el día');
    expect(items[0].querySelector('.agenda-item__end')).toBeNull();
    expect(items[1].querySelector('.agenda-item__time')?.textContent).toContain('11:00');
    expect(items[1].textContent).toContain('Salud');
  });

  it('R25: event-card con personas; badge solo si confirmed', () => {
    const cards = render('ready').el.querySelectorAll('app-event-card');
    expect(cards).toHaveLength(2);
    expect(cards[0].querySelector('.event-card__time')?.textContent?.trim()).toBe('12:00 – 13:00');
    expect(cards[0].querySelector('.event-card__meta')?.textContent).toContain('Sala 2');
    expect(cards[0].querySelector('app-badge')?.textContent).toContain('Confirmada');
    expect(cards[1].querySelector('app-badge')).toBeNull();
  });

  it('R27: rango sin eventos muestra empty state', () => {
    const empty = render('ready', []).el.querySelector('app-empty-state')!;
    expect(empty.querySelector('.empty-state__title')?.textContent?.trim()).toBe('Sin citas');
    expect(empty.textContent).toContain('No tienes nada en estos días.');
    expect(empty.textContent).toContain('event_available');
  });

  it('R17: error muestra alert y Reintentar emite retry', () => {
    const { fixture, el } = render('error');
    const alert = el.querySelector('app-alert')!;
    expect(alert.getAttribute('data-tone')).toBe('danger');
    expect(alert.textContent).toContain('No se pudo cargar tu agenda');
    expect(alert.textContent).toContain(
      'Revisa el almacenamiento del navegador e inténtalo de nuevo.',
    );
    let retries = 0;
    fixture.componentInstance.retry.subscribe(() => retries++);
    alert.querySelector<HTMLButtonElement>('app-button button')!.click();
    expect(retries).toBe(1);
  });

  it('R35: clases de host', () => {
    const { el } = render('ready');
    expect([...el.classList]).toEqual(['l-shell__agenda', 'panel', 'l-stack']);
    expect(el.dataset['variant']).toBe('surface');
    expect(el.dataset['gap']).toBe('xs');
  });

  it('SPEC 60 R17, R21: «Nueva cita» emite newEvent', () => {
    const { fixture, el } = render('ready');
    const spy = vi.fn();
    fixture.componentInstance.newEvent.subscribe(spy);
    el.querySelector<HTMLButtonElement>('app-icon-button button[aria-label="Nueva cita"]')!.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
