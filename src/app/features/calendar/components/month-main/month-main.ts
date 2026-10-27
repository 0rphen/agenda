import { Component, computed, input, output } from '@angular/core';
import { Alert, AlertAction } from '@shared/components/alert/alert';
import { Breadcrumb } from '@shared/components/breadcrumb/breadcrumb';
import { Button } from '@shared/components/button/button';
import { IconButton } from '@shared/components/icon-button/icon-button';
import { MonthView } from '@shared/components/month-view/month-view';
import { SegmentedControl } from '@shared/components/segmented-control/segmented-control';
import { SkeletonList } from '@shared/components/skeleton/skeleton-list';
import { MonthViewEvent, SegmentedOption } from '@shared/interfaces';
import { BreadcrumbItem } from '@shared/types';
import { addMonths, capitalize, MONTH_YEAR } from '@shared/utils';
import { AgendaStatus } from '../../../agenda/domain/agenda-view.model';

@Component({
  selector: 'app-month-main',
  imports: [
    Alert,
    AlertAction,
    Breadcrumb,
    Button,
    IconButton,
    MonthView,
    SegmentedControl,
    SkeletonList,
  ],
  templateUrl: './month-main.html',
  host: { class: 'l-shell__main panel l-stack', 'data-gap': 'm' },
})
export class MonthMain {
  readonly status = input.required<AgendaStatus>();
  readonly today = input.required<string>();
  readonly day = input.required<string>();
  readonly year = input.required<number>();
  readonly month = input.required<number>();
  readonly events = input<MonthViewEvent[]>([]);

  readonly dayChanged = output<string>();
  readonly viewChanged = output<'dia' | 'semana'>();
  /** Chip or «+N más» of a cell: the day to open in DayPage. */
  readonly dayOpened = output<string>();
  readonly retry = output<void>();

  protected readonly viewOptions: SegmentedOption[] = [
    { value: 'dia', label: 'Día' },
    { value: 'semana', label: 'Semana' },
    { value: 'mes', label: 'Mes' },
  ];

  /** «Octubre 2026». */
  protected readonly title = computed(() =>
    capitalize(MONTH_YEAR.format(new Date(`${this.day()}T00:00:00Z`)).replace(' de ', ' ')),
  );

  protected readonly crumbs = computed<BreadcrumbItem[]>(() => [
    { label: 'Inicio', icon: 'home', link: '/inicio' },
    { label: 'Calendario' },
    { label: this.title() },
  ]);

  protected move(months: number): void {
    this.dayChanged.emit(addMonths(this.day(), months));
  }

  protected onView(value: string): void {
    if (value === 'dia' || value === 'semana') this.viewChanged.emit(value);
  }
}
