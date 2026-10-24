import { Component, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

export type BottomNavItem = {
  icon: string;
  label: string;
  active?: boolean;
  badge?: number;
  disabled?: boolean;
  state?: 'hover' | 'active' | 'focus';
};

@Component({
  selector: 'app-bottom-nav',
  imports: [Icon],
  templateUrl: './bottom-nav.html',
})
export class BottomNav {
  readonly items = input.required<BottomNavItem[]>();
  readonly label = input('Navegación principal');

  readonly itemSelected = output<BottomNavItem>();
}
