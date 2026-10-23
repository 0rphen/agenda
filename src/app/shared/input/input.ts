import { Component, computed, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { Icon } from '../icon/icon';

type InputType = 'text' | 'search' | 'date' | 'time';

export interface InputOption {
  value: string;
  label: string;
}

let nextId = 0;

@Component({
  selector: 'app-input',
  imports: [Icon],
  templateUrl: './input.html',
  host: {
    class: 'field',
    // the id belongs to the control; a static id on <app-input> would duplicate it
    '[attr.id]': 'null',
    '[attr.data-invalid]': "error() ? '' : null",
  },
})
export class InputField implements FormValueControl<string> {
  readonly value = model('');
  readonly touched = model(false);

  readonly label = input.required<string>();
  readonly id = input(`app-input-${nextId++}`);
  readonly name = input('');
  readonly type = input<InputType>('text');
  readonly placeholder = input<string>();
  readonly icon = input<string>();
  readonly options = input<InputOption[]>();
  readonly multiline = input(false);
  readonly rows = input(3);
  readonly hint = input<string>();
  readonly error = input<string>();
  readonly disabled = input(false);

  protected readonly hintId = computed(() =>
    this.hint() || this.error() ? `${this.id()}-hint` : null,
  );
}
