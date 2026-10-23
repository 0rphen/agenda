import { booleanAttribute, Component, input } from '@angular/core';
import { ButtonVariant } from '../button/button';
import { Icon } from '../icon/icon';
import { Size } from '../types/ui';

@Component({
  selector: 'a[app-button-link]',
  imports: [Icon],
  templateUrl: './button-link.html',
  host: {
    class: 'button',
    '[attr.data-variant]': "variant() === 'primary' ? null : variant()",
    '[attr.data-size]': "size() === 'm' ? null : size()",
    '[attr.data-block]': "block() ? '' : null",
  },
})
export class ButtonLink {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<Exclude<Size, 'xl'>>('m');
  readonly icon = input<string>();
  readonly iconEnd = input<string>();
  readonly block = input(false, { transform: booleanAttribute });
}
