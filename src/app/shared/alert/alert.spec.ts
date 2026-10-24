import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Button } from '../button/button';
import { Alert, AlertAction } from './alert';

function render(inputs: Record<string, unknown> = {}): HTMLElement {
  const fixture = TestBed.createComponent(Alert);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement;
}

// Contenido proyectado, acción y atributos sueltos necesitan un host.
@Component({
  imports: [Alert, AlertAction, Button],
  template: `
    <app-alert id="plain">Texto</app-alert>
    <app-alert id="full" heading="Cambios guardados">
      Texto <strong>fuerte</strong>
      <app-button alertAction size="s">Reintentar</app-button>
    </app-alert>
    <app-alert id="bound" [heading]="heading">Texto</app-alert>
    <app-alert id="dismissible" dismissible (closed)="closes = closes + 1">Texto</app-alert>
  `,
})
class Host {
  closes = 0;
  heading = 'Tienes citas en conflicto';
}

function renderHost() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const byId = (id: string) => el.querySelector<HTMLElement>(`#${id}`)!;
  return {
    fixture,
    host: fixture.componentInstance,
    plain: byId('plain'),
    full: byId('full'),
    bound: byId('bound'),
    dismissible: byId('dismissible'),
  };
}

describe('Alert', () => {
  it('R1: host con class alert', () => {
    expect(render().classList).toContain('alert');
  });

  it('R2: data-tone solo con success, warning o danger', () => {
    expect(render().hasAttribute('data-tone')).toBe(false);
    expect(render({ tone: 'info' }).hasAttribute('data-tone')).toBe(false);
    for (const tone of ['success', 'warning', 'danger']) {
      expect(render({ tone }).getAttribute('data-tone')).toBe(tone);
    }
  });

  it('R3: role alert solo con danger; status en el resto', () => {
    expect(render().getAttribute('role')).toBe('status');
    for (const tone of ['info', 'success', 'warning']) {
      expect(render({ tone }).getAttribute('role')).toBe('status');
    }
    expect(render({ tone: 'danger' }).getAttribute('role')).toBe('alert');
  });

  it('R4: primer hijo app-icon decorativo con icono por tono o input icon', () => {
    const icons = {
      info: 'info',
      success: 'check_circle',
      warning: 'warning_amber',
      danger: 'error_outline',
    };
    for (const [tone, name] of Object.entries(icons)) {
      const icon = render({ tone }).firstElementChild!;
      expect(icon.tagName).toBe('APP-ICON');
      expect(icon.getAttribute('aria-hidden')).toBe('true');
      expect(icon.textContent?.trim()).toBe(name);
    }
    const custom = render({ tone: 'danger', icon: 'schedule' }).firstElementChild!;
    expect(custom.textContent?.trim()).toBe('schedule');
  });

  it('R5: div.alert__body tras el icono', () => {
    const body = render().children[1];
    expect(body.matches('div.alert__body')).toBe(true);
  });

  it('R6: heading pinta p.alert__title como primer hijo de alert__body', () => {
    const { full, bound } = renderHost();
    const title = full.querySelector('.alert__body')!.firstElementChild!;
    expect(title.matches('p.alert__title')).toBe(true);
    expect(title.textContent?.trim()).toBe('Cambios guardados');
    expect(bound.querySelector('.alert__title')?.textContent?.trim()).toBe(
      'Tienes citas en conflicto',
    );
    expect(render().querySelector('.alert__title')).toBeNull();
  });

  it('R7: heading estático o enlazado no deja atributo title en el host', () => {
    const { full, bound } = renderHost();
    for (const alert of [full, bound]) expect(alert.hasAttribute('title')).toBe(false);
    expect(TestBed.createComponent(Alert).componentInstance).not.toHaveProperty('title');
  });

  it('R8: contenido por defecto en p.alert__text tras el título', () => {
    const { plain, full } = renderHost();
    expect(plain.querySelector('.alert__body > p.alert__text')?.textContent?.trim()).toBe('Texto');
    const body = full.querySelector('.alert__body')!;
    expect(body.children[1].matches('p.alert__text')).toBe(true);
    expect(body.querySelector('.alert__text strong')?.textContent).toBe('fuerte');
    expect(body.querySelector('.alert__text app-button')).toBeNull();
  });

  it('R9: alertAction dentro de div.alert__action al final de alert__body', () => {
    const { plain, full } = renderHost();
    const action = full.querySelector('.alert__body')!.lastElementChild!;
    expect(action.matches('div.alert__action')).toBe(true);
    expect(action.querySelector(':scope > app-button[alertAction]')).not.toBeNull();
    expect(plain.querySelector('.alert__action')).toBeNull();
  });

  it('R10: dismissible pinta app-icon-button close «Cerrar aviso» size s tras alert__body', () => {
    const { plain, dismissible } = renderHost();
    const close = dismissible.lastElementChild!;
    expect(close.tagName).toBe('APP-ICON-BUTTON');
    expect(close.previousElementSibling?.matches('.alert__body')).toBe(true);
    const button = close.querySelector('button')!;
    expect(button.getAttribute('aria-label')).toBe('Cerrar aviso');
    expect(button.getAttribute('data-size')).toBe('s');
    expect(button.textContent?.trim()).toBe('close');
    expect(plain.querySelector('app-icon-button')).toBeNull();
    expect(render({ dismissible: false }).querySelector('app-icon-button')).toBeNull();
  });

  it('R11: dismissible como atributo suelto vale true', () => {
    const { dismissible } = renderHost();
    expect(dismissible.querySelector('app-icon-button')).not.toBeNull();
  });

  it('R12: clic en cerrar emite closed', () => {
    const { host, dismissible } = renderHost();
    dismissible.querySelector('button')!.click();
    expect(host.closes).toBe(1);
  });

  it('R13: tras cerrar, el host sigue en el DOM', () => {
    const { fixture, dismissible } = renderHost();
    dismissible.querySelector('button')!.click();
    fixture.detectChanges();
    expect(dismissible.isConnected).toBe(true);
    expect(dismissible.querySelector('.alert__body')).not.toBeNull();
  });
});
