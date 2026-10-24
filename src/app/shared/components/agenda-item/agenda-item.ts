import { booleanAttribute, Component, input, output } from '@angular/core';
import { Category } from '@shared/types';

@Component({
  selector: 'app-agenda-item',
  templateUrl: './agenda-item.html',
})
export class AgendaItem {
  readonly start = input.required<string>();
  readonly end = input<string>();
  readonly heading = input.required<string>();
  readonly category = input<Category>();
  readonly categoryLabel = input<string>();
  readonly selected = input(false, { transform: booleanAttribute });
  readonly cancelled = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly clicked = output<MouseEvent>();
}
