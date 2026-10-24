import { booleanAttribute, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-day-pill',
  templateUrl: './day-pill.html',
})
export class DayPill {
  readonly dow = input.required<string>();
  readonly num = input.required<number | string>();
  readonly label = input<string>();
  readonly selected = input(false, { transform: booleanAttribute });
  readonly today = input(false, { transform: booleanAttribute });
  readonly hasEvents = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly fluid = input(false, { transform: booleanAttribute });

  readonly clicked = output<MouseEvent>();
}
