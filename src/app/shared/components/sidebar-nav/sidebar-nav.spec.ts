import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SidebarNav } from './sidebar-nav';
import { SidebarNavEntry, SidebarNavItem } from '@shared/types';

const ITEMS: SidebarNavEntry[] = [
  { section: 'Menú principal' },
  { icon: 'dashboard', label: 'Resumen' },
  { icon: 'calendar_month', label: 'Calendario', active: true },
  { icon: 'task_alt', label: 'Tareas', badge: 5, state: 'hover' },
  { icon: 'lock', label: 'Reportes', disabled: true },
];

@Component({
  imports: [SidebarNav],
  template: `<app-sidebar-nav
    [items]="items"
    [variant]="variant()"
    [user]="user"
    (itemSelected)="selected = $event"
  />`,
})
class Host {
  items = ITEMS;
  variant = signal<'panel' | 'rail'>('panel');
  user = { name: 'Amir Baqian', role: 'Organizador' };
  selected?: SidebarNavItem;
}

function renderHost(variant: 'panel' | 'rail' = 'panel') {
  const fixture = TestBed.createComponent(Host);
  fixture.componentInstance.variant.set(variant);
  fixture.detectChanges();
  const nav: HTMLElement = fixture.nativeElement.querySelector('nav');
  const buttons = () => Array.from<HTMLButtonElement>(nav.querySelectorAll('.sidebar-nav__item'));
  return { fixture, nav, buttons };
}

describe('SidebarNav', () => {
  it('R1: nav.sidebar-nav con aria-label por defecto o propio', () => {
    const { nav } = renderHost();
    expect(nav.classList).toContain('sidebar-nav');
    expect(nav.getAttribute('aria-label')).toBe('Principal');

    const fixture = TestBed.createComponent(SidebarNav);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.componentRef.setInput('label', 'Ajustes');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('nav').getAttribute('aria-label')).toBe('Ajustes');
  });

  it('R2: un botón por ítem con su ícono', () => {
    const { buttons } = renderHost();
    expect(buttons()).toHaveLength(4);
    expect(buttons().every((b) => b.type === 'button')).toBe(true);
    expect(buttons().map((b) => b.querySelector('app-icon')!.textContent!.trim())).toEqual([
      'dashboard',
      'calendar_month',
      'task_alt',
      'lock',
    ]);
  });

  it('R3: panel con etiquetas, secciones y contador', () => {
    const { nav, buttons } = renderHost();
    expect(nav.hasAttribute('data-variant')).toBe(false);
    expect(buttons().map((b) => b.querySelector('.sidebar-nav__label')!.textContent)).toEqual([
      'Resumen',
      'Calendario',
      'Tareas',
      'Reportes',
    ]);
    expect(nav.querySelector('.sidebar-nav__section')!.textContent).toBe('Menú principal');
    const badges = nav.querySelectorAll('app-badge');
    expect(badges).toHaveLength(1);
    expect(badges[0].getAttribute('data-tone')).toBe('count');
    expect(badges[0].textContent!.trim()).toBe('5');
    expect(buttons()[0].hasAttribute('aria-label')).toBe(false);
  });

  it('R4: rail solo íconos con aria-label y title', () => {
    const { nav, buttons } = renderHost('rail');
    expect(nav.getAttribute('data-variant')).toBe('rail');
    expect(nav.querySelector('.sidebar-nav__section, .sidebar-nav__label, app-badge')).toBeNull();
    expect(nav.querySelector('.sidebar-nav__user')).toBeNull();
    expect(buttons().map((b) => [b.getAttribute('aria-label'), b.title])).toEqual([
      ['Resumen', 'Resumen'],
      ['Calendario', 'Calendario'],
      ['Tareas', 'Tareas'],
      ['Reportes', 'Reportes'],
    ]);
  });

  it('R5: activo con aria-current="page" e ícono relleno solo en rail', () => {
    const { buttons } = renderHost();
    expect(buttons().map((b) => b.getAttribute('aria-current'))).toEqual([
      null,
      'page',
      null,
      null,
    ]);
    expect(buttons()[1].querySelector('app-icon')!.hasAttribute('data-filled')).toBe(false);

    const rail = renderHost('rail');
    expect(rail.buttons()[1].querySelector('app-icon')!.hasAttribute('data-filled')).toBe(true);
    expect(rail.buttons()[0].querySelector('app-icon')!.hasAttribute('data-filled')).toBe(false);
  });

  it('R6: ítem disabled deshabilita el botón', () => {
    const { buttons } = renderHost();
    expect(buttons().map((b) => b.disabled)).toEqual([false, false, false, true]);
  });

  it('R7: clic emite itemSelected con el ítem', () => {
    const { fixture, buttons } = renderHost();
    buttons()[2].click();
    expect(fixture.componentInstance.selected).toBe(ITEMS[3]);
  });

  it('R8: usuario al pie en panel con avatar l, nombre y rol', () => {
    const { nav } = renderHost();
    const user = nav.querySelector('.sidebar-nav__user')!;
    expect(user.querySelector('app-avatar')!.getAttribute('data-size')).toBe('l');
    expect(user.querySelector('app-avatar')!.getAttribute('aria-label')).toBe('Amir Baqian');
    expect(user.querySelector('strong')!.textContent).toBe('Amir Baqian');
    expect(user.querySelector('span')!.textContent).toBe('Organizador');
  });

  it('R9: state del ítem en data-force', () => {
    const { buttons } = renderHost();
    expect(buttons().map((b) => b.getAttribute('data-force'))).toEqual([null, null, 'hover', null]);
  });
});
