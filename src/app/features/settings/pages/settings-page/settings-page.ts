import { Component, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Alert, AlertAction } from '@shared/components/alert/alert';
import { AppBar } from '@shared/components/app-bar/app-bar';
import { Breadcrumb } from '@shared/components/breadcrumb/breadcrumb';
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { Dialog, DialogFooter } from '@shared/components/dialog/dialog';
import { SaveBar } from '@shared/components/save-bar/save-bar';
import { SettingRow } from '@shared/components/setting-row/setting-row';
import { SidebarNav } from '@shared/components/sidebar-nav/sidebar-nav';
import { SkeletonList } from '@shared/components/skeleton/skeleton-list';
import { BreadcrumbItem, SidebarNavEntry, SidebarNavItem } from '@shared/types';
import { SettingsAppearance } from '../../components/settings-appearance/settings-appearance';
import { SettingsCalendar } from '../../components/settings-calendar/settings-calendar';
import { SettingsNotifications } from '../../components/settings-notifications/settings-notifications';
import { SettingsProfile } from '../../components/settings-profile/settings-profile';
import { SettingsSecurity } from '../../components/settings-security/settings-security';
import { SETTINGS_EMAIL, SETTINGS_NAV, SETTINGS_TITLES } from '../../domain/settings-options';
import { SettingsSection } from '../../domain/settings.model';
import { SettingsFacade } from '../../settings.facade';

@Component({
  selector: 'app-settings-page',
  imports: [
    Alert,
    AlertAction,
    AppBar,
    Breadcrumb,
    Button,
    Card,
    Dialog,
    DialogFooter,
    SaveBar,
    SettingsAppearance,
    SettingsCalendar,
    SettingsNotifications,
    SettingsProfile,
    SettingsSecurity,
    SettingRow,
    SidebarNav,
    SkeletonList,
  ],
  templateUrl: './settings-page.html',
  host: {
    class: 'settings-page screen l-screen',
    '(window:beforeunload)': 'onBeforeUnload($event)',
  },
})
export class SettingsPage {
  protected readonly facade = inject(SettingsFacade);
  private readonly router = inject(Router);

  // route data, bound by withComponentInputBinding; undefined on /configuracion (mobile list)
  readonly section = input<SettingsSection>();

  protected readonly current = computed(() => this.section() ?? 'perfil');
  protected readonly title = computed(() => SETTINGS_TITLES[this.current()]);
  protected readonly email = SETTINGS_EMAIL;
  protected readonly notificationsValue = computed(() => {
    const { browser, email, mobile } = this.facade.draft().notifications;
    return browser || email || mobile ? 'Activas' : 'Desactivadas';
  });
  protected readonly crumbs = computed<BreadcrumbItem[]>(() => [
    { label: 'Inicio', icon: 'home', link: '/inicio' },
    { label: 'Configuración' },
    { label: this.title() },
  ]);
  protected readonly navItems = computed<SidebarNavEntry[]>(() =>
    SETTINGS_NAV.map((entry) =>
      'label' in entry ? { ...entry, active: entry.label === this.title() } : entry,
    ),
  );
  /** Resolver of the pending `canDeactivate`; set while the leave Dialog is open. */
  protected readonly leaving = signal<((leave: boolean) => void) | undefined>(undefined);
  protected readonly deleting = signal(false);
  protected readonly logoutUnavailable = signal(false);
  protected readonly user = computed(() => ({
    name: this.facade.userName(),
    role: 'Organizador',
  }));

  constructor() {
    // Data lives in the browser's localStorage: the server renders skeletons only.
    afterNextRender(() => {
      if (this.facade.status() === 'idle') this.facade.load();
      this.facade.readNotificationPermission();
    });
  }

  canLeave(): boolean | Promise<boolean> {
    if (!this.facade.dirty()) return true;
    return new Promise((resolve) => this.leaving.set(resolve));
  }

  protected async leave(action: 'stay' | 'discard' | 'save'): Promise<void> {
    const resolve = this.leaving();
    if (!resolve) return;
    if (action === 'save') await this.facade.save();
    if (action === 'discard') this.facade.cancel();
    this.leaving.set(undefined);
    // a failed save stays here, with the save error Alert visible
    resolve(action === 'discard' || (action === 'save' && !this.facade.saveError()));
  }

  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.facade.dirty()) event.preventDefault();
  }

  protected open(section?: SettingsSection): void {
    this.router.navigate(section ? ['/configuracion', section] : ['/configuracion']);
  }

  protected go(item: SidebarNavItem): void {
    const section = (Object.keys(SETTINGS_TITLES) as SettingsSection[]).find(
      (key) => SETTINGS_TITLES[key] === item.label,
    );
    if (section) this.open(section);
  }
}
