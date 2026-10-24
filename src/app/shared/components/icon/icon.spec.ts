import { TestBed } from '@angular/core/testing';
import { Icon } from './icon';

function render(inputs: Record<string, unknown>): HTMLElement {
  const fixture = TestBed.createComponent(Icon);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement;
}

describe('Icon', () => {
  it('R1: renderiza name como ligadura con clase icon', () => {
    const el = render({ name: 'event' });
    expect(el.classList).toContain('icon');
    expect(el.textContent?.trim()).toBe('event');
  });

  it('R2: data-size solo cuando size no es m', () => {
    expect(render({ name: 'event' }).hasAttribute('data-size')).toBe(false);
    expect(render({ name: 'event', size: 'm' }).hasAttribute('data-size')).toBe(false);
    for (const size of ['s', 'l', 'xl']) {
      expect(render({ name: 'event', size }).getAttribute('data-size')).toBe(size);
    }
  });

  it('R3: data-filled cuando filled es true', () => {
    expect(render({ name: 'event' }).hasAttribute('data-filled')).toBe(false);
    expect(render({ name: 'event', filled: true }).hasAttribute('data-filled')).toBe(true);
  });

  it('R4: role img y aria-label con label; aria-hidden sin label', () => {
    const labelled = render({ name: 'event', label: 'Evento' });
    expect(labelled.getAttribute('role')).toBe('img');
    expect(labelled.getAttribute('aria-label')).toBe('Evento');
    expect(labelled.hasAttribute('aria-hidden')).toBe(false);

    const decorative = render({ name: 'event' });
    expect(decorative.getAttribute('aria-hidden')).toBe('true');
    expect(decorative.hasAttribute('role')).toBe(false);
    expect(decorative.hasAttribute('aria-label')).toBe(false);
  });
});
