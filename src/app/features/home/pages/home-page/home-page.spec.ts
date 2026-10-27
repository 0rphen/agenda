import { TestBed } from '@angular/core/testing';
import { AgendaUnavailableError } from '../../../agenda/domain/agenda-errors';
import { AgendaRepository } from '../../../agenda/domain/agenda-repository';
import { HomeFacade } from '../../home.facade';
import { AgendaStore } from '../../../agenda/store/agenda.store';
import { HomePage } from './home-page';

describe('HomePage', () => {
  let repository: { [K in keyof AgendaRepository]: ReturnType<typeof vi.fn> };

  function setup() {
    repository = {
      listEvents: vi.fn().mockResolvedValue([]),
      listTasks: vi.fn().mockResolvedValue([]),
      setTaskDone: vi.fn().mockResolvedValue(undefined),
    };
    TestBed.configureTestingModule({
      providers: [AgendaStore, HomeFacade, { provide: AgendaRepository, useValue: repository }],
    });
    const fixture = TestBed.createComponent(HomePage);
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  async function settle(fixture: ReturnType<typeof setup>['fixture']) {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('R35: paneles como hijos directos con host home-page', async () => {
    const { fixture, el } = setup();
    await settle(fixture);
    expect(el.classList).toContain('home-page');
    expect([...el.children].map((child) => child.localName)).toEqual([
      'app-calendar-panel',
      'app-agenda-panel',
      'app-tasks-panel',
    ]);
  });

  // El servidor real se comprueba con serve:ssr (spec, paso 7): aquí, que no lee antes de renderizar.
  it('R15–R16: no lee datos antes del primer render, que pinta mes y esqueletos', () => {
    const { fixture, el } = setup();
    expect(repository.listEvents).not.toHaveBeenCalled();
    fixture.detectChanges();
    expect(el.querySelector('h1.page-title')?.textContent?.trim()).toMatch(/^[A-Z][a-z]+ \d{4}$/);
    expect(el.querySelectorAll('app-skeleton-list')).toHaveLength(2);
  });

  it('R15: tras renderizar en navegador carga datos', async () => {
    const { fixture, el } = setup();
    await settle(fixture);
    expect(repository.listEvents).toHaveBeenCalledTimes(1);
    expect(repository.listTasks).toHaveBeenCalledTimes(1);
    expect(el.querySelector('app-skeleton-list')).toBeNull();
    expect(el.textContent).toContain('Sin citas');
  });

  it('R17: si falla muestra Alert y Reintentar vuelve a cargar', async () => {
    const { fixture, el } = setup();
    repository.listEvents.mockRejectedValueOnce(new AgendaUnavailableError());
    await settle(fixture);
    const alert = el.querySelector('app-agenda-panel app-alert')!;
    expect(alert.textContent).toContain('No se pudo cargar tu agenda');
    expect(
      el.querySelector('app-tasks-panel app-task-item, app-tasks-panel app-empty-state'),
    ).toBeNull();
    alert.querySelector<HTMLButtonElement>('app-button button')!.click();
    await settle(fixture);
    expect(repository.listEvents).toHaveBeenCalledTimes(2);
    expect(el.querySelector('app-agenda-panel app-alert')).toBeNull();
  });
});
