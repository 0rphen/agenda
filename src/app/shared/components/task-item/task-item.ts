import { booleanAttribute, Component, input, model, output } from '@angular/core';
import { Checkbox } from '@shared/components/checkbox/checkbox';
import { Icon } from '@shared/components/icon/icon';
import { Category, TaskItemAction } from '@shared/types';

@Component({
  selector: 'app-task-item',
  imports: [Checkbox, Icon],
  templateUrl: './task-item.html',
  host: {
    class: 'task-item',
    '[attr.title]': 'null',
    '[attr.data-done]': "done() ? '' : null",
    '[attr.data-disabled]': "disabled() ? '' : null",
    '[attr.data-interactive]': "disabled() || action() === 'remove' ? null : ''",
    '[attr.data-selected]': "selected() ? '' : null",
    '[attr.data-overdue]': "overdue() ? '' : null",
    '(click)': 'onRowClick($event)',
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
  readonly selected = input(false, { transform: booleanAttribute });
  readonly overdue = input(false, { transform: booleanAttribute });
  readonly action = input<TaskItemAction>('open');

  readonly opened = output<void>();
  readonly removed = output<void>();

  protected onRowClick(event: MouseEvent): void {
    // el checkbox completa o reabre la tarea, nunca abre el detalle
    if (
      this.disabled() ||
      this.action() === 'remove' ||
      (event.target as Element).closest('.check')
    )
      return;
    this.opened.emit();
  }

  protected onAction(): void {
    if (this.action() === 'remove') this.removed.emit();
    else this.opened.emit();
  }
}
