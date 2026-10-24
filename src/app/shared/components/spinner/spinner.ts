import { Component, input } from '@angular/core';
import { Size } from '@shared/types';

@Component({
  selector: 'app-spinner',
  template: '',
  host: {
    class: 'spinner',
    role: 'status',
    '[attr.data-size]': "size() === 'm' ? null : size()",
    '[attr.aria-label]': 'label()',
  },
})
export class Spinner {
  readonly size = input<Exclude<Size, 'xl'>>('m');
  readonly label = input('Cargando');
}
