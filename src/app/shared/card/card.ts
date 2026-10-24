import {
  booleanAttribute,
  Component,
  contentChild,
  Directive,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';
import { Tint } from '../types/ui';

@Directive({ selector: '[cardActions]' })
export class CardActions {}

@Component({
  selector: 'app-card, button[app-card]',
  templateUrl: './card.html',
  host: {
    class: 'card',
    '[class.u-tint]': '!!tint()',
    '[attr.data-variant]': "variant() === 'elevated' ? 'elevated' : null",
    '[attr.data-tint]': 'tint() ?? null',
    '[attr.data-interactive]': "interactive ? '' : null",
    '[attr.type]': "interactive ? 'button' : null",
    '[attr.data-selected]': "selected() ? '' : null",
    '[attr.aria-current]': "selected() ? 'true' : null",
    '[attr.data-disabled]': "disabled() ? '' : null",
    '[attr.disabled]': "interactive && disabled() ? '' : null",
    '[attr.aria-disabled]': "!interactive && disabled() ? 'true' : null",
    '[attr.data-force]': 'state() ?? null',
    '(click)': 'onClick($event)',
  },
})
export class Card {
  readonly heading = input<string>();
  readonly variant = input<'default' | 'elevated'>('default');
  readonly tint = input<Tint>();
  readonly selected = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly state = input<'hover' | 'active' | 'focus'>();

  readonly clicked = output<MouseEvent>();

  protected readonly interactive =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';
  protected readonly actions = contentChild(CardActions);

  protected onClick(event: MouseEvent): void {
    if (this.interactive && !this.disabled()) this.clicked.emit(event);
  }
}
