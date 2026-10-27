import { isNarrow } from './dom';

describe('isNarrow', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('es false sin matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(isNarrow()).toBe(false);
  });

  it('consulta (width < 48rem)', () => {
    const matchMedia = vi.fn(() => ({ matches: true }));
    vi.stubGlobal('matchMedia', matchMedia);
    expect(isNarrow()).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith('(width < 48rem)');
  });
});
