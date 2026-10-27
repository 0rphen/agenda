import { Component, input, output } from '@angular/core';
import { Alert } from '@shared/components/alert/alert';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { MiniCalendar } from '@shared/components/mini-calendar/mini-calendar';
import { SkeletonList } from '@shared/components/skeleton/skeleton-list';
import { TaskItem } from '@shared/components/task-item/task-item';
import { AgendaStatus } from '../../../agenda/domain/agenda-view.model';
import { Task } from '../../../agenda/domain/task.model';

@Component({
  selector: 'app-day-side',
  imports: [Alert, Badge, Button, EmptyState, MiniCalendar, SkeletonList, TaskItem],
  templateUrl: './day-side.html',
  host: { class: 'l-shell__panel panel l-stack', 'data-variant': 'side', 'data-gap': 'm' },
})
export class DaySide {
  readonly status = input.required<AgendaStatus>();
  readonly today = input.required<string>();
  readonly day = input.required<string>();
  readonly eventDays = input<string[]>([]);
  readonly tasks = input<Task[]>([]);
  readonly pendingCount = input(0);
  readonly saveError = input(false);
  readonly selectedTaskId = input<string>();

  readonly daySelected = output<string>();
  readonly toggled = output<{ id: string; done: boolean }>();
  readonly saveErrorDismissed = output<void>();
  readonly taskOpened = output<string>();
  readonly newEvent = output<void>();

  protected onDay(iso: string | undefined): void {
    if (iso) this.daySelected.emit(iso);
  }
}
