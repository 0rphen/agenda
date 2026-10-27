import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AgendaCommands } from '../../../agenda/agenda-commands';
import { AgendaRepository } from '../../../agenda/domain/agenda-repository';
import { Task } from '../../../agenda/domain/task.model';
import { AgendaStore } from '../../../agenda/store/agenda.store';
import { TASKS_ROUTES } from '../../tasks.routes';
import { TasksFacade } from '../../tasks.facade';
import { TasksPage } from './tasks-page';

const tasks: Task[] = [
  { id: 'hoy', title: 'Informe', due: '2026-10-22', done: false },
  { id: 'hecha', title: 'Fruta', due: '2026-10-21', done: true },
];

describe('TasksPage', () => {
  let repository: { [K in keyof AgendaRepository]: ReturnType<typeof vi.fn> };

  function setup() {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 22, 10));
    repository = {
      listEvents: vi.fn().mockResolvedValue([]),
      listTasks: vi.fn().mockResolvedValue(tasks),
      setTaskDone: vi.fn().mockResolvedValue(undefined),
      createEvent: vi.fn(),
      updateTask: vi.fn().mockResolvedValue(undefined),
      createTask: vi
        .fn()
        .mockResolvedValue({ id: 'nueva', title: 'Pan', due: '2026-10-22', done: false }),
    };
    TestBed.configureTestingModule({
      providers: [
        AgendaStore,
        AgendaCommands,
        TasksFacade,
        provideRouter([]),
        { provide: AgendaRepository, useValue: repository },
      ],
    });
    const fixture = TestBed.createComponent(TasksPage);
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  async function settle(fixture: ReturnType<typeof setup>['fixture']) {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  const headings = (el: HTMLElement) =>
    [...el.querySelectorAll('app-tasks-main .card__title')].map((t) => t.textContent?.trim());

  afterEach(() => vi.useRealTimers());

  it('R1: ruta con título, layout week y facade', () => {
    const [route] = TASKS_ROUTES;
    expect(route.component).toBe(TasksPage);
    expect(route.title).toBe('Tareas · Agenda');
    expect(route.data).toEqual({ layout: 'week' });
    expect(route.providers).toContain(TasksFacade);
  });

  it('R22: main y side como hijos directos con host tasks-page', () => {
    const { el } = setup();
    expect(el.classList).toContain('tasks-page');
    expect([...el.children].map((child) => child.localName)).toEqual([
      'app-tasks-main',
      'app-tasks-side',
    ]);
  });

  it('R2: no lee datos antes del primer render, que pinta esqueletos', () => {
    const { fixture, el } = setup();
    expect(repository.listTasks).not.toHaveBeenCalled();
    fixture.detectChanges();
    expect(el.querySelectorAll('app-skeleton-list')).toHaveLength(2);
  });

  it('R2: tras renderizar carga y pinta grupos; filtro, añadir y seleccionar', async () => {
    const { fixture, el } = setup();
    await settle(fixture);
    expect(repository.listTasks).toHaveBeenCalledTimes(1);
    expect(headings(el)).toEqual(['Hoy', 'Completadas']);

    el.querySelectorAll<HTMLButtonElement>('app-segmented-control button')[3].click();
    await settle(fixture);
    expect(headings(el)).toEqual(['Completadas']);

    const input = el.querySelector<HTMLInputElement>('form input')!;
    input.value = 'Pan';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await settle(fixture);
    expect(repository.createTask).toHaveBeenCalled();
    const detail = el.querySelectorAll('app-tasks-side app-card')[1];
    expect(detail.querySelector('.card__title')?.textContent?.trim()).toBe('Detalle de la tarea');
    expect(detail.querySelector<HTMLInputElement>('app-task-form input')!.value).toBe('Pan');
    expect(el.querySelector('app-tasks-side app-progress')?.textContent).toContain(
      '1 de 3 completadas',
    );
  });
});
