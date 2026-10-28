import { Component, computed, input, output } from '@angular/core';
import { Alert } from '@shared/components/alert/alert';
import { Card } from '@shared/components/card/card';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { Progress } from '@shared/components/progress/progress';
import { SkeletonList } from '@shared/components/skeleton/skeleton-list';
import { TaskForm } from '@shared/components/task-form/task-form';
import { TaskFormValue } from '@shared/interfaces';
import { taskToForm } from '../../../agenda/agenda-forms';
import { AgendaStatus } from '../../../agenda/domain/agenda-view.model';
import { Task } from '../../../agenda/domain/task.model';
import { TasksProgress } from '../../domain/tasks-view.model';

@Component({
  selector: 'app-tasks-side',
  imports: [Alert, Card, EmptyState, Progress, SkeletonList, TaskForm],
  templateUrl: './tasks-side.html',
  host: { class: 'l-shell__panel panel l-stack', 'data-variant': 'side', 'data-gap': 'm' },
})
export class TasksSide {
  readonly status = input.required<AgendaStatus>();
  readonly progress = input<TasksProgress>({ done: 0, total: 0, value: 0 });
  readonly task = input<Task>();
  readonly detailError = input(false);

  readonly saved = output<TaskFormValue>();
  readonly deleted = output<string>();
  readonly cancelled = output<void>();

  // Stable reference: a new object on every check would reset what the user typed.
  protected readonly taskDefaults = computed(() => {
    const task = this.task();
    return task ? taskToForm(task) : {};
  });
}
