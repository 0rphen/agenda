import { Injectable, Injector, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SETTINGS_DEFAULTS } from '../domain/settings-options';
import { SettingsRepository } from '../domain/settings-repository';
import { UserSettings } from '../domain/settings.model';

/** Saved settings for the whole app; defaults on the server and until loaded in the browser. */
@Injectable({ providedIn: 'root' })
export class UserSettingsStore {
  private readonly injector = inject(Injector);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly settingsState = signal<UserSettings>(SETTINGS_DEFAULTS);
  private loading?: Promise<void>;

  readonly settings = this.settingsState.asReadonly();

  /** Reads the repository once; later calls share the same promise. */
  load(): Promise<void> {
    if (!this.browser) return Promise.resolve();
    // resolved here, not in a field: screens that only read `settings` need no repository
    this.loading ??= this.read();
    return this.loading;
  }

  private async read(): Promise<void> {
    try {
      this.settingsState.set(await this.injector.get(SettingsRepository).load());
    } catch {
      // corrupt storage: keep the defaults; Configuración shows its own error
    }
  }

  set(settings: UserSettings): void {
    this.settingsState.set(settings);
  }
}
