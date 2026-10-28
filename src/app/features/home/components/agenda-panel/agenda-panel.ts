import { Component, computed, input, output } from '@angular/core';
import { AgendaItem } from '@shared/components/agenda-item/agenda-item';
import { Alert, AlertAction } from '@shared/components/alert/alert';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { EventCard, EventCardBadge } from '@shared/components/event-card/event-card';
import { IconButton } from '@shared/components/icon-button/icon-button';
import { Menu } from '@shared/components/menu/menu';
import { SkeletonList } from '@shared/components/skeleton/skeleton-list';
import { AvatarPerson } from '@shared/interfaces';
import { MenuItem } from '@shared/types';
import { AgendaStatus } from '../../../agenda/domain/agenda-view.model';
import { TimeFormatPipe } from '../../../settings/time-format.pipe';
import { AgendaGroup } from '../../domain/home-view.model';

@Component({
  selector: 'app-agenda-panel',
  imports: [
    AgendaItem,
    Alert,
    AlertAction,
    Badge,
    Button,
    EmptyState,
    EventCard,
    EventCardBadge,
    IconButton,
    Menu,
    SkeletonList,
    TimeFormatPipe,
  ],
  templateUrl: './agenda-panel.html',
  host: { class: 'l-shell__agenda panel l-stack', 'data-variant': 'surface', 'data-gap': 'xs' },
})
export class AgendaPanel {
  readonly status = input.required<AgendaStatus>();
  readonly groups = input<AgendaGroup[]>([]);

  readonly retry = output<void>();
  readonly newEvent = output<void>();
  readonly eventEdited = output<string>();
  readonly eventDeleted = output<string>();

  protected readonly eventActions: MenuItem[] = [
    { label: 'Editar', icon: 'edit' },
    { label: 'Eliminar', icon: 'delete_outline', tone: 'danger' },
  ];

  protected readonly people = computed(() => {
    const byEvent = new Map<string, AvatarPerson[]>();
    for (const group of this.groups()) {
      for (const event of group.events)
        byEvent.set(
          event.id,
          event.people.map((name) => ({ name })),
        );
    }
    return byEvent;
  });

  protected onEventAction(id: string, item: MenuItem): void {
    (item.tone === 'danger' ? this.eventDeleted : this.eventEdited).emit(id);
  }
}
