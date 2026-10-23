import { Component, computed, input, linkedSignal } from '@angular/core';
import { Size } from '../types/ui';

const TINTS = ['periwinkle', 'cream', 'rose', 'mint', 'sky', 'lilac', 'lime'];

// Algoritmos portados del bundle del DS: el mismo nombre da las mismas iniciales y tinte.
export function initials(name: string): string {
  const parts = (name || '?').trim().split(/\s+/);
  return ((parts[0] || '?')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function tintFor(name: string): string {
  let n = 0;
  for (let i = 0; i < name.length; i++) n = (n + name.charCodeAt(i)) % 997;
  return TINTS[n % TINTS.length];
}

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
