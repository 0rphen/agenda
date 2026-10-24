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
import { IconButton } from '../icon-button/icon-button';

@Directive({ selector: '[dialogFooter]' })
export class DialogFooter {}

const FOCUSABLE =
  'input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])';

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
