import { Component, input, output } from '@angular/core';
import { Icon } from '@shared/components/icon/icon';
import { BottomNavItem } from '@shared/types';

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
