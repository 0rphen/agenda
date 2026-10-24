import { booleanAttribute, Component, computed, input, model } from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';
import { Icon } from '@shared/components/icon/icon';

let nextId = 0;

@Component({
  selector: 'app-switch',
  imports: [Icon],
  templateUrl: './switch.html',
  host: {
    class: 'field',
    // the id belongs to the input; a static id on <app-switch> would duplicate it
    '[attr.id]': 'null',
    '[attr.data-invalid]': "error() ? '' : null",
  },
})
export class Switch implements FormCheckboxControl {
  readonly checked = model(false);
  readonly touched = model(false);

  readonly label = input<string>();
  readonly ariaLabel = input<string>();
  readonly id = input(`app-switch-${nextId++}`);
  readonly name = input('');
  readonly hint = input<string>();
  readonly error = input<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });

  protected readonly hintId = computed(() =>
    this.hint() || this.error() ? `${this.id()}-hint` : null,
  );
}
