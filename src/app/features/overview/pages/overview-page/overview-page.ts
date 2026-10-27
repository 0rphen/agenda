import { Component, afterNextRender, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OverviewMain } from '../../components/overview-main/overview-main';
import { OverviewSide } from '../../components/overview-side/overview-side';
import { OverviewFacade } from '../../overview.facade';

@Component({
  selector: 'app-overview-page',
  imports: [OverviewMain, OverviewSide],
  templateUrl: './overview-page.html',
  host: { class: 'overview-page' },
})
export class OverviewPage {
  protected readonly facade = inject(OverviewFacade);
  protected readonly router = inject(Router);

  constructor() {
    // Data lives in the browser's localStorage: the server renders skeletons only.
    afterNextRender(() => this.facade.load());
  }
}
