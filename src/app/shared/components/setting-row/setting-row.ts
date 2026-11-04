import {
  booleanAttribute,
  Component,
  contentChild,
  Directive,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';
import { Icon } from '@shared/components/icon/icon';

@Directive({ selector: '[settingRowControl]' })
export class SettingRowControl {}

@Component({
  selector: 'app-setting-row, button[app-setting-row]',
  imports: [Icon],
  templateUrl: './setting-row.html',
  host: {
    class: 'setting-row',
    '[attr.data-interactive]': "interactive ? '' : null",
    '[attr.type]': "interactive ? 'button' : null",
    '[attr.disabled]': "interactive && disabled() ? '' : null",
    '[attr.data-tone]': 'tone() ?? null',
    '(click)': 'onClick($event)',
  },
})
export class SettingRow {
  readonly label = input.required<string>();
  readonly icon = input<string>();
  readonly description = input<string>();
  readonly value = input<string>();
  readonly wide = input(false, { transform: booleanAttribute });
  readonly noChevron = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly tone = input<'danger'>();

  readonly clicked = output<MouseEvent>();

  protected readonly interactive =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';
  protected readonly control = contentChild(SettingRowControl);

  protected onClick(event: MouseEvent): void {
    if (this.interactive && !this.disabled()) this.clicked.emit(event);
  }
}
