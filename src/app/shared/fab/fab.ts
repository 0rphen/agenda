import { booleanAttribute, Component, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-fab',
  imports: [Icon],
  templateUrl: './fab.html',
})
export class Fab {
  readonly label = input.required<string>();
  readonly icon = input('add');
  readonly extended = input(false, { transform: booleanAttribute });

  readonly clicked = output<MouseEvent>();
}
