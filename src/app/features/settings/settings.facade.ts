import { Injectable, computed, inject, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { SETTINGS_DEFAULTS } from './domain/settings-options';
import { SettingsRepository } from './domain/settings-repository';
import { SettingsStatus, UserSettings } from './domain/settings.model';

@Injectable()
export class SettingsFacade {
  private readonly repository = inject(SettingsRepository);

  private readonly statusState = signal<SettingsStatus>('idle');
  private readonly stored = signal<UserSettings>(SETTINGS_DEFAULTS);
  private readonly savingState = signal(false);
  private readonly savedState = signal(false);
  private readonly saveErrorState = signal(false);

  readonly status = this.statusState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly saved = this.savedState.asReadonly();
  readonly saveError = this.saveErrorState.asReadonly();

  // un único draft para todas las secciones: cambiar de sección no descarta nada
  readonly draft = signal<UserSettings>(structuredClone(SETTINGS_DEFAULTS));
  readonly form = form(this.draft);

  readonly dirty = computed(() => JSON.stringify(this.draft()) !== JSON.stringify(this.stored()));
  readonly userName = computed(() =>
    `${this.draft().profile.firstName} ${this.draft().profile.lastName}`.trim(),
  );

  async load(): Promise<void> {
    this.statusState.set('loading');
    try {
      const settings = await this.repository.load();
      this.stored.set(settings);
      this.draft.set(structuredClone(settings));
      this.statusState.set('ready');
    } catch {
      this.statusState.set('error');
    }
  }

  async save(): Promise<void> {
    const settings = structuredClone(this.draft());
    this.savingState.set(true);
    this.savedState.set(false);
    this.saveErrorState.set(false);
    try {
      await this.repository.save(settings);
      this.stored.set(settings);
      this.savedState.set(true);
    } catch {
      this.saveErrorState.set(true);
    } finally {
      this.savingState.set(false);
    }
  }

  cancel(): void {
    this.draft.set(structuredClone(this.stored()));
    this.savedState.set(false);
  }

  dismissSaveError(): void {
    this.saveErrorState.set(false);
  }
}
