import { TestBed } from '@angular/core/testing';
import { AgendaStatus, ListProgress } from '../../../agenda/domain/agenda-view.model';
import { AgendaConflict } from '../../domain/overview-view.model';
import { OverviewSide } from './overview-side';

const progress: ListProgress[] = [
  { list: 'Diseño web', value: 100 },
  { list: 'Investigación', value: 72 },
];

function render(
  inputs: Partial<{
    status: AgendaStatus;
    progress: ListProgress[];
    conflict: AgendaConflict | undefined;
  }> = {},
) {
  const fixture = TestBed.createComponent(OverviewSide);
  const values = { status: 'ready', progress, ...inputs };
  fixture.componentRef.setInput('today', '2026-10-22');
  fixture.componentRef.setInput('eventDays', ['2026-10-22', '2026-10-27']);
  for (const [key, value] of Object.entries(values)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

const text = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim();

describe('OverviewSide', () => {
  it('R32: host l-shell__panel panel l-stack side con gap m', () => {
    const el = render();
    expect(el.className).toBe('l-shell__panel panel l-stack');
    expect(el.getAttribute('data-variant')).toBe('side');
    expect(el.getAttribute('data-gap')).toBe('m');
  });

  it('R29: MiniCalendar con hoy seleccionado y días con eventos', () => {
    const el = render();
    expect(el.firstElementChild?.localName).toBe('app-mini-calendar');
    expect(el.querySelector('[aria-current="date"]')?.textContent?.trim()).toBe('22');
    expect(el.querySelector('[aria-pressed="true"]')?.textContent?.trim()).toBe('22');
    expect(el.querySelectorAll('.calendar__dot')).toHaveLength(2);
  });

  it('R29: sin eventos marcados hasta ready', () => {
    expect(render({ status: 'loading' }).querySelectorAll('.calendar__dot')).toHaveLength(0);
  });

  it('R30: «Avance de la semana» con un Progress por lista', () => {
    const card = render().querySelector('app-card')!;
    expect(text(card.querySelector('.card__title'))).toBe('Avance de la semana');
    const bars = card.querySelectorAll('app-progress');
    expect(bars).toHaveLength(2);
    expect(text(bars[0])).toContain('Diseño web');
  });

  it('R30: sin progreso o sin ready, no hay Card', () => {
    expect(render({ progress: [] }).querySelector('app-card')).toBeNull();
    expect(render({ status: 'loading' }).querySelector('app-card')).toBeNull();
  });

  it('R31: conflicto muestra Alert warning; sin conflicto no', () => {
    const el = render({ conflict: { time: '09:30', first: 'Reunión', second: 'Llamada' } });
    const alert = el.querySelector('app-alert')!;
    expect(alert.getAttribute('data-tone')).toBe('warning');
    expect(text(alert)).toContain('Conflicto de agenda');
    expect(text(alert)).toContain('Hoy a las 09:30 coinciden «Reunión» y «Llamada».');
    expect(render().querySelector('app-alert')).toBeNull();
  });
});
