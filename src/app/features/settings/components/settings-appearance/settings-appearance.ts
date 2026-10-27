import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { Card } from '@shared/components/card/card';
import { SegmentedControl } from '@shared/components/segmented-control/segmented-control';
import { SettingRow, SettingRowControl } from '@shared/components/setting-row/setting-row';
import { Switch } from '@shared/components/switch/switch';
import { DENSITIES, TEXT_SIZES } from '../../domain/settings-options';
import { UserSettings } from '../../domain/settings.model';

@Component({
  selector: 'app-settings-appearance',
  imports: [Card, FormField, SegmentedControl, SettingRow, SettingRowControl, Switch],
  templateUrl: './settings-appearance.html',
  host: { class: 'l-stack', 'data-gap': 'm' },
})
export class SettingsAppearance {
  readonly fields = input.required<FieldTree<UserSettings['appearance']>>();

  protected readonly densities = DENSITIES;
  protected readonly textSizes = TEXT_SIZES;
}
