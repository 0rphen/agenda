import { TestBed } from '@angular/core/testing';
import { AvatarGroup } from './avatar-group';
import { AvatarPerson } from '@shared/interfaces';

function render(inputs: Record<string, unknown>): HTMLElement {
  const fixture = TestBed.createComponent(AvatarGroup);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement;
}

const people = (n: number): AvatarPerson[] =>
  Array.from({ length: n }, (_, i) => ({ name: `Persona ${i + 1}` }));

const avatars = (el: HTMLElement) => el.querySelectorAll('app-avatar');
const more = (el: HTMLElement) => el.querySelector<HTMLElement>('[data-more]');

describe('AvatarGroup', () => {
  it('R10: host .avatar-group con un app-avatar por persona, en orden', () => {
    const el = render({ people: people(2) });
    expect(el.classList).toContain('avatar-group');
    const shown = avatars(el);
    expect(shown.length).toBe(2);
    expect(shown[0].getAttribute('aria-label')).toBe('Persona 1');
    expect(shown[1].getAttribute('aria-label')).toBe('Persona 2');
  });

  it('R10: pasa src al avatar', () => {
    const el = render({ people: [{ name: 'Ana', src: '/ana.jpg' }] });
    expect(el.querySelector('app-avatar img')?.getAttribute('src')).toBe('/ana.jpg');
  });

  it('R11: por defecto max 3 y size s', () => {
    const el = render({ people: people(6) });
    const shown = avatars(el);
    expect(shown.length).toBe(3);
    shown.forEach((a) => expect(a.getAttribute('data-size')).toBe('s'));
  });

  it('R12: con más de max añade contador +N con mismo data-size', () => {
    const counter = more(render({ people: people(6) }));
    expect(counter?.classList).toContain('avatar');
    expect(counter?.getAttribute('role')).toBe('img');
    expect(counter?.getAttribute('aria-label')).toBe('3 más');
    expect(counter?.textContent?.trim()).toBe('+3');
    expect(counter?.getAttribute('data-size')).toBe('s');
  });

  it('R12: con max 4 y size m, contador +2 sin data-size', () => {
    const el = render({ people: people(6), max: 4, size: 'm' });
    expect(avatars(el).length).toBe(4);
    avatars(el).forEach((a) => expect(a.hasAttribute('data-size')).toBe(false));
    expect(more(el)?.textContent?.trim()).toBe('+2');
    expect(more(el)?.hasAttribute('data-size')).toBe(false);
  });

  it('R13: sin contador con max personas o menos', () => {
    expect(more(render({ people: people(2) }))).toBeNull();
    expect(more(render({ people: people(3) }))).toBeNull();
  });

  it('R14: data-on-tint solo con onTint', () => {
    expect(render({ people: people(1) }).hasAttribute('data-on-tint')).toBe(false);
    expect(render({ people: people(1), onTint: true }).getAttribute('data-on-tint')).toBe('');
  });
});
