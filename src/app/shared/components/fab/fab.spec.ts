import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Fab } from './fab';

function render(inputs: Record<string, unknown> = {}): HTMLButtonElement {
  const fixture = TestBed.createComponent(Fab);
  const all = { label: 'Nueva cita', ...inputs };
  for (const [key, value] of Object.entries(all)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement.querySelector('button');
}

// El atributo sin valor `extended` necesita un host.
@Component({
  imports: [Fab],
  template: `<app-fab extended icon="checklist" label="Nueva tarea" (clicked)="last = $event" />`,
})
class Host {
  last?: MouseEvent;
}

function renderHost() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
  return { host: fixture.componentInstance, button };
}

describe('Fab', () => {
  it('R1: un único button.fab de type button', () => {
    const button = render();
    expect(button.parentElement!.querySelectorAll('button')).toHaveLength(1);
    expect(button.classList).toContain('fab');
    expect(button.getAttribute('type')).toBe('button');
  });

  it('R2: aria-label con label', () => {
    expect(render({ label: 'Nueva cita' }).getAttribute('aria-label')).toBe('Nueva cita');
  });

  it('R3: app-icon add por defecto, icon cuando se indica, tamaño l y decorativo', () => {
    const icon = render().querySelector('app-icon')!;
    expect(icon.textContent!.trim()).toBe('add');
    expect(icon.getAttribute('data-size')).toBe('l');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(render({ icon: 'checklist' }).querySelector('app-icon')!.textContent!.trim()).toBe(
      'checklist',
    );
  });

  it('R4: extended añade data-extended y span con label tras el icono', () => {
    const { button } = renderHost();
    expect(button.getAttribute('data-extended')).toBe('');
    expect(button.children).toHaveLength(2);
    expect(button.children[0].tagName).toBe('APP-ICON');
    expect(button.children[1].tagName).toBe('SPAN');
    expect(button.children[1].textContent!.trim()).toBe('Nueva tarea');
  });

  it('R5: sin extended, sin data-extended ni span', () => {
    const button = render();
    expect(button.hasAttribute('data-extended')).toBe(false);
    expect(button.querySelector('span')).toBeNull();
  });

  it('R6: clic emite clicked con el MouseEvent', () => {
    const { host, button } = renderHost();
    button.click();
    expect(host.last).toBeInstanceOf(MouseEvent);
  });
});
