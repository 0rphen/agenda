import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { dniNie, phone } from './validators';

function setup(config?: { message?: string }) {
  const model = signal({ tel: '', doc: '' });
  const f = TestBed.runInInjectionContext(() =>
    form(model, (path) => {
      phone(path.tel, config);
      dniNie(path.doc, config);
    }),
  );
  const telErrors = (tel: string) => {
    model.update((m) => ({ ...m, tel }));
    return f.tel().errors();
  };
  const docErrors = (doc: string) => {
    model.update((m) => ({ ...m, doc }));
    return f.doc().errors();
  };
  return { telErrors, docErrors };
}

describe('phone', () => {
  it('R1: acepta + opcional, dígitos y espacios, 7–15 dígitos', () => {
    const { telErrors } = setup();
    for (const tel of ['+34 600 123 456', '600123456', '1234567', '123456789012345']) {
      expect(telErrors(tel)).toEqual([]);
    }
  });

  it('R2: error kind phone si no cumple R1', () => {
    const { telErrors } = setup();
    for (const tel of ['12-34', '+34abc', '123456', '1234567890123456', '34+600123456']) {
      expect(telErrors(tel).map((e) => e.kind)).toEqual(['phone']);
    }
  });
});

describe('dniNie', () => {
  it('R3: acepta DNI y NIE, sin distinguir mayúsculas e ignorando espacios', () => {
    const { docErrors } = setup();
    for (const doc of ['12345678Z', 'X1234567L', 'y1234567x', ' z1234567r ', '12345678z']) {
      expect(docErrors(doc)).toEqual([]);
    }
  });

  it('R4: comprueba la letra de control, con X/Y/Z como 0/1/2', () => {
    const { docErrors } = setup();
    expect(docErrors('12345678A').map((e) => e.kind)).toEqual(['dniNie']);
    expect(docErrors('X1234567Z').map((e) => e.kind)).toEqual(['dniNie']);
    expect(docErrors('Y1234567X')).toEqual([]);
  });

  it('R5: error kind dniNie si el formato no cumple R3', () => {
    const { docErrors } = setup();
    for (const doc of ['1234567Z', 'A1234567L', 'X12345678L', '12 345678Z', '123456789']) {
      expect(docErrors(doc).map((e) => e.kind)).toEqual(['dniNie']);
    }
  });
});

describe('phone y dniNie', () => {
  it('R6: valor vacío no produce error', () => {
    const { telErrors, docErrors } = setup();
    expect(telErrors('')).toEqual([]);
    expect(docErrors('')).toEqual([]);
  });

  it('R7: usa config.message como message del error', () => {
    const { telErrors, docErrors } = setup({ message: 'Mal' });
    expect(telErrors('12-34')[0].message).toBe('Mal');
    expect(docErrors('12345678A')[0].message).toBe('Mal');
  });
});
