import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SETTINGS_DEFAULTS } from '../domain/settings-options';
import { SettingsRepository } from '../domain/settings-repository';
import { UserSettings } from '../domain/settings.model';
import { UserSettingsStore } from './user-settings.store';

describe('UserSettingsStore', () => {
  const saved: UserSettings = {
    ...structuredClone(SETTINGS_DEFAULTS),
    calendar: { ...SETTINGS_DEFAULTS.calendar, defaultView: 'Mes' },
  };
  let load: ReturnType<typeof vi.fn>;

  function setup(platform = 'browser') {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: platform },
        { provide: SettingsRepository, useValue: { load, save: vi.fn() } },
      ],
    });
    return TestBed.inject(UserSettingsStore);
  }

  beforeEach(() => (load = vi.fn().mockResolvedValue(saved)));

  it('R1: vale los defaults hasta cargar; load lee el repositorio una sola vez', async () => {
    const store = setup();
    expect(store.settings()).toEqual(SETTINGS_DEFAULTS);
    await Promise.all([store.load(), store.load()]);
    await store.load();
    expect(load).toHaveBeenCalledTimes(1);
    expect(store.settings()).toEqual(saved);
  });

  it('R1: en el servidor load no lee el repositorio y quedan los defaults', async () => {
    const store = setup('server');
    await store.load();
    expect(load).not.toHaveBeenCalled();
    expect(store.settings()).toEqual(SETTINGS_DEFAULTS);
  });

  it('R2: si la carga falla quedan los defaults sin lanzar', async () => {
    load = vi.fn(async () => {
      throw new SyntaxError('JSON');
    });
    const store = setup();
    await expect(store.load()).resolves.toBeUndefined();
    expect(store.settings()).toEqual(SETTINGS_DEFAULTS);
  });

  it('R3: set reemplaza los ajustes', () => {
    const store = setup();
    store.set(saved);
    expect(store.settings()).toEqual(saved);
  });
});
