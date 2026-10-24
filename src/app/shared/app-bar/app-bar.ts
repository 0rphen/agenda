import { booleanAttribute, Component, contentChild, Directive, input, output } from '@angular/core';
import { IconButton } from '../icon-button/icon-button';

@Directive({ selector: '[appBarActions]' })
export class AppBarActions {}

@Component({
  selector: 'app-app-bar',
  imports: [IconButton],
  templateUrl: './app-bar.html',
})
export class AppBar {
  readonly heading = input.required<string>();
  readonly subtitle = input<string>();
  readonly back = input(false, { transform: booleanAttribute });
  readonly backLabel = input('Volver');
  readonly large = input(false, { transform: booleanAttribute });

  readonly backClicked = output<MouseEvent>();

  protected readonly actions = contentChild(AppBarActions);
}
