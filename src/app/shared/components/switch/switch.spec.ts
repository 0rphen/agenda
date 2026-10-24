import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { Switch } from './switch';

function render(inputs: Record<string, unknown>): ComponentFixture<Switch> {
  const fixture = TestBed.createComponent(Switch);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture;
}

function q<T extends Element>(fixture: ComponentFixture<unknown>, selector: string): T {
  return (fixture.nativeElement as HTMLElement).querySelector<T>(selector)!;
}

@Component({
  imports: [Switch],
  template: `<app-switch label="Todo el día" /><app-switch label="Todo el día" />`,
})
class TwoSwitches {}

@Component({
  imports: [Switch],
  template: `<app-switch label="Todo el día" disabled required />`,
})
class BareAttributes {}

@Component({
  imports: [Switch, FormField],
  template: `<app-switch label="Recibir avisos" [formField]="notifyForm.on" />`,
})
class SignalFormHost {
  readonly model = signal({ on: false });
  readonly locked = signal(false);
  readonly notifyForm = form(this.model, (path) => {
    required(path.on);
    disabled(path.on, () => this.locked());
  });
}

describe('Switch', () => {
  it('R1: host .field con label.switch > input role=switch oculto, pista vacía y texto', () => {
    const fixture = render({ label: 'Todo el día' });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList).toContain('field');
    const label = q(fixture, 'label.switch');
    const [input, track, text] = Array.from(label.children);
    expect(input.tagName).toBe('INPUT');
    expect((input as HTMLInputElement).type).toBe('checkbox');
    expect(input.getAttribute('role')).toBe('switch');
    expect(input.classList).toContain('switch__input');
    expect(input.classList).toContain('u-visually-hidden');
    expect(track.tagName).toBe('SPAN');
    expect(track.classList).toContain('switch__track');
    expect(track.childNodes.length).toBe(0);
    expect(text.tagName).toBe('SPAN');
    expect(text.textContent?.trim()).toBe('Todo el día');

    const bare = render({ ariaLabel: 'Avisos' });
    expect(q(bare, 'label.switch').children.length).toBe(2);
  });

  it('R2: id va al input (app-switch-N único por defecto), nunca al host', () => {
    const fixture = render({ id: 'todo-el-dia' });
    expect((fixture.nativeElement as HTMLElement).hasAttribute('id')).toBe(false);
    expect(q(fixture, 'input').id).toBe('todo-el-dia');

    const two = TestBed.createComponent(TwoSwitches);
    two.detectChanges();
    const [a, b] = Array.from((two.nativeElement as HTMLElement).querySelectorAll('input'));
    expect(a.id).toMatch(/^app-switch-\d+$/);
    expect(b.id).toMatch(/^app-switch-\d+$/);
    expect(a.id).not.toBe(b.id);
  });

  it('R3: aria-label solo sin label', () => {
    expect(q(render({ ariaLabel: 'Avisos' }), 'input').getAttribute('aria-label')).toBe('Avisos');
    expect(
      q(render({ label: 'Todo el día', ariaLabel: 'Avisos' }), 'input').hasAttribute('aria-label'),
    ).toBe(false);
  });

  it('R4: refleja checked en la propiedad del input', () => {
    expect(q<HTMLInputElement>(render({ checked: true }), 'input').checked).toBe(true);
    expect(q<HTMLInputElement>(render({}), 'input').checked).toBe(false);
  });

  it('R5: alternar (input o texto) actualiza checked', () => {
    const fixture = render({ label: 'Todo el día' });
    q<HTMLInputElement>(fixture, 'input').click();
    expect(fixture.componentInstance.checked()).toBe(true);

    q<HTMLSpanElement>(fixture, 'label.switch > span:last-child').click();
    expect(fixture.componentInstance.checked()).toBe(false);
  });

  it('R6: perder el foco pone touched en true', () => {
    const fixture = render({});
    expect(fixture.componentInstance.touched()).toBe(false);
    q(fixture, 'input').dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.touched()).toBe(true);
  });

  it('R7: disabled nativo y data-disabled en el label; el clic no cambia checked', () => {
    const fixture = render({ disabled: true });
    const input = q<HTMLInputElement>(fixture, 'input');
    expect(input.disabled).toBe(true);
    expect(q(fixture, 'label.switch').getAttribute('data-disabled')).toBe('');
    input.click();
    expect(fixture.componentInstance.checked()).toBe(false);

    const enabled = render({});
    expect(q<HTMLInputElement>(enabled, 'input').disabled).toBe(false);
    expect(q(enabled, 'label.switch').hasAttribute('data-disabled')).toBe(false);
  });

  it('R8: name se expone solo si se pasa', () => {
    expect(q(render({ name: 'avisos' }), 'input').getAttribute('name')).toBe('avisos');
    expect(q(render({}), 'input').hasAttribute('name')).toBe(false);
  });

  it('R9: required nativo', () => {
    expect(q<HTMLInputElement>(render({ required: true }), 'input').required).toBe(true);
    expect(q<HTMLInputElement>(render({}), 'input').required).toBe(false);
  });

  it('R10: disabled y required como atributo suelto cuentan como true', () => {
    const fixture = TestBed.createComponent(BareAttributes);
    fixture.detectChanges();
    const input = q<HTMLInputElement>(fixture, 'input');
    expect(input.disabled).toBe(true);
    expect(input.required).toBe(true);
  });

  it('R11: hint en .field__hint tras el label, referenciado por aria-describedby', () => {
    const fixture = render({ id: 'avisos', label: 'Avisos', hint: 'Te avisamos 10 min antes' });
    const hint = q(fixture, '.field__hint');
    expect(hint.id).toBe('avisos-hint');
    expect(hint.previousElementSibling?.matches('label.switch')).toBe(true);
    expect(hint.textContent?.trim()).toBe('Te avisamos 10 min antes');
    expect(q(fixture, 'input').getAttribute('aria-describedby')).toBe('avisos-hint');

    const bare = render({});
    expect(q(bare, '.field__hint')).toBeNull();
    expect(q(bare, 'input').hasAttribute('aria-describedby')).toBe(false);

    const error = render({ id: 'avisos', error: 'Completa este campo' });
    expect(q(error, '.field__hint').id).toBe('avisos-hint');
    expect(q(error, 'input').getAttribute('aria-describedby')).toBe('avisos-hint');
  });

  it('R12: error marca data-invalid, aria-invalid, error_outline s y gana al hint', () => {
    const fixture = render({ hint: 'Ayuda', error: 'Completa este campo' });
    expect((fixture.nativeElement as HTMLElement).getAttribute('data-invalid')).toBe('');
    expect(q(fixture, 'input').getAttribute('aria-invalid')).toBe('true');
    const icon = q(fixture, '.field__hint app-icon');
    expect(icon.textContent?.trim()).toBe('error_outline');
    expect(icon.getAttribute('data-size')).toBe('s');
    expect(q(fixture, '.field__hint').textContent).toContain('Completa este campo');
    expect(q(fixture, '.field__hint').textContent).not.toContain('Ayuda');

    const valid = render({ hint: 'Ayuda' });
    expect((valid.nativeElement as HTMLElement).hasAttribute('data-invalid')).toBe(false);
    expect(q(valid, 'input').hasAttribute('aria-invalid')).toBe(false);
    expect(q(valid, '.field__hint app-icon')).toBeNull();
  });

  it('R17: no declara estilos de componente', () => {
    const host = render({}).nativeElement as HTMLElement;
    expect(Array.from(host.attributes).some((a) => a.name.startsWith('_nghost'))).toBe(false);
  });
});

describe('Switch con Signal Forms', () => {
  it('R14: sincroniza checked, touched, disabled, required y name con el campo', () => {
    const fixture = TestBed.createComponent(SignalFormHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const input = q<HTMLInputElement>(fixture, 'input');
    expect(input.checked).toBe(false);
    expect(input.required).toBe(true);
    expect(input.getAttribute('name')).toBeTruthy();
    expect(host.notifyForm.on().invalid()).toBe(true);

    input.click();
    fixture.detectChanges();
    expect(host.model().on).toBe(true);
    expect(host.notifyForm.on().invalid()).toBe(false);

    host.model.set({ on: false });
    fixture.detectChanges();
    expect(input.checked).toBe(false);

    input.dispatchEvent(new Event('blur'));
    expect(host.notifyForm.on().touched()).toBe(true);

    host.locked.set(true);
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
    expect(q(fixture, 'label.switch').hasAttribute('data-disabled')).toBe(true);
  });
});
