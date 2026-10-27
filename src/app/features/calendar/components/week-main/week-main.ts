import { Component, computed, input, output } from '@angular/core';
import { Alert, AlertAction } from '@shared/components/alert/alert';
import { Breadcrumb } from '@shared/components/breadcrumb/breadcrumb';
import { Button } from '@shared/components/button/button';
import { IconButton } from '@shared/components/icon-button/icon-button';
import { SegmentedControl } from '@shared/components/segmented-control/segmented-control';
import { SkeletonList } from '@shared/components/skeleton/skeleton-list';
import { WeekView } from '@shared/components/week-view/week-view';
import {
  SegmentedOption,
  WeekDay,
  WeekViewAllDay,
  WeekViewEvent,
  WeekViewSlot,
} from '@shared/interfaces';
import { BreadcrumbItem } from '@shared/types';
import { addDays, isoWeek, weekRangeLabel, weekStart } from '@shared/utils';
import { AgendaStatus } from '../../../agenda/domain/agenda-view.model';

@Component({
  selector: 'app-week-main',
  imports: [
    Alert,
    AlertAction,
    Breadcrumb,
    Button,
    IconButton,
    SegmentedControl,
    SkeletonList,
    WeekView,
  ],
  templateUrl: './week-main.html',
  host: { class: 'l-shell__main panel l-stack', 'data-gap': 'm' },
})
export class WeekMain {
  readonly status = input.required<AgendaStatus>();
  readonly today = input.required<string>();
  readonly day = input.required<string>();
  readonly days = input<WeekDay[]>([]);
  readonly events = input<WeekViewEvent[]>([]);
  readonly allDay = input<WeekViewAllDay[]>([]);
  readonly now = input<string>();

  readonly dayChanged = output<string>();
  readonly viewChanged = output<'dia' | 'mes'>();
  readonly eventSelected = output<string>();
  readonly slotClicked = output<WeekViewSlot>();
  readonly retry = output<void>();

  protected readonly viewOptions: SegmentedOption[] = [
    { value: 'dia', label: 'Día' },
    { value: 'semana', label: 'Semana' },
    { value: 'mes', label: 'Mes' },
  ];

  /** «19 – 25 de octubre, 2026». */
  protected readonly title = computed(() => weekRangeLabel(weekStart(this.day())));
  protected readonly week = computed(() => `Semana ${isoWeek(this.day())}`);

  protected readonly crumbs = computed<BreadcrumbItem[]>(() => [
    { label: 'Inicio', icon: 'home', link: '/inicio' },
    { label: 'Calendario' },
    { label: this.week() },
  ]);

  protected move(days: number): void {
    this.dayChanged.emit(addDays(this.day(), days));
  }

  protected onView(value: string): void {
    if (value === 'dia' || value === 'mes') this.viewChanged.emit(value);
  }

  protected onEvent(event: WeekViewEvent): void {
    if (event.id) this.eventSelected.emit(event.id);
  }
}
