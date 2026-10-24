import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  contentChild,
  Directive,
  ElementRef,
  input,
  model,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconButton } from '@shared/components/icon-button/icon-button';
import { FOCUSABLE } from '@shared/utils';

@Directive({ selector: '[dialogFooter]' })
export class DialogFooter {}

@Component({
  selector: 'app-dialog',
  imports: [IconButton, NgTemplateOutlet],
  templateUrl: './dialog.html',
})
export class Dialog {
  readonly heading = input.required<string>();
  readonly description = input<string>();
  readonly variant = input<'sheet' | 'full'>();
  readonly contained = input(false, { transform: booleanAttribute });
  readonly isStatic = input(false, { alias: 'static', transform: booleanAttribute });
  readonly closable = input(true, { transform: booleanAttribute });
  readonly open = model(false);

  protected readonly footer = contentChild(DialogFooter);
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    afterRenderEffect(() => {
      const dialog = this.dialog()?.nativeElement;
      if (!dialog) return;
      if (this.open() && !dialog.open) {
        if (this.contained()) dialog.show();
        else dialog.showModal();
        dialog.querySelector<HTMLElement>(`.dialog__body :is(${FOCUSABLE})`)?.focus();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }
}
