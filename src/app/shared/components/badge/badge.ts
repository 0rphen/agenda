import { Component, input } from '@angular/core';
import { Icon } from '@shared/components/icon/icon';
import { Category, Tone } from '@shared/types';

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
  readonly tone = input<Exclude<Tone, 'accent'>>('neutral');
  readonly icon = input<string>();
  readonly dot = input(false);
  readonly category = input<Category>();
  readonly label = input<string>();
}
