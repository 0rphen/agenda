import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Button } from './button';

function render(inputs: Record<string, unknown> = {}): HTMLButtonElement {
  const fixture = TestBed.createComponent(Button);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement.querySelector('button');
}

// Atributos sin valor (`loading`, `disabled`) y contenido proyectado necesitan un host.
@Component({
  imports: [Button],
  template: `
    <form (submit)="submitted = true">
      <app-button
        type="submit"
        loading
        size="l"
        iconEnd="expand_more"
        (clicked)="clicks = clicks + 1"
        >Guardar cita</app-button
      >
      <app-button disabled (clicked)="clicks = clicks + 1">Guardar cita</app-button>
      <app-button (clicked)="last = $event">Guardar cita</app-button>
    </form>
  `,
})
class Host {
  clicks = 0;
  submitted = false;
  last?: MouseEvent;
}

function renderHost() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const [loading, disabled, plain] = Array.from<HTMLButtonElement>(
    fixture.nativeElement.querySelectorAll('button'),
  );
  return { host: fixture.componentInstance, loading, disabled, plain };
}

function iconNames(button: HTMLButtonElement): string[] {
  return Array.from(button.querySelectorAll('app-icon'), (icon) => icon.textContent!.trim());
}

describe('Button', () => {
  it('R1: un único button.button con el contenido dentro de un span hijo', () => {
    const { plain } = renderHost();
    expect(plain.parentElement!.querySelectorAll('button')).toHaveLength(1);
    expect(plain.classList).toContain('button');
    const span = plain.querySelector(':scope > span');
    expect(span?.textContent).toBe('Guardar cita');
  });

  it('R2: type button por defecto y submit cuando se indica', () => {
    expect(render().getAttribute('type')).toBe('button');
    expect(render({ type: 'submit' }).getAttribute('type')).toBe('submit');
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

  it('R6: icon antes del span; no mientras loading', () => {
    const button = render({ icon: 'add' });
    const first = button.firstElementChild!;
    expect(first.tagName).toBe('APP-ICON');
    expect(first.textContent!.trim()).toBe('add');
    expect(first.nextElementSibling!.tagName).toBe('SPAN');

    expect(iconNames(render({ icon: 'add', loading: true }))).toEqual([]);
  });

  it('R7: iconEnd después del span, también mientras loading', () => {
    for (const loading of [false, true]) {
      const last = render({ iconEnd: 'expand_more', loading }).lastElementChild!;
      expect(last.tagName).toBe('APP-ICON');
      expect(last.textContent!.trim()).toBe('expand_more');
      expect(last.previousElementSibling!.tagName).toBe('SPAN');
    }
  });

  it('R8: disabled nativo con disabled', () => {
    expect(render().disabled).toBe(false);
    expect(render({ disabled: true }).disabled).toBe(true);
    expect(renderHost().disabled.disabled).toBe(true);
  });

  it('R9: loading expone data-loading, aria-busy y aria-disabled sin disabled nativo', () => {
    const idle = render();
    expect(idle.hasAttribute('data-loading')).toBe(false);
    expect(idle.hasAttribute('aria-busy')).toBe(false);
    expect(idle.hasAttribute('aria-disabled')).toBe(false);

    const { loading } = renderHost();
    expect(loading.getAttribute('data-loading')).toBe('');
    expect(loading.getAttribute('aria-busy')).toBe('true');
    expect(loading.getAttribute('aria-disabled')).toBe('true');
    expect(loading.disabled).toBe(false);
  });

  it('R10: spinner en lugar del icono, tamaño según size y label', () => {
    const spinnerOf = (inputs: Record<string, unknown>) =>
      render({ icon: 'add', loading: true, ...inputs }).querySelector('app-spinner')!;

    const small = spinnerOf({});
    expect(small.firstElementChild).toBeNull();
    expect(small.parentElement!.firstElementChild).toBe(small);
    expect(small.getAttribute('data-size')).toBe('s');
    expect(small.getAttribute('aria-label')).toBe('Cargando');

    expect(spinnerOf({ size: 's' }).getAttribute('data-size')).toBe('s');
    expect(spinnerOf({ size: 'l' }).hasAttribute('data-size')).toBe(false); // m no expone atributo
    expect(spinnerOf({ loadingLabel: 'Guardando' }).getAttribute('aria-label')).toBe('Guardando');

    expect(render({ icon: 'add' }).querySelector('app-spinner')).toBeNull();
  });

  it('R11: clic emite clicked con el MouseEvent', () => {
    const { host, plain } = renderHost();
    plain.click();
    expect(host.last).toBeInstanceOf(MouseEvent);
  });

  it('R12: mientras loading, clic no emite ni envía el formulario', () => {
    const { host, loading } = renderHost();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    loading.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    loading.click();
    expect(host.clicks).toBe(0);
    expect(host.submitted).toBe(false);
  });

  it('R13: mientras disabled, clic no emite', () => {
    const { host, disabled } = renderHost();
    disabled.click();
    expect(host.clicks).toBe(0);
  });
});
