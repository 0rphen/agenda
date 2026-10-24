import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IconButton } from '@shared/components/icon-button/icon-button';
import { Menu } from '@shared/components/menu/menu';
import { AppBar, AppBarActions } from './app-bar';

function render(inputs: Record<string, unknown> = {}): HTMLElement {
  const fixture = TestBed.createComponent(AppBar);
  fixture.componentRef.setInput('heading', 'Hoy');
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement;
}

// Acciones proyectadas y salida backClicked necesitan un host.
@Component({
  imports: [AppBar, AppBarActions, IconButton, Menu],
  template: `
    <app-app-bar id="back" heading="Detalle" back (backClicked)="backs = backs + 1" />
    <app-app-bar id="actions" heading="Hoy">
      <app-icon-button appBarActions icon="search" label="Buscar" />
      <app-menu appBarActions icon="more_vert" [items]="[{ label: 'Ajustes' }]" />
    </app-app-bar>
  `,
})
class Host {
  backs = 0;
}

function renderHost() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  return {
    host: fixture.componentInstance,
    fixture,
    back: el.querySelector<HTMLElement>('#back')!,
    actions: el.querySelector<HTMLElement>('#actions')!,
  };
}

describe('AppBar', () => {
  it('R1: renderiza header.app-bar con h1.app-bar__title dentro de .app-bar__heading', () => {
    const el = render();
    const title = el.querySelector('header.app-bar > .app-bar__heading > h1.app-bar__title');
    expect(title?.textContent?.trim()).toBe('Hoy');
  });

  it('R2: muestra el subtítulo solo si hay subtitle', () => {
    expect(render().querySelector('.app-bar__subtitle')).toBeNull();
    const sub = render({ subtitle: 'Jueves 22 de octubre' }).querySelector(
      '.app-bar__heading > h1 + p.app-bar__subtitle',
    );
    expect(sub?.textContent?.trim()).toBe('Jueves 22 de octubre');
  });

  it('R3: con back muestra el botón volver antes del encabezado, por defecto «Volver»', () => {
    expect(render().querySelector('app-icon-button')).toBeNull();
    const el = render({ back: true });
    const button = el.querySelector('header > app-icon-button:first-child button');
    expect(button?.getAttribute('aria-label')).toBe('Volver');
    expect(button?.textContent).toContain('chevron_left');
    const custom = render({ back: true, backLabel: 'Volver a ajustes' });
    expect(custom.querySelector('button')?.getAttribute('aria-label')).toBe('Volver a ajustes');
  });

  it('R4: emite backClicked al pulsar volver', () => {
    const { host, back } = renderHost();
    back.querySelector('button')!.click();
    expect(host.backs).toBe(1);
  });

  it('R5: proyecta las acciones en .app-bar__actions tras el encabezado; sin acciones no lo pinta', () => {
    expect(render().querySelector('.app-bar__actions')).toBeNull();
    const { actions } = renderHost();
    const box = actions.querySelector('.app-bar__heading + .app-bar__actions');
    expect(box?.querySelector('app-icon-button')).not.toBeNull();
    expect(box?.querySelector('app-menu')).not.toBeNull();
  });

  it('R6: large pone data-size="l" en el header', () => {
    expect(render().querySelector('header')?.hasAttribute('data-size')).toBe(false);
    expect(render({ large: true }).querySelector('header')?.getAttribute('data-size')).toBe('l');
  });
});
