import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AgendaItem } from '@shared/components/agenda-item/agenda-item';
import { Alert, AlertAction } from '@shared/components/alert/alert';
import { Badge } from '@shared/components/badge/badge';
import { Breadcrumb } from '@shared/components/breadcrumb/breadcrumb';
import { Button } from '@shared/components/button/button';
import { ButtonLink } from '@shared/components/button-link/button-link';
import { Card, CardActions } from '@shared/components/card/card';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { EventCard } from '@shared/components/event-card/event-card';
import { SkeletonList } from '@shared/components/skeleton/skeleton-list';
import { StatCard } from '@shared/components/stat-card/stat-card';
import { TaskItem } from '@shared/components/task-item/task-item';
import { BreadcrumbItem } from '@shared/types';
import { capitalize, LONG_DAY, SHORT_DAY } from '@shared/utils';
import { isOverdue } from '../../../agenda/agenda-queries';
import { AgendaStatus } from '../../../agenda/domain/agenda-view.model';
import { CalendarEvent } from '../../../agenda/domain/calendar-event.model';
import { Task } from '../../../agenda/domain/task.model';
import { OverviewStats } from '../../domain/overview-view.model';

@Component({
  selector: 'app-overview-main',
  imports: [
    AgendaItem,
    Alert,
    AlertAction,
    Badge,
    Breadcrumb,
    Button,
    ButtonLink,
    Card,
    CardActions,
    EmptyState,
    EventCard,
    RouterLink,
    SkeletonList,
    StatCard,
    TaskItem,
  ],
  templateUrl: './overview-main.html',
  host: { class: 'l-shell__main panel l-stack', 'data-gap': 'm' },
})
export class OverviewMain {
  readonly status = input.required<AgendaStatus>();
  readonly today = input.required<string>();
  readonly greeting = input.required<string>();
  readonly stats = input<OverviewStats>();
  readonly nextEvent = input<CalendarEvent>();
  readonly nextEventBadge = input<string>();
  readonly dueTasks = input<Task[]>([]);
  readonly todayEvents = input<CalendarEvent[]>([]);
  readonly saveError = input(false);
  readonly selectedTaskId = input<string>();

  readonly retry = output<void>();
  readonly toggled = output<{ id: string; done: boolean }>();
  readonly saveErrorDismissed = output<void>();
  readonly dayOpened = output<void>();
  readonly tasksOpened = output<void>();
  readonly taskOpened = output<string>();
  readonly newEvent = output<void>();

  protected readonly crumbs: BreadcrumbItem[] = [
    { label: 'Inicio', icon: 'home', link: '/inicio' },
    { label: 'Resumen' },
  ];

  protected readonly lead = computed(() => {
    const day = capitalize(LONG_DAY.format(new Date(`${this.today()}T00:00:00Z`)).replace(',', ''));
    const stats = this.stats();
    if (this.status() !== 'ready' || !stats) return day;
    const events = stats.eventsToday === 1 ? '1 cita' : `${stats.eventsToday} citas`;
    const tasks =
      stats.dueToday === 1 ? '1 tarea que vence' : `${stats.dueToday} tareas que vencen`;
    return `${day} · tienes ${events} hoy y ${tasks}.`;
  });

  protected readonly nextPeople = computed(() =>
    (this.nextEvent()?.people ?? []).map((name) => ({ name })),
  );

  protected isOverdue(task: Task): boolean {
    return isOverdue(task, this.today());
  }

  protected shortDay(day: string): string {
    return SHORT_DAY.format(new Date(`${day}T00:00:00Z`));
  }
}
