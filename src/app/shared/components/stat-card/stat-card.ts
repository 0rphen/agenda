import { Component, ElementRef, inject, input, output } from '@angular/core';
import { Icon } from '@shared/components/icon/icon';
import { StatCardTone } from '@shared/types';

@Component({
  selector: 'app-stat-card, button[app-stat-card]',
  imports: [Icon],
  templateUrl: './stat-card.html',
  host: {
    class: 'stat-card',
    '[attr.data-tone]': "tone() === 'brand' ? null : tone()",
    '[attr.data-interactive]': "interactive ? '' : null",
    '[attr.type]': "interactive ? 'button' : null",
    '(click)': 'onClick($event)',
  },
})
export class StatCard {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string>();
  readonly tone = input<StatCardTone>('brand');

  readonly clicked = output<MouseEvent>();

  protected readonly interactive =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';

  protected onClick(event: MouseEvent): void {
    if (this.interactive) this.clicked.emit(event);
  }
}
