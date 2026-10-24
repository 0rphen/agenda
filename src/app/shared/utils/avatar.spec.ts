import { initials, tintFor } from './avatar';

describe('initials', () => {
  it('una palabra: primera letra', () => expect(initials('Ana')).toBe('A'));
  it('varias palabras: primera y última', () => expect(initials('Ana María López')).toBe('AL'));
  it('ignora espacios sobrantes', () => expect(initials('  Ana   López  ')).toBe('AL'));
  it('vacío o solo espacios da ?', () => {
    expect(initials('')).toBe('?');
    expect(initials('   ')).toBe('?');
  });
  it('pasa a mayúsculas', () => expect(initials('ana lópez')).toBe('AL'));
});

describe('tintFor', () => {
  it('es estable para el mismo nombre', () => expect(tintFor('Ana')).toBe(tintFor('Ana')));
  it('da el valor del DS', () => {
    expect(tintFor('Adrian Murillo')).toBe('rose');
    expect(tintFor('Ana')).toBe('lime');
  });
});
