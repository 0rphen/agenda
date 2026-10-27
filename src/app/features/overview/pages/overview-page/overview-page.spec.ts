import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AgendaUnavailableError } from '../../../agenda/domain/agenda-errors';
import { AgendaRepository } from '../../../agenda/domain/agenda-repository';
import { AgendaStore } from '../../../agenda/store/agenda.store';
import { OverviewFacade } from '../../overview.facade';
import { OverviewPage } from './overview-page';

describe('OverviewPage', () => {
  let repository: { [K in keyof AgendaRepository]: ReturnType<typeof vi.fn> };

  function setup() {
    repository = {
      listEvents: vi.fn().mockResolvedValue([]),
      listTasks: vi.fn().mockResolvedValue([]),
      setTaskDone: vi.fn().mockResolvedValue(undefined),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        AgendaStore,
        OverviewFacade,
        { provide: AgendaRepository, useValue: repository },
      ],
    });
    const fixture = TestBed.createComponent(OverviewPage);
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  async function settle(fixture: ReturnType<typeof setup>['fixture']) {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('R32: main y side como hijos directos con host overview-page', async () => {
    const { fixture, el } = setup();
    await settle(fixture);
    expect(el.classList).toContain('overview-page');
    expect([...el.children].map((child) => child.localName)).toEqual([
      'app-overview-main',
      'app-overview-side',
    ]);
  });

  it('R9, R27: no lee datos antes del primer render, que pinta saludo y esqueleto', () => {
    const { fixture, el } = setup();
    expect(repository.listEvents).not.toHaveBeenCalled();
    fixture.detectChanges();
    expect(el.querySelector('h1.page-title')?.textContent).toMatch(/^Buen[oa]s \w+, César$/);
    expect(el.querySelector('app-skeleton-list')).not.toBeNull();
    expect(el.querySelector('.stat-card')).toBeNull();
  });

  it('R9: tras renderizar en navegador carga datos', async () => {
    const { fixture, el } = setup();
    await settle(fixture);
    expect(repository.listEvents).toHaveBeenCalledTimes(1);
    expect(repository.listTasks).toHaveBeenCalledTimes(1);
    expect(el.querySelector('app-skeleton-list')).toBeNull();
    expect(el.querySelectorAll('.stat-card')).toHaveLength(4);
  });

  it('R17: «Citas hoy» y «Pendientes» navegan', async () => {
    const { fixture, el } = setup();
    await settle(fixture);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const [events, pending] = el.querySelectorAll<HTMLButtonElement>('button.stat-card');
    events.click();
    pending.click();
    expect(navigate.mock.calls.map(([url]) => url)).toEqual(['/calendario/dia', '/tareas']);
  });

  it('R28: si falla muestra Alert y Reintentar vuelve a cargar', async () => {
    const { fixture, el } = setup();
    repository.listEvents.mockRejectedValueOnce(new AgendaUnavailableError());
    await settle(fixture);
    const alert = el.querySelector('app-overview-main app-alert')!;
    expect(alert.textContent).toContain('No se pudo cargar tu agenda');
    alert.querySelector<HTMLButtonElement>('app-button button')!.click();
    await settle(fixture);
    expect(repository.listEvents).toHaveBeenCalledTimes(2);
    expect(el.querySelector('app-overview-main app-alert')).toBeNull();
  });
});
