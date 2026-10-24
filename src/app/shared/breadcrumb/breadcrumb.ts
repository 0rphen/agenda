import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';

export type BreadcrumbItem = { label: string; icon?: string } & (
  | { link: string | readonly unknown[]; href?: never }
  | { href: string; link?: never }
  | { link?: never; href?: never }
);

@Component({
  selector: 'app-breadcrumb',
  imports: [Icon, RouterLink],
  templateUrl: './breadcrumb.html',
  host: {
    class: 'breadcrumb',
    role: 'navigation',
    'aria-label': 'Ruta de navegación',
    '[attr.data-variant]': "variant() === 'bar' ? 'bar' : null",
  },
})
export class Breadcrumb {
  readonly items = input.required<BreadcrumbItem[]>();
  readonly variant = input<'default' | 'bar'>('default');
}
