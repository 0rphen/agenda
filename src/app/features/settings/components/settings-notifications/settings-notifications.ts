import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { Alert, AlertAction } from '@shared/components/alert/alert';
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { SelectField } from '@shared/components/select/select';
import { SettingRow, SettingRowControl } from '@shared/components/setting-row/setting-row';
import { Switch } from '@shared/components/switch/switch';
import { REMINDERS } from '../../domain/settings-options';
import { UserSettings } from '../../domain/settings.model';

@Component({
  selector: 'app-settings-notifications',
  imports: [
    Alert,
    AlertAction,
    Button,
    Card,
    FormField,
    SelectField,
    SettingRow,
    SettingRowControl,
    Switch,
  ],
  templateUrl: './settings-notifications.html',
  host: { class: 'l-stack', 'data-gap': 'm' },
})
export class SettingsNotifications {
  readonly fields = input.required<FieldTree<UserSettings['notifications']>>();

  protected readonly reminders = REMINDERS;
}
