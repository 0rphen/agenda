import { Component, input, output, signal } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { Alert } from '@shared/components/alert/alert';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { SettingRow, SettingRowControl } from '@shared/components/setting-row/setting-row';
import { Switch } from '@shared/components/switch/switch';
import { UserSettings } from '../../domain/settings.model';

@Component({
  selector: 'app-settings-security',
  imports: [Alert, Badge, Button, Card, FormField, SettingRow, SettingRowControl, Switch],
  templateUrl: './settings-security.html',
  host: { class: 'l-stack', 'data-gap': 'm' },
})
export class SettingsSecurity {
  readonly fields = input.required<FieldTree<UserSettings['security']>>();
  readonly exportClicked = output<void>();
  readonly deleteClicked = output<void>();

  /** Card showing the «No disponible» Alert. */
  protected readonly unavailable = signal<'password' | 'session' | undefined>(undefined);
}
