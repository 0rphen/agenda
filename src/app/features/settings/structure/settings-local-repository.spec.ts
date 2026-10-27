import { TestBed } from '@angular/core/testing';
import { SETTINGS_DEFAULTS } from '../domain/settings-options';
import { SettingsLocalRepository } from './settings-local-repository';

describe('SettingsLocalRepository', () => {
  const key = 'agenda:v2:/settings';
  let repository: SettingsLocalRepository;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [SettingsLocalRepository] });
    repository = TestBed.inject(SettingsLocalRepository);
  });

  it('R3: sin datos devuelve una copia de los defaults del DS', async () => {
    const settings = await repository.load();
    expect(settings).toEqual(SETTINGS_DEFAULTS);
    expect(settings).not.toBe(SETTINGS_DEFAULTS);
    expect(settings.profile.firstName).toBe('César');
    expect(settings.calendar.defaultView).toBe('Semana');
  });

  it('R3: mezcla lo guardado sobre los defaults por grupo', async () => {
    localStorage.setItem(key, JSON.stringify({ calendar: { defaultView: 'Mes' } }));
    const settings = await repository.load();
    expect(settings.calendar.defaultView).toBe('Mes');
    expect(settings.calendar.weekStart).toBe('Lunes');
    expect(settings.appearance).toEqual(SETTINGS_DEFAULTS.appearance);
  });

  it('R4: JSON inválido rechaza', async () => {
    localStorage.setItem(key, '{roto');
    await expect(repository.load()).rejects.toThrow();
    localStorage.setItem(key, 'null');
    await expect(repository.load()).rejects.toThrow();
  });

  it('R6: save persiste y load lo devuelve', async () => {
    const settings = structuredClone(SETTINGS_DEFAULTS);
    settings.appearance.density = 'Compacta';
    await repository.save(settings);
    expect(JSON.parse(localStorage.getItem(key)!)).toEqual(settings);
    expect((await repository.load()).appearance.density).toBe('Compacta');
  });
});
