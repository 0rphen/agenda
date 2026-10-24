import { booleanAttribute, Component, input, model } from '@angular/core';
import { Checkbox } from '../checkbox/checkbox';
import { Icon } from '../icon/icon';
import { Category } from '../types/ui';

@Component({
  selector: 'app-task-item',
  imports: [Checkbox, Icon],
  templateUrl: './task-item.html',
  host: {
    class: 'task-item',
    '[attr.title]': 'null',
    '[attr.data-done]': "done() ? '' : null",
    '[attr.data-disabled]': "disabled() ? '' : null",
  },
})
export class TaskItem {
  readonly heading = input.required<string>();
  readonly done = model(false);
  readonly due = input<string>();
  readonly subtasks = input<number>();
  readonly list = input<string>();
  readonly listColor = input<Category>('blue');
  readonly disabled = input(false, { transform: booleanAttribute });
}
