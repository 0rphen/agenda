import { Component, computed, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
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
}
