import { Component, computed, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { Icon } from '../icon/icon';

export interface SelectOption {
  value: string;
  label: string;
}

let nextId = 0;

@Component({
  selector: 'app-select',
  imports: [Icon],
  templateUrl: './select.html',
  host: {
    class: 'field',
    // the id belongs to the control; a static id on <app-select> would duplicate it
    '[attr.id]': 'null',
    '[attr.data-invalid]': "error() ? '' : null",
  },
})
export class SelectField implements FormValueControl<string> {
  readonly value = model('');
  readonly touched = model(false);

  readonly label = input.required<string>();
  readonly id = input(`app-select-${nextId++}`);
  readonly name = input('');
  readonly options = input.required<SelectOption[]>();
  readonly icon = input<string>();
  readonly hint = input<string>();
  readonly error = input<string>();
  readonly disabled = input(false);

  protected readonly hintId = computed(() =>
    this.hint() || this.error() ? `${this.id()}-hint` : null,
  );
}
