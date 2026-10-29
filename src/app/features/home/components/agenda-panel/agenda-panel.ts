import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  linkedSignal,
  output,
  viewChild,
} from '@angular/core';
import { AgendaItem } from '@shared/components/agenda-item/agenda-item';
import { Alert, AlertAction } from '@shared/components/alert/alert';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { EventCard, EventCardBadge } from '@shared/components/event-card/event-card';
import { IconButton } from '@shared/components/icon-button/icon-button';
import { SkeletonList } from '@shared/components/skeleton/skeleton-list';
import { TextField } from '@shared/components/text-field/text-field';
import { AvatarPerson } from '@shared/interfaces';
import { normalizeSearch } from '@shared/utils';
import { AgendaStatus } from '../../../agenda/domain/agenda-view.model';
import { TimeFormatPipe } from '../../../settings/time-format.pipe';
import { AgendaGroup, AgendaRange } from '../../domain/home-view.model';

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
    SkeletonList,
    TextField,
    TimeFormatPipe,
  ],
  templateUrl: './agenda-panel.html',
  host: { class: 'l-shell__agenda panel l-stack', 'data-variant': 'surface', 'data-gap': 'xs' },
})
export class AgendaPanel {
  readonly status = input.required<AgendaStatus>();
  readonly groups = input<AgendaGroup[]>([]);
  readonly range = input.required<AgendaRange>();
  readonly selectedDay = input.required<string>();

  readonly retry = output<void>();
  readonly newEvent = output<void>();
  readonly eventEdited = output<string>();

  // Changing range or day resets the search; new groups alone do not (R10, R11)
  private readonly view = computed(() => `${this.range()}|${this.selectedDay()}`);
  protected readonly searching = linkedSignal({ source: this.view, computation: () => false });
  protected readonly query = linkedSignal({ source: this.view, computation: () => '' });

  protected readonly visibleGroups = computed<AgendaGroup[]>(() => {
    const query = normalizeSearch(this.query().trim());
    if (!query) return this.groups();
    const matches = (text?: string) => !!text && normalizeSearch(text).includes(query);
    return this.groups()
      .map((group) => ({
        ...group,
        events: group.events.filter(
          (event) => matches(event.title) || matches(event.location) || event.people.some(matches),
        ),
      }))
      .filter((group) => group.events.length);
  });

  private readonly injector = inject(Injector);
  // TextField and IconButton expose no focus(): reach their inner control
  private readonly searchField = viewChild('searchField', { read: ElementRef });
  private readonly searchButton = viewChild('searchButton', { read: ElementRef });

  protected openSearch(): void {
    this.searching.set(true);
    afterNextRender(() => this.searchField()?.nativeElement.querySelector('input')?.focus(), {
      injector: this.injector,
    });
  }

  protected closeSearch(): void {
    this.query.set('');
    this.searching.set(false);
    afterNextRender(() => this.searchButton()?.nativeElement.querySelector('button')?.focus(), {
      injector: this.injector,
    });
  }

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
}
