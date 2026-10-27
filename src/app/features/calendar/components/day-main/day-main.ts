import { Component, computed, input, output } from '@angular/core';
import { Alert, AlertAction } from '@shared/components/alert/alert';
import { Breadcrumb } from '@shared/components/breadcrumb/breadcrumb';
import { Button } from '@shared/components/button/button';
import { DayView } from '@shared/components/day-view/day-view';
import { IconButton } from '@shared/components/icon-button/icon-button';
import { SegmentedControl } from '@shared/components/segmented-control/segmented-control';
import { SkeletonList } from '@shared/components/skeleton/skeleton-list';
import { WeekStrip } from '@shared/components/week-strip/week-strip';
import { DayViewAllDay, DayViewEvent, SegmentedOption, WeekDay } from '@shared/interfaces';
import { BreadcrumbItem } from '@shared/types';
import { addDays, dayTitle } from '@shared/utils';
import { AgendaStatus } from '../../../agenda/domain/agenda-view.model';

@Component({
  selector: 'app-day-main',
  imports: [
    Alert,
    AlertAction,
    Breadcrumb,
    Button,
    DayView,
    IconButton,
    SegmentedControl,
    SkeletonList,
    WeekStrip,
  ],
  templateUrl: './day-main.html',
  host: { class: 'l-shell__main l-screen__main panel l-stack', 'data-gap': 'm' },
})
export class DayMain {
  readonly status = input.required<AgendaStatus>();
  readonly today = input.required<string>();
  readonly day = input.required<string>();
  readonly isToday = input(false);
  readonly events = input<DayViewEvent[]>([]);
  readonly allDay = input<DayViewAllDay[]>([]);
  readonly now = input<string>();
  /** Mobile WeekStrip: the week of `day`. */
  readonly weekDays = input<WeekDay[]>([]);

  readonly dayChanged = output<string>();
  readonly viewChanged = output<'semana' | 'mes'>();
  readonly eventSelected = output<string>();
  readonly slotClicked = output<string>();
  readonly retry = output<void>();

  protected readonly viewOptions: SegmentedOption[] = [
    { value: 'dia', label: 'Día' },
    { value: 'semana', label: 'Semana' },
    { value: 'mes', label: 'Mes' },
  ];

  /** «Jueves 22 de octubre». */
  protected readonly title = computed(() => dayTitle(this.day()));

  protected readonly crumbs = computed<BreadcrumbItem[]>(() => [
    { label: 'Inicio', icon: 'home', link: '/inicio' },
    { label: 'Calendario' },
    // Drops the weekday: «22 de octubre».
    { label: this.title().slice(this.title().indexOf(' ') + 1) },
  ]);

  protected move(days: number): void {
    this.dayChanged.emit(addDays(this.day(), days));
  }

  protected onView(value: string): void {
    if (value === 'semana' || value === 'mes') this.viewChanged.emit(value);
  }

  protected onEvent(event: DayViewEvent): void {
    if (event.id) this.eventSelected.emit(event.id);
  }
}
