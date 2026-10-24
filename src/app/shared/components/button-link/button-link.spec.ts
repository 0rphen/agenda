import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { ButtonLink } from './button-link';

function render(inputs: Record<string, unknown> = {}): HTMLAnchorElement {
  const fixture = TestBed.createComponent(ButtonLink);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement;
}

// Atributos del consumidor y contenido proyectado necesitan un host.
@Component({
  imports: [ButtonLink],
  template: `
    <a app-button-link href="/semana" target="_blank" aria-current="page">Ver semana</a>
    <span app-button-link>Ver semana</span>
  `,
})
class Host {}

@Component({
  imports: [ButtonLink, RouterLink],
  template: `<a app-button-link routerLink="/semana">Ver semana</a>`,
})
class RouterHost {}

function renderHost() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const element: HTMLElement = fixture.nativeElement;
  return {
    link: element.querySelector('a')!,
    span: element.querySelector('span[app-button-link]')!,
  };
}

describe('ButtonLink', () => {
  it('R1: solo a[app-button-link] recibe la clase button', () => {
    const { link, span } = renderHost();
    expect(link.classList).toContain('button');
    expect(span.classList).not.toContain('button');
  });

  it('R2: contenido dentro de un span hijo del a', () => {
    const span = renderHost().link.querySelector(':scope > span');
    expect(span?.textContent).toBe('Ver semana');
  });

  it('R3: data-variant salvo primary', () => {
    expect(render().hasAttribute('data-variant')).toBe(false);
    expect(render({ variant: 'primary' }).hasAttribute('data-variant')).toBe(false);
    for (const variant of ['accent', 'secondary', 'ghost', 'ghost-danger', 'danger']) {
      expect(render({ variant }).getAttribute('data-variant')).toBe(variant);
    }
  });

  it('R4: data-size salvo m', () => {
    expect(render().hasAttribute('data-size')).toBe(false);
    expect(render({ size: 'm' }).hasAttribute('data-size')).toBe(false);
    for (const size of ['s', 'l']) {
      expect(render({ size }).getAttribute('data-size')).toBe(size);
    }
  });

  it('R5: data-block vacío solo con block', () => {
    expect(render().hasAttribute('data-block')).toBe(false);
    expect(render({ block: true }).getAttribute('data-block')).toBe('');
  });

  it('R6: icon antes del span', () => {
    const first = render({ icon: 'add' }).firstElementChild!;
    expect(first.tagName).toBe('APP-ICON');
    expect(first.textContent!.trim()).toBe('add');
    expect(first.nextElementSibling!.tagName).toBe('SPAN');
  });

  it('R7: iconEnd después del span', () => {
    const last = render({ iconEnd: 'chevron_right' }).lastElementChild!;
    expect(last.tagName).toBe('APP-ICON');
    expect(last.textContent!.trim()).toBe('chevron_right');
    expect(last.previousElementSibling!.tagName).toBe('SPAN');
  });

  it('R8: conserva los atributos del consumidor', () => {
    const { link } = renderHost();
    expect(link.getAttribute('href')).toBe('/semana');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('aria-current')).toBe('page');
  });

  it('R9: con routerLink expone el href generado', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(RouterHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/semana');
  });
});
