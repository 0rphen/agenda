import { booleanAttribute, Component, computed, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { Icon } from '@shared/components/icon/icon';

let nextId = 0;

@Component({
  selector: 'app-time-field',
  imports: [Icon],
  templateUrl: './time-field.html',
  host: {
    class: 'field',
    // the id belongs to the control; a static id on <app-time-field> would duplicate it
    '[attr.id]': 'null',
    '[attr.data-invalid]': "error() ? '' : null",
  },
})
export class TimeField implements FormValueControl<string> {
  /** HH:mm (24 h) */
  readonly value = model('');
  readonly touched = model(false);

  readonly label = input.required<string>();
  readonly id = input(`app-time-field-${nextId++}`);
  readonly name = input('');
  readonly minTime = input<string>();
  readonly maxTime = input<string>();
  /** seconds */
  readonly step = input<number>();
  readonly icon = input<string>();
  readonly hint = input<string>();
  readonly error = input<string>();
  readonly disabled = input(false);
  readonly ariaLabel = input<string>();
  readonly hideLabel = input(false, { transform: booleanAttribute });

  protected readonly hintId = computed(() =>
    this.hint() || this.error() ? `${this.id()}-hint` : null,
  );
}
