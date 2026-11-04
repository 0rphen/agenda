import { Component, DOCUMENT, afterNextRender, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { BottomNav } from '@shared/components/bottom-nav/bottom-nav';
import { SidebarNav } from '@shared/components/sidebar-nav/sidebar-nav';
import { NavDestination } from '@shared/interfaces';
import { BottomNavItem, ShellLayout, SidebarNavItem } from '@shared/types';
import { BOTTOM_DESTINATIONS, RAIL_DESTINATIONS } from '@shared/utils';
import { AgendaCommands } from './features/agenda/agenda-commands';
import { AgendaStore } from './features/agenda/store/agenda.store';
import { UserSettingsStore } from './features/settings/store/user-settings.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarNav, BottomNav],
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  private readonly userSettings = inject(UserSettingsStore);
  private readonly agenda = inject(AgendaStore);
  private readonly commands = inject(AgendaCommands);

  constructor() {
    afterNextRender(() => {
      this.userSettings.load();
      this.commands.load();
    });
    // the save error belonged to the screen that failed, as when AgendaCommands lived per route
    this.navigationEnd.pipe(takeUntilDestroyed()).subscribe(() => this.commands.dismissSaveError());
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

  private readonly navigationEnd = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
  );
  private readonly url = toSignal(
    this.navigationEnd.pipe(map((event) => event.urlAfterRedirects)),
    { initialValue: this.router.url },
  );

  /** Undefined until the agenda is loaded, or with nothing pending: no badge. */
  private readonly pendingTasks = computed(() => {
    if (this.agenda.status() !== 'ready') return undefined;
    return this.agenda.tasks().filter((task) => !task.done).length || undefined;
  });

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
    const pending = this.pendingTasks();
    return destinations.map(({ icon, label, url: target, match }) => ({
      icon,
      label,
      active: match.some((prefix) => url.startsWith(prefix)),
      badge: target === '/tareas' ? pending : undefined,
    }));
  }
}
