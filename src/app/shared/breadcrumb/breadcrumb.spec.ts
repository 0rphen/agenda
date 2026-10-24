import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Breadcrumb, BreadcrumbItem } from './breadcrumb';

function render(items: BreadcrumbItem[], inputs: Record<string, unknown> = {}): HTMLElement {
  const fixture = TestBed.createComponent(Breadcrumb);
  fixture.componentRef.setInput('items', items);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement;
}

const items: BreadcrumbItem[] = [
  { label: 'Inicio', icon: 'home', link: '/' },
  { label: 'Ayuda', href: 'https://example.com' },
  { label: 'Maham' },
  { label: 'Octubre 2026', link: '/octubre' },
];

const entries = (el: HTMLElement) => [...el.querySelectorAll('li.breadcrumb__item')];

describe('Breadcrumb', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('R1: host con class breadcrumb, role navigation y aria-label', () => {
    const el = render(items);
    expect(el.classList).toContain('breadcrumb');
    expect(el.getAttribute('role')).toBe('navigation');
    expect(el.getAttribute('aria-label')).toBe('Ruta de navegación');
  });

  it('R2: data-variant="bar" solo con variant bar', () => {
    expect(render(items).hasAttribute('data-variant')).toBe(false);
    expect(render(items, { variant: 'default' }).hasAttribute('data-variant')).toBe(false);
    expect(render(items, { variant: 'bar' }).getAttribute('data-variant')).toBe('bar');
  });

  it('R3: ol.breadcrumb__list con un li.breadcrumb__item por ítem, en orden', () => {
    const el = render([
      { label: 'Inicio', link: '/' },
      { label: 'Calendario' },
      { label: 'Octubre 2026' },
    ]);
    expect(el.firstElementChild?.matches('ol.breadcrumb__list')).toBe(true);
    const labels = entries(el).map((li) => li.firstElementChild?.textContent?.trim());
    expect(labels).toEqual(['Inicio', 'Calendario', 'Octubre 2026']);
  });

  it('R4: último ítem como span.breadcrumb__current[aria-current=page] aunque tenga link', () => {
    const last = entries(render(items)).at(-1)!;
    const current = last.firstElementChild!;
    expect(current.matches('span.breadcrumb__current')).toBe(true);
    expect(current.getAttribute('aria-current')).toBe('page');
    expect(last.querySelector('a')).toBeNull();
  });

  it('R5: ítem con link renderiza a.breadcrumb__link con routerLink', () => {
    const el = render([{ label: 'Semana', link: '/semana' }, { label: 'Lunes' }]);
    const link = entries(el)[0].firstElementChild!;
    expect(link.matches('a.breadcrumb__link')).toBe(true);
    expect(link.getAttribute('href')).toBe('/semana');
    expect(link.hasAttribute('target')).toBe(false);
  });

  it('R6: ítem con href renderiza a.breadcrumb__link externo en pestaña nueva', () => {
    const link = entries(render(items))[1].firstElementChild!;
    expect(link.matches('a.breadcrumb__link')).toBe(true);
    expect(link.getAttribute('href')).toBe('https://example.com');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('R7: ítem intermedio sin link ni href renderiza span.breadcrumb__link sin href', () => {
    const span = entries(render(items))[2].firstElementChild!;
    expect(span.matches('span.breadcrumb__link')).toBe(true);
    expect(span.hasAttribute('href')).toBe(false);
  });

  it('R8: icon pinta app-icon decorativo antes del label', () => {
    const el = render([
      { label: 'Inicio', icon: 'home', link: '/' },
      { label: 'Exámenes', icon: 'edit_calendar' },
    ]);
    const [first, last] = entries(el).map((li) => li.firstElementChild!);
    for (const [wrapper, name] of [
      [first, 'home'],
      [last, 'edit_calendar'],
    ] as const) {
      const icon = wrapper.firstElementChild!;
      expect(icon.matches('app-icon[aria-hidden="true"]')).toBe(true);
      expect(icon.textContent?.trim()).toBe(name);
    }
    expect(entries(render(items))[1].firstElementChild!.querySelector('app-icon')).toBeNull();
  });

  it('R9: separador chevron_right tras cada ítem no último; el último sin separador', () => {
    const lis = entries(render(items));
    for (const li of lis.slice(0, -1)) {
      const sep = li.lastElementChild!;
      expect(sep.matches('app-icon.breadcrumb__sep[aria-hidden="true"]')).toBe(true);
      expect(sep.textContent?.trim()).toBe('chevron_right');
    }
    expect(lis.at(-1)!.querySelector('.breadcrumb__sep')).toBeNull();
  });

  it('R10: BreadcrumbItem no admite link y href a la vez', () => {
    // @ts-expect-error link y href son excluyentes
    const both: BreadcrumbItem = { label: 'Ambos', link: '/', href: 'https://example.com' };
    expect(both).toBeDefined();
  });
});
