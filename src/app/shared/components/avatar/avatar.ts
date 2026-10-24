import { Component, computed, input, linkedSignal } from '@angular/core';
import { Size } from '@shared/types';
import { initials, tintFor } from '@shared/utils';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.html',
  host: {
    class: 'avatar u-tint',
    role: 'img',
    '[attr.aria-label]': 'name()',
    '[attr.data-tint]': 'tint()',
    '[attr.data-size]': "size() === 'm' ? null : size()",
  },
})
export class Avatar {
  readonly name = input.required<string>();
  readonly src = input<string>();
  readonly size = input<Size>('m');

  // Se reinicia a false en cada cambio de src para reintentar la imagen nueva.
  protected readonly failed = linkedSignal(() => {
    this.src();
    return false;
  });

  protected readonly initialsText = computed(() => initials(this.name()));
  protected readonly tint = computed(() => tintFor(this.name()));
}
