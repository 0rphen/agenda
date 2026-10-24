import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DayPill } from './day-pill';

function render(inputs: Record<string, unknown> = {}): HTMLButtonElement {
  const fixture = TestBed.createComponent(DayPill);
  const all = { dow: 'M', num: 20, ...inputs };
  for (const [key, value] of Object.entries(all)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement.querySelector('button');
}

// Atributos sin valor y `(clicked)` necesitan un host.
@Component({
  imports: [DayPill],
  template: `
    <app-day-pill dow="J" num="22" today hasEvents fluid selected (clicked)="last = $event" />
    <app-day-pill dow="L" [num]="19" disabled (clicked)="clicks = clicks + 1" />
  `,
})
class Host {
  last?: MouseEvent;
  clicks = 0;
}

function renderHost() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const [on, disabled] = Array.from<HTMLButtonElement>(
    fixture.nativeElement.querySelectorAll('button'),
  );
  return { host: fixture.componentInstance, on, disabled };
}

describe('DayPill', () => {
  it('R1: un único button.day-pill con dow y num en orden', () => {
    const button = render();
    expect(button.parentElement!.querySelectorAll('button')).toHaveLength(1);
    expect(button.getAttribute('type')).toBe('button');
    expect(button.classList).toContain('day-pill');
    const [dow, num] = Array.from(button.children);
    expect(dow.outerHTML).toBe('<span class="day-pill__dow">M</span>');
    expect(num.outerHTML).toBe('<span class="day-pill__num">20</span>');
    expect(renderHost().on.querySelector('.day-pill__num')!.textContent).toBe('22');
  });

  it('R2: aria-pressed sigue a selected', () => {
    expect(render().getAttribute('aria-pressed')).toBe('false');
    expect(render({ selected: true }).getAttribute('aria-pressed')).toBe('true');
    expect(renderHost().on.getAttribute('aria-pressed')).toBe('true');
  });

  it('R3: today da data-today y aria-current="date"', () => {
    const plain = render();
    expect(plain.hasAttribute('data-today')).toBe(false);
    expect(plain.hasAttribute('aria-current')).toBe(false);
    const { on } = renderHost();
    expect(on.getAttribute('data-today')).toBe('');
    expect(on.getAttribute('aria-current')).toBe('date');
  });

  it('R4: hasEvents añade el punto tras el número', () => {
    expect(render().querySelector('.day-pill__dot')).toBeNull();
    const dot = renderHost().on.lastElementChild!;
    expect(dot.matches('span.day-pill__dot')).toBe(true);
    expect(dot.previousElementSibling!.classList).toContain('day-pill__num');
  });

  it('R5: fluid da data-fluid', () => {
    expect(render().hasAttribute('data-fluid')).toBe(false);
    expect(renderHost().on.getAttribute('data-fluid')).toBe('');
  });

  it('R6: disabled nativo', () => {
    expect(render().disabled).toBe(false);
    expect(renderHost().disabled.disabled).toBe(true);
  });

  it('R7: aria-label solo con label', () => {
    expect(render().hasAttribute('aria-label')).toBe(false);
    const label = 'Jueves 22 de octubre, hoy, con eventos';
    expect(render({ label }).getAttribute('aria-label')).toBe(label);
  });

  it('R8: clic emite clicked; mientras disabled no', () => {
    const { host, on, disabled } = renderHost();
    on.click();
    expect(host.last).toBeInstanceOf(MouseEvent);
    disabled.click();
    expect(host.clicks).toBe(0);
  });
});
