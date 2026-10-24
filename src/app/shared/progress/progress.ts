import { Component, computed, input } from '@angular/core';
import { Tone } from '../types/ui';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.html',
  host: {
    class: 'progress',
    '[attr.data-tone]': 'dataTone()',
  },
})
export class Progress {
  readonly value = input.required<number>();
  readonly heading = input<string>();
  readonly label = input<string>();
  readonly tone = input<Extract<Tone, 'brand' | 'success' | 'accent'>>();
  readonly showLabel = input(true);

  protected readonly pct = computed(() => {
    const v = this.value();
    return Number.isFinite(v) ? Math.round(Math.min(100, Math.max(0, v))) : 0;
  });

  // Sin tone explícito, al 100 % pasa a success; brand es el aspecto base y no expone atributo.
  protected readonly dataTone = computed(() => {
    const tone = this.tone() ?? (this.pct() === 100 ? 'success' : undefined);
    return tone === 'brand' ? null : (tone ?? null);
  });

  protected readonly name = computed(() => this.label() ?? this.heading() ?? 'Progreso');
}
