import { normalizeSearch } from './text';

describe('normalizeSearch', () => {
  it('quita tildes y pasa a minúsculas', () =>
    expect(normalizeSearch('Reunión ÁREA')).toBe('reunion area'));
  it('quita diéresis', () => expect(normalizeSearch('Pingüino')).toBe('pinguino'));
  it('la ñ pierde la virgulilla', () => expect(normalizeSearch('Peña')).toBe('pena'));
  it('vacío da vacío', () => expect(normalizeSearch('')).toBe(''));
});
