import { Component, input } from '@angular/core';
import { SkeletonShape } from '@shared/types';

@Component({
  selector: 'app-skeleton',
  template: '',
  host: {
    class: 'skeleton',
    'aria-hidden': 'true',
    '[style.--w]': 'width()',
    '[style.--h]': 'height()',
    '[attr.data-shape]': 'shape()',
  },
})
export class Skeleton {
  readonly width = input<string>();
  readonly height = input<string>();
  readonly shape = input<SkeletonShape>();
}
