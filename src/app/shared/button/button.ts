import { booleanAttribute, Component, input, output } from '@angular/core';
import { Icon } from '../icon/icon';
import { Spinner } from '../spinner/spinner';

type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'ghost-danger' | 'danger';
type ButtonSize = 's' | 'm' | 'l';

@Component({
  selector: 'app-button',
  imports: [Icon, Spinner],
  templateUrl: './button.html',
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('m');
  readonly type = input<'button' | 'submit'>('button');
  readonly icon = input<string>();
  readonly iconEnd = input<string>();
  readonly block = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly loadingLabel = input('Cargando');

  readonly clicked = output<MouseEvent>();

  protected onClick(event: MouseEvent): void {
    // loading mantiene el foco (aria-disabled, sin disabled nativo): bloquea aquí también el submit.
    if (this.loading()) {
      event.preventDefault();
      return;
    }
    this.clicked.emit(event);
  }
}
