import { TestBed } from '@angular/core/testing';
import { localIso } from '@shared/utils';
import { AgendaUnavailableError } from '../domain/agenda-errors';
import { AgendaLocalRepository } from './agenda-local-repository';

describe('AgendaLocalRepository', () => {
  let repository: AgendaLocalRepository;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [AgendaLocalRepository] });
    repository = TestBed.inject(AgendaLocalRepository);
  });

  afterEach(() => vi.restoreAllMocks());

  it('con almacenamiento vacío escribe la semilla y la devuelve', async () => {
    const events = await repository.listEvents();
    const tasks = await repository.listTasks();
    expect(JSON.parse(localStorage.getItem('agenda:/events')!)).toHaveLength(events.length);
    expect(JSON.parse(localStorage.getItem('agenda:/tasks')!)).toHaveLength(tasks.length);
    expect(events.length).toBeGreaterThanOrEqual(6);
    expect(new Set(tasks.map((task) => task.list)).size).toBe(3);
  });

  it('la semilla es relativa a hoy', async () => {
    const today = localIso(new Date());
    const events = await repository.listEvents();
    const tasks = await repository.listTasks();
    expect(events.some((event) => event.date === today && !event.start)).toBe(true);
    expect(events.some((event) => event.people.length > 0 && event.confirmed)).toBe(true);
    expect(tasks.some((task) => task.due === today)).toBe(true);
    expect(tasks.some((task) => task.done)).toBe(true);
  });

  it('lee lo guardado sin reescribir la semilla', async () => {
    localStorage.setItem(
      'agenda:/tasks',
      JSON.stringify([{ id: 'x', title: 'Mía', done: false, list_color: 'red' }]),
    );
    expect(await repository.listTasks()).toEqual([
      expect.objectContaining({ id: 'x', title: 'Mía', listColor: 'red' }),
    ]);
  });

  it('setTaskDone persiste el cambio', async () => {
    const [first] = await repository.listTasks();
    await repository.setTaskDone(first.id, !first.done);
    const stored = JSON.parse(localStorage.getItem('agenda:/tasks')!);
    expect(stored[0].done).toBe(!first.done);
  });

  it('si el JSON no es válido rechaza con AgendaUnavailableError y no reescribe', async () => {
    localStorage.setItem('agenda:/events', '{');
    await expect(repository.listEvents()).rejects.toBeInstanceOf(AgendaUnavailableError);
    expect(localStorage.getItem('agenda:/events')).toBe('{');
  });

  it('si setItem lanza rechaza con AgendaUnavailableError', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    await expect(repository.listTasks()).rejects.toBeInstanceOf(AgendaUnavailableError);
  });

  it('si getItem lanza rechaza con AgendaUnavailableError', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    await expect(repository.setTaskDone('t1', true)).rejects.toBeInstanceOf(AgendaUnavailableError);
  });
});
