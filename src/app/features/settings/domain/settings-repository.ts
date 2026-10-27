import { UserSettings } from './settings.model';

export abstract class SettingsRepository {
  abstract load(): Promise<UserSettings>;
  abstract save(settings: UserSettings): Promise<void>;
}
