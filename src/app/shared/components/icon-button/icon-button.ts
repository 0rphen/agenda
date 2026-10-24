import { booleanAttribute, Component, input, output } from '@angular/core';
import { Icon } from '@shared/components/icon/icon';
import { Spinner } from '@shared/components/spinner/spinner';
import { IconButtonVariant, Size } from '@shared/types';

@Component({
  selector: 'app-icon-button',
  imports: [Icon, Spinner],
  templateUrl: './icon-button.html',
})
export class IconButton {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly variant = input<IconButtonVariant>('ghost');
  readonly size = input<Exclude<Size, 'xl'>>('m');
  readonly type = input<'button' | 'submit'>('button');
  readonly filled = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly expanded = input<boolean>();
  readonly haspopup = input<'menu'>();

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
