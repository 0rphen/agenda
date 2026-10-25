import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { Checkbox } from './checkbox';

function render(inputs: Record<string, unknown>): ComponentFixture<Checkbox> {
  const fixture = TestBed.createComponent(Checkbox);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture;
}

function q<T extends Element>(fixture: ComponentFixture<unknown>, selector: string): T {
  return (fixture.nativeElement as HTMLElement).querySelector<T>(selector)!;
}

@Component({
  imports: [Checkbox],
  template: `<app-checkbox label="Recordarme" /><app-checkbox label="Recordarme" />`,
})
class TwoChecks {}

@Component({
  imports: [Checkbox],
  template: `<app-checkbox label="Recordarme" disabled required />`,
})
class BareAttributes {}

@Component({
  imports: [Checkbox, FormField],
  template: `<app-checkbox label="Acepto las condiciones" [formField]="termsForm.ok" />`,
})
class SignalFormHost {
  readonly model = signal({ ok: false });
  readonly locked = signal(false);
  readonly termsForm = form(this.model, (path) => {
    required(path.ok);
    disabled(path.ok, () => this.locked());
  });
}

describe('Checkbox', () => {
  it('R1: host .field con label.check > input oculto, caja con app-icon s y texto', () => {
    const fixture = render({ label: 'Recordarme' });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList).toContain('field');
    const label = q(fixture, 'label.check');
    const [input, box, text] = Array.from(label.children);
    expect(input.tagName).toBe('INPUT');
    expect((input as HTMLInputElement).type).toBe('checkbox');
    expect(input.classList).toContain('check__input');
    expect(input.classList).toContain('u-visually-hidden');
    expect(box.classList).toContain('check__box');
    expect(box.querySelector('app-icon')?.getAttribute('data-size')).toBe('s');
    expect(text.tagName).toBe('SPAN');
    expect(text.textContent?.trim()).toBe('Recordarme');

    const bare = render({ ariaLabel: 'Marcar como hecha' });
    expect(q(bare, 'label.check').children.length).toBe(2);
  });

  it('R2: id va al input (app-checkbox-N único por defecto), nunca al host', () => {
    const fixture = render({ id: 'recordar' });
    expect((fixture.nativeElement as HTMLElement).hasAttribute('id')).toBe(false);
    expect(q(fixture, 'input').id).toBe('recordar');

    const two = TestBed.createComponent(TwoChecks);
    two.detectChanges();
    const [a, b] = Array.from((two.nativeElement as HTMLElement).querySelectorAll('input'));
    expect(a.id).toMatch(/^app-checkbox-\d+$/);
    expect(b.id).toMatch(/^app-checkbox-\d+$/);
    expect(a.id).not.toBe(b.id);
  });

  it('R3: aria-label solo sin label', () => {
    expect(q(render({ ariaLabel: 'Marcar como hecha' }), 'input').getAttribute('aria-label')).toBe(
      'Marcar como hecha',
    );
    expect(
      q(render({ label: 'Recordarme', ariaLabel: 'Marcar como hecha' }), 'input').hasAttribute(
        'aria-label',
      ),
    ).toBe(false);
  });

  it('R4: refleja checked en la propiedad del input', () => {
    expect(q<HTMLInputElement>(render({ checked: true }), 'input').checked).toBe(true);
    expect(q<HTMLInputElement>(render({}), 'input').checked).toBe(false);
  });

  it('R5: alternar actualiza checked y limpia indeterminate', () => {
    const fixture = render({ label: 'Todas', indeterminate: true });
    q<HTMLInputElement>(fixture, 'input').click();
    expect(fixture.componentInstance.checked()).toBe(true);
    expect(fixture.componentInstance.indeterminate()).toBe(false);

    q<HTMLSpanElement>(fixture, 'label.check > span:last-child').click();
    expect(fixture.componentInstance.checked()).toBe(false);
  });

  it('R6: perder el foco pone touched en true', () => {
    const fixture = render({});
    expect(fixture.componentInstance.touched()).toBe(false);
    q(fixture, 'input').dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.touched()).toBe(true);
  });

  it('R7: indeterminate en el input e ícono remove; si no, check', () => {
    const fixture = render({ indeterminate: true });
    expect(q<HTMLInputElement>(fixture, 'input').indeterminate).toBe(true);
    expect(q(fixture, '.check__box app-icon').textContent?.trim()).toBe('remove');

    const plain = render({});
    expect(q<HTMLInputElement>(plain, 'input').indeterminate).toBe(false);
    expect(q(plain, '.check__box app-icon').textContent?.trim()).toBe('check');

    q<HTMLInputElement>(fixture, 'input').click();
    fixture.detectChanges();
    expect(q(fixture, '.check__box app-icon').textContent?.trim()).toBe('check');
  });

  it('R9: disabled nativo y data-disabled en el label; el clic no cambia checked', () => {
    const fixture = render({ disabled: true });
    const input = q<HTMLInputElement>(fixture, 'input');
    expect(input.disabled).toBe(true);
    expect(q(fixture, 'label.check').getAttribute('data-disabled')).toBe('');
    input.click();
    expect(fixture.componentInstance.checked()).toBe(false);

    const enabled = render({});
    expect(q<HTMLInputElement>(enabled, 'input').disabled).toBe(false);
    expect(q(enabled, 'label.check').hasAttribute('data-disabled')).toBe(false);
  });

  it('R10: name se expone solo si se pasa', () => {
    expect(q(render({ name: 'recordar' }), 'input').getAttribute('name')).toBe('recordar');
    expect(q(render({}), 'input').hasAttribute('name')).toBe(false);
  });

  it('R11: required nativo', () => {
    expect(q<HTMLInputElement>(render({ required: true }), 'input').required).toBe(true);
    expect(q<HTMLInputElement>(render({}), 'input').required).toBe(false);
  });

  it('R12: hint en .field__hint tras el label, referenciado por aria-describedby', () => {
    const fixture = render({
      id: 'recordar',
      label: 'Recordarme',
      hint: 'Solo en este dispositivo',
    });
    const hint = q(fixture, '.field__hint');
    expect(hint.id).toBe('recordar-hint');
    expect(hint.previousElementSibling?.matches('label.check')).toBe(true);
    expect(hint.textContent?.trim()).toBe('Solo en este dispositivo');
    expect(q(fixture, 'input').getAttribute('aria-describedby')).toBe('recordar-hint');

    const bare = render({});
    expect(q(bare, '.field__hint')).toBeNull();
    expect(q(bare, 'input').hasAttribute('aria-describedby')).toBe(false);

    const error = render({ id: 'terminos', error: 'Completa este campo' });
    expect(q(error, '.field__hint').id).toBe('terminos-hint');
    expect(q(error, 'input').getAttribute('aria-describedby')).toBe('terminos-hint');
  });

  it('R13: error marca data-invalid, aria-invalid, error_outline s y gana al hint', () => {
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

  it('R17: disabled y required como atributo suelto cuentan como true', () => {
    const fixture = TestBed.createComponent(BareAttributes);
    fixture.detectChanges();
    const input = q<HTMLInputElement>(fixture, 'input');
    expect(input.disabled).toBe(true);
    expect(input.required).toBe(true);
  });

  it('R16: no declara estilos de componente', () => {
    const host = render({}).nativeElement as HTMLElement;
    expect(Array.from(host.attributes).some((a) => a.name.startsWith('_nghost'))).toBe(false);
  });
});

describe('Checkbox con Signal Forms', () => {
  it('R15: sincroniza checked, touched, disabled, required y name con el campo', () => {
    const fixture = TestBed.createComponent(SignalFormHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const input = q<HTMLInputElement>(fixture, 'input');
    expect(input.checked).toBe(false);
    expect(input.required).toBe(true);
    expect(input.getAttribute('name')).toBeTruthy();
    expect(host.termsForm.ok().invalid()).toBe(true);

    input.click();
    fixture.detectChanges();
    expect(host.model().ok).toBe(true);
    expect(host.termsForm.ok().invalid()).toBe(false);

    host.model.set({ ok: false });
    fixture.detectChanges();
    expect(input.checked).toBe(false);

    input.dispatchEvent(new Event('blur'));
    expect(host.termsForm.ok().touched()).toBe(true);

    host.locked.set(true);
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
    expect(q(fixture, 'label.check').hasAttribute('data-disabled')).toBe(true);
  });
});
