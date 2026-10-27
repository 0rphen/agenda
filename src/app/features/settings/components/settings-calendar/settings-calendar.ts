import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { Card } from '@shared/components/card/card';
import { SegmentedControl } from '@shared/components/segmented-control/segmented-control';
import { SelectField } from '@shared/components/select/select';
import { SettingRow, SettingRowControl } from '@shared/components/setting-row/setting-row';
import { Switch } from '@shared/components/switch/switch';
import { TimeField } from '@shared/components/time-field/time-field';
import { DEFAULT_VIEWS, DURATIONS, TIME_FORMATS, WEEK_STARTS } from '../../domain/settings-options';
import { UserSettings } from '../../domain/settings.model';

@Component({
  selector: 'app-settings-calendar',
  imports: [
    Card,
    FormField,
    SegmentedControl,
    SelectField,
    SettingRow,
    SettingRowControl,
    Switch,
    TimeField,
  ],
  templateUrl: './settings-calendar.html',
  host: { class: 'l-stack', 'data-gap': 'm' },
})
export class SettingsCalendar {
  readonly fields = input.required<FieldTree<UserSettings['calendar']>>();

  protected readonly views = DEFAULT_VIEWS;
  protected readonly weekStarts = WEEK_STARTS;
  protected readonly timeFormats = TIME_FORMATS;
  protected readonly durations = DURATIONS;
}
