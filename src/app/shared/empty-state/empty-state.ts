import { Component, contentChildren, Directive, input } from '@angular/core';
import { Icon } from '../icon/icon';
import { Size } from '../types/ui';

@Directive({ selector: '[emptyStateAction]' })
export class EmptyStateAction {}

@Component({
  selector: 'app-empty-state',
  imports: [Icon],
  templateUrl: './empty-state.html',
  host: {
    class: 'empty-state',
    '[attr.data-size]': "size() === 's' ? 's' : null",
  },
})
export class EmptyState {
  readonly heading = input.required<string>();
  readonly description = input<string>();
  readonly icon = input<string>();
  readonly size = input<Extract<Size, 's' | 'm'>>('m');

  protected readonly actions = contentChildren(EmptyStateAction);
}
