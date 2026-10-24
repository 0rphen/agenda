import { booleanAttribute, Component, input, output } from '@angular/core';
import { Button } from '@shared/components/button/button';
import { Icon } from '@shared/components/icon/icon';

@Component({
  selector: 'app-save-bar',
  imports: [Button, Icon],
  templateUrl: './save-bar.html',
  // sticky se acota a la caja del padre: sin caja propia, .save-bar se pega al contenedor real
  host: { '[style.display]': "'contents'" },
})
export class SaveBar {
  readonly dirty = input(false, { transform: booleanAttribute });
  readonly saving = input(false, { transform: booleanAttribute });
  readonly saved = input(false, { transform: booleanAttribute });
  readonly isStatic = input(false, { alias: 'static', transform: booleanAttribute });
  readonly message = input('Tienes cambios sin guardar');
  readonly savedMessage = input('Cambios guardados');
  readonly saveLabel = input('Guardar cambios');

  readonly saveClicked = output<MouseEvent>();
  readonly cancelClicked = output<MouseEvent>();
}
