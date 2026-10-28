import { Component, computed, input, signal } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { Alert } from '@shared/components/alert/alert';
import { Avatar } from '@shared/components/avatar/avatar';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { SelectField } from '@shared/components/select/select';
import { SettingRow, SettingRowControl } from '@shared/components/setting-row/setting-row';
import { TextField } from '@shared/components/text-field/text-field';
import { LANGUAGES, SETTINGS_EMAIL, TIME_ZONES } from '../../domain/settings-options';
import { UserSettings } from '../../domain/settings.model';

@Component({
  selector: 'app-settings-profile',
  imports: [
    Alert,
    Avatar,
    Badge,
    Button,
    Card,
    FormField,
    SelectField,
    SettingRow,
    SettingRowControl,
    TextField,
  ],
  templateUrl: './settings-profile.html',
  host: { class: 'l-stack', 'data-gap': 'm' },
})
export class SettingsProfile {
  readonly fields = input.required<FieldTree<UserSettings['profile']>>();

  protected readonly email = SETTINGS_EMAIL;
  protected readonly timeZones = TIME_ZONES;
  protected readonly languages = LANGUAGES;
  protected readonly name = computed(() =>
    `${this.fields().firstName().value()} ${this.fields().lastName().value()}`.trim(),
  );
  protected readonly photo = computed(() => this.fields().photo().value());
  protected readonly photoError = signal(false);

  protected pick(input: HTMLInputElement): void {
    const file = input.files?.[0];
    // same file picked twice must fire change again
    input.value = '';
    if (!file) return;
    const valid = ['image/png', 'image/jpeg'].includes(file.type) && file.size <= 2 * 1024 * 1024;
    this.photoError.set(!valid);
    if (!valid) return;
    const photo = this.fields().photo();
    const reader = new FileReader();
    reader.onload = () => photo.value.set(reader.result as string);
    reader.readAsDataURL(file);
  }
}
