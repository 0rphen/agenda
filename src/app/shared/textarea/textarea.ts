import { Component, computed, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { Icon } from '../icon/icon';

let nextId = 0;

@Component({
  selector: 'app-textarea',
  imports: [Icon],
  templateUrl: './textarea.html',
  host: {
    class: 'field',
    // the id belongs to the control; a static id on <app-textarea> would duplicate it
    '[attr.id]': 'null',
    '[attr.data-invalid]': "error() ? '' : null",
  },
})
export class TextareaField implements FormValueControl<string> {
  readonly value = model('');
  readonly touched = model(false);

  readonly label = input.required<string>();
  readonly id = input(`app-textarea-${nextId++}`);
  readonly name = input('');
  readonly rows = input(3);
  readonly placeholder = input<string>();
  readonly hint = input<string>();
  readonly error = input<string>();
  readonly disabled = input(false);

  protected readonly hintId = computed(() =>
    this.hint() || this.error() ? `${this.id()}-hint` : null,
  );
}
