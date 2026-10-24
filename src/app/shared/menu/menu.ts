import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  ElementRef,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { Icon } from '../icon/icon';
import { IconButton, IconButtonVariant } from '../icon-button/icon-button';
import { Size } from '../types/ui';

export type MenuItem = {
  label: string;
  icon?: string;
  shortcut?: string;
  tone?: 'danger';
  disabled?: boolean;
  selected?: boolean;
};
export type MenuEntry = MenuItem | { divider: true } | { section: string };

@Component({
  selector: 'app-menu',
  imports: [Icon, IconButton],
  templateUrl: './menu.html',
  host: {
    class: 'menu',
    '[attr.data-static]': "isStatic() ? '' : null",
    '[attr.data-align]': "align() === 'start' ? 'start' : null",
    '(document:mousedown)': 'onDocumentMousedown($event)',
  },
})
export class Menu {
  readonly items = input.required<MenuEntry[]>();
  readonly label = input('Acciones');
  readonly align = input<'end' | 'start'>('end');
  readonly icon = input('more_horiz');
  readonly triggerLabel = input('Más acciones');
  readonly variant = input<IconButtonVariant>('ghost');
  readonly size = input<Exclude<Size, 'xl'>>('m');
  readonly isStatic = input(false, { alias: 'static', transform: booleanAttribute });
  readonly open = model(false);

  readonly itemSelected = output<MenuItem>();

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;

  constructor() {
    afterRenderEffect(() => {
      if (this.open() && !this.isStatic()) this.enabledItems()[0]?.focus();
    });
  }

  protected asItem(entry: MenuEntry): MenuItem | null {
    return 'label' in entry ? entry : null;
  }

  protected select(item: MenuItem): void {
    this.itemSelected.emit(item);
    if (!this.isStatic()) this.close();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const items = this.enabledItems();
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const n = items.length;
    const target = n
      ? {
          ArrowDown: items[(i + 1) % n],
          ArrowUp: items[i <= 0 ? n - 1 : i - 1],
          Home: items[0],
          End: items[n - 1],
        }[event.key]
      : undefined;
    if (target) {
      event.preventDefault();
      target.focus();
    } else if (this.isStatic()) {
      return;
    } else if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'Tab') {
      this.open.set(false);
    }
  }

  protected onDocumentMousedown(event: MouseEvent): void {
    if (this.open() && !this.isStatic() && !this.host.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  private close(): void {
    this.open.set(false);
    this.host.querySelector<HTMLButtonElement>('.icon-button')?.focus();
  }

  private enabledItems(): HTMLButtonElement[] {
    return [...this.host.querySelectorAll<HTMLButtonElement>('.menu__item:not(:disabled)')];
  }
}
