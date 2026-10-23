import { Component, computed, input } from '@angular/core';
import { Skeleton } from './skeleton';

export type SkeletonListVariant = 'agenda' | 'task' | 'card';

@Component({
  selector: 'app-skeleton-list',
  imports: [Skeleton],
  templateUrl: './skeleton-list.html',
  host: {
    class: 'skeleton-list',
    role: 'status',
    'aria-busy': 'true',
    '[attr.data-variant]': 'variant()',
    '[attr.aria-label]': "label() ?? 'Cargando'",
  },
})
export class SkeletonList {
  readonly variant = input<SkeletonListVariant>('agenda');
  readonly rows = input(4);
  readonly label = input<string>();

  // Entero ≥ 1; negativos o NaN darían una lista vacía con role="status".
  protected readonly count = computed(() => {
    const n = Math.floor(this.rows());
    return Number.isFinite(n) && n >= 1 ? n : 4;
  });

  protected readonly indexes = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
