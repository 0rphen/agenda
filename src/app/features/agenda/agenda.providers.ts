import { Provider } from '@angular/core';
import { AgendaRepository } from './domain/agenda-repository';
import { AgendaStore } from './store/agenda.store';
import { AgendaLocalRepository } from './structure/agenda-local-repository';

export function provideAgenda(): Provider[] {
  return [{ provide: AgendaRepository, useClass: AgendaLocalRepository }, AgendaStore];
}
