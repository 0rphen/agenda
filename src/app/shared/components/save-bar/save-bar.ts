import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  input,
  linkedSignal,
  output,
} from '@angular/core';
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
  // para volver a mostrar «Cambios guardados», saved debe pasar por false
  readonly saved = input(false, { transform: booleanAttribute });
  readonly isStatic = input(false, { alias: 'static', transform: booleanAttribute });
  readonly message = input('Tienes cambios sin guardar');
  readonly savedMessage = input('Cambios guardados');
  readonly saveLabel = input('Guardar cambios');
  readonly savedTimeout = input(1800);

  readonly saveClicked = output<MouseEvent>();
  readonly cancelClicked = output<MouseEvent>();

  protected readonly showSaved = linkedSignal(() => this.saved());

  constructor() {
    afterRenderEffect((onCleanup) => {
      const ms = this.savedTimeout();
      if (!this.showSaved() || this.isStatic() || ms === 0) return;
      const id = setTimeout(() => this.showSaved.set(false), ms);
      onCleanup(() => clearTimeout(id));
    });
  }
}
