import { Pipe, PipeTransform, inject } from '@angular/core';
import { formatTime } from '@shared/utils';
import { UserSettingsStore } from './store/user-settings.store';

/** `HH:mm` in the saved «Formato de hora»; impure so it follows the store without new args. */
@Pipe({ name: 'timeFormat', pure: false })
export class TimeFormatPipe implements PipeTransform {
  private readonly format = inject(UserSettingsStore).timeFormat;

  transform(hhmm: string | undefined): string | undefined {
    return hhmm && formatTime(hhmm, this.format());
  }
}
