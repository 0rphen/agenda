import { Provider } from '@angular/core';
import { AgendaCommands } from './agenda-commands';
import { AgendaDialogs } from './agenda-dialogs';
import { AgendaRepository } from './domain/agenda-repository';
import { AgendaStore } from './store/agenda.store';
import { AgendaLocalRepository } from './structure/agenda-local-repository';

export function provideAgenda(): Provider[] {
  return [
    { provide: AgendaRepository, useClass: AgendaLocalRepository },
    AgendaStore,
    AgendaCommands,
    AgendaDialogs,
  ];
}
