import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  Directive,
  input,
  output,
} from '@angular/core';
import { Icon } from '../icon/icon';
import { IconButton } from '../icon-button/icon-button';
import { Tone } from '../types/ui';

export type AlertTone = Extract<Tone, 'info' | 'success' | 'warning' | 'danger'>;

const ICONS: Record<AlertTone, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning_amber',
  danger: 'error_outline',
};

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
  protected readonly iconName = computed(() => this.icon() ?? ICONS[this.tone()]);
}
