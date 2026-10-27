import { TestBed } from '@angular/core/testing';
import { SETTINGS_DEFAULTS } from './domain/settings-options';
import { SettingsRepository } from './domain/settings-repository';
import { UserSettings } from './domain/settings.model';
import { SettingsFacade } from './settings.facade';

describe('SettingsFacade', () => {
  let repository: { load: ReturnType<typeof vi.fn>; save: ReturnType<typeof vi.fn> };
  let facade: SettingsFacade;
  const stored = (): UserSettings => ({
    ...structuredClone(SETTINGS_DEFAULTS),
    appearance: { density: 'Compacta', textSize: 'Grande', reduceMotion: true },
  });

  beforeEach(() => {
    repository = {
      load: vi.fn().mockResolvedValue(stored()),
      save: vi.fn().mockResolvedValue(undefined),
    };
    TestBed.configureTestingModule({
      providers: [SettingsFacade, { provide: SettingsRepository, useValue: repository }],
    });
    facade = TestBed.inject(SettingsFacade);
  });

  it('R3: load pasa de idle a loading y a ready con los ajustes', async () => {
    expect(facade.status()).toBe('idle');
    const loading = facade.load();
    expect(facade.status()).toBe('loading');
    await loading;
    expect(facade.status()).toBe('ready');
    expect(facade.draft()).toEqual(stored());
  });

  it('R4: si el repositorio falla, status es error', async () => {
    repository.load.mockRejectedValue(new SyntaxError('JSON'));
    await facade.load();
    expect(facade.status()).toBe('error');
  });

  it('R5: el form refleja los ajustes y dirty sigue al draft', async () => {
    await facade.load();
    expect(facade.form.appearance.density().value()).toBe('Compacta');
    expect(facade.dirty()).toBe(false);
    facade.form.appearance.density().value.set('Cómoda');
    expect(facade.dirty()).toBe(true);
    facade.form.appearance.density().value.set('Compacta');
    expect(facade.dirty()).toBe(false);
  });

  it('R6: save persiste el draft, marca saving y saved y limpia dirty', async () => {
    await facade.load();
    facade.form.calendar.showWeekends().value.set(false);
    const saving = facade.save();
    expect(facade.saving()).toBe(true);
    await saving;
    expect(repository.save).toHaveBeenCalledWith(facade.draft());
    expect(facade.saving()).toBe(false);
    expect(facade.saved()).toBe(true);
    expect(facade.dirty()).toBe(false);
  });

  it('R6: si save falla, saveError y dirty se mantiene', async () => {
    await facade.load();
    repository.save.mockRejectedValue(new Error('quota'));
    facade.form.profile.firstName().value.set('Ana');
    await facade.save();
    expect(facade.saveError()).toBe(true);
    expect(facade.saved()).toBe(false);
    expect(facade.dirty()).toBe(true);
    facade.dismissSaveError();
    expect(facade.saveError()).toBe(false);
  });

  it('R7: cancel vuelve a lo guardado', async () => {
    await facade.load();
    facade.form.profile.firstName().value.set('Ana');
    facade.cancel();
    expect(facade.draft().profile.firstName).toBe('César');
    expect(facade.dirty()).toBe(false);
  });

  it('R8 y R9: un draft común a todas las secciones; userName del draft', async () => {
    await facade.load();
    facade.form.profile.lastName().value.set('Rojas');
    facade.form.notifications.browser().value.set(true);
    expect(facade.draft().profile.lastName).toBe('Rojas');
    expect(facade.draft().notifications.browser).toBe(true);
    expect(facade.userName()).toBe('César Rojas');
  });
});
