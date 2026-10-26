import { Component, input } from '@angular/core';
import { EmptyState } from '@shared/components/empty-state/empty-state';

@Component({
  selector: 'app-placeholder-page',
  imports: [EmptyState],
  templateUrl: './placeholder-page.html',
  host: { class: 'placeholder-page panel l-stack' },
})
export class PlaceholderPage {
  readonly heading = input.required<string>();
}
