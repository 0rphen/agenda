import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { WeekDay, WeekViewAllDay, WeekViewEvent, WeekViewSlot } from '@shared/interfaces';
import { AgendaStatus } from '../../../agenda/domain/agenda-view.model';
import { WeekMain } from './week-main';

const days: WeekDay[] = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].map((dow, i) => ({
  iso: `2026-10-${19 + i}`,
  dow,
  num: 19 + i,
  today: i === 3,
}));
const events: WeekViewEvent[] = [
  { id: 'a', day: '2026-10-19', start: '10:00', end: '11:00', title: 'Kickoff' },
  { id: 'b', day: '2026-10-22', start: '12:00', end: '13:00', title: 'Comida', selected: true },
];
const allDay: WeekViewAllDay[] = [{ day: '2026-10-25', title: 'Viaje', category: 'violet' }];

function render(inputs: Partial<{ status: AgendaStatus; day: string; now: string }> = {}) {
  const fixture = TestBed.createComponent(WeekMain);
  const values = {
    status: 'ready',
    today: '2026-10-22',
    day: '2026-10-22',
    days,
    events,
    allDay,
  };
  for (const [key, value] of Object.entries({ ...values, ...inputs })) {
    fixture.componentRef.setInput(key, value);
  }
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

const text = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim();

describe('WeekMain', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('R22: host de main con breadcrumb, h1 con el rango y controles', () => {
    const { el } = render();
    expect(el.className).toBe('l-shell__main panel l-stack');
    expect(el.getAttribute('data-gap')).toBe('m');
    const crumbs = [...el.querySelectorAll('app-breadcrumb li')].map((li) => text(li));
    expect(crumbs).toHaveLength(3);
    expect(crumbs[0]).toContain('home Inicio');
    expect(el.querySelector('app-breadcrumb a.breadcrumb__link')?.getAttribute('href')).toBe(
      '/inicio',
    );
    expect(crumbs[1]).toContain('Calendario');
    expect(crumbs[2]).toBe('Semana 43');
    const head = el.querySelector(':scope > .l-cluster[data-justify="between"]')!;
    expect(text(head.querySelector('h1.page-title'))).toBe('19 – 25 de octubre, 2026');
    const tools = head.querySelector('.l-cluster[data-gap="xs"]')!;
    const arrows = [...tools.querySelectorAll('app-icon-button button')];
    expect(arrows.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Semana anterior',
      'Semana siguiente',
    ]);
    expect(arrows.map((b) => text(b))).toEqual(['chevron_left', 'chevron_right']);
    const today = tools.querySelector('app-button')!;
    expect(text(today)).toBe('Hoy');
    expect(today.querySelector('button')!.getAttribute('data-variant')).toBe('secondary');
    expect(today.querySelector('button')!.getAttribute('data-size')).toBe('s');
    const options = [...tools.querySelectorAll('.segmented__option')];
    expect(options.map((o) => text(o))).toEqual(['Día', 'Semana', 'Mes']);
    expect(options[1].getAttribute('aria-checked') ?? options[1].getAttribute('aria-pressed')).toBe(
      'true',
    );
  });

  it('R22: título y semana siguen al día, cruzando año', () => {
    const { el } = render({ day: '2027-01-01' });
    expect(text(el.querySelector('h1'))).toBe('28 de diciembre, 2026 – 3 de enero, 2027');
    expect(text([...el.querySelectorAll('app-breadcrumb li')].at(-1))).toBe('Semana 53');
  });

  it('R12: flechas emiten day ∓ 7; «Hoy» emite today', () => {
    const { fixture, el } = render({ day: '2026-10-28' });
    const out: string[] = [];
    fixture.componentInstance.dayChanged.subscribe((day) => out.push(day));
    el.querySelectorAll<HTMLButtonElement>('app-icon-button button').forEach((b) => b.click());
    el.querySelector<HTMLButtonElement>('app-button button')!.click();
    expect(out).toEqual(['2026-10-21', '2026-11-04', '2026-10-22']);
  });

  it('R13: «Día» y «Mes» emiten viewChanged', () => {
    const { fixture, el } = render();
    const views: string[] = [];
    fixture.componentInstance.viewChanged.subscribe((view) => views.push(view));
    const options = el.querySelectorAll<HTMLButtonElement>('.segmented__option');
    options[0].click();
    options[2].click();
    expect(views).toEqual(['dia', 'mes']);
  });

  it('R23: ready pinta el WeekView con días, citas, todo el día y ahora', () => {
    const { el } = render({ now: '10:30' });
    const view = el.querySelector('app-week-view')!;
    expect(view.getAttribute('aria-label')).toBe('Semana 43');
    expect(view.querySelectorAll('.week-view__col')).toHaveLength(7);
    expect(view.querySelectorAll('.week-view__time')).toHaveLength(24);
    expect(view.querySelectorAll('.week-view__event')).toHaveLength(2);
    expect(view.textContent).toContain('Viaje');
    expect(view.querySelector('.week-view__now')).not.toBeNull();
    expect(el.querySelector('app-skeleton-list')).toBeNull();
  });

  it('R24: clic en cita emite su id; clic en hueco emite día y hora', () => {
    const { fixture, el } = render();
    const ids: string[] = [];
    const slots: WeekViewSlot[] = [];
    fixture.componentInstance.eventSelected.subscribe((id) => ids.push(id));
    fixture.componentInstance.slotClicked.subscribe((slot) => slots.push(slot));
    el.querySelectorAll<HTMLButtonElement>('.week-view__event')[0].click();
    el.querySelectorAll('.week-view__col')[3]
      .querySelectorAll<HTMLButtonElement>('.week-view__slot')[10]
      .click();
    expect(ids).toEqual(['a']);
    expect(slots).toEqual([{ day: '2026-10-22', hour: '10:00' }]);
  });

  it('R25: mientras carga muestra skeleton agenda y no el WeekView', () => {
    for (const status of ['idle', 'loading'] as const) {
      const { el } = render({ status });
      expect(el.querySelector('app-skeleton-list')?.getAttribute('data-variant')).toBe('agenda');
      expect(el.querySelector('app-week-view')).toBeNull();
    }
  });

  it('R26: error muestra Alert danger con «Reintentar» que emite retry', () => {
    const { fixture, el } = render({ status: 'error' });
    const alert = el.querySelector('app-alert')!;
    expect(alert.getAttribute('data-tone')).toBe('danger');
    expect(alert.textContent).toContain('No se pudo cargar tu agenda');
    expect(alert.textContent).toContain(
      'Revisa el almacenamiento del navegador e inténtalo de nuevo.',
    );
    expect(el.querySelector('app-week-view')).toBeNull();
    let retries = 0;
    fixture.componentInstance.retry.subscribe(() => retries++);
    [...alert.querySelectorAll<HTMLButtonElement>('button')]
      .find((b) => text(b)?.includes('Reintentar'))!
      .click();
    expect(retries).toBe(1);
  });

  it('R30: no inyecta servicios: se crea sin providers', () => {
    expect(() => render()).not.toThrow();
  });
});
