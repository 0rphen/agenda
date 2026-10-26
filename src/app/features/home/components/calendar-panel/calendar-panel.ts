import { Component, computed, input, output } from '@angular/core';
import { Breadcrumb } from '@shared/components/breadcrumb/breadcrumb';
import { Button } from '@shared/components/button/button';
import { MiniCalendar } from '@shared/components/mini-calendar/mini-calendar';
import { SegmentedControl } from '@shared/components/segmented-control/segmented-control';
import { SegmentedOption } from '@shared/interfaces';
import { BreadcrumbItem } from '@shared/types';
import { capitalize, MONTH_YEAR } from '@shared/utils';
import { AgendaRange } from '../../domain/home-view.model';

@Component({
  selector: 'app-calendar-panel',
  imports: [Breadcrumb, Button, MiniCalendar, SegmentedControl],
  templateUrl: './calendar-panel.html',
  host: { class: 'l-shell__calendar panel l-stack', 'data-gap': 'm' },
})
export class CalendarPanel {
  readonly today = input.required<string>();
  readonly selectedDay = input.required<string>();
  readonly range = input.required<AgendaRange>();
  readonly eventDays = input<string[]>([]);

  readonly daySelected = output<string>();
  readonly rangeChanged = output<AgendaRange>();

  protected readonly crumbs: BreadcrumbItem[] = [
    { label: 'Inicio', icon: 'home' },
    { label: 'Calendario' },
  ];
  protected readonly rangeOptions: SegmentedOption[] = [
    { value: 'day', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'next', label: 'Próxima' },
  ];

  protected readonly monthTitle = computed(() =>
    capitalize(MONTH_YEAR.format(new Date(`${this.selectedDay()}T00:00:00Z`)).replace(' de ', ' ')),
  );

  protected onDay(iso: string | undefined): void {
    if (iso) this.daySelected.emit(iso);
  }

  protected onRange(value: string): void {
    this.rangeChanged.emit(value as AgendaRange);
  }
}
