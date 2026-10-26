import { Component, computed, input, output } from '@angular/core';
import { Alert } from '@shared/components/alert/alert';
import { Badge } from '@shared/components/badge/badge';
import { Card } from '@shared/components/card/card';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { Progress } from '@shared/components/progress/progress';
import { SkeletonList } from '@shared/components/skeleton/skeleton-list';
import { TaskItem } from '@shared/components/task-item/task-item';
import { TextField } from '@shared/components/text-field/text-field';
import { SHORT_DAY } from '@shared/utils';
import { AgendaStatus, ListProgress } from '../../domain/home-view.model';
import { Task } from '../../domain/task.model';

@Component({
  selector: 'app-tasks-panel',
  imports: [Alert, Badge, Card, EmptyState, Progress, SkeletonList, TaskItem, TextField],
  templateUrl: './tasks-panel.html',
  host: { class: 'l-shell__tasks panel l-stack' },
})
export class TasksPanel {
  readonly status = input.required<AgendaStatus>();
  readonly today = input.required<string>();
  readonly selectedDay = input.required<string>();
  readonly tasks = input<Task[]>([]);
  readonly pendingCount = input(0);
  readonly progress = input<ListProgress[]>([]);
  readonly saveError = input(false);

  readonly toggled = output<{ id: string; done: boolean }>();
  readonly saveErrorDismissed = output<void>();

  protected readonly heading = computed(() =>
    this.selectedDay() === this.today() ? 'Hoy' : this.shortDay(this.selectedDay()),
  );

  protected isOverdue(task: Task): boolean {
    return !task.done && !!task.due && task.due < this.today();
  }

  protected shortDay(day: string): string {
    return SHORT_DAY.format(new Date(`${day}T00:00:00Z`));
  }
}
