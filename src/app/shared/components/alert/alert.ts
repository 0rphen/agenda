import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  Directive,
  input,
  output,
} from '@angular/core';
import { Icon } from '@shared/components/icon/icon';
import { IconButton } from '@shared/components/icon-button/icon-button';
import { AlertTone, Tone } from '@shared/types';
import { ALERT_ICONS } from '@shared/utils';

@Directive({ selector: '[alertAction]' })
export class AlertAction {}

@Component({
  selector: 'app-alert',
  imports: [Icon, IconButton],
  templateUrl: './alert.html',
  host: {
    class: 'alert',
    '[attr.data-tone]': "tone() === 'info' ? null : tone()",
    '[attr.role]': "tone() === 'danger' ? 'alert' : 'status'",
  },
})
export class Alert {
  readonly tone = input<AlertTone>('info');
  readonly heading = input<string>();
  readonly icon = input<string>();
  readonly dismissible = input(false, { transform: booleanAttribute });

  readonly closed = output<void>();

  protected readonly action = contentChild(AlertAction);
  protected readonly iconName = computed(() => this.icon() ?? ALERT_ICONS[this.tone()]);
}
