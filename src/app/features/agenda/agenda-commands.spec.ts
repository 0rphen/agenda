import { TestBed } from '@angular/core/testing';
import { EVENT_FORM_DEFAULTS } from '@shared/utils';
import { AgendaCommands } from './agenda-commands';
import { taskToForm } from './agenda-forms';
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
});
