import { Injectable } from '@angular/core';
import { SETTINGS_DEFAULTS } from '../domain/settings-options';
import { SettingsRepository } from '../domain/settings-repository';
import { UserSettings } from '../domain/settings.model';

/** Ajustes en `agenda:v2:/settings`; lo guardado se mezcla sobre los defaults por grupo. */
@Injectable()
export class SettingsLocalRepository extends SettingsRepository {
  private readonly key = 'agenda:v2:/settings';

  async load(): Promise<UserSettings> {
    const raw = localStorage.getItem(this.key);
    if (raw === null) return structuredClone(SETTINGS_DEFAULTS);
    const saved = JSON.parse(raw) as Partial<UserSettings>;
    if (typeof saved !== 'object' || saved === null) throw new Error('Ajustes no válidos');
    const merged = structuredClone(SETTINGS_DEFAULTS);
    for (const group of Object.keys(merged) as (keyof UserSettings)[]) {
      Object.assign(merged[group], saved[group]);
    }
    return merged;
  }

  async save(settings: UserSettings): Promise<void> {
    localStorage.setItem(this.key, JSON.stringify(settings));
  }
}
