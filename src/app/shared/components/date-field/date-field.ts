import { Component, computed, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { Icon } from '@shared/components/icon/icon';

let nextId = 0;

@Component({
  selector: 'app-date-field',
  imports: [Icon],
  templateUrl: './date-field.html',
  host: {
    class: 'field',
    // the id belongs to the control; a static id on <app-date-field> would duplicate it
    '[attr.id]': 'null',
    '[attr.data-invalid]': "error() ? '' : null",
  },
})
export class DateField implements FormValueControl<string> {
  /** YYYY-MM-DD */
  readonly value = model('');
  readonly touched = model(false);

  readonly label = input.required<string>();
  readonly id = input(`app-date-field-${nextId++}`);
  readonly name = input('');
  readonly minDate = input<string>();
  readonly maxDate = input<string>();
  readonly icon = input<string>();
  readonly hint = input<string>();
  readonly error = input<string>();
  readonly disabled = input(false);

  protected readonly hintId = computed(() =>
    this.hint() || this.error() ? `${this.id()}-hint` : null,
  );
}
