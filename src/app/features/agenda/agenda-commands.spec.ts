import { TestBed } from '@angular/core/testing';
import { EVENT_FORM_DEFAULTS } from '@shared/utils';
import { AgendaCommands } from './agenda-commands';
import { eventToForm, taskToForm } from './agenda-forms';
import { AgendaRepository } from './domain/agenda-repository';
import { CalendarEvent } from './domain/calendar-event.model';
import { Task } from './domain/task.model';
import { AgendaStore } from './store/agenda.store';

const task: Task = { id: 't1', title: 'Informe', done: false, list: 'Trabajo' };
const saved: CalendarEvent = {
  id: 'nuevo',
  title: 'Kickoff',
  date: '2026-10-22',
  people: [],
  confirmed: false,
};

describe('AgendaCommands', () => {
  let commands: AgendaCommands;
  let store: AgendaStore;
  let repository: Record<keyof AgendaRepository, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    repository = {
      listEvents: vi.fn().mockResolvedValue([]),
      listTasks: vi.fn().mockResolvedValue([task]),
      setTaskDone: vi.fn().mockResolvedValue(undefined),
      createEvent: vi.fn().mockResolvedValue(saved),
      updateTask: vi.fn().mockResolvedValue(undefined),
      deleteTask: vi.fn().mockResolvedValue(undefined),
      updateEvent: vi.fn().mockResolvedValue(undefined),
      deleteEvent: vi.fn().mockResolvedValue(undefined),
      createTask: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [AgendaStore, AgendaCommands, { provide: AgendaRepository, useValue: repository }],
    });
    commands = TestBed.inject(AgendaCommands);
    store = TestBed.inject(AgendaStore);
    await commands.load();
  });

  it('R9: load llena el store', () => {
    expect(store.status()).toBe('ready');
    expect(store.tasks()).toEqual([task]);
  });

  it('R9: toggleTask optimista; si falla revierte y marca saveError', async () => {
    repository.setTaskDone.mockRejectedValue(new Error('x'));
    await commands.toggleTask('t1', true);
    expect(store.tasks()[0].done).toBe(false);
    expect(commands.saveError()).toBe(true);
    commands.dismissSaveError();
    expect(commands.saveError()).toBe(false);
  });

  it('R10: createEvent guarda la conversión y añade lo devuelto al store', async () => {
    await commands.createEvent({ ...EVENT_FORM_DEFAULTS, title: 'Kickoff', date: '2026-10-22' });
    expect(repository.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Kickoff', start: '09:00', confirmed: false }),
    );
    expect(store.events()).toEqual([saved]);
  });

  it('R10: si createEvent rechaza, relanza sin tocar el store', async () => {
    repository.createEvent.mockRejectedValue(new Error('x'));
    await expect(commands.createEvent(EVENT_FORM_DEFAULTS)).rejects.toThrow('x');
    expect(store.events()).toEqual([]);
  });

  it('R11: updateTask guarda la tarea convertida y la sustituye en el store', async () => {
    await commands.updateTask('t1', { ...taskToForm(task), title: 'Nuevo', list: 'Casa' });
    const expected = expect.objectContaining({ id: 't1', title: 'Nuevo', listColor: 'green' });
    expect(repository.updateTask).toHaveBeenCalledWith(expected);
    expect(store.tasks()).toEqual([expected]);
  });

  it('R11: si updateTask rechaza, relanza sin tocar el store', async () => {
    repository.updateTask.mockRejectedValue(new Error('x'));
    await expect(
      commands.updateTask('t1', { ...taskToForm(task), title: 'Nuevo' }),
    ).rejects.toThrow('x');
    expect(store.tasks()).toEqual([task]);
  });

  it('SPEC 67 R3: createTask guarda con título recortado, lista Personal y la añade al store', async () => {
    const created: Task = { id: 'n1', title: 'Comprar pan', done: false, due: '2026-10-27' };
    repository.createTask.mockResolvedValue(created);
    await expect(commands.createTask('  Comprar pan ', '2026-10-27')).resolves.toEqual(created);
    expect(repository.createTask).toHaveBeenCalledWith({
      title: 'Comprar pan',
      done: false,
      due: '2026-10-27',
      list: 'Personal',
      listColor: 'orange',
    });
    expect(store.tasks()).toEqual([task, created]);
  });

  it('SPEC 67 R4: si createTask rechaza, marca saveError sin tocar el store', async () => {
    repository.createTask.mockRejectedValue(new Error('x'));
    await expect(commands.createTask('X', '2026-10-27')).resolves.toBeUndefined();
    expect(commands.saveError()).toBe(true);
    expect(store.tasks()).toEqual([task]);
  });

  it('SPEC 71 R2: deleteTask borra en el repositorio y quita del store; si falla relanza', async () => {
    repository.deleteTask.mockRejectedValueOnce(new Error('x'));
    await expect(commands.deleteTask('t1')).rejects.toThrow('x');
    expect(store.tasks()).toEqual([task]);
    await commands.deleteTask('t1');
    expect(repository.deleteTask).toHaveBeenCalledWith('t1');
    expect(store.tasks()).toEqual([]);
  });

  it('SPEC 71 R2: deleteEvent y updateEvent; si fallan el store no cambia', async () => {
    const event: CalendarEvent = {
      ...saved,
      id: 'e1',
      start: '09:00',
      tint: 'mint',
      confirmed: true,
    };
    store.addEvent(event);
    repository.updateEvent.mockRejectedValueOnce(new Error('x'));
    const value = { ...eventToForm(event), title: 'Cambiada', start: '16:00', end: '17:00' };
    await expect(commands.updateEvent('e1', value)).rejects.toThrow('x');
    expect(store.events()).toEqual([event]);

    await commands.updateEvent('e1', value);
    const updated = { ...event, title: 'Cambiada', start: '16:00', end: '17:00' };
    expect(repository.updateEvent).toHaveBeenCalledWith(expect.objectContaining(updated));
    expect(store.events()).toEqual([expect.objectContaining(updated)]);

    repository.deleteEvent.mockRejectedValueOnce(new Error('x'));
    await expect(commands.deleteEvent('e1')).rejects.toThrow('x');
    expect(store.events()).toHaveLength(1);
    await commands.deleteEvent('e1');
    expect(store.events()).toEqual([]);
  });
});
