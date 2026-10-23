import { Component, input } from '@angular/core';
import { Icon } from '../icon/icon';

type BadgeTone =
  'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'inverse' | 'glass' | 'count';
type BadgeCategory = 'orange' | 'violet' | 'red' | 'blue' | 'green' | 'mustard' | 'cyan';

@Component({
  selector: 'app-badge',
  imports: [Icon],
  templateUrl: './badge.html',
  host: {
    class: 'badge',
    '[class.u-category]': '!!category()',
    '[attr.data-tone]': "tone() === 'neutral' ? null : tone()",
    '[attr.data-category]': 'category() || null',
    '[attr.aria-label]': 'label() || null',
  },
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');
  readonly icon = input<string>();
  readonly dot = input(false);
  readonly category = input<BadgeCategory>();
  readonly label = input<string>();
}
