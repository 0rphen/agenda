import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { localIso } from '@shared/utils';
import { SETTINGS_DEFAULTS } from './domain/settings-options';
import { SettingsRepository } from './domain/settings-repository';
import { UserSettings } from './domain/settings.model';
import { SettingsFacade } from './settings.facade';
import { UserSettingsStore } from './store/user-settings.store';

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

  it('SPEC 73 R3: save ok actualiza UserSettingsStore; si falla no', async () => {
    const store = TestBed.inject(UserSettingsStore);
    await facade.load();
    facade.form.calendar.defaultView().value.set('Mes');
    await facade.save();
    expect(store.settings().calendar.defaultView).toBe('Mes');
    repository.save.mockRejectedValue(new Error('quota'));
    facade.form.calendar.defaultView().value.set('Día');
    await facade.save();
    expect(store.settings().calendar.defaultView).toBe('Mes');
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

  describe('acciones de cuenta (SPEC 74)', () => {
    beforeEach(() => localStorage.clear());

    it('R4: exportar descarga JSON con events, tasks, settings y exportedAt', async () => {
      localStorage.setItem('agenda:v3:/events', '[{"id":"e1"}]');
      localStorage.setItem('agenda:v3:/tasks', '[{"id":"t1"}]');
      let blob: Blob | undefined;
      URL.createObjectURL = vi.fn((b: Blob) => ((blob = b), 'blob:x'));
      URL.revokeObjectURL = vi.fn();
      const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
      await facade.exportData();
      const link = click.mock.contexts[0] as HTMLAnchorElement;
      expect(link.download).toBe(`agenda-export-${localIso(new Date())}.json`);
      // jsdom's Blob has no text()
      const raw = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsText(blob!);
      });
      const data = JSON.parse(raw);
      expect(data.events).toEqual([{ id: 'e1' }]);
      expect(data.tasks).toEqual([{ id: 't1' }]);
      expect(data.settings).toEqual(stored());
      expect(typeof data.exportedAt).toBe('string');
      expect(facade.exportError()).toBe(false);
      click.mockRestore();
    });

    it('R5: si la lectura falla, exportError', async () => {
      repository.load.mockRejectedValue(new SyntaxError('JSON'));
      await facade.exportData();
      expect(facade.exportError()).toBe(true);
      facade.dismissExportError();
      expect(facade.exportError()).toBe(false);
    });

    it('R7: eliminar cuenta borra solo agenda:* y recarga /inicio', () => {
      const assign = vi.fn();
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          SettingsFacade,
          { provide: SettingsRepository, useValue: repository },
          { provide: DOCUMENT, useValue: { location: { assign } } },
        ],
      });
      localStorage.setItem('agenda:v2:/settings', '{}');
      localStorage.setItem('agenda:v3:/tasks', '[]');
      localStorage.setItem('otra', '1');
      TestBed.inject(SettingsFacade).deleteAccount();
      expect(localStorage.getItem('agenda:v2:/settings')).toBeNull();
      expect(localStorage.getItem('agenda:v3:/tasks')).toBeNull();
      expect(localStorage.getItem('otra')).toBe('1');
      expect(assign).toHaveBeenCalledWith('/inicio');
    });

    it('R10 y R11: sin leer, permiso undefined; sin Notification, unsupported', async () => {
      expect(facade.notificationPermission()).toBeUndefined();
      vi.stubGlobal('Notification', undefined);
      try {
        facade.readNotificationPermission();
        expect(facade.notificationPermission()).toBe('unsupported');
        await facade.requestNotifications();
        expect(facade.notificationPermission()).toBe('unsupported');
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it('R9: requestNotifications guarda la respuesta del navegador', async () => {
      const requestPermission = vi.fn().mockResolvedValue('denied');
      vi.stubGlobal('Notification', { permission: 'default', requestPermission });
      try {
        await facade.requestNotifications();
        expect(requestPermission).toHaveBeenCalled();
        expect(facade.notificationPermission()).toBe('denied');
      } finally {
        vi.unstubAllGlobals();
      }
    });
  });
});
