import { Component, afterNextRender, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppBar } from '@shared/components/app-bar/app-bar';
import { dayTitle } from '@shared/utils';
import { OverviewMain } from '../../components/overview-main/overview-main';
import { OverviewSide } from '../../components/overview-side/overview-side';
import { AgendaDialogs } from '../../../agenda/components/agenda-dialogs/agenda-dialogs';
import { OverviewFacade } from '../../overview.facade';

@Component({
  selector: 'app-overview-page',
  imports: [AppBar, OverviewMain, OverviewSide, AgendaDialogs],
  templateUrl: './overview-page.html',
  host: { class: 'overview-page screen l-screen' },
})
export class OverviewPage {
  protected readonly facade = inject(OverviewFacade);
  protected readonly router = inject(Router);

  protected readonly title = computed(() => dayTitle(this.facade.today()));

  constructor() {
    // Data lives in the browser's localStorage: the server renders skeletons only.
    afterNextRender(() => this.facade.load());
  }
}
