import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { SettingsRepository } from './features/settings/domain/settings-repository';
import { SettingsLocalRepository } from './features/settings/structure/settings-local-repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(withEventReplay()),
    // app-wide: UserSettingsStore reads it from every screen
    { provide: SettingsRepository, useClass: SettingsLocalRepository },
  ],
};
