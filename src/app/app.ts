import { Component, DOCUMENT, afterNextRender, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { BottomNav } from '@shared/components/bottom-nav/bottom-nav';
import { SidebarNav } from '@shared/components/sidebar-nav/sidebar-nav';
import { NavDestination } from '@shared/interfaces';
import { BottomNavItem, ShellLayout, SidebarNavItem } from '@shared/types';
import { BOTTOM_DESTINATIONS, RAIL_DESTINATIONS } from '@shared/utils';
import { UserSettingsStore } from './features/settings/store/user-settings.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarNav, BottomNav],
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  private readonly userSettings = inject(UserSettingsStore);

  constructor() {
    afterNextRender(() => this.userSettings.load());
    // Apariencia on <html>: defaults (no attributes) on the server, saved values once loaded
    const root = inject(DOCUMENT).documentElement;
    effect(() => {
      const { density, textSize, reduceMotion } = this.userSettings.settings().appearance;
      root.toggleAttribute('data-reduce-motion', reduceMotion);
      if (density === 'Compacta') root.setAttribute('data-density', 'compact');
      else root.removeAttribute('data-density');
      if (textSize === 'Grande') root.setAttribute('data-text-size', 'large');
      else root.removeAttribute('data-text-size');
    });
  }

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly layout = computed(() => {
    this.url(); // re-read the snapshot on every NavigationEnd
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return route.data['layout'] as ShellLayout | undefined;
  });

  protected readonly railItems = computed(() => this.toItems(RAIL_DESTINATIONS));
  protected readonly bottomItems = computed(() => this.toItems(BOTTOM_DESTINATIONS));
  protected readonly railDestinations = RAIL_DESTINATIONS;
  protected readonly bottomDestinations = BOTTOM_DESTINATIONS;

  protected navigate(destinations: NavDestination[], item: SidebarNavItem | BottomNavItem): void {
    const destination = destinations.find((d) => d.label === item.label);
    if (destination) this.router.navigateByUrl(destination.url);
  }

  private toItems(destinations: NavDestination[]): SidebarNavItem[] {
    const url = this.url();
    return destinations.map(({ icon, label, match }) => ({
      icon,
      label,
      active: match.some((prefix) => url.startsWith(prefix)),
    }));
  }
}
