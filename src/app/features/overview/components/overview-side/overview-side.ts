import { Component, input } from '@angular/core';
import { Alert } from '@shared/components/alert/alert';
import { Card } from '@shared/components/card/card';
import { MiniCalendar } from '@shared/components/mini-calendar/mini-calendar';
import { Progress } from '@shared/components/progress/progress';
import { AgendaStatus, ListProgress } from '../../../agenda/domain/agenda-view.model';
import { TimeFormatPipe } from '../../../settings/time-format.pipe';
import { AgendaConflict } from '../../domain/overview-view.model';

@Component({
  selector: 'app-overview-side',
  imports: [Alert, Card, MiniCalendar, Progress, TimeFormatPipe],
  templateUrl: './overview-side.html',
  host: { class: 'l-shell__panel panel l-stack', 'data-variant': 'side', 'data-gap': 'm' },
})
export class OverviewSide {
  readonly status = input.required<AgendaStatus>();
  readonly today = input.required<string>();
  readonly eventDays = input<string[]>([]);
  /** «Inicio de semana»: 1 Monday, 0 Sunday. */
  readonly firstDay = input<0 | 1>(1);
  readonly progress = input<ListProgress[]>([]);
  readonly conflict = input<AgendaConflict>();
}
