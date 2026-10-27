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
    expect(JSON.parse(localStorage.getItem('agenda:v2:/events')!)).toHaveLength(events.length);
    expect(JSON.parse(localStorage.getItem('agenda:v2:/tasks')!)).toHaveLength(tasks.length);
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
      'agenda:v2:/tasks',
      JSON.stringify([{ id: 'x', title: 'Mía', done: false, list_color: 'red' }]),
    );
    expect(await repository.listTasks()).toEqual([
      expect.objectContaining({ id: 'x', title: 'Mía', listColor: 'red' }),
    ]);
  });

  it('setTaskDone persiste el cambio', async () => {
    const [first] = await repository.listTasks();
    await repository.setTaskDone(first.id, !first.done);
    const stored = JSON.parse(localStorage.getItem('agenda:v2:/tasks')!);
    expect(stored[0].done).toBe(!first.done);
  });

  it('SPEC 60 R2: no lee claves antiguas y la semilla trae subtareas en lista', async () => {
    localStorage.setItem(
      'agenda:/tasks',
      JSON.stringify([{ id: 'x', title: 'Vieja', done: false }]),
    );
    const tasks = await repository.listTasks();
    expect(tasks.some((task) => task.id === 'x')).toBe(false);
    const withSubtasks = tasks.find((task) => task.subtasks?.length);
    expect(withSubtasks?.subtasks?.[0]).toEqual({
      title: expect.any(String),
      done: expect.any(Boolean),
    });
  });

  it('SPEC 60 R3, R4: createEvent añade con id nuevo y lo devuelve como modelo', async () => {
    const before = await repository.listEvents();
    const created = await repository.createEvent({
      title: 'Dentista',
      date: '2026-10-22',
      start: '10:00',
      end: '11:00',
      people: [],
      confirmed: false,
      notes: 'Revisión',
    });
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(created).toEqual(expect.objectContaining({ title: 'Dentista', notes: 'Revisión' }));
    const stored = JSON.parse(localStorage.getItem('agenda:v2:/events')!);
    expect(stored).toHaveLength(before.length + 1);
    expect(stored.at(-1)).toEqual(
      expect.objectContaining({ id: created.id, all_day: false, start: '10:00' }),
    );
  });

  it('SPEC 60 R4: updateTask persiste todos los campos', async () => {
    const [first] = await repository.listTasks();
    await repository.updateTask({
      ...first,
      title: 'Nuevo',
      priority: 'alta',
      tags: ['a'],
      subtasks: [{ title: 'Paso', done: true }],
    });
    const stored = JSON.parse(localStorage.getItem('agenda:v2:/tasks')!);
    expect(stored[0]).toEqual(
      expect.objectContaining({
        id: first.id,
        title: 'Nuevo',
        priority: 'alta',
        tags: ['a'],
        subtasks: [{ title: 'Paso', done: true }],
      }),
    );
  });

  it('SPEC 60 R4: si setItem lanza, createEvent y updateTask rechazan con AgendaUnavailableError', async () => {
    const [first] = await repository.listTasks();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    await expect(
      repository.createEvent({ title: 'X', date: '2026-10-22', people: [], confirmed: false }),
    ).rejects.toBeInstanceOf(AgendaUnavailableError);
    await expect(repository.updateTask(first)).rejects.toBeInstanceOf(AgendaUnavailableError);
  });

  it('SPEC 67 R3: createTask añade con id nuevo y lo devuelve como modelo', async () => {
    const before = await repository.listTasks();
    const created = await repository.createTask({
      title: 'Comprar pan',
      done: false,
      due: '2026-10-27',
      list: 'Personal',
      listColor: 'orange',
    });
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(created).toEqual(expect.objectContaining({ title: 'Comprar pan', listColor: 'orange' }));
    const stored = JSON.parse(localStorage.getItem('agenda:v2:/tasks')!);
    expect(stored).toHaveLength(before.length + 1);
    expect(stored.at(-1)).toEqual(
      expect.objectContaining({ id: created.id, list_color: 'orange', due: '2026-10-27' }),
    );
  });

  it('SPEC 67 R4: si setItem lanza, createTask rechaza con AgendaUnavailableError', async () => {
    await repository.listTasks();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    await expect(repository.createTask({ title: 'X', done: false })).rejects.toBeInstanceOf(
      AgendaUnavailableError,
    );
  });

  it('si el JSON no es válido rechaza con AgendaUnavailableError y no reescribe', async () => {
    localStorage.setItem('agenda:v2:/events', '{');
    await expect(repository.listEvents()).rejects.toBeInstanceOf(AgendaUnavailableError);
    expect(localStorage.getItem('agenda:v2:/events')).toBe('{');
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
