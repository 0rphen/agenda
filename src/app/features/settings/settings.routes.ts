import { Routes } from '@angular/router';
import { SETTINGS_TITLES } from './domain/settings-options';
import { SettingsRepository } from './domain/settings-repository';
import { SettingsSection } from './domain/settings.model';
import { SettingsPage } from './pages/settings-page/settings-page';
import { SettingsFacade } from './settings.facade';
import { SettingsLocalRepository } from './structure/settings-local-repository';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    // facade on the parent route: one draft shared by every section
    providers: [{ provide: SettingsRepository, useClass: SettingsLocalRepository }, SettingsFacade],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'perfil' },
      ...(Object.keys(SETTINGS_TITLES) as SettingsSection[]).map((section) => ({
        path: section,
        component: SettingsPage,
        title: `${SETTINGS_TITLES[section]} · Configuración · Agenda`,
        data: { layout: 'settings', section },
      })),
    ],
  },
];
