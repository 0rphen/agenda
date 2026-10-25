import { TestBed } from '@angular/core/testing';
import { Spinner } from './spinner';

function render(inputs: Record<string, unknown> = {}): HTMLElement {
  const fixture = TestBed.createComponent(Spinner);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement;
}

describe('Spinner', () => {
  it('R1: host con clase spinner y sin contenido', () => {
    const el = render();
    expect(el.classList).toContain('spinner');
    expect(el.childNodes.length).toBe(0);
  });

  it('R2: data-size solo cuando size no es m', () => {
    expect(render().hasAttribute('data-size')).toBe(false);
    expect(render({ size: 'm' }).hasAttribute('data-size')).toBe(false);
    for (const size of ['s', 'l']) {
      expect(render({ size }).getAttribute('data-size')).toBe(size);
    }
  });

  it('R3: role status', () => {
    expect(render().getAttribute('role')).toBe('status');
  });

  it('R4: aria-label con label; Cargando por defecto', () => {
    expect(render().getAttribute('aria-label')).toBe('Cargando');
    expect(render({ label: 'Cargando eventos' }).getAttribute('aria-label')).toBe(
      'Cargando eventos',
    );
  });
});
