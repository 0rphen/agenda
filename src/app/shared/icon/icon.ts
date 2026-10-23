import { Component, input } from '@angular/core';
import { Size } from '../types/ui';

@Component({
  selector: 'app-icon',
  template: '{{ name() }}',
  host: {
    class: 'icon',
    '[attr.data-size]': "size() === 'm' ? null : size()",
    '[attr.data-filled]': "filled() ? '' : null",
    '[attr.role]': "label() ? 'img' : null",
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': "label() ? null : 'true'",
  },
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input<Size>('m');
  readonly filled = input(false);
  readonly label = input<string>();
}
