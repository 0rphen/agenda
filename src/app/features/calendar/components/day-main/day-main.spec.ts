import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DayViewAllDay, DayViewEvent, WeekDay } from '@shared/interfaces';
import { AgendaStatus } from '../../../agenda/domain/agenda-view.model';
import { DayMain } from './day-main';

const events: DayViewEvent[] = [
  { id: 'a', start: '10:00', end: '11:00', title: 'Kickoff' },
  { id: 'b', start: '12:00', end: '13:00', title: 'Comida', selected: true },
];
const allDay: DayViewAllDay[] = [{ title: 'Viaje', category: 'violet' }];

function render(
  inputs: Partial<{
    status: AgendaStatus;
    day: string;
    isToday: boolean;
    now: string;
    weekDays: WeekDay[];
  }> = {},
) {
  const fixture = TestBed.createComponent(DayMain);
  const values = { status: 'ready', today: '2026-10-22', day: '2026-10-22', events, allDay };
  for (const [key, value] of Object.entries({ ...values, ...inputs })) {
    fixture.componentRef.setInput(key, value);
  }
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

const text = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim();

describe('DayMain', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('R18, R29: host de main con breadcrumb, h1 con el día largo y controles', () => {
    const { el } = render();
    expect(el.className).toBe('l-shell__main l-screen__main panel l-stack');
    expect(el.getAttribute('data-gap')).toBe('m');
    const crumbs = [...el.querySelectorAll('app-breadcrumb li')].map((li) => text(li));
    expect(crumbs).toHaveLength(3);
    expect(crumbs[0]).toContain('home Inicio');
    expect(el.querySelector('app-breadcrumb a.breadcrumb__link')?.getAttribute('href')).toBe(
      '/inicio',
    );
    expect(crumbs[1]).toContain('Calendario');
    expect(crumbs[2]).toBe('22 de octubre');
    const head = el.querySelector(':scope > .l-cluster[data-justify="between"]')!;
    expect(text(head.querySelector('h1.page-title'))).toBe('Jueves 22 de octubre');
    const tools = head.querySelector('.l-cluster[data-gap="xs"]')!;
    expect(
      [...tools.querySelectorAll('app-icon-button button')].map((b) =>
        b.getAttribute('aria-label'),
      ),
    ).toEqual(['Día anterior', 'Día siguiente']);
    const today = tools.querySelector('app-button')!;
    expect(text(today)).toBe('Hoy');
    expect(today.querySelector('button')!.getAttribute('data-variant')).toBe('secondary');
    expect(today.querySelector('button')!.getAttribute('data-size')).toBe('s');
    const options = [...tools.querySelectorAll('.segmented__option')];
    expect(options.map((o) => text(o))).toEqual(['Día', 'Semana', 'Mes']);
    expect(options[0].getAttribute('aria-checked') ?? options[0].getAttribute('aria-pressed')).toBe(
      'true',
    );
  });

  it('SPEC 75 R8: cabecera solo en escritorio; WeekStrip móvil que emite dayChanged', () => {
    const weekDays: WeekDay[] = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].map((dow, i) => ({
      iso: `2026-10-${19 + i}`,
      dow,
      num: 19 + i,
      hasEvents: i === 3,
    }));
    const { el, fixture } = render({ weekDays });
    expect(el.querySelector('app-breadcrumb')!.classList).toContain('u-desktop-only');
    expect(el.querySelector('h1.page-title')!.parentElement!.classList).toContain('u-desktop-only');
    const strip = el.querySelector('app-week-strip')!;
    expect(strip.classList).toContain('u-mobile-only');
    const pills = strip.querySelectorAll<HTMLButtonElement>('.day-pill');
    expect(pills).toHaveLength(7);
    expect(pills[3].getAttribute('aria-pressed')).toBe('true');
    const spy = vi.fn();
    fixture.componentInstance.dayChanged.subscribe(spy);
    pills[5].click();
    expect(spy).toHaveBeenCalledWith('2026-10-24');
  });

  it('R18: el título sigue al día', () => {
    expect(text(render({ day: '2027-01-01' }).el.querySelector('h1'))).toBe('Viernes 1 de enero');
  });

  it('R9: flechas emiten el día anterior y siguiente; «Hoy» emite today', () => {
    const { fixture, el } = render({ day: '2026-10-31' });
    const days: string[] = [];
    fixture.componentInstance.dayChanged.subscribe((day) => days.push(day));
    el.querySelectorAll<HTMLButtonElement>('app-icon-button button').forEach((b) => b.click());
    el.querySelector<HTMLButtonElement>('app-button button')!.click();
    expect(days).toEqual(['2026-10-30', '2026-11-01', '2026-10-22']);
  });

  it('R10: «Semana» y «Mes» emiten viewChanged', () => {
    const { fixture, el } = render();
    const views: string[] = [];
    fixture.componentInstance.viewChanged.subscribe((view) => views.push(view));
    const options = el.querySelectorAll<HTMLButtonElement>('.segmented__option');
    options[1].click();
    options[2].click();
    expect(views).toEqual(['semana', 'mes']);
  });

  it('R19: ready pinta el DayView con heading, citas, todo el día, hoy y ahora', () => {
    const { el } = render({ isToday: true, now: '10:30' });
    const view = el.querySelector('app-day-view')!;
    expect(text(view.querySelector('h2, h3'))).toContain('Agenda del día');
    expect(view.querySelectorAll('.day-view__event')).toHaveLength(2);
    expect(view.textContent).toContain('Viaje');
    expect(view.textContent).toContain('Hoy');
    expect(view.querySelector('.day-view__now')).not.toBeNull();
    expect(el.querySelector('app-skeleton-list')).toBeNull();
  });

  it('R19: otro día sin Badge «Hoy» ni línea ahora', () => {
    const view = render().el.querySelector('app-day-view')!;
    expect(view.querySelector('.day-view__heading app-badge')).toBeNull();
    expect(view.querySelector('.day-view__now')).toBeNull();
  });

  it('R20: clic en cita emite su id; clic en hueco emite la hora', () => {
    const { fixture, el } = render();
    const ids: string[] = [];
    const hours: string[] = [];
    fixture.componentInstance.eventSelected.subscribe((id) => ids.push(id));
    fixture.componentInstance.slotClicked.subscribe((hour) => hours.push(hour));
    el.querySelectorAll<HTMLButtonElement>('.day-view__event')[0].click();
    el.querySelectorAll<HTMLButtonElement>('.day-view__slot')[10].click();
    expect(ids).toEqual(['a']);
    expect(hours).toEqual(['10:00']);
  });

  it('R21: mientras carga muestra skeleton agenda y no el DayView', () => {
    for (const status of ['idle', 'loading'] as const) {
      const { el } = render({ status });
      expect(el.querySelector('app-skeleton-list')?.getAttribute('data-variant')).toBe('agenda');
      expect(el.querySelector('app-day-view')).toBeNull();
    }
  });

  it('R22: error muestra Alert danger con «Reintentar» que emite retry', () => {
    const { fixture, el } = render({ status: 'error' });
    const alert = el.querySelector('app-alert')!;
    expect(alert.getAttribute('data-tone')).toBe('danger');
    expect(alert.textContent).toContain('No se pudo cargar tu agenda');
    expect(alert.textContent).toContain(
      'Revisa el almacenamiento del navegador e inténtalo de nuevo.',
    );
    expect(el.querySelector('app-day-view')).toBeNull();
    let retries = 0;
    fixture.componentInstance.retry.subscribe(() => retries++);
    [...alert.querySelectorAll<HTMLButtonElement>('button')]
      .find((b) => text(b)?.includes('Reintentar'))!
      .click();
    expect(retries).toBe(1);
  });
});
