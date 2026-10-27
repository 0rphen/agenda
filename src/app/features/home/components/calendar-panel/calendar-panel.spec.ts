import { TestBed } from '@angular/core/testing';
import { CalendarPanel } from './calendar-panel';

function render(selectedDay = '2026-10-22') {
  const fixture = TestBed.createComponent(CalendarPanel);
  fixture.componentRef.setInput('today', '2026-10-22');
  fixture.componentRef.setInput('selectedDay', selectedDay);
  fixture.componentRef.setInput('range', 'day');
  fixture.componentRef.setInput('eventDays', ['2026-10-23']);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('CalendarPanel', () => {
  it('R18: breadcrumb, h1, segmented, mini-calendar y botón en orden', () => {
    const { el } = render();
    expect([...el.children].map((child) => child.tagName.toLowerCase())).toEqual([
      'app-breadcrumb',
      'h1',
      'app-segmented-control',
      'app-mini-calendar',
      'app-button',
    ]);
    expect(el.querySelector('h1.page-title')?.textContent?.trim()).toBe('Octubre 2026');
    expect(el.querySelector('app-breadcrumb')?.textContent).toContain('Calendario');
    expect(el.querySelector('app-breadcrumb a')).toBeNull();
    expect(el.querySelector('app-button')?.textContent).toContain('Configurar vista');
    const options = [...el.querySelectorAll('.segmented__option')].map((o) =>
      o.textContent?.trim(),
    );
    expect(options).toEqual(['Hoy', 'Esta semana', 'Próxima']);
  });

  it('R18: el título sigue al mes del día elegido', () => {
    expect(render('2027-01-05').el.querySelector('h1')?.textContent?.trim()).toBe('Enero 2027');
  });

  it('R19: mini-calendar marca seleccionado y días con eventos', () => {
    const { el } = render();
    expect(el.querySelector('.calendar__day[aria-pressed="true"]')?.textContent?.trim()).toBe('22');
    expect(el.querySelectorAll('.calendar__dot')).toHaveLength(1);
  });

  it('R20: elegir día emite daySelected', () => {
    const { fixture, el } = render();
    const emitted: string[] = [];
    fixture.componentInstance.daySelected.subscribe((iso) => emitted.push(iso));
    const day = [...el.querySelectorAll<HTMLButtonElement>('.calendar__day')].find(
      (b) => b.textContent?.trim() === '23' && !b.hasAttribute('data-out'),
    )!;
    day.click();
    expect(emitted).toEqual(['2026-10-23']);
  });

  it('R21: cambiar vista emite rangeChanged', () => {
    const { fixture, el } = render();
    const emitted: string[] = [];
    fixture.componentInstance.rangeChanged.subscribe((range) => emitted.push(range));
    el.querySelectorAll<HTMLButtonElement>('.segmented__option')[1].click();
    expect(emitted).toEqual(['week']);
  });

  it('R35: clases de host', () => {
    const { el } = render();
    expect([...el.classList]).toEqual(['l-shell__calendar', 'panel', 'l-stack']);
    expect(el.dataset['gap']).toBe('m');
  });
});
