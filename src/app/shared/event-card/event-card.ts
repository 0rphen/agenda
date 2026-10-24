import { booleanAttribute, Component, contentChild, Directive, input, output } from '@angular/core';
import { AvatarGroup, AvatarPerson } from '../avatar/avatar-group';
import { Icon } from '../icon/icon';
import { Tint } from '../types/ui';

@Directive({ selector: '[eventCardStatus]' })
export class EventCardStatus {}

@Directive({ selector: '[eventCardBadge]' })
export class EventCardBadge {}

@Component({
  selector: 'app-event-card',
  imports: [AvatarGroup, Icon],
  templateUrl: './event-card.html',
})
export class EventCard {
  readonly time = input.required<string>();
  readonly heading = input.required<string>();
  readonly tint = input<Tint>('periwinkle');
  readonly location = input<string>();
  readonly people = input<AvatarPerson[]>([]);
  readonly selected = input(false, { transform: booleanAttribute });
  readonly cancelled = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly clicked = output<MouseEvent>();

  protected readonly badge = contentChild(EventCardBadge);
}
