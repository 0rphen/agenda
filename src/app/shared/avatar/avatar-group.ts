import { Component, computed, input } from '@angular/core';
import { Avatar, AvatarSize } from './avatar';

export interface AvatarPerson {
  name: string;
  src?: string;
}

@Component({
  selector: 'app-avatar-group',
  imports: [Avatar],
  templateUrl: './avatar-group.html',
  host: {
    class: 'avatar-group',
    '[attr.data-on-tint]': "onTint() ? '' : null",
  },
})
export class AvatarGroup {
  readonly people = input.required<AvatarPerson[]>();
  readonly max = input(3);
  readonly size = input<AvatarSize>('s');
  readonly onTint = input(false);

  protected readonly shown = computed(() => this.people().slice(0, this.max()));
  protected readonly extra = computed(() => this.people().length - this.shown().length);
}
