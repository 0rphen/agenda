import { Component, input } from '@angular/core';
import { Alert } from '@shared/components/alert/alert';
import { Card } from '@shared/components/card/card';
import { MiniCalendar } from '@shared/components/mini-calendar/mini-calendar';
import { Progress } from '@shared/components/progress/progress';
import { AgendaStatus, ListProgress } from '../../../agenda/domain/agenda-view.model';
import { AgendaConflict } from '../../domain/overview-view.model';

@Component({
  selector: 'app-overview-side',
  imports: [Alert, Card, MiniCalendar, Progress],
  templateUrl: './overview-side.html',
  host: { class: 'l-shell__panel panel l-stack', 'data-variant': 'side', 'data-gap': 'm' },
})
export class OverviewSide {
  readonly status = input.required<AgendaStatus>();
  readonly today = input.required<string>();
  readonly eventDays = input<string[]>([]);
  readonly progress = input<ListProgress[]>([]);
  readonly conflict = input<AgendaConflict>();
}
