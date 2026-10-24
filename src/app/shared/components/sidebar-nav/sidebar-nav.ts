import { Component, computed, input, output } from '@angular/core';
import { Avatar } from '@shared/components/avatar/avatar';
import { Badge } from '@shared/components/badge/badge';
import { Icon } from '@shared/components/icon/icon';
import { SidebarNavEntry, SidebarNavItem } from '@shared/types';

@Component({
  selector: 'app-sidebar-nav',
  imports: [Avatar, Badge, Icon],
  templateUrl: './sidebar-nav.html',
})
export class SidebarNav {
  readonly items = input.required<SidebarNavEntry[]>();
  readonly variant = input<'panel' | 'rail'>('panel');
  readonly user = input<{ name: string; role: string }>();
  readonly label = input('Principal');

  readonly itemSelected = output<SidebarNavItem>();

  protected readonly rail = computed(() => this.variant() === 'rail');

  protected asItem(entry: SidebarNavEntry): SidebarNavItem | null {
    return 'label' in entry ? entry : null;
  }
}
