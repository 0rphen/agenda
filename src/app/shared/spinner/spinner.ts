import { Component, input } from '@angular/core';

type SpinnerSize = 's' | 'm' | 'l';

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
  readonly size = input<SpinnerSize>('m');
  readonly label = input('Cargando');
}
