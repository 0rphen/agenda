import { TestBed } from '@angular/core/testing';
import { MonthView } from './month-view';
import { MonthViewEvent } from '@shared/interfaces';

const EVENTS: MonthViewEvent[] = [
  { day: '2026-10-22', title: 'Rocas', start: '08:30', category: 'orange' },
  { day: '2026-10-22', title: 'Bestbuy', start: '09:30', category: 'violet' },
  { day: '2026-10-22', title: 'Repositorio', start: '14:30' },
  { day: '2026-10-22', title: 'Dentista', start: '17:00', category: 'green' },
  { day: '2026-10-22', title: 'Impuestos', category: 'mustard' },
  { day: '2026-10-23', title: 'Reunión', start: '10:00', cancelled: true, state: 'focus' },
];

function render(inputs: Record<string, unknown> = {}) {
  const fixture = TestBed.createComponent(MonthView);
  fixture.componentRef.setInput('year', 2026);
  fixture.componentRef.setInput('month', 9);
  fixture.componentRef.setInput('today', '2026-10-22');
  fixture.componentRef.setInput('events', EVENTS);
  for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  const $$ = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));
  const text = (n: Element | null) => n!.textContent!.replace(/\s+/g, ' ').trim();
  const cell = (day: number) => $$('.month-view__cell')[day + 2];
  const num = (day: number) => cell(day).querySelector<HTMLButtonElement>('.month-view__num')!;
  return { fixture, el, $$, text, cell, num };
}

describe('MonthView', () => {
  it('R1: host .month-view, role region y aria-label', () => {
    const { el } = render();
    expect(el.classList).toContain('month-view');
    expect(el.getAttribute('role')).toBe('region');
    expect(el.getAttribute('aria-label')).toBe('Mes');
    expect(render({ label: 'Octubre 2026' }).el.getAttribute('aria-label')).toBe('Octubre 2026');
  });

  it('R2: siete días de cabecera aria-hidden con forma larga y corta', () => {
    const { $$, text } = render();
    const dows = $$('.month-view__dow');
    expect(dows.length).toBe(7);
    expect(dows.every((d) => d.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(dows.map((d) => text(d.querySelector('.month-view__dow-long')))).toEqual([
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábado',
      'domingo',
    ]);
    expect(dows.map((d) => text(d.querySelector('.month-view__dow-short')))).toEqual([
      'lun',
      'mar',
      'mié',
      'jue',
      'vie',
      'sáb',
      'dom',
    ]);
  });

  it('R4: 42 celdas desde el lunes, fuera de mes, hoy y seleccionado', () => {
    const { $$, text, cell } = render({ selected: '2026-10-27' });
    const cells = $$('.month-view__cell');
    expect(cells.length).toBe(42);
    // Octubre 2026 empieza en jueves: la rejilla arranca el lunes 28 de septiembre
    expect(text(cells[0].querySelector('.month-view__num'))).toBe('28');
    expect(cells[0].getAttribute('aria-label')).toBe('Lunes 28 de septiembre de 2026');
    expect(cells[0].getAttribute('role')).toBe('group');
    expect(cells.filter((c) => c.hasAttribute('data-out')).length).toBe(11);
    expect(cell(22).hasAttribute('data-today')).toBe(true);
    expect(cells.filter((c) => c.hasAttribute('data-today')).length).toBe(1);
    expect(cell(27).hasAttribute('data-selected')).toBe(true);
    expect(cells.filter((c) => c.hasAttribute('data-selected')).length).toBe(1);
  });

  it('R5: número con aria-label, aria-pressed y aria-current en hoy', () => {
    const { num } = render({ selected: '2026-10-27' });
    expect(num(22).getAttribute('aria-label')).toBe('Jueves 22 de octubre de 2026, hoy');
    expect(num(22).getAttribute('aria-current')).toBe('date');
    expect(num(22).getAttribute('aria-pressed')).toBe('false');
    expect(num(27).getAttribute('aria-label')).toBe('Martes 27 de octubre de 2026');
    expect(num(27).getAttribute('aria-pressed')).toBe('true');
    expect(num(27).hasAttribute('aria-current')).toBe(false);
  });

  it('R6: pulsar un número fija selected, también fuera de mes', () => {
    const { fixture, $$ } = render();
    const emitted: (string | undefined)[] = [];
    fixture.componentInstance.selected.subscribe((v) => emitted.push(v));
    $$('.month-view__num')[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe('2026-09-28');
    expect(emitted).toEqual(['2026-09-28']);
    expect($$('.month-view__cell')[0].hasAttribute('data-selected')).toBe(true);
  });

  it('R7: hasta maxPerDay chips en orden, categoría, punto y texto', () => {
    const { cell, text } = render();
    const chips = Array.from(cell(22).querySelectorAll<HTMLElement>('.month-view__chip'));
    expect(chips.length).toBe(3);
    expect(chips.map((c) => text(c))).toEqual([
      '08:30 Rocas',
      '09:30 Bestbuy',
      '14:30 Repositorio',
    ]);
    expect(chips.every((c) => c.classList.contains('u-category'))).toBe(true);
    expect(chips.map((c) => c.dataset['category'])).toEqual(['orange', 'violet', 'blue']);
    expect(chips[0].querySelector('.badge__dot')!.hasAttribute('data-category-dot')).toBe(true);
    const all = render({ maxPerDay: 5 });
    const last = all.cell(22).querySelectorAll('.month-view__chip')[4];
    expect(all.text(last)).toBe('Impuestos');
  });

  it('R8: cancelado con data-cancelled y texto oculto; state en data-force', () => {
    const { cell, text } = render();
    const chip = cell(23).querySelector<HTMLElement>('.month-view__chip')!;
    expect(chip.hasAttribute('data-cancelled')).toBe(true);
    expect(chip.querySelector('.u-visually-hidden')!.textContent).toBe('Cancelado. ');
    expect(text(chip)).toBe('Cancelado. 10:00 Reunión');
    expect(chip.dataset['force']).toBe('focus');
    const plain = cell(22).querySelector<HTMLElement>('.month-view__chip')!;
    expect(plain.hasAttribute('data-cancelled')).toBe(false);
    expect(plain.hasAttribute('data-force')).toBe(false);
  });

  it('R9: pulsar un chip emite eventSelected', () => {
    const { fixture, cell } = render();
    const emitted: MonthViewEvent[] = [];
    fixture.componentInstance.eventSelected.subscribe((e) => emitted.push(e));
    cell(23).querySelector<HTMLElement>('.month-view__chip')!.click();
    expect(emitted).toEqual([EVENTS[5]]);
  });

  it('R10: «+N más» solo con más de maxPerDay y emite moreSelected', () => {
    const { fixture, cell, text, $$ } = render();
    const more = cell(22).querySelector<HTMLElement>('.month-view__more')!;
    expect(text(more)).toBe('+2 más');
    expect(more.previousElementSibling!.classList).toContain('month-view__chip');
    expect($$('.month-view__more').length).toBe(1);
    const emitted: string[] = [];
    fixture.componentInstance.moreSelected.subscribe((iso) => emitted.push(iso));
    more.click();
    expect(emitted).toEqual(['2026-10-22']);
    expect(render({ maxPerDay: 5 }).$$('.month-view__more').length).toBe(0);
  });

  it('R11: un solo tab stop: selected, si no today, si no el día 1', () => {
    const tabbable = (r: ReturnType<typeof render>) =>
      r.$$('.month-view__num').filter((b) => b.getAttribute('tabindex') === '0');
    const sel = render({ selected: '2026-10-27' });
    expect(tabbable(sel)).toEqual([sel.num(27)]);
    expect(sel.$$('.month-view__num[tabindex="-1"]').length).toBe(41);
    const today = render({ selected: '2027-01-05' });
    expect(tabbable(today)).toEqual([today.num(22)]);
    const first = render({ month: 10 });
    expect(tabbable(first).map((b) => b.textContent!.trim())).toEqual(['1']);
    expect(tabbable(first)[0].closest('.month-view__cell')!.hasAttribute('data-out')).toBe(false);
  });

  it('R12: flechas mueven el foco ±1/±7 sin salir de la rejilla ni cambiar selected', async () => {
    const { fixture, $$, num } = render({ selected: '2026-10-27' });
    const key = async (k: string) => {
      document.activeElement!.dispatchEvent(
        new KeyboardEvent('keydown', { key: k, bubbles: true }),
      );
      fixture.detectChanges();
      await fixture.whenStable();
    };
    num(27).focus();
    await key('ArrowRight');
    expect(document.activeElement).toBe(num(28));
    await key('ArrowDown');
    expect(document.activeElement?.textContent?.trim()).toBe('4');
    await key('ArrowUp');
    await key('ArrowLeft');
    expect(document.activeElement).toBe(num(27));
    expect(num(27).getAttribute('tabindex')).toBe('0');
    expect(fixture.componentInstance.selected()).toBe('2026-10-27');
    const first = $$('.month-view__num')[0];
    first.click();
    first.focus();
    await key('ArrowUp');
    await key('ArrowLeft');
    expect(document.activeElement).toBe(first);
    expect($$('.month-view__num').filter((b) => b.getAttribute('tabindex') === '0')).toEqual([
      first,
    ]);
  });
});
