import { booleanAttribute, Component, contentChild, Directive, input, output } from '@angular/core';
import { AvatarGroup } from '@shared/components/avatar/avatar-group';
import { Icon } from '@shared/components/icon/icon';
import { Tint } from '@shared/types';
import { AvatarPerson } from '@shared/interfaces';

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
