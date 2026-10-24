import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { WeekStrip } from './week-strip';
import { WeekDay } from '@shared/interfaces';

const DAYS: WeekDay[] = [
  { iso: '2026-10-19', dow: 'L', num: 19 },
  { iso: '2026-10-20', dow: 'M', num: 20, hasEvents: true },
  { iso: '2026-10-22', dow: 'J', num: 22, today: true, hasEvents: true },
];

@Component({
  imports: [WeekStrip],
  template: `<app-week-strip [days]="days" [(selected)]="selected" />`,
})
class Host {
  days = DAYS;
  selected = signal<string | undefined>('2026-10-20');
}

function renderHost() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const strip: HTMLElement = fixture.nativeElement.querySelector('app-week-strip');
  const buttons = () => Array.from<HTMLButtonElement>(strip.querySelectorAll('button'));
  return { fixture, strip, buttons };
}

describe('WeekStrip', () => {
  it('R1: host .week-strip, role group y aria-label por defecto o propio', () => {
    const { strip } = renderHost();
    expect(strip.classList).toContain('week-strip');
    expect(strip.getAttribute('role')).toBe('group');
    expect(strip.getAttribute('aria-label')).toBe('Días de la semana');

    const fixture = TestBed.createComponent(WeekStrip);
    fixture.componentRef.setInput('days', DAYS);
    fixture.componentRef.setInput('label', 'Semana del 19 de octubre');
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Semana del 19 de octubre');
  });

  it('R2: una píldora fluida por día, en orden, con sus datos', () => {
    const { buttons } = renderHost();
    expect(buttons()).toHaveLength(3);
    expect(buttons().map((b) => b.textContent!.replace(/\s/g, ''))).toEqual(['L19', 'M20', 'J22']);
    expect(buttons().every((b) => b.hasAttribute('data-fluid'))).toBe(true);
    const [plain, events, today] = buttons();
    expect(plain.querySelector('.day-pill__dot')).toBeNull();
    expect(events.querySelector('.day-pill__dot')).not.toBeNull();
    expect(today.getAttribute('aria-current')).toBe('date');
    expect(plain.hasAttribute('data-today')).toBe(false);
  });

  it('R3: solo la píldora del ISO seleccionado tiene aria-pressed="true"', () => {
    const { fixture, buttons } = renderHost();
    expect(buttons().map((b) => b.getAttribute('aria-pressed'))).toEqual([
      'false',
      'true',
      'false',
    ]);
    fixture.componentInstance.selected.set(undefined);
    fixture.detectChanges();
    expect(buttons().map((b) => b.getAttribute('aria-pressed'))).toEqual([
      'false',
      'false',
      'false',
    ]);
  });

  it('R4: clic actualiza selected con el ISO del día', () => {
    const { fixture, buttons } = renderHost();
    buttons()[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe('2026-10-22');
    expect(buttons()[2].getAttribute('aria-pressed')).toBe('true');
  });

  it('R5: aria-label con la fecha completa, hoy y eventos', () => {
    const { buttons } = renderHost();
    expect(buttons().map((b) => b.getAttribute('aria-label'))).toEqual([
      'Lunes 19 de octubre',
      'Martes 20 de octubre, con eventos',
      'Jueves 22 de octubre, hoy, con eventos',
    ]);
  });
});
