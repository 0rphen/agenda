import { TestBed } from '@angular/core/testing';
import { PlaceholderPage } from './placeholder-page';

function render(heading = 'Resumen'): HTMLElement {
  const fixture = TestBed.createComponent(PlaceholderPage);
  fixture.componentRef.setInput('heading', heading);
  fixture.detectChanges();
  return fixture.nativeElement;
}

describe('PlaceholderPage', () => {
  it('R6: h1.page-title con heading', () => {
    const title = render('Tareas').firstElementChild!;
    expect(title.matches('h1.page-title')).toBe(true);
    expect(title.textContent?.trim()).toBe('Tareas');
  });

  it('R6: app-empty-state de pantalla en construcción', () => {
    const empty = render().querySelector('app-empty-state')!;
    expect(empty.querySelector('.empty-state__title')?.textContent?.trim()).toBe(
      'Pantalla en construcción',
    );
    expect(empty.textContent).toContain('Esta vista llegará pronto.');
    expect(empty.querySelector('app-icon')?.textContent?.trim()).toBe('construction');
  });

  it('R7: clases de host placeholder-page panel l-stack', () => {
    expect([...render().classList]).toEqual(['placeholder-page', 'panel', 'l-stack']);
  });
});
