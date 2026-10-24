import { Component, computed, input } from '@angular/core';
import { Size } from '@shared/types';
import { Avatar } from './avatar';
import { AvatarPerson } from '@shared/interfaces';

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
  readonly size = input<Size>('s');
  readonly onTint = input(false);

  protected readonly shown = computed(() => this.people().slice(0, this.max()));
  protected readonly extra = computed(() => this.people().length - this.shown().length);
}
