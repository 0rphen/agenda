import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import { form, validate } from '@angular/forms/signals';
import { localIso, toMin } from '@shared/utils';
import { LocalStorageApi } from '../agenda/structure/local-storage-api';
import { SETTINGS_DEFAULTS } from './domain/settings-options';
import { SettingsRepository } from './domain/settings-repository';
import { NotificationStatus, SettingsStatus, UserSettings } from './domain/settings.model';
import { UserSettingsStore } from './store/user-settings.store';

@Injectable()
export class SettingsFacade {
  private readonly repository = inject(SettingsRepository);
  private readonly userSettings = inject(UserSettingsStore);
  private readonly api = inject(LocalStorageApi);
  private readonly document = inject(DOCUMENT);

  private readonly statusState = signal<SettingsStatus>('idle');
  private readonly stored = signal<UserSettings>(SETTINGS_DEFAULTS);
  private readonly savingState = signal(false);
  private readonly savedState = signal(false);
  private readonly saveErrorState = signal(false);
  private readonly exportErrorState = signal(false);
  private readonly permissionState = signal<NotificationStatus | undefined>(undefined);

  readonly status = this.statusState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly saved = this.savedState.asReadonly();
  readonly saveError = this.saveErrorState.asReadonly();
  readonly exportError = this.exportErrorState.asReadonly();
  /** `undefined` on the server and until `readNotificationPermission()` runs in the browser. */
  readonly notificationPermission = this.permissionState.asReadonly();

  // un único draft para todas las secciones: cambiar de sección no descarta nada
  readonly draft = signal<UserSettings>(structuredClone(SETTINGS_DEFAULTS));
  readonly form = form(this.draft, (path) => {
    validate(path.calendar.workEnd, ({ value, valueOf }) => {
      const start = valueOf(path.calendar.workStart);
      return start && value() && toMin(value()) <= toMin(start)
        ? { kind: 'endBeforeStart', message: 'La hora de fin debe ser posterior al inicio' }
        : null;
    });
  });

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

  /** Does nothing while the draft is invalid: the field shows the error. */
  async save(): Promise<void> {
    if (!this.form().valid()) return;
    const settings = structuredClone(this.draft());
    this.savingState.set(true);
    this.savedState.set(false);
    this.saveErrorState.set(false);
    try {
      await this.repository.save(settings);
      this.stored.set(settings);
      this.userSettings.set(settings);
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

  /** Downloads citas, tareas y ajustes as `agenda-export-AAAA-MM-DD.json`. */
  async exportData(): Promise<void> {
    this.exportErrorState.set(false);
    try {
      const now = new Date();
      const data = {
        events: await this.api.get('/events'),
        tasks: await this.api.get('/tasks'),
        settings: await this.repository.load(),
        exportedAt: now.toISOString(),
      };
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      );
      const link = this.document.createElement('a');
      link.href = url;
      link.download = `agenda-export-${localIso(now)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      this.exportErrorState.set(true);
    }
  }

  dismissExportError(): void {
    this.exportErrorState.set(false);
  }

  /** Clears every `agenda:*` key and reloads /inicio, which seeds the data again. */
  deleteAccount(): void {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith('agenda:'));
    keys.forEach((key) => localStorage.removeItem(key));
    // full reload: root stores still hold the deleted data in memory
    this.document.location.assign('/inicio');
  }

  /** Browser only (reads `Notification`). */
  readNotificationPermission(): void {
    this.permissionState.set(
      typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
    );
  }

  async requestNotifications(): Promise<void> {
    if (typeof Notification === 'undefined') {
      this.permissionState.set('unsupported');
      return;
    }
    this.permissionState.set(await Notification.requestPermission());
  }
}
