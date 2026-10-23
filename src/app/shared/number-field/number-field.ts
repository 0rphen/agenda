import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  input,
  model,
  viewChild,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { Icon } from '../icon/icon';

let nextId = 0;

@Component({
  selector: 'app-number-field',
  imports: [Icon],
  templateUrl: './number-field.html',
  host: {
    class: 'field',
    // the id belongs to the control; a static id on <app-number-field> would duplicate it
    '[attr.id]': 'null',
    '[attr.data-invalid]': "error() ? '' : null",
  },
})
export class NumberField implements FormValueControl<number | null> {
  readonly value = model<number | null>(null);
  readonly touched = model(false);

  readonly label = input.required<string>();
  readonly id = input(`app-number-field-${nextId++}`);
  readonly name = input('');
  readonly placeholder = input<string>();
  readonly icon = input<string>();
  readonly min = input<number>();
  readonly max = input<number>();
  readonly step = input<number>();
  readonly hint = input<string>();
  readonly error = input<string>();
  readonly disabled = input(false);

  protected readonly hintId = computed(() =>
    this.hint() || this.error() ? `${this.id()}-hint` : null,
  );

  private readonly control = viewChild.required<ElementRef<HTMLInputElement>>('control');

  constructor() {
    // write only on mismatch: a [value] binding would wipe intermediate text like "1e"
    afterRenderEffect(() => {
      const value = this.value();
      const control = this.control().nativeElement;
      const current = control.valueAsNumber; // NaN when empty or not a number
      if (value === null ? Number.isNaN(current) : current === value) return;
      control.value = value === null ? '' : String(value);
    });
  }

  protected onInput(control: HTMLInputElement): void {
    const value = control.valueAsNumber;
    this.value.set(Number.isNaN(value) ? null : value);
  }
}
