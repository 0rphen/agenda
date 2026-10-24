import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Badge } from '@shared/components/badge/badge';
import { EventCard, EventCardBadge, EventCardStatus } from './event-card';

function render(inputs: Record<string, unknown> = {}): HTMLButtonElement {
  const fixture = TestBed.createComponent(EventCard);
  const all = { time: '08:00 – 09:00', heading: 'Reunión de planeación', ...inputs };
  for (const [key, value] of Object.entries(all)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement.querySelector('button');
}

// Atributos sin valor, slots proyectados y `(clicked)` necesitan un host.
@Component({
  imports: [EventCard, EventCardBadge, EventCardStatus, Badge],
  template: `
    <app-event-card
      time="08:00 – 09:00"
      heading="Reunión"
      selected
      cancelled
      (clicked)="last = $event"
    >
      <app-badge eventCardBadge tone="glass">Cancelada</app-badge>
      <span eventCardStatus>Ahora</span>
    </app-event-card>
    <app-event-card time="07:00" heading="Pasada" disabled (clicked)="clicks = clicks + 1" />
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

describe('EventCard', () => {
  it('R1: un único button.event-card.u-tint con top y título en orden', () => {
    const button = render();
    expect(button.parentElement!.querySelectorAll('button')).toHaveLength(1);
    expect(button.getAttribute('type')).toBe('button');
    expect(button.classList).toContain('event-card');
    expect(button.classList).toContain('u-tint');
    expect(button.getAttribute('data-tint')).toBe('periwinkle');
    const [top, title] = Array.from(button.children);
    expect(top.classList).toContain('event-card__top');
    expect(top.innerHTML).toBe('<span class="event-card__time">08:00 – 09:00</span>');
    expect(title.outerHTML).toBe('<span class="event-card__title">Reunión de planeación</span>');
    expect(button.children).toHaveLength(2);
  });

  it('R1: tint cambia data-tint', () => {
    expect(render({ tint: 'mint' }).getAttribute('data-tint')).toBe('mint');
  });

  it('R1: status proyectado en el top; heading estático sin title en el host', () => {
    const { on } = renderHost();
    expect(on.parentElement!.hasAttribute('title')).toBe(false);
    const top = on.querySelector('.event-card__top')!;
    expect(top.lastElementChild!.textContent).toBe('Ahora');
    expect(on.querySelector('.event-card__title')!.textContent).toBe('Reunión');
  });

  it('R2: location añade meta con icono place decorativo', () => {
    expect(render().querySelector('.event-card__meta')).toBeNull();
    const meta = render({ location: 'Sala 302' }).querySelector('.event-card__meta')!;
    expect(meta.textContent).toContain('Sala 302');
    const icon = meta.querySelector('app-icon')!;
    expect(icon.textContent).toBe('place');
    expect(icon.getAttribute('data-size')).toBe('s');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('R3: people pinta foot con avatar-group onTint', () => {
    expect(render().querySelector('.event-card__foot')).toBeNull();
    const foot = render({
      people: [{ name: 'Lucía Martín' }, { name: 'Javier Ruiz' }],
    }).querySelector('.event-card__foot')!;
    const group = foot.firstElementChild!;
    expect(group.tagName).toBe('APP-AVATAR-GROUP');
    expect(group.hasAttribute('data-on-tint')).toBe(true);
    expect(group.querySelectorAll('app-avatar')).toHaveLength(2);
  });

  it('R3: badge sin people pinta foot con span vacío y el badge', () => {
    const foot = renderHost().on.querySelector('.event-card__foot')!;
    const [spacer, badge] = Array.from(foot.children);
    expect(spacer.outerHTML).toBe('<span></span>');
    expect(badge.textContent).toContain('Cancelada');
  });

  it('R4: aria-pressed y data-selected siguen a selected', () => {
    const plain = render();
    expect(plain.getAttribute('aria-pressed')).toBe('false');
    expect(plain.hasAttribute('data-selected')).toBe(false);
    const { on } = renderHost();
    expect(on.getAttribute('aria-pressed')).toBe('true');
    expect(on.getAttribute('data-selected')).toBe('');
  });

  it('R5: cancelled da data-cancelled y texto oculto antes del título', () => {
    const plain = render();
    expect(plain.hasAttribute('data-cancelled')).toBe(false);
    expect(plain.querySelector('.u-visually-hidden')).toBeNull();
    const { on } = renderHost();
    expect(on.getAttribute('data-cancelled')).toBe('');
    const hidden = on.querySelector('.u-visually-hidden')!;
    expect(hidden.textContent).toBe('Cancelada. ');
    expect(hidden.nextElementSibling!.classList).toContain('event-card__title');
  });

  it('R6: disabled nativo', () => {
    expect(render().disabled).toBe(false);
    expect(renderHost().disabled.disabled).toBe(true);
  });

  it('R7: clic emite clicked; mientras disabled no', () => {
    const { host, on, disabled } = renderHost();
    on.click();
    expect(host.last).toBeInstanceOf(MouseEvent);
    disabled.click();
    expect(host.clicks).toBe(0);
  });
});
