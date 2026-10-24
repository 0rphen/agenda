import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DemoPage } from './demo-page';

const IDS = [
  'icon',
  'spinner',
  'badge',
  'avatar',
  'progress',
  'skeleton',
  'button',
  'button-link',
  'icon-button',
  'checkbox',
  'switch',
  'segmented-control',
  'text-field',
  'textarea-field',
  'select-field',
  'date-field',
  'time-field',
  'number-field',
  'card',
  'alert',
  'empty-state',
  'breadcrumb',
  'fab',
  'menu',
  'day-pill',
  'agenda-item',
  'task-item',
];

function render(): ComponentFixture<DemoPage> {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(DemoPage);
  fixture.detectChanges();
  return fixture;
}

describe('DemoPage', () => {
  it('R3: renderiza el <h1> «Componentes»', () => {
    const h1 = (render().nativeElement as HTMLElement).querySelector('h1');
    expect(h1?.textContent?.trim()).toBe('Componentes');
  });

  it('R4: una <section> por componente, en orden, cada una con su <h2>', () => {
    const sections = Array.from(
      (render().nativeElement as HTMLElement).querySelectorAll<HTMLElement>('main > section'),
    );
    expect(sections.map((s) => s.id)).toEqual(IDS);
    for (const section of sections)
      expect(section.querySelector('h2')?.textContent?.trim()).toBeTruthy();
  });

  it('R5: el <nav> enlaza a cada sección en el mismo orden', () => {
    const links = Array.from(
      (render().nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>(
        'nav[aria-label="Componentes"] a',
      ),
    );
    expect(links.map((a) => a.getAttribute('href'))).toEqual(IDS.map((id) => `demo#${id}`));
  });

  it('R9: un field required vacío y touched muestra «Completa este campo»', () => {
    const fixture = render();
    const field = (fixture.nativeElement as HTMLElement).querySelector(
      '#text-field app-text-field',
    )!;
    const input = field.querySelector('input')!;
    expect(field.querySelector('.field__hint')?.textContent).not.toContain('Completa este campo');
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(field.querySelector('.field__hint')?.textContent).toContain('Completa este campo');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
