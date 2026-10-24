import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { email, form, FormField, max, min, required, validate } from '@angular/forms/signals';
import { NumberField } from '@shared/components/number-field/number-field';
import { TextField } from '@shared/components/text-field/text-field';
import { fieldError } from './field-error';
import { dniNie, phone } from './validators';

function setup() {
  const model = signal({
    name: '',
    mail: 'x',
    low: 1,
    high: 99,
    tel: '12-34',
    doc: '1',
    odd: '',
    own: '',
  });
  const f = TestBed.runInInjectionContext(() =>
    form(model, (path) => {
      required(path.name);
      email(path.mail);
      min(path.low, 5);
      max(path.high, 10);
      phone(path.tel);
      dniNie(path.doc);
      validate(path.odd, () => ({ kind: 'raro' }));
      required(path.own, { message: 'Pon tu nombre' });
    }),
  );
  return { model, f };
}

describe('fieldError', () => {
  it('R8: undefined mientras no está touched', () => {
    const { f } = setup();
    expect(f.name().errors().length).toBe(1);
    expect(fieldError(f.name)).toBeUndefined();
  });

  it('R8: undefined si está touched sin errores', () => {
    const { model, f } = setup();
    model.update((m) => ({ ...m, name: 'Ana' }));
    f.name().markAsTouched();
    expect(fieldError(f.name)).toBeUndefined();
  });

  it('R9: devuelve el message del primer error si está touched', () => {
    const { f } = setup();
    f.own().markAsTouched();
    expect(fieldError(f.own)).toBe('Pon tu nombre');
  });

  it('R10: mensaje por defecto según kind', () => {
    const { f } = setup();
    const cases = [
      [f.name, 'Completa este campo'],
      [f.mail, 'Escribe un correo válido, p. ej. nombre@dominio.es'],
      [f.low, 'Escribe un número igual o mayor que 5'],
      [f.high, 'Escribe un número igual o menor que 10'],
      [f.tel, 'Escribe un teléfono válido, p. ej. +34 600 123 456'],
      [f.doc, 'Escribe un DNI o NIE válido, p. ej. 12345678Z'],
    ] as const;
    for (const [field, message] of cases) {
      field().markAsTouched();
      expect(fieldError(field)).toBe(message);
    }
  });

  it('R11: kind desconocido devuelve «Revisa este campo»', () => {
    const { f } = setup();
    f.odd().markAsTouched();
    expect(fieldError(f.odd)).toBe('Revisa este campo');
  });
});

@Component({
  imports: [TextField, NumberField, FormField],
  template: `
    <app-text-field label="Correo" type="email" [formField]="f.mail" [error]="fieldError(f.mail)" />
    <app-number-field label="Asistentes" [formField]="f.guests" [error]="fieldError(f.guests)" />
  `,
})
class FormHost {
  readonly model = signal<{ mail: string; guests: number | null }>({ mail: '', guests: null });
  readonly f = form(this.model, (path) => {
    email(path.mail);
    min(path.guests, 1);
  });
  protected readonly fieldError = fieldError;
}

describe('fieldError en un formulario', () => {
  it('R19: muestra el mensaje tras blur con valor inválido y lo quita al corregirlo', () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const hint = (host: string) => el.querySelector(`${host} .field__hint`)?.textContent?.trim();
    const edit = (host: string, text: string, event: string) => {
      const control = el.querySelector<HTMLInputElement>(`${host} input`)!;
      control.value = text;
      control.dispatchEvent(new Event(event));
      fixture.detectChanges();
    };

    edit('app-text-field', 'ana', 'input');
    edit('app-number-field', '0', 'input');
    expect(hint('app-text-field')).toBeUndefined();
    expect(hint('app-number-field')).toBeUndefined();

    edit('app-text-field', 'ana', 'blur');
    edit('app-number-field', '0', 'blur');
    expect(hint('app-text-field')).toBe(
      'error_outline Escribe un correo válido, p. ej. nombre@dominio.es',
    );
    expect(hint('app-number-field')).toBe('error_outline Escribe un número igual o mayor que 1');

    edit('app-text-field', 'ana@dominio.es', 'input');
    edit('app-number-field', '3', 'input');
    expect(hint('app-text-field')).toBeUndefined();
    expect(hint('app-number-field')).toBeUndefined();
  });
});
