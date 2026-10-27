import { Component, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Alert, AlertAction } from '@shared/components/alert/alert';
import { Badge } from '@shared/components/badge/badge';
import { Breadcrumb } from '@shared/components/breadcrumb/breadcrumb';
import { Button } from '@shared/components/button/button';
import { Card, CardActions } from '@shared/components/card/card';
import { EmptyState, EmptyStateAction } from '@shared/components/empty-state/empty-state';
import { Progress } from '@shared/components/progress/progress';
import { SegmentedControl } from '@shared/components/segmented-control/segmented-control';
import { SkeletonList } from '@shared/components/skeleton/skeleton-list';
import { TaskItem } from '@shared/components/task-item/task-item';
import { TextField } from '@shared/components/text-field/text-field';
import { SegmentedOption } from '@shared/interfaces';
import { BreadcrumbItem } from '@shared/types';
import { plural, SHORT_DAY } from '@shared/utils';
import { AgendaStatus } from '../../../agenda/domain/agenda-view.model';
import { TaskFilter, TaskGroup, TasksProgress } from '../../domain/tasks-view.model';

@Component({
  selector: 'app-tasks-main',
  imports: [
    Alert,
    AlertAction,
    Badge,
    Breadcrumb,
    Button,
    Card,
    CardActions,
    EmptyState,
    EmptyStateAction,
    SegmentedControl,
    SkeletonList,
    TaskItem,
    TextField,
    NgTemplateOutlet,
    Progress,
  ],
  templateUrl: './tasks-main.html',
  host: { class: 'l-shell__main l-screen__main panel l-stack', 'data-gap': 'm' },
})
export class TasksMain {
  readonly status = input.required<AgendaStatus>();
  readonly filter = input<TaskFilter>('todas');
  readonly groups = input<TaskGroup[]>([]);
  readonly pendingCount = input(0);
  readonly dueTodayCount = input(0);
  readonly saveError = input(false);
  readonly selectedTaskId = input<string>();
  /** Mobile «Progreso» Card, the same as the side panel. */
  readonly progress = input<TasksProgress>({ done: 0, total: 0, value: 0 });

  readonly filterChanged = output<TaskFilter>();
  readonly added = output<string>();
  readonly toggled = output<{ id: string; done: boolean }>();
  readonly taskOpened = output<string>();
  readonly saveErrorDismissed = output<void>();
  readonly retry = output<void>();

  protected readonly draft = signal('');

  protected readonly crumbs: BreadcrumbItem[] = [
    { label: 'Inicio', icon: 'home', link: '/inicio' },
    { label: 'Tareas' },
  ];
  protected readonly filterOptions: SegmentedOption[] = [
    { value: 'todas', label: 'Todas' },
    { value: 'hoy', label: 'Hoy' },
    { value: 'pendientes', label: 'Pendientes' },
    { value: 'hechas', label: 'Hechas' },
  ];

  protected onFilter(value: string): void {
    this.filterChanged.emit(value as TaskFilter);
  }

  protected add(event: Event): void {
    event.preventDefault();
    if (!this.draft().trim()) return;
    this.added.emit(this.draft());
    this.draft.set('');
  }

  protected readonly plural = plural;

  protected shortDay(day: string): string {
    return SHORT_DAY.format(new Date(`${day}T00:00:00Z`));
  }
}
