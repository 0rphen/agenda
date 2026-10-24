import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IconButton } from './icon-button';

function render(inputs: Record<string, unknown> = {}): HTMLButtonElement {
  const fixture = TestBed.createComponent(IconButton);
  const all = { icon: 'more_horiz', label: 'Más opciones', ...inputs };
  for (const [key, value] of Object.entries(all)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement.querySelector('button');
}

// Atributos sin valor (`loading`, `disabled`) necesitan un host.
@Component({
  imports: [IconButton],
  template: `
    <form (submit)="submitted = true">
      <app-icon-button
        type="submit"
        loading
        size="l"
        icon="add"
        label="Nuevo evento"
        (clicked)="clicks = clicks + 1"
      />
      <app-icon-button disabled icon="edit" label="Editar" (clicked)="clicks = clicks + 1" />
      <app-icon-button icon="more_horiz" label="Más opciones" (clicked)="last = $event" />
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

describe('IconButton', () => {
  it('R1: un único button.icon-button con un único app-icon, o app-spinner mientras loading', () => {
    const { plain } = renderHost();
    expect(plain.parentElement!.querySelectorAll('button')).toHaveLength(1);
    expect(plain.classList).toContain('icon-button');
    expect(plain.children).toHaveLength(1);
    expect(plain.firstElementChild!.tagName).toBe('APP-ICON');

    const loading = render({ loading: true });
    expect(loading.children).toHaveLength(1);
    expect(loading.firstElementChild!.tagName).toBe('APP-SPINNER');
  });

  it('R2: aria-label y title con label', () => {
    const button = render({ label: 'Nuevo evento' });
    expect(button.getAttribute('aria-label')).toBe('Nuevo evento');
    expect(button.getAttribute('title')).toBe('Nuevo evento');
  });

  it('R3: type button por defecto y submit cuando se indica', () => {
    expect(render().getAttribute('type')).toBe('button');
    expect(render({ type: 'submit' }).getAttribute('type')).toBe('submit');
  });

  it('R4: data-variant salvo ghost', () => {
    expect(render().hasAttribute('data-variant')).toBe(false);
    expect(render({ variant: 'ghost' }).hasAttribute('data-variant')).toBe(false);
    for (const variant of ['tonal', 'solid']) {
      expect(render({ variant }).getAttribute('data-variant')).toBe(variant);
    }
  });

  it('R5: data-size salvo m', () => {
    expect(render().hasAttribute('data-size')).toBe(false);
    expect(render({ size: 'm' }).hasAttribute('data-size')).toBe(false);
    for (const size of ['s', 'l']) {
      expect(render({ size }).getAttribute('data-size')).toBe(size);
    }
  });

  it('R6: app-icon con icon, tamaño m y filled', () => {
    for (const size of ['s', 'm', 'l']) {
      const icon = render({ icon: 'star', size }).querySelector('app-icon')!;
      expect(icon.textContent!.trim()).toBe('star');
      expect(icon.hasAttribute('data-size')).toBe(false);
      expect(icon.hasAttribute('data-filled')).toBe(false);
    }
    const filled = render({ icon: 'star', filled: true }).querySelector('app-icon')!;
    expect(filled.getAttribute('data-filled')).toBe('');
  });

  it('R7: disabled nativo con disabled', () => {
    expect(render().disabled).toBe(false);
    expect(render({ disabled: true }).disabled).toBe(true);
    expect(renderHost().disabled.disabled).toBe(true);
  });

  it('R8: loading expone data-loading, aria-busy y aria-disabled sin disabled nativo y conserva aria-label', () => {
    const idle = render();
    expect(idle.hasAttribute('data-loading')).toBe(false);
    expect(idle.hasAttribute('aria-busy')).toBe(false);
    expect(idle.hasAttribute('aria-disabled')).toBe(false);

    const { loading } = renderHost();
    expect(loading.getAttribute('data-loading')).toBe('');
    expect(loading.getAttribute('aria-busy')).toBe('true');
    expect(loading.getAttribute('aria-disabled')).toBe('true');
    expect(loading.disabled).toBe(false);
    expect(loading.getAttribute('aria-label')).toBe('Nuevo evento');
  });

  it('R9: spinner aria-hidden en lugar del icono, m con size l y s en otro caso', () => {
    const spinnerOf = (inputs: Record<string, unknown>) =>
      render({ loading: true, ...inputs }).querySelector('app-spinner')!;

    const small = spinnerOf({});
    expect(small.getAttribute('aria-hidden')).toBe('true');
    expect(small.parentElement!.querySelector('app-icon')).toBeNull();
    expect(small.getAttribute('data-size')).toBe('s');
    expect(spinnerOf({ size: 's' }).getAttribute('data-size')).toBe('s');
    expect(spinnerOf({ size: 'l' }).hasAttribute('data-size')).toBe(false); // m no expone atributo

    expect(render().querySelector('app-spinner')).toBeNull();
  });

  it('R10: clic emite clicked con el MouseEvent', () => {
    const { host, plain } = renderHost();
    plain.click();
    expect(host.last).toBeInstanceOf(MouseEvent);
  });

  it('R11: mientras loading, clic no emite ni envía el formulario', () => {
    const { host, loading } = renderHost();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    loading.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    loading.click();
    expect(host.clicks).toBe(0);
    expect(host.submitted).toBe(false);
  });

  it('R12: mientras disabled, clic no emite', () => {
    const { host, disabled } = renderHost();
    disabled.click();
    expect(host.clicks).toBe(0);
  });
});
