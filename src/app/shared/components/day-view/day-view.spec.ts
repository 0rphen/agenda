import { TestBed } from '@angular/core/testing';
import { DayView } from './day-view';
import { DayViewEvent } from '@shared/interfaces';

const EVENTS: DayViewEvent[] = [
  { start: '08:30', end: '09:00', title: 'Rocas', tint: 'cream', category: 'Marketing' },
  {
    start: '09:30',
    end: '11:45',
    title: 'Lanzamiento',
    tint: 'mint',
    location: 'Sala 3',
    people: ['a', 'b', 'c'],
    selected: true,
  },
  {
    start: '10:00',
    end: '11:00',
    title: 'Revisión',
    location: 'Videollamada',
    locationIcon: 'videocam',
    people: ['a'],
  },
  { start: '15:00', end: '15:30', title: 'Llamada', cancelled: true, state: 'focus' },
];

function render(inputs: Record<string, unknown> = {}) {
  const fixture = TestBed.createComponent(DayView);
  fixture.componentRef.setInput('heading', 'Jueves 22 octubre');
  for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  const $ = (s: string) => el.querySelector<HTMLElement>(s);
  const $$ = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));
  const text = (n: Element | null) => n!.textContent!.replace(/\s+/g, ' ').trim();
  return { fixture, el, $, $$, text };
}

describe('DayView', () => {
  it('R1: host .day-view, role region y aria-label = heading', () => {
    const { el } = render();
    expect(el.classList).toContain('day-view');
    expect(el.getAttribute('role')).toBe('region');
    expect(el.getAttribute('aria-label')).toBe('Jueves 22 octubre');
  });

  it('R2: cabecera con título y contador singular/plural', () => {
    const { $, text, fixture } = render({ events: EVENTS });
    expect(text($('header.day-view__head .day-view__heading h2.day-view__title'))).toBe(
      'Jueves 22 octubre',
    );
    expect(text($('.day-view__count'))).toBe('4 eventos');
    fixture.componentRef.setInput('events', [EVENTS[0]]);
    fixture.detectChanges();
    expect(text($('.day-view__count'))).toBe('1 evento');
  });

  it('R3: today pone data-today y badge brand «Hoy»', () => {
    const off = render();
    expect(off.$('.day-view__heading')!.hasAttribute('data-today')).toBe(false);
    expect(off.$('app-badge')).toBeNull();
    const { $, text } = render({ today: true });
    expect($('.day-view__heading')!.hasAttribute('data-today')).toBe(true);
    const badge = $('.day-view__title + app-badge')!;
    expect(badge.getAttribute('data-tone')).toBe('brand');
    expect(text(badge)).toBe('Hoy');
  });

  it('R4: todo el día con badges por categoría (blue por defecto); vacío no renderiza', () => {
    expect(render().$('.day-view__allday')).toBeNull();
    const { $, $$, text } = render({
      allDay: [{ title: 'Cumpleaños', category: 'green' }, { title: 'Informe' }],
    });
    expect(text($('.day-view__allday-label'))).toBe('Todo el día');
    const badges = $$('.day-view__allday app-badge');
    expect(badges.map((b) => b.getAttribute('data-category'))).toEqual(['green', 'blue']);
    expect(badges.map(text)).toEqual(['Cumpleaños', 'Informe']);
  });

  it('R5: una hora por fila de startHour a endHour - 1', () => {
    const all = render().$$('.day-view__body .day-view__times .day-view__time');
    expect(all).toHaveLength(24);
    expect([all[0].textContent, all[23].textContent]).toEqual(['00:00', '23:00']);
    const { $$, text, $ } = render({ startHour: 9, endHour: 12 });
    expect($$('.day-view__time').map(text)).toEqual(['09:00', '10:00', '11:00']);
    expect($('.day-view__body > .day-view__track')).not.toBeNull();
  });

  it('R6: huecos con ícono add, texto, aria-label y slotState', () => {
    const { $$, text } = render({ startHour: 12, endHour: 14, slotState: 13 });
    const slots = $$('.day-view__track > button.day-view__slot');
    expect(slots).toHaveLength(2);
    expect(slots[0].querySelector('app-icon')!.textContent).toBe('add');
    expect(slots[0].querySelector('app-icon')!.getAttribute('data-size')).toBe('s');
    expect(text(slots[0])).toBe('add12:00');
    expect(slots.map((s) => s.getAttribute('aria-label'))).toEqual([
      'Agendar a las 12:00',
      'Agendar a las 13:00',
    ]);
    expect(slots.map((s) => s.getAttribute('data-force'))).toEqual([null, 'hover']);
  });

  it('R7: clic en hueco emite slotClicked con HH:00', () => {
    const { fixture, $$ } = render();
    const spy = vi.fn();
    fixture.componentInstance.slotClicked.subscribe(spy);
    $$('.day-view__slot')[9].click();
    expect(spy).toHaveBeenCalledWith('09:00');
  });

  it('R8: evento con u-tint, data-tint y --start/--span en horas', () => {
    const { $$ } = render({
      startHour: 8,
      events: [EVENTS[1], { start: '13:00', end: '14:00', title: 'X' }],
    });
    const [a, b] = $$('button.day-view__event.u-tint');
    expect(a.getAttribute('data-tint')).toBe('mint');
    expect(b.getAttribute('data-tint')).toBe('periwinkle');
    expect(a.style.getPropertyValue('--start')).toBe('1.5');
    expect(a.style.getPropertyValue('--span')).toBe('2.25');
    expect(b.style.getPropertyValue('--start')).toBe('5');
  });

  it('R9: eventos solapados en carriles; sin solape lane 0 / lanes 1', () => {
    const { $$ } = render({ events: EVENTS });
    const lanes = $$('.day-view__event').map((e) => [
      e.querySelector('.day-view__event-title')!.textContent,
      e.style.getPropertyValue('--lane'),
      e.style.getPropertyValue('--lanes'),
    ]);
    expect(lanes).toEqual([
      ['Rocas', '0', '1'],
      ['Lanzamiento', '0', '2'],
      ['Revisión', '1', '2'],
      ['Llamada', '0', '1'],
    ]);
  });

  it('R10: hora, categoría, título, lugar y asistentes', () => {
    const { $$, text } = render({ events: EVENTS });
    const [rocas, lanz, rev] = $$('.day-view__event');
    expect(text(rocas.querySelector('.day-view__event-time'))).toBe('08:30 – 09:00 · Marketing');
    expect(text(rocas.querySelector('.day-view__event-cat'))).toBe('· Marketing');
    expect(lanz.querySelector('.day-view__event-cat')).toBeNull();
    expect(text(lanz.querySelector('.day-view__event-title'))).toBe('Lanzamiento');
    expect(rocas.querySelector('.day-view__event-meta')).toBeNull();
    const meta = Array.from(lanz.querySelectorAll('.day-view__event-meta')).map(text);
    expect(meta).toEqual(['placeSala 3', 'group3 asistentes']);
    const revMeta = Array.from(rev.querySelectorAll('.day-view__event-meta')).map(text);
    expect(revMeta).toEqual(['videocamVideollamada', 'group1 asistente']);
  });

  it('R11: compacto si dura 45 min o menos', () => {
    const { $$ } = render({
      events: [
        { start: '08:00', end: '08:45', title: 'A' },
        { start: '09:00', end: '09:46', title: 'B' },
      ],
    });
    expect($$('.day-view__event').map((e) => e.hasAttribute('data-compact'))).toEqual([
      true,
      false,
    ]);
  });

  it('R12: seleccionado, cancelado y state', () => {
    const { $$, text } = render({ events: EVENTS });
    const [rocas, lanz, , llamada] = $$('.day-view__event');
    expect(lanz.hasAttribute('data-selected')).toBe(true);
    expect(lanz.getAttribute('aria-pressed')).toBe('true');
    expect(rocas.hasAttribute('data-selected')).toBe(false);
    expect(rocas.getAttribute('aria-pressed')).toBe('false');
    expect(llamada.hasAttribute('data-cancelled')).toBe(true);
    expect(llamada.firstElementChild!.classList).toContain('u-visually-hidden');
    expect(text(llamada.querySelector('.day-view__event-title'))).toBe('Llamada');
    expect(text(llamada.querySelector('.u-visually-hidden'))).toBe('Cancelado.');
    expect(rocas.querySelector('.u-visually-hidden')).toBeNull();
    expect(llamada.getAttribute('data-force')).toBe('focus');
    expect(rocas.hasAttribute('data-force')).toBe(false);
  });

  it('R13: clic en evento emite eventSelected con el evento', () => {
    const { fixture, $$ } = render({ events: EVENTS });
    const spy = vi.fn();
    fixture.componentInstance.eventSelected.subscribe(spy);
    $$('.day-view__event')[2].click();
    expect(spy).toHaveBeenCalledWith(EVENTS[2]);
  });

  it('R14: línea de ahora y pasado según now', () => {
    const none = render();
    expect(none.$('.day-view__now')).toBeNull();
    expect(none.$('.day-view__past')).toBeNull();
    expect(render({ startHour: 8, now: '07:30' }).$('.day-view__now')).toBeNull();

    const atStart = render({ startHour: 8, now: '08:00' });
    expect(atStart.$('.day-view__now')).not.toBeNull();
    expect(atStart.$('.day-view__past')).toBeNull();

    const { $ } = render({ startHour: 8, now: '13:15' });
    const now = $('.day-view__now')!;
    expect(now.getAttribute('role')).toBe('img');
    expect(now.getAttribute('aria-label')).toBe('Ahora 13:15');
    expect(now.style.getPropertyValue('--start')).toBe('5.25');
    const past = $('.day-view__past')!;
    expect(past.getAttribute('aria-hidden')).toBe('true');
    expect(past.style.getPropertyValue('--start')).toBe('5.25');
  });

  it('R16: ventana de visibleHours horas con scroll inicial a now - 1 h o scrollToHour', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(48);
    const { el, $, fixture } = render();
    await fixture.whenStable();
    expect(el.style.getPropertyValue('--visible')).toBe('10');
    expect($('.day-view__body')!.scrollTop).toBe(8 * 48);

    const custom = render({ startHour: 6, scrollToHour: 9, visibleHours: 5 });
    await custom.fixture.whenStable();
    expect(custom.el.style.getPropertyValue('--visible')).toBe('5');
    expect(custom.$('.day-view__body')!.scrollTop).toBe(3 * 48);

    const withNow = render({ now: '13:10' });
    await withNow.fixture.whenStable();
    expect(withNow.$('.day-view__body')!.scrollTop).toBe(12 * 48);

    const early = render({ startHour: 8, now: '08:20' });
    await early.fixture.whenStable();
    expect(early.$('.day-view__body')!.scrollTop).toBe(0);
    vi.restoreAllMocks();
  });
});
