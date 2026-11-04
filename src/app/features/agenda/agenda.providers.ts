import { Provider } from '@angular/core';
import { AgendaDialogs } from './agenda-dialogs';

/** Per-screen dialog state; store, commands and repository are app-wide (root / app.config). */
export function provideAgenda(): Provider[] {
  return [AgendaDialogs];
}
