import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Button } from '../button/button';
import { EmptyState, EmptyStateAction } from './empty-state';

function render(inputs: Record<string, unknown> = {}): HTMLElement {
  const fixture = TestBed.createComponent(EmptyState);
  fixture.componentRef.setInput('heading', 'Todo al día');
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement;
}

// Acciones proyectadas y atributos sueltos necesitan un host.
@Component({
  imports: [EmptyState, EmptyStateAction, Button],
  template: `
    <app-empty-state id="plain" heading="Todo al día" />
    <app-empty-state id="bound" [heading]="heading" />
    <app-empty-state id="actions" heading="No pudimos cargar tu agenda">
      <app-button emptyStateAction icon="refresh">Reintentar</app-button>
      <app-button emptyStateAction variant="ghost">Ver ayuda</app-button>
    </app-empty-state>
  `,
})
class Host {
  heading = 'Sin resultados';
}

function renderHost() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const byId = (id: string) => el.querySelector<HTMLElement>(`#${id}`)!;
  return { plain: byId('plain'), bound: byId('bound'), actions: byId('actions') };
}

describe('EmptyState', () => {
  it('R1: host con class empty-state', () => {
    expect(render().classList).toContain('empty-state');
  });

  it('R2: data-size="s" solo con size s', () => {
    expect(render().hasAttribute('data-size')).toBe(false);
    expect(render({ size: 'm' }).hasAttribute('data-size')).toBe(false);
    expect(render({ size: 's' }).getAttribute('data-size')).toBe('s');
  });

  it('R3: primer hijo span.empty-state__icon con app-icon decorativo, event_available por defecto', () => {
    const wrapper = render().firstElementChild!;
    expect(wrapper.matches('span.empty-state__icon')).toBe(true);
    const icon = wrapper.querySelector('app-icon')!;
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.textContent?.trim()).toBe('event_available');
    const custom = render({ icon: 'cloud_off' }).querySelector('.empty-state__icon app-icon')!;
    expect(custom.textContent?.trim()).toBe('cloud_off');
  });

  it('R4: icono xl con size m y l con size s', () => {
    expect(render().querySelector('app-icon')?.getAttribute('data-size')).toBe('xl');
    expect(render({ size: 's' }).querySelector('app-icon')?.getAttribute('data-size')).toBe('l');
  });

  it('R5: h3.empty-state__title con heading tras el icono', () => {
    const { plain, bound } = renderHost();
    const title = plain.children[1];
    expect(title.matches('h3.empty-state__title')).toBe(true);
    expect(title.textContent?.trim()).toBe('Todo al día');
    expect(bound.querySelector('h3.empty-state__title')?.textContent?.trim()).toBe(
      'Sin resultados',
    );
  });

  it('R6: heading estático o enlazado no deja atributo title en el host', () => {
    const { plain, bound } = renderHost();
    for (const empty of [plain, bound]) expect(empty.hasAttribute('title')).toBe(false);
    expect(TestBed.createComponent(EmptyState).componentInstance).not.toHaveProperty('title');
  });

  it('R7: description pinta p.empty-state__description tras el título', () => {
    expect(render().querySelector('p')).toBeNull();
    const description = render({ description: 'Tu día está libre.' }).children[2];
    expect(description.matches('p.empty-state__description')).toBe(true);
    expect(description.textContent?.trim()).toBe('Tu día está libre.');
  });

  it('R8: acciones en orden dentro de div.l-cluster[data-justify=center] al final', () => {
    const { actions } = renderHost();
    const cluster = actions.lastElementChild!;
    expect(cluster.matches('div.l-cluster[data-justify="center"]')).toBe(true);
    const buttons = cluster.querySelectorAll(':scope > app-button[emptyStateAction]');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].textContent).toContain('Reintentar');
    expect(buttons[1].textContent).toContain('Ver ayuda');
  });

  it('R9: sin acciones no pinta .l-cluster', () => {
    const { plain } = renderHost();
    expect(plain.querySelector('.l-cluster')).toBeNull();
  });
});
