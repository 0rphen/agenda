import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { taskToForm } from '../agenda/agenda-forms';
import { AgendaCommands } from '../agenda/agenda-commands';
import { AgendaDialogs } from '../agenda/agenda-dialogs';
import { Clock } from '../agenda/clock';
import { AgendaRepository } from '../agenda/domain/agenda-repository';
import { Task } from '../agenda/domain/task.model';
import { AgendaStore } from '../agenda/store/agenda.store';
import { TasksFacade } from './tasks.facade';

const task = (id: string, due?: string, done = false): Task => ({ id, title: id, due, done });

describe('TasksFacade', () => {
  let facade: TasksFacade;
  let now: ReturnType<typeof signal<Date>>;
  let repository: { [K in keyof AgendaRepository]: ReturnType<typeof vi.fn> };

  const keys = () => facade.groups().map((group) => group.key);
  const ids = () => facade.groups().map((group) => group.tasks.map((t) => t.id));

  beforeEach(async () => {
    // Jueves 22 octubre 2026
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 22, 10));
    now = signal(new Date(2026, 9, 22, 10));
    repository = {
      listEvents: vi.fn().mockResolvedValue([]),
      listTasks: vi
        .fn()
        .mockResolvedValue([
          task('sin-fecha'),
          task('lunes', '2026-10-26'),
          task('hoy', '2026-10-22'),
          task('ayer', '2026-10-21'),
          task('hecha-tarde', '2026-10-30', true),
          task('antes', '2026-10-15'),
          task('hecha', '2026-10-20', true),
          task('viernes', '2026-10-23'),
        ]),
      setTaskDone: vi.fn().mockResolvedValue(undefined),
      createEvent: vi.fn(),
      updateTask: vi.fn().mockResolvedValue(undefined),
      deleteTask: vi.fn().mockResolvedValue(undefined),
      updateEvent: vi.fn().mockResolvedValue(undefined),
      deleteEvent: vi.fn().mockResolvedValue(undefined),
      createTask: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        AgendaStore,
        AgendaCommands,
        AgendaDialogs,
        TasksFacade,
        provideRouter([]),
        { provide: AgendaRepository, useValue: repository },
        { provide: Clock, useValue: { now } },
      ],
    });
    facade = TestBed.inject(TasksFacade);
    await facade.load();
  });

  afterEach(() => vi.useRealTimers());

  it('R5: estado inicial', () => {
    expect(facade.today()).toBe('2026-10-22');
    expect(facade.status()).toBe('ready');
    expect(facade.filter()).toBe('todas');
    expect(facade.selectedTask()).toBeUndefined();
    expect(facade.detailError()).toBe(false);
  });

  it('R2 (SPEC 84): al pasar a mañana, «hoy» va a Vencidas y «viernes» a Hoy', () => {
    now.set(new Date(2026, 9, 23, 0, 0));
    expect(facade.today()).toBe('2026-10-23');
    expect(ids().slice(0, 2)).toEqual([['antes', 'ayer', 'hoy'], ['viernes']]);
    expect(facade.dueTodayCount()).toBe(1);
  });

  it('R6: grupos Vencidas · Hoy · Próximas · Completadas, por fecha y sin fecha al final', () => {
    expect(facade.groups().map((group) => group.heading)).toEqual([
      'Vencidas',
      'Hoy',
      'Próximas',
      'Completadas',
    ]);
    expect(ids()).toEqual([
      ['antes', 'ayer'],
      ['hoy'],
      ['viernes', 'lunes', 'sin-fecha'],
      ['hecha', 'hecha-tarde'],
    ]);
  });

  it('R6: los grupos vacíos no aparecen', async () => {
    repository.listTasks.mockResolvedValue([task('hoy', '2026-10-22')]);
    await facade.load();
    expect(keys()).toEqual(['today']);
  });

  it('R7: filtros', async () => {
    await facade.setFilter('hoy');
    expect(keys()).toEqual(['today']);
    await facade.setFilter('pendientes');
    expect(keys()).toEqual(['late', 'today', 'next']);
    await facade.setFilter('hechas');
    expect(keys()).toEqual(['done']);
    await facade.setFilter('todas');
    expect(keys()).toEqual(['late', 'today', 'next', 'done']);
  });

  it('SPEC 71 R7: el filtro se escribe y se lee en ?filtro=; ausente o inválido = todas', async () => {
    const router = TestBed.inject(Router);
    await facade.setFilter('hechas');
    expect(router.url).toBe('/?filtro=hechas');
    await facade.setFilter('todas');
    expect(router.url).toBe('/');
    await router.navigateByUrl('/?filtro=pendientes');
    expect(facade.filter()).toBe('pendientes');
    await router.navigateByUrl('/?filtro=toString');
    expect(facade.filter()).toBe('todas');
  });

  it('SPEC 71 R5, R6: eliminar pide confirmación; al confirmar la seleccionada desaparece', async () => {
    const dialogs = TestBed.inject(AgendaDialogs);
    facade.selectTask('hoy');
    facade.askDeleteTask('hoy');
    expect(dialogs.pendingDelete()).toEqual({ kind: 'task', id: 'hoy', title: 'hoy' });
    expect(repository.deleteTask).not.toHaveBeenCalled();
    await dialogs.confirmDelete();
    expect(repository.deleteTask).toHaveBeenCalledWith('hoy');
    expect(facade.selectedTask()).toBeUndefined();
    expect(keys()).not.toContain('today');
  });

  it('SPEC 71 R8: clearSelection deselecciona sin guardar', () => {
    facade.selectTask('hoy');
    facade.clearSelection();
    expect(facade.selectedTask()).toBeUndefined();
    expect(repository.updateTask).not.toHaveBeenCalled();
  });

  it('R8: contadores y progreso', async () => {
    expect(facade.pendingCount()).toBe(6);
    expect(facade.dueTodayCount()).toBe(1);
    expect(facade.progress()).toEqual({ done: 2, total: 8, value: 25 });
    repository.listTasks.mockResolvedValue([]);
    await facade.load();
    expect(facade.progress()).toEqual({ done: 0, total: 0, value: 0 });
  });

  it('R8: marcar una tarea la mueve a Completadas', async () => {
    await facade.toggleTask('hoy', true);
    expect(keys()).not.toContain('today');
    expect(facade.pendingCount()).toBe(5);
  });

  it('R9: addTask crea con fecha de hoy y la selecciona', async () => {
    const created = task('nueva', '2026-10-22');
    repository.createTask.mockResolvedValue(created);
    await facade.addTask(' Nueva ');
    expect(repository.createTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Nueva', due: '2026-10-22' }),
    );
    expect(facade.selectedTask()).toEqual(created);
    expect(ids()[1]).toEqual(['hoy', 'nueva']);
  });

  it('R9: addTask con título vacío no hace nada', async () => {
    await facade.addTask('   ');
    expect(repository.createTask).not.toHaveBeenCalled();
  });

  it('R10: saveTask guarda la seleccionada y la mantiene', async () => {
    facade.selectTask('hoy');
    await facade.saveTask({ ...taskToForm(task('hoy', '2026-10-22')), title: 'Cambiada' });
    expect(repository.updateTask).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'hoy', title: 'Cambiada' }),
    );
    expect(facade.selectedTask()?.title).toBe('Cambiada');
  });

  it('R10: si saveTask rechaza, detailError hasta la siguiente selección', async () => {
    repository.updateTask.mockRejectedValue(new Error('x'));
    facade.selectTask('hoy');
    await facade.saveTask(taskToForm(task('hoy', '2026-10-22')));
    expect(facade.detailError()).toBe(true);
    expect(facade.selectedTask()?.id).toBe('hoy');
    facade.selectTask('ayer');
    expect(facade.detailError()).toBe(false);
  });
});
