import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Badge } from './badge';

function render(inputs: Record<string, unknown>): HTMLElement {
  const fixture = TestBed.createComponent(Badge);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement;
}

@Component({
  imports: [Badge],
  template: `<app-badge
    [tone]="tone"
    [icon]="icon"
    [dot]="dot"
    [category]="category"
    [label]="label"
    >{{ text }}</app-badge
  >`,
})
class Host {
  tone: ReturnType<Badge['tone']> = 'neutral';
  icon?: string;
  dot = false;
  category?: ReturnType<Badge['category']>;
  label?: string;
  text = '';
}

// Para contenido proyectado hace falta un host.
function renderWithText(text: string, inputs: Partial<Host> = {}): HTMLElement {
  const fixture = TestBed.createComponent(Host);
  Object.assign(fixture.componentInstance, { text, ...inputs });
  fixture.detectChanges();
  return fixture.nativeElement.querySelector('app-badge');
}

describe('Badge', () => {
  it('R1: el host es .badge y proyecta el texto', () => {
    const el = renderWithText('Hoy');
    expect(el.classList).toContain('badge');
    expect(el.textContent?.trim()).toBe('Hoy');
  });

  it('R2: data-tone salvo con neutral', () => {
    expect(render({}).hasAttribute('data-tone')).toBe(false);
    expect(render({ tone: 'neutral' }).hasAttribute('data-tone')).toBe(false);
    for (const tone of [
      'brand',
      'success',
      'warning',
      'danger',
      'info',
      'inverse',
      'glass',
      'count',
    ]) {
      expect(render({ tone }).getAttribute('data-tone')).toBe(tone);
    }
  });

  it('R3: icon renderiza app-icon size s antes del texto', () => {
    expect(render({}).querySelector('app-icon')).toBeNull();
    const el = renderWithText('Confirmada', { icon: 'check_circle' });
    const icon = el.firstElementChild!;
    expect(icon.tagName).toBe('APP-ICON');
    expect(icon.textContent).toBe('check_circle');
    expect(icon.getAttribute('data-size')).toBe('s');
    expect(el.lastChild?.textContent).toBe('Confirmada');
  });

  it('R4: dot renderiza badge__dot antes del ícono', () => {
    expect(render({}).querySelector('.badge__dot')).toBeNull();
    const el = render({ dot: true, icon: 'event' });
    expect(el.children[0].matches('.badge__dot:not([data-category-dot])')).toBe(true);
    expect(el.children[1].tagName).toBe('APP-ICON');
  });

  it('R5: category añade u-category, data-category y punto de categoría', () => {
    const el = render({ category: 'violet', icon: 'event' });
    expect(el.classList).toContain('u-category');
    expect(el.getAttribute('data-category')).toBe('violet');
    expect(el.children[0].matches('.badge__dot[data-category-dot]')).toBe(true);
    expect(el.children[1].tagName).toBe('APP-ICON');
  });

  it('R4+R5: orden punto, punto de categoría, ícono, texto', () => {
    const el = renderWithText('Reunión', { dot: true, category: 'green', icon: 'event' });
    const [dot, catDot, icon] = Array.from(el.children);
    expect(el.querySelectorAll('.badge__dot').length).toBe(2);
    expect(dot.hasAttribute('data-category-dot')).toBe(false);
    expect(catDot.hasAttribute('data-category-dot')).toBe(true);
    expect(icon.tagName).toBe('APP-ICON');
    expect(el.lastChild?.textContent).toBe('Reunión');
  });

  it('R6: sin category no hay u-category ni data-category', () => {
    const el = render({});
    expect(el.classList).not.toContain('u-category');
    expect(el.hasAttribute('data-category')).toBe(false);
    expect(el.querySelector('[data-category-dot]')).toBeNull();
  });

  it('R7: aria-label solo con label', () => {
    expect(render({}).hasAttribute('aria-label')).toBe(false);
    const el = renderWithText('2', { tone: 'count', label: '2 sin leer' });
    expect(el.getAttribute('aria-label')).toBe('2 sin leer');
  });

  it('R8: ícono y puntos con aria-hidden', () => {
    const el = render({ dot: true, category: 'red', icon: 'event' });
    const decorations = el.querySelectorAll('.badge__dot, app-icon');
    expect(decorations.length).toBe(3);
    decorations.forEach((node) => expect(node.getAttribute('aria-hidden')).toBe('true'));
  });

  it('marcado de ejemplo del criterio de aceptación', () => {
    const el = renderWithText('Confirmada', { tone: 'success', icon: 'check_circle' });
    expect(el.outerHTML.replace(/<!--.*?-->/g, '')).toBe(
      '<app-badge class="badge" data-tone="success"><app-icon class="icon" data-size="s" aria-hidden="true">check_circle</app-icon>Confirmada</app-badge>',
    );
  });
});
