import { booleanAttribute, Component, ElementRef, inject, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

export interface SegmentedOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-segmented-control',
  templateUrl: './segmented-control.html',
  host: {
    class: 'segmented',
    role: 'group',
    '[attr.aria-label]': 'label()',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class SegmentedControl implements FormValueControl<string> {
  readonly value = model('');
  readonly touched = model(false);

  readonly label = input.required<string>();
  readonly options = input.required<SegmentedOption[]>();
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  // moving focus between options stays inside the group, so it must not mark touched
  protected onFocusOut(event: FocusEvent): void {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null))
      this.touched.set(true);
  }
}
