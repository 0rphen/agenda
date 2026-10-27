import { TestBed } from '@angular/core/testing';
import { EVENT_FORM_DEFAULTS } from '@shared/utils';
import { AgendaCommands } from './agenda-commands';
import { AgendaDialogs } from './agenda-dialogs';
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

describe('AgendaDialogs', () => {
  let dialogs: AgendaDialogs;
  let store: AgendaStore;
  let repository: Record<keyof AgendaRepository, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    repository = {
      listEvents: vi.fn().mockResolvedValue([]),
      listTasks: vi.fn().mockResolvedValue([task]),
      setTaskDone: vi.fn(),
      createEvent: vi.fn().mockResolvedValue(saved),
      updateTask: vi.fn().mockResolvedValue(undefined),
      createTask: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        AgendaStore,
        AgendaCommands,
        AgendaDialogs,
        { provide: AgendaRepository, useValue: repository },
      ],
    });
    dialogs = TestBed.inject(AgendaDialogs);
    store = TestBed.inject(AgendaStore);
    await TestBed.inject(AgendaCommands).load();
  });

  it('R1: openTask expone la tarea; guardar ok actualiza y cierra', async () => {
    dialogs.openTask('t1');
    expect(dialogs.editingTask()).toEqual(task);
    await dialogs.saveTask({ ...taskToForm(task), title: 'Nuevo' });
    expect(store.tasks()[0].title).toBe('Nuevo');
    expect(dialogs.editingTask()).toBeUndefined();
  });

  it('R1: si guardar la tarea falla sigue abierta con error; cerrar lo olvida', async () => {
    repository.updateTask.mockRejectedValue(new Error('x'));
    dialogs.openTask('t1');
    await dialogs.saveTask({ ...taskToForm(task), title: 'Nuevo' });
    expect(dialogs.editingTask()).toEqual(task);
    expect(dialogs.dialogError()).toBe(true);
    dialogs.closeTask();
    expect(dialogs.editingTask()).toBeUndefined();
    expect(dialogs.dialogError()).toBe(false);
  });

  it('R1: openNewEvent guarda el borrador recibido; guardar ok añade y cierra', async () => {
    dialogs.openNewEvent({ date: '2026-10-22', start: '10:00' });
    expect(dialogs.eventDraft()).toEqual({ date: '2026-10-22', start: '10:00' });
    await dialogs.saveEvent({ ...EVENT_FORM_DEFAULTS, title: 'Kickoff', date: '2026-10-22' });
    expect(store.events()).toEqual([saved]);
    expect(dialogs.eventDraft()).toBeUndefined();
  });

  it('R1: si guardar la cita falla sigue abierta con error; cerrar lo olvida', async () => {
    repository.createEvent.mockRejectedValue(new Error('x'));
    dialogs.openNewEvent({ date: '2026-10-22' });
    await dialogs.saveEvent(EVENT_FORM_DEFAULTS);
    expect(dialogs.eventDraft()).toEqual({ date: '2026-10-22' });
    expect(dialogs.dialogError()).toBe(true);
    dialogs.closeNewEvent();
    expect(dialogs.eventDraft()).toBeUndefined();
    expect(dialogs.dialogError()).toBe(false);
  });
});
