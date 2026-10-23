import { TestBed } from '@angular/core/testing';
import { Skeleton } from './skeleton';

function render(inputs: Record<string, unknown> = {}): HTMLElement {
  const fixture = TestBed.createComponent(Skeleton);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement;
}

describe('Skeleton', () => {
  it('R1: host con clase skeleton y aria-hidden', () => {
    const el = render();
    expect(el.classList).toContain('skeleton');
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('R2: --w con width tal cual; sin width no hay --w', () => {
    expect(render({ width: '12rem' }).style.getPropertyValue('--w')).toBe('12rem');
    expect(render({ width: 'var(--icon-xl)' }).style.getPropertyValue('--w')).toBe(
      'var(--icon-xl)',
    );
    expect(render().style.getPropertyValue('--w')).toBe('');
  });

  it('R3: --h con height tal cual; sin height no hay --h', () => {
    expect(render({ height: '0.75em' }).style.getPropertyValue('--h')).toBe('0.75em');
    expect(render().style.getPropertyValue('--h')).toBe('');
  });

  it('R4: data-shape solo con circle o block', () => {
    expect(render({ shape: 'circle' }).getAttribute('data-shape')).toBe('circle');
    expect(render({ shape: 'block' }).getAttribute('data-shape')).toBe('block');
    expect(render().hasAttribute('data-shape')).toBe(false);
  });
});
