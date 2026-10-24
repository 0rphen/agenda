import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AgendaItem } from './agenda-item';

function render(inputs: Record<string, unknown> = {}): HTMLButtonElement {
  const fixture = TestBed.createComponent(AgendaItem);
  const all = { start: '08:30', heading: '3 categorías de rocas', ...inputs };
  for (const [key, value] of Object.entries(all)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement.querySelector('button');
}

// Atributos sin valor y `(clicked)` necesitan un host.
@Component({
  imports: [AgendaItem],
  template: `
    <app-agenda-item start="14:30" heading="Reunión" selected cancelled (clicked)="last = $event" />
    <app-agenda-item start="07:00" heading="Evento pasado" disabled (clicked)="clicks = clicks + 1" />
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

describe('AgendaItem', () => {
  it('R1: un único button.agenda-item con hora, barra y título en orden', () => {
    const button = render();
    expect(button.parentElement!.querySelectorAll('button')).toHaveLength(1);
    expect(button.getAttribute('type')).toBe('button');
    expect(button.classList).toContain('agenda-item');
    const [time, bar, text] = Array.from(button.children);
    expect(time.classList).toContain('agenda-item__time');
    expect(time.children).toHaveLength(1);
    expect(time.firstElementChild!.outerHTML).toBe('<span class="agenda-item__start">08:30</span>');
    expect(bar.classList).toContain('agenda-item__bar');
    expect(bar.getAttribute('aria-hidden')).toBe('true');
    expect(text.children).toHaveLength(1);
    expect(text.firstElementChild!.outerHTML).toBe(
      '<span class="agenda-item__title">3 categorías de rocas</span>',
    );
  });

  it('R2: end añade agenda-item__end tras el inicio', () => {
    const end = render({ end: '09:00' }).querySelector('.agenda-item__time')!.lastElementChild!;
    expect(end.outerHTML).toBe('<span class="agenda-item__end">09:00</span>');
    expect(render().querySelector('.agenda-item__end')).toBeNull();
  });

  it('R3: category da u-category y data-category', () => {
    const plain = render();
    expect(plain.classList).not.toContain('u-category');
    expect(plain.hasAttribute('data-category')).toBe(false);
    const button = render({ category: 'violet' });
    expect(button.classList).toContain('u-category');
    expect(button.getAttribute('data-category')).toBe('violet');
  });

  it('R4: categoryLabel antes del título', () => {
    expect(render().querySelector('.agenda-item__category')).toBeNull();
    const label = render({ categoryLabel: 'Marketing' }).querySelector('.agenda-item__category')!;
    expect(label.textContent).toBe('Marketing');
    expect(label.nextElementSibling!.classList).toContain('agenda-item__title');
  });

  it('R1: heading estático no deja title nativo en el host', () => {
    const { on } = renderHost();
    expect(on.parentElement!.hasAttribute('title')).toBe(false);
    expect(on.querySelector('.agenda-item__title')!.textContent).toBe('Reunión');
  });

  it('R5: aria-pressed y data-selected siguen a selected', () => {
    const plain = render();
    expect(plain.getAttribute('aria-pressed')).toBe('false');
    expect(plain.hasAttribute('data-selected')).toBe(false);
    const { on } = renderHost();
    expect(on.getAttribute('aria-pressed')).toBe('true');
    expect(on.getAttribute('data-selected')).toBe('');
  });

  it('R6: cancelled da data-cancelled y texto oculto antes del título', () => {
    const plain = render();
    expect(plain.hasAttribute('data-cancelled')).toBe(false);
    expect(plain.querySelector('.u-visually-hidden')).toBeNull();
    const { on } = renderHost();
    expect(on.getAttribute('data-cancelled')).toBe('');
    const hidden = on.querySelector('.u-visually-hidden')!;
    expect(hidden.textContent).toBe('Cancelada. ');
    expect(hidden.nextElementSibling!.classList).toContain('agenda-item__title');
  });

  it('R7: disabled nativo', () => {
    expect(render().disabled).toBe(false);
    expect(renderHost().disabled.disabled).toBe(true);
  });

  it('R8: clic emite clicked; mientras disabled no', () => {
    const { host, on, disabled } = renderHost();
    on.click();
    expect(host.last).toBeInstanceOf(MouseEvent);
    disabled.click();
    expect(host.clicks).toBe(0);
  });
});
