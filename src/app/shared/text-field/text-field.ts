import { Component, computed, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { Icon } from '../icon/icon';

type TextFieldType = 'text' | 'search' | 'email' | 'tel';

let nextId = 0;

@Component({
  selector: 'app-text-field',
  imports: [Icon],
  templateUrl: './text-field.html',
  host: {
    class: 'field',
    // the id belongs to the control; a static id on <app-text-field> would duplicate it
    '[attr.id]': 'null',
    '[attr.data-invalid]': "error() ? '' : null",
  },
})
export class TextField implements FormValueControl<string> {
  readonly value = model('');
  readonly touched = model(false);

  readonly label = input.required<string>();
  readonly id = input(`app-text-field-${nextId++}`);
  readonly name = input('');
  readonly type = input<TextFieldType>('text');
  readonly placeholder = input<string>();
  readonly icon = input<string>();
  readonly hint = input<string>();
  readonly error = input<string>();
  readonly disabled = input(false);

  protected readonly hintId = computed(() =>
    this.hint() || this.error() ? `${this.id()}-hint` : null,
  );
}
