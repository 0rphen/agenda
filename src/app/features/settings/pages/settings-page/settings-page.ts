import { Component, afterNextRender, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Alert, AlertAction } from '@shared/components/alert/alert';
import { Breadcrumb } from '@shared/components/breadcrumb/breadcrumb';
import { Button } from '@shared/components/button/button';
import { SaveBar } from '@shared/components/save-bar/save-bar';
import { SidebarNav } from '@shared/components/sidebar-nav/sidebar-nav';
import { SkeletonList } from '@shared/components/skeleton/skeleton-list';
import { BreadcrumbItem, SidebarNavEntry, SidebarNavItem } from '@shared/types';
import { SettingsAppearance } from '../../components/settings-appearance/settings-appearance';
import { SettingsCalendar } from '../../components/settings-calendar/settings-calendar';
import { SettingsNotifications } from '../../components/settings-notifications/settings-notifications';
import { SettingsProfile } from '../../components/settings-profile/settings-profile';
import { SettingsSecurity } from '../../components/settings-security/settings-security';
import { SETTINGS_NAV, SETTINGS_TITLES } from '../../domain/settings-options';
import { SettingsSection } from '../../domain/settings.model';
import { SettingsFacade } from '../../settings.facade';

@Component({
  selector: 'app-settings-page',
  imports: [
    Alert,
    AlertAction,
    Breadcrumb,
    Button,
    SaveBar,
    SettingsAppearance,
    SettingsCalendar,
    SettingsNotifications,
    SettingsProfile,
    SettingsSecurity,
    SidebarNav,
    SkeletonList,
  ],
  templateUrl: './settings-page.html',
  host: { class: 'settings-page' },
})
export class SettingsPage {
  protected readonly facade = inject(SettingsFacade);
  private readonly router = inject(Router);

  // route data, bound by withComponentInputBinding
  readonly section = input<SettingsSection>('perfil');

  protected readonly title = computed(() => SETTINGS_TITLES[this.section()]);
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
  protected readonly user = computed(() => ({
    name: this.facade.userName(),
    role: 'Organizador',
  }));

  constructor() {
    // Data lives in the browser's localStorage: the server renders skeletons only.
    afterNextRender(() => {
      if (this.facade.status() === 'idle') this.facade.load();
    });
  }

  protected go(item: SidebarNavItem): void {
    const section = (Object.keys(SETTINGS_TITLES) as SettingsSection[]).find(
      (key) => SETTINGS_TITLES[key] === item.label,
    );
    if (section) this.router.navigate(['/configuracion', section]);
  }
}
