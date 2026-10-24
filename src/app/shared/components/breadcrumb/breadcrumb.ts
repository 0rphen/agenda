import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '@shared/components/icon/icon';
import { BreadcrumbItem } from '@shared/types';

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
