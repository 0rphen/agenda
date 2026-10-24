import { TestBed } from '@angular/core/testing';
import { WeekDay } from '../week-strip/week-strip';
import { WeekView, WeekViewAllDay, WeekViewEvent } from './week-view';

const DAYS: WeekDay[] = [
  { iso: '2026-10-21', dow: 'mié', num: 21 },
  { iso: '2026-10-22', dow: 'jue', num: 22, today: true },
  { iso: '2026-10-23', dow: 'vie', num: 23 },
];

const EVENTS: WeekViewEvent[] = [
  { day: '2026-10-21', start: '11:00', end: '12:00', title: 'Proyecto', tint: 'rose' },
  { day: '2026-10-22', start: '09:30', end: '11:45', title: 'Lanzamiento', selected: true },
  {
    day: '2026-10-23',
    start: '10:00',
    end: '11:00',
    title: 'Reunión',
    cancelled: true,
    state: 'focus',
  },
];

function render(inputs: Record<string, unknown> = {}) {
  const fixture = TestBed.createComponent(WeekView);
  fixture.componentRef.setInput('days', DAYS);
  for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  const $ = (s: string) => el.querySelector<HTMLElement>(s);
  const $$ = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));
  const text = (n: Element | null) => n!.textContent!.replace(/\s+/g, ' ').trim();
  return { fixture, el, $, $$, text };
}

describe('WeekView', () => {
  it('R1: host .week-view, role region, aria-label y variables de horas', () => {
    const { el } = render();
    expect(el.classList).toContain('week-view');
    expect(el.getAttribute('role')).toBe('region');
    expect(el.getAttribute('aria-label')).toBe('Semana');
    expect(el.style.getPropertyValue('--hours')).toBe('24');
    expect(el.style.getPropertyValue('--visible-hours')).toBe('10');
    const custom = render({ label: 'Semana 43', startHour: 8, endHour: 18 });
    expect(custom.el.getAttribute('aria-label')).toBe('Semana 43');
    expect(custom.el.style.getPropertyValue('--hours')).toBe('10');
  });

  it('R2: cabecera con hueco inicial y un día por entrada, hoy con data-today', () => {
    const { $, $$, text } = render();
    expect($('.week-view__head > span:first-child')!.textContent).toBe('');
    const days = $$('.week-view__head .week-view__day');
    expect(days.length).toBe(3);
    expect(text(days[0].querySelector('.week-view__dow'))).toBe('mié');
    expect(text(days[0].querySelector('.week-view__num'))).toBe('21');
    expect(days.map((d) => d.hasAttribute('data-today'))).toEqual([false, true, false]);
  });

  it('R3: horas de startHour a endHour - 1 y columnas por día', () => {
    const { $$, text } = render();
    const times = $$('.week-view__body .week-view__times .week-view__time');
    expect(times.length).toBe(24);
    expect(text(times[0])).toBe('00:00');
    expect(text(times[23])).toBe('23:00');
    const cols = $$('.week-view__body > .week-view__col');
    expect(cols.length).toBe(3);
    expect(cols[0].getAttribute('role')).toBe('group');
    expect(cols[0].getAttribute('aria-label')).toBe('mié 21');
    expect(cols.map((c) => c.hasAttribute('data-today'))).toEqual([false, true, false]);
    const custom = render({ startHour: 8, endHour: 18 });
    const t = custom.$$('.week-view__time');
    expect(t.length).toBe(10);
    expect(custom.text(t[0])).toBe('08:00');
  });

  it('R4: eventos en su columna con tinte, posición, hora y título', () => {
    const { $$, text } = render({ events: EVENTS });
    const cols = $$('.week-view__col');
    expect(cols.map((c) => c.querySelectorAll('.week-view__event').length)).toEqual([1, 1, 1]);
    const [rose, plain] = [
      cols[0].querySelector<HTMLElement>('button.week-view__event.u-tint')!,
      cols[1].querySelector<HTMLElement>('.week-view__event')!,
    ];
    expect(rose.getAttribute('type')).toBe('button');
    expect(rose.dataset['tint']).toBe('rose');
    expect(plain.dataset['tint']).toBe('periwinkle');
    expect(rose.style.getPropertyValue('--start')).toBe('11');
    expect(rose.style.getPropertyValue('--span')).toBe('1');
    expect(plain.style.getPropertyValue('--start')).toBe('9.5');
    expect(plain.style.getPropertyValue('--span')).toBe('2.25');
    expect(text(plain.querySelector('.week-view__event-time'))).toBe('09:30 – 11:45');
    expect(text(plain.querySelector('.week-view__event-title'))).toBe('Lanzamiento');
    const shifted = render({ events: EVENTS, startHour: 8 });
    expect(shifted.$('.week-view__event')!.style.getPropertyValue('--start')).toBe('3');
  });

  it('R5: seleccionado, cancelado y estado forzado', () => {
    const { $$ } = render({ events: EVENTS });
    const [rose, selected, cancelled] = $$('.week-view__event');
    expect(selected.hasAttribute('data-selected')).toBe(true);
    expect(selected.getAttribute('aria-pressed')).toBe('true');
    expect(rose.hasAttribute('data-selected')).toBe(false);
    expect(rose.getAttribute('aria-pressed')).toBe('false');
    expect(cancelled.hasAttribute('data-cancelled')).toBe(true);
    expect(cancelled.querySelector('.u-visually-hidden')!.textContent).toBe('Cancelado. ');
    expect(rose.querySelector('.u-visually-hidden')).toBeNull();
    expect(cancelled.dataset['force']).toBe('focus');
    expect(rose.hasAttribute('data-force')).toBe(false);
  });

  it('R6: pulsar un evento emite eventSelected', () => {
    const { fixture, $$ } = render({ events: EVENTS });
    const emitted: WeekViewEvent[] = [];
    fixture.componentInstance.eventSelected.subscribe((e) => emitted.push(e));
    $$('.week-view__event')[2].click();
    expect(emitted).toEqual([EVENTS[2]]);
  });

  it('R7: línea de ahora solo en la columna de hoy', () => {
    const none = render();
    expect(none.$('.week-view__now')).toBeNull();

    const { $$ } = render({ now: '13:15' });
    const cols = $$('.week-view__col');
    const now = cols[1].querySelector<HTMLElement>('.week-view__now')!;
    expect(now.getAttribute('role')).toBe('img');
    expect(now.getAttribute('aria-label')).toBe('Ahora 13:15');
    expect(now.style.getPropertyValue('--start')).toBe('13.25');
    expect($$('.week-view__now').length).toBe(1);

    const early = render({ now: '07:00', startHour: 8 });
    expect(early.$('.week-view__now')).toBeNull();

    const fixture = TestBed.createComponent(WeekView);
    fixture.componentRef.setInput('days', [DAYS[0]]);
    fixture.componentRef.setInput('now', '13:15');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.week-view__now')).toBeNull();
  });

  it('R8: scroll inicial a now - 1 h con hoy visible, o scrollToHour', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(56);
    const plain = render();
    await plain.fixture.whenStable();
    expect(plain.$('.week-view__body')!.scrollTop).toBe(8 * 56);

    const custom = render({ startHour: 6, scrollToHour: 9 });
    await custom.fixture.whenStable();
    expect(custom.$('.week-view__body')!.scrollTop).toBe(3 * 56);

    const withNow = render({ now: '13:10' });
    await withNow.fixture.whenStable();
    expect(withNow.$('.week-view__body')!.scrollTop).toBe(12 * 56);

    const early = render({ startHour: 8, now: '08:20' });
    await early.fixture.whenStable();
    expect(early.$('.week-view__body')!.scrollTop).toBe(0);

    const fixture = TestBed.createComponent(WeekView);
    fixture.componentRef.setInput('days', [DAYS[0]]);
    fixture.componentRef.setInput('now', '13:10');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.week-view__body').scrollTop).toBe(8 * 56);
    vi.restoreAllMocks();
  });

  it('R10: solapes del mismo día en carriles; días distintos no se agrupan', () => {
    const events: WeekViewEvent[] = [
      { day: '2026-10-22', start: '09:00', end: '11:00', title: 'A' },
      { day: '2026-10-22', start: '10:00', end: '11:00', title: 'B' },
      { day: '2026-10-22', start: '12:00', end: '13:00', title: 'C' },
      { day: '2026-10-23', start: '10:00', end: '11:00', title: 'D' },
    ];
    const { $$, text } = render({ events });
    const lanes = $$('.week-view__event').map((b) => [
      text(b.querySelector('.week-view__event-title')),
      b.style.getPropertyValue('--lane'),
      b.style.getPropertyValue('--lanes'),
    ]);
    expect(lanes).toEqual([
      ['A', '0', '2'],
      ['B', '1', '2'],
      ['C', '0', '1'],
      ['D', '0', '1'],
    ]);
  });

  it('R11: fila «Todo el día» con un badge en la celda de su día', () => {
    expect(render().$('.week-view__allday')).toBeNull();
    const allDay: WeekViewAllDay[] = [
      { day: '2026-10-22', title: 'Cumpleaños', category: 'green' },
      { day: '2026-10-23', title: 'Entrega' },
    ];
    const { $, $$, text } = render({ allDay });
    expect(text($('.week-view__head + .week-view__allday > .week-view__allday-label'))).toBe(
      'Todo el día',
    );
    const cells = $$('.week-view__allday-cell');
    expect(cells.length).toBe(3);
    expect(cells.map((c) => c.querySelectorAll('app-badge').length)).toEqual([0, 1, 1]);
    const [green, blue] = $$('.week-view__allday-cell app-badge');
    expect(text(green)).toBe('Cumpleaños');
    expect(green.dataset['category']).toBe('green');
    expect(blue.dataset['category']).toBe('blue');
  });
});
