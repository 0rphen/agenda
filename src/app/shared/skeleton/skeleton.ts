import { Component, input } from '@angular/core';

export type SkeletonShape = 'circle' | 'block';

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
