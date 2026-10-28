import { CanDeactivateFn } from '@angular/router';
import { SettingsPage } from './pages/settings-page/settings-page';

/** Asks before leaving `/configuracion` with unsaved changes; moving between sections is free. */
export const unsavedSettingsGuard: CanDeactivateFn<SettingsPage> = (page, _route, _state, next) =>
  next.url.startsWith('/configuracion') || page.canLeave();
