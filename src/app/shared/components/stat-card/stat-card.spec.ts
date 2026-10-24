import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StatCard } from './stat-card';

function render(inputs: Record<string, unknown> = {}): HTMLElement {
  const fixture = TestBed.createComponent(StatCard);
  const all = { icon: 'event', label: 'Citas hoy', value: 5, ...inputs };
  for (const [key, value] of Object.entries(all)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement;
}

// `button[app-stat-card]` y `(clicked)` necesitan un host.
@Component({
  imports: [StatCard],
  template: `
    <app-stat-card icon="event" label="Citas hoy" value="5" (clicked)="clicks = clicks + 1" />
    <button
      app-stat-card
      icon="task_alt"
      label="Pendientes"
      value="7"
      (clicked)="last = $event"
    ></button>
  `,
})
class Host {
  last?: MouseEvent;
  clicks = 0;
}

function renderHost() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const [staticCard, button] = Array.from<HTMLElement>(
    fixture.nativeElement.querySelectorAll('.stat-card'),
  );
  return { host: fixture.componentInstance, staticCard, button };
}

describe('StatCard', () => {
  it('R1: host .stat-card con icono decorativo, etiqueta y valor en orden', () => {
    const card = render();
    expect(card.classList).toContain('stat-card');
    const [icon, label, value] = Array.from(card.children);
    expect(icon.matches('span.stat-card__icon')).toBe(true);
    const glyph = icon.querySelector('app-icon')!;
    expect(glyph.textContent).toBe('event');
    expect(glyph.getAttribute('aria-hidden')).toBe('true');
    expect(label.outerHTML).toBe('<span class="stat-card__label">Citas hoy</span>');
    expect(value.outerHTML).toBe('<span class="stat-card__value">5</span>');
    expect(card.children).toHaveLength(3);
  });

  it('R2: hint añade .stat-card__hint tras el valor', () => {
    expect(render().querySelector('.stat-card__hint')).toBeNull();
    const hint = render({ hint: 'Próxima a las 14:30' }).lastElementChild!;
    expect(hint.outerHTML).toBe('<span class="stat-card__hint">Próxima a las 14:30</span>');
    expect(hint.previousElementSibling!.classList).toContain('stat-card__value');
  });

  it('R3: data-tone solo si no es brand', () => {
    expect(render().hasAttribute('data-tone')).toBe(false);
    expect(render({ tone: 'brand' }).hasAttribute('data-tone')).toBe(false);
    expect(render({ tone: 'accent' }).getAttribute('data-tone')).toBe('accent');
    expect(render({ tone: 'danger' }).getAttribute('data-tone')).toBe('danger');
  });

  it('R4: button[app-stat-card] con type="button" y data-interactive; estática sin ellos', () => {
    const { staticCard, button } = renderHost();
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('data-interactive')).toBe('');
    expect(staticCard.hasAttribute('type')).toBe(false);
    expect(staticCard.hasAttribute('data-interactive')).toBe(false);
  });

  it('R5: clic emite clicked solo en button[app-stat-card]', () => {
    const { host, staticCard, button } = renderHost();
    button.click();
    expect(host.last).toBeInstanceOf(MouseEvent);
    staticCard.click();
    expect(host.clicks).toBe(0);
  });

  it('R6: state escribe data-force', () => {
    expect(render().hasAttribute('data-force')).toBe(false);
    expect(render({ state: 'hover' }).getAttribute('data-force')).toBe('hover');
  });
});
