import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BottomNav } from './bottom-nav';
import { BottomNavItem } from '@shared/types';

const ITEMS: BottomNavItem[] = [
  { icon: 'today', label: 'Hoy', active: true },
  { icon: 'calendar_month', label: 'Mes', badge: 0, state: 'focus' },
  { icon: 'task_alt', label: 'Tareas', badge: 5 },
  { icon: 'settings', label: 'Ajustes', disabled: true },
];

@Component({
  imports: [BottomNav],
  template: `<app-bottom-nav [items]="items" (itemSelected)="selected = $event" />`,
})
class Host {
  items = ITEMS;
  selected?: BottomNavItem;
}

function renderHost() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const nav: HTMLElement = fixture.nativeElement.querySelector('nav');
  const buttons = Array.from<HTMLButtonElement>(nav.querySelectorAll('.bottom-nav__item'));
  return { fixture, nav, buttons };
}

describe('BottomNav', () => {
  it('R1: nav.bottom-nav con aria-label por defecto o propio', () => {
    const { nav } = renderHost();
    expect(nav.classList).toContain('bottom-nav');
    expect(nav.getAttribute('aria-label')).toBe('Navegación principal');

    const fixture = TestBed.createComponent(BottomNav);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.componentRef.setInput('label', 'Secciones');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('nav').getAttribute('aria-label')).toBe('Secciones');
  });

  it('R2: un botón por ítem con ícono en .bottom-nav__icon y etiqueta', () => {
    const { buttons } = renderHost();
    expect(buttons).toHaveLength(4);
    expect(buttons.every((b) => b.type === 'button')).toBe(true);
    expect(
      buttons.map((b) => b.querySelector('.bottom-nav__icon app-icon')!.textContent!.trim()),
    ).toEqual(['today', 'calendar_month', 'task_alt', 'settings']);
    expect(buttons.map((b) => b.lastElementChild!.textContent)).toEqual([
      'Hoy',
      'Mes',
      'Tareas',
      'Ajustes',
    ]);
  });

  it('R3: activo con aria-current="page" e ícono relleno', () => {
    const { buttons } = renderHost();
    expect(buttons.map((b) => b.getAttribute('aria-current'))).toEqual(['page', null, null, null]);
    expect(buttons.map((b) => b.querySelector('app-icon')!.hasAttribute('data-filled'))).toEqual([
      true,
      false,
      false,
      false,
    ]);
  });

  it('R4: contador en .bottom-nav__badge solo si badge no es 0', () => {
    const { nav, buttons } = renderHost();
    expect(nav.querySelectorAll('.bottom-nav__badge')).toHaveLength(1);
    expect(buttons[2].querySelector('.bottom-nav__icon .bottom-nav__badge')!.textContent).toBe('5');
    expect(buttons[2].getAttribute('aria-label')).toBe('Tareas, 5 pendientes');
    expect(buttons[1].hasAttribute('aria-label')).toBe(false);
  });

  it('R5: ítem disabled deshabilita el botón', () => {
    const { buttons } = renderHost();
    expect(buttons.map((b) => b.disabled)).toEqual([false, false, false, true]);
  });

  it('R6: clic emite itemSelected con el ítem', () => {
    const { fixture, buttons } = renderHost();
    buttons[2].click();
    expect(fixture.componentInstance.selected).toBe(ITEMS[2]);
  });

  it('R7: state del ítem en data-force', () => {
    const { buttons } = renderHost();
    expect(buttons.map((b) => b.getAttribute('data-force'))).toEqual([null, 'focus', null, null]);
  });
});
