import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MiniCalendar } from './mini-calendar';
import { MiniCalendarForcedState } from '@shared/types';

const EVENTS = ['2026-10-02', '2026-10-22', '2026-11-03'];

@Component({
  imports: [MiniCalendar],
  template: `
    <app-mini-calendar
      today="2026-10-22"
      [events]="events"
      [isDisabled]="isDisabled"
      [forceState]="force"
      [(selected)]="selected"
    />
  `,
})
class Host {
  events = EVENTS;
  isDisabled = (iso: string) => iso === '2026-10-25';
  force: Record<string, MiniCalendarForcedState> = { '2026-10-14': 'hover' };
  selected = signal<string | undefined>('2026-10-27');
}

function renderHost() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const calendar: HTMLElement = fixture.nativeElement.querySelector('app-mini-calendar');
  const days = () => Array.from<HTMLButtonElement>(calendar.querySelectorAll('.calendar__day'));
  const day = (num: number, out = false) =>
    days().find(
      (b) => b.textContent!.trim() === String(num) && b.hasAttribute('data-out') === out,
    )!;
  const title = () => calendar.querySelector('.calendar__title')!.textContent!.trim();
  const nav = (label: string) =>
    calendar.querySelector<HTMLButtonElement>(`.calendar__nav button[aria-label="${label}"]`)!;
  return { fixture, calendar, days, day, title, nav };
}

describe('MiniCalendar', () => {
  it('R1: host .calendar con título h3 del mes en español', () => {
    const { calendar } = renderHost();
    expect(calendar.classList).toContain('calendar');
    const title = calendar.querySelector('.calendar__head h3.calendar__title');
    expect(title?.textContent?.trim()).toBe('Octubre de 2026');
  });

  it('R2: siete cabeceras L–D y 42 días desde el lunes de la semana del día 1', () => {
    const { calendar, days } = renderHost();
    const dows = Array.from(calendar.querySelectorAll('.calendar__grid .calendar__dow'));
    expect(dows.map((d) => d.textContent!.trim())).toEqual(['L', 'M', 'X', 'J', 'V', 'S', 'D']);
    expect(days()).toHaveLength(42);
    // 1 oct 2026 es jueves: la rejilla empieza el lunes 28 sep
    expect(days()[0].getAttribute('aria-label')).toBe('Lunes 28 de septiembre de 2026');
    expect(days()[3].textContent!.trim()).toBe('1');
  });

  it('R3: data-out solo en los días fuera del mes visible', () => {
    const { days } = renderHost();
    expect(days().filter((b) => b.hasAttribute('data-out'))).toHaveLength(42 - 31);
    expect(days()[0].hasAttribute('data-out')).toBe(true);
    expect(days()[3].hasAttribute('data-out')).toBe(false);
  });

  it('R4: hoy con data-today y aria-current="date"', () => {
    const { days, day } = renderHost();
    const today = days().filter((b) => b.hasAttribute('data-today'));
    expect(today).toEqual([day(22)]);
    expect(day(22).getAttribute('aria-current')).toBe('date');
    expect(day(21).hasAttribute('aria-current')).toBe(false);
  });

  it('R5: solo el seleccionado tiene aria-pressed="true"; sin selección, hoy', () => {
    const { fixture, days, day } = renderHost();
    expect(days().filter((b) => b.getAttribute('aria-pressed') === 'true')).toEqual([day(27)]);
    fixture.componentInstance.selected.set(undefined);
    fixture.detectChanges();
    expect(days().filter((b) => b.getAttribute('aria-pressed') === 'true')).toEqual([day(22)]);
  });

  it('R6: clic actualiza selected con el ISO del día', () => {
    const { fixture, day } = renderHost();
    day(15).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe('2026-10-15');
    expect(day(15).getAttribute('aria-pressed')).toBe('true');
  });

  it('R7: abre en el mes seleccionado y navega con las flechas', () => {
    const { fixture, title, nav } = renderHost();
    nav('Mes siguiente').click();
    fixture.detectChanges();
    expect(title()).toBe('Noviembre de 2026');
    nav('Mes anterior').click();
    nav('Mes anterior').click();
    fixture.detectChanges();
    expect(title()).toBe('Septiembre de 2026');
    fixture.componentInstance.selected.set('2027-01-05');
    fixture.detectChanges();
    expect(title()).toBe('Enero de 2027');
  });

  it('R8: punto de eventos solo en los días con eventos', () => {
    const { days, day } = renderHost();
    expect(days().filter((b) => b.querySelector('.calendar__dot'))).toEqual([
      day(2),
      day(22),
      day(3, true),
    ]);
  });

  it('R9: isDisabled deshabilita el día', () => {
    const { days, day } = renderHost();
    expect(days().filter((b) => b.disabled)).toEqual([day(25)]);
  });

  it('R10: aria-label con fecha completa, hoy y eventos', () => {
    const { day } = renderHost();
    expect(day(21).getAttribute('aria-label')).toBe('Miércoles 21 de octubre de 2026');
    expect(day(2).getAttribute('aria-label')).toBe('Viernes 2 de octubre de 2026, con eventos');
    expect(day(22).getAttribute('aria-label')).toBe(
      'Jueves 22 de octubre de 2026, hoy, con eventos',
    );
  });

  it('R11: forceState pone data-force en el día', () => {
    const { days, day } = renderHost();
    expect(day(14).getAttribute('data-force')).toBe('hover');
    expect(days().filter((b) => b.hasAttribute('data-force'))).toHaveLength(1);
  });
});

describe('MiniCalendar teclado (SPEC 49)', () => {
  const tabStops = (days: HTMLButtonElement[]) =>
    days.filter((b) => b.getAttribute('tabindex') === '0');
  const press = (key: string) =>
    (document.activeElement as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true }),
    );

  it('R6: solo el día enfocado tiene tabindex="0"; el resto -1', () => {
    const { days, day } = renderHost();
    expect(tabStops(days())).toEqual([day(27)]);
    expect(days().filter((b) => b.getAttribute('tabindex') === '-1')).toHaveLength(41);
  });

  it('R7, R8: → desde el último día pasa al día 1 del mes siguiente', async () => {
    const { fixture, day, title } = renderHost();
    fixture.componentInstance.selected.set('2026-10-31');
    fixture.detectChanges();
    day(31).focus();
    press('ArrowRight');
    await fixture.whenStable();
    expect(title()).toBe('Noviembre de 2026');
    expect(document.activeElement).toBe(day(1));
  });

  it('R7: ↓ salta el día deshabilitado', async () => {
    const { fixture, day, title } = renderHost();
    day(27).focus();
    press('ArrowUp');
    await fixture.whenStable();
    expect(document.activeElement).toBe(day(20));
    day(18).click();
    fixture.detectChanges();
    press('ArrowDown');
    await fixture.whenStable();
    // 25 está deshabilitado: 18 + 14 = 1 de noviembre
    expect(title()).toBe('Noviembre de 2026');
    expect(document.activeElement).toBe(day(1));
  });

  it('R9: «Mes siguiente» mueve el tabindex al mismo día sin mover el foco', () => {
    const { fixture, days, day, nav } = renderHost();
    const next = nav('Mes siguiente');
    next.focus();
    next.click();
    fixture.detectChanges();
    expect(tabStops(days())).toEqual([day(27)]);
    expect(day(27).hasAttribute('data-out')).toBe(false);
    expect(document.activeElement).toBe(next);
    fixture.componentInstance.selected.set('2026-10-31');
    fixture.detectChanges();
    next.click();
    fixture.detectChanges();
    expect(tabStops(days())).toEqual([day(30)]);
  });

  it('R10: título con aria-live="polite"', () => {
    const { calendar } = renderHost();
    expect(calendar.querySelector('.calendar__title')!.getAttribute('aria-live')).toBe('polite');
  });
});
