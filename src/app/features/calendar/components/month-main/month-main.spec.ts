import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MonthViewEvent } from '@shared/interfaces';
import { AgendaStatus } from '../../../agenda/domain/agenda-view.model';
import { CalendarEvent } from '../../../agenda/domain/calendar-event.model';
import { MonthMain } from './month-main';

const events: MonthViewEvent[] = [
  { id: 'viaje', day: '2026-10-22', title: 'Viaje', category: 'violet' },
  { day: '2026-10-22', title: 'Kickoff', start: '09:00', category: 'blue' },
  { day: '2026-10-22', title: 'Comida', start: '13:00', category: 'green' },
  { day: '2026-10-22', title: 'Revisión', start: '17:00', category: 'blue' },
];

function render(
  inputs: Partial<{
    status: AgendaStatus;
    day: string;
    year: number;
    month: number;
    eventDays: string[];
    dayEvents: CalendarEvent[];
  }> = {},
) {
  const fixture = TestBed.createComponent(MonthMain);
  const values = {
    status: 'ready',
    today: '2026-10-22',
    day: '2026-10-22',
    year: 2026,
    month: 9,
    events,
  };
  for (const [key, value] of Object.entries({ ...values, ...inputs })) {
    fixture.componentRef.setInput(key, value);
  }
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

const text = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim();

describe('MonthMain', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('R15: host de main con breadcrumb, h1 «Octubre 2026» y controles', () => {
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
    expect(crumbs[2]).toBe('Octubre 2026');
    const head = el.querySelector(':scope > .l-cluster[data-justify="between"]')!;
    expect(text(head.querySelector('h1.page-title'))).toBe('Octubre 2026');
    const tools = head.querySelector('.l-cluster[data-gap="xs"]')!;
    const arrows = [...tools.querySelectorAll('app-icon-button button')];
    expect(arrows.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Mes anterior',
      'Mes siguiente',
    ]);
    expect(arrows.map((b) => text(b))).toEqual(['chevron_left', 'chevron_right']);
    const today = tools.querySelector('app-button')!;
    expect(text(today)).toBe('Hoy');
    expect(today.querySelector('button')!.getAttribute('data-variant')).toBe('secondary');
    expect(today.querySelector('button')!.getAttribute('data-size')).toBe('s');
    const options = [...tools.querySelectorAll('.segmented__option')];
    expect(options.map((o) => text(o))).toEqual(['Día', 'Semana', 'Mes']);
    expect(options[2].getAttribute('aria-checked') ?? options[2].getAttribute('aria-pressed')).toBe(
      'true',
    );
  });

  it('SPEC 75 R12: cabecera y MonthView solo en escritorio; MiniCalendar móvil en Card', () => {
    const { el, fixture } = render({ eventDays: ['2026-10-22'] });
    expect(el.querySelector('app-breadcrumb')!.classList).toContain('u-desktop-only');
    expect(el.querySelector('h1.page-title')!.parentElement!.classList).toContain('u-desktop-only');
    expect(el.querySelector('app-month-view')!.classList).toContain('u-desktop-only');
    const mobile = el.querySelector('.u-mobile-only')!;
    const calendar = mobile.querySelector('app-card app-mini-calendar')!;
    expect(calendar.querySelector('.calendar__day[aria-pressed="true"]')?.textContent?.trim()).toBe(
      '22',
    );
    expect(calendar.querySelectorAll('.calendar__dot')).toHaveLength(1);
    const spy = vi.fn();
    fixture.componentInstance.dayChanged.subscribe(spy);
    const day = [...calendar.querySelectorAll<HTMLButtonElement>('.calendar__day')].find(
      (d) => d.textContent?.trim() === '15',
    )!;
    day.click();
    expect(spy).toHaveBeenCalledWith('2026-10-15');
  });

  it('SPEC 75 R13–R14: citas del día como AgendaItem; vacío «Sin citas»', () => {
    const base = { date: '2026-10-22', people: [], confirmed: false };
    const dayEvents: CalendarEvent[] = [
      { ...base, id: 'v', title: 'Viaje' },
      {
        ...base,
        id: 'k',
        title: 'Kickoff',
        start: '09:00',
        end: '10:00',
        category: 'blue',
        categoryLabel: 'Desarrollo',
      },
    ];
    const { el, fixture } = render({ dayEvents });
    const mobile = el.querySelector('.u-mobile-only')!;
    expect(text(mobile.querySelector('h2.section-title'))).toBe('Jueves 22 de octubre');
    const items = mobile.querySelectorAll('app-agenda-item');
    expect(text(items[0].querySelector('.agenda-item__start'))).toBe('Todo el día');
    expect(text(items[1])).toContain('09:00');
    expect(text(items[1])).toContain('10:00');
    expect(text(items[1])).toContain('Desarrollo');
    const spy = vi.fn();
    const day = vi.fn();
    fixture.componentInstance.eventEdited.subscribe(spy);
    fixture.componentInstance.dayOpened.subscribe(day);
    items[1].querySelector('button')!.click();
    // SPEC 79 R9: edita la cita en vez de abrir el día
    expect(spy).toHaveBeenCalledWith(dayEvents[1].id);
    expect(day).not.toHaveBeenCalled();
    fixture.componentRef.setInput('dayEvents', []);
    fixture.detectChanges();
    expect(text(mobile.querySelector('app-empty-state'))).toContain('Sin citas');
  });

  it('R15: título sigue al día, sin «de»', () => {
    const { el } = render({ day: '2027-01-31', year: 2027, month: 0 });
    expect(text(el.querySelector('h1'))).toBe('Enero 2027');
    expect(text([...el.querySelectorAll('app-breadcrumb li')].at(-1))).toBe('Enero 2027');
  });

  it('R7: flechas emiten day ∓ 1 mes recortando; «Hoy» emite today', () => {
    const { fixture, el } = render({ day: '2026-01-31', year: 2026, month: 0 });
    const out: string[] = [];
    fixture.componentInstance.dayChanged.subscribe((day) => out.push(day));
    el.querySelectorAll<HTMLButtonElement>('app-icon-button button').forEach((b) => b.click());
    el.querySelector<HTMLButtonElement>(':scope > .l-cluster app-button button')!.click();
    expect(out).toEqual(['2025-12-31', '2026-02-28', '2026-10-22']);
  });

  it('R8: «Día» y «Semana» emiten viewChanged', () => {
    const { fixture, el } = render();
    const views: string[] = [];
    fixture.componentInstance.viewChanged.subscribe((view) => views.push(view));
    const options = el.querySelectorAll<HTMLButtonElement>('.segmented__option');
    options[0].click();
    options[1].click();
    expect(views).toEqual(['dia', 'semana']);
  });

  it('R16: ready pinta el MonthView con mes, seleccionado, citas y máx. 3 por día', () => {
    const { el } = render({ day: '2026-10-15' });
    const view = el.querySelector('app-month-view')!;
    expect(view.getAttribute('aria-label')).toBe('Octubre 2026');
    expect(view.querySelectorAll('.month-view__cell')).toHaveLength(42);
    expect(text(view.querySelector('.month-view__cell[data-selected] .month-view__num'))).toBe(
      '15',
    );
    expect(text(view.querySelector('.month-view__cell[data-today] .month-view__num'))).toBe('22');
    const chips = [...view.querySelectorAll('.month-view__chip')].map((c) => text(c));
    expect(chips).toEqual(['Viaje', '09:00 Kickoff', '13:00 Comida']);
    expect(text(view.querySelector('.month-view__more'))).toBe('+1 más');
    expect(el.querySelector('app-skeleton-list')).toBeNull();
  });

  it('R7: clic en un número (también fuera de mes) emite ese día', () => {
    const { fixture, el } = render();
    const out: string[] = [];
    fixture.componentInstance.dayChanged.subscribe((day) => out.push(day));
    const nums = el.querySelectorAll<HTMLButtonElement>('.month-view__num');
    nums[0].click(); // lunes 28 sep, fuera de mes
    nums[10].click();
    expect(out).toEqual(['2026-09-28', '2026-10-08']);
  });

  it('SPEC 79 R9, R11: chip emite eventEdited con el id; «+N más» emite dayOpened', () => {
    const { fixture, el } = render();
    const days: string[] = [];
    const edited: string[] = [];
    fixture.componentInstance.dayOpened.subscribe((day) => days.push(day));
    fixture.componentInstance.eventEdited.subscribe((id) => edited.push(id));
    el.querySelector<HTMLButtonElement>('.month-view__chip')!.click();
    el.querySelector<HTMLButtonElement>('.month-view__more')!.click();
    expect(edited).toEqual(['viaje']);
    expect(days).toEqual(['2026-10-22']);
  });

  it('R17: mientras carga muestra skeleton agenda y no el MonthView', () => {
    for (const status of ['idle', 'loading'] as const) {
      const { el } = render({ status });
      expect(el.querySelector('app-skeleton-list')?.getAttribute('data-variant')).toBe('agenda');
      expect(el.querySelector('app-month-view')).toBeNull();
    }
  });

  it('R18: error muestra Alert danger con «Reintentar» que emite retry', () => {
    const { fixture, el } = render({ status: 'error' });
    const alert = el.querySelector('app-alert')!;
    expect(alert.getAttribute('data-tone')).toBe('danger');
    expect(alert.textContent).toContain('No se pudo cargar tu agenda');
    expect(alert.textContent).toContain(
      'Revisa el almacenamiento del navegador e inténtalo de nuevo.',
    );
    expect(el.querySelector('app-month-view')).toBeNull();
    let retries = 0;
    fixture.componentInstance.retry.subscribe(() => retries++);
    [...alert.querySelectorAll<HTMLButtonElement>('button')]
      .find((b) => text(b)?.includes('Reintentar'))!
      .click();
    expect(retries).toBe(1);
  });

  it('R21: no inyecta servicios: se crea sin providers', () => {
    expect(() => render()).not.toThrow();
  });
});
