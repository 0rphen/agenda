import { TestBed } from '@angular/core/testing';
import { EVENT_FORM_DEFAULTS } from '@shared/utils';
import { AgendaCommands } from './agenda-commands';
import { AgendaDialogs } from './agenda-dialogs';
import { eventToForm, taskToForm } from './agenda-forms';
import { AgendaRepository } from './domain/agenda-repository';
import { CalendarEvent } from './domain/calendar-event.model';
import { Task } from './domain/task.model';
import { AgendaStore } from './store/agenda.store';
import { SETTINGS_DEFAULTS } from '../settings/domain/settings-options';
import { UserSettingsStore } from '../settings/store/user-settings.store';

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
    expect(dialogs.eventDraft()).toEqual({ date: '2026-10-22', start: '10:00', end: '10:30' });
    await dialogs.saveEvent({ ...EVENT_FORM_DEFAULTS, title: 'Kickoff', date: '2026-10-22' });
    expect(store.events()).toEqual([saved]);
    expect(dialogs.eventDraft()).toBeUndefined();
  });

  it('R1: si guardar la cita falla sigue abierta con error; cerrar lo olvida', async () => {
    repository.createEvent.mockRejectedValue(new Error('x'));
    dialogs.openNewEvent({ date: '2026-10-22' });
    await dialogs.saveEvent(EVENT_FORM_DEFAULTS);
    expect(dialogs.eventDraft()).toEqual({ date: '2026-10-22', start: '09:00', end: '09:30' });
    expect(dialogs.dialogError()).toBe(true);
    dialogs.closeNewEvent();
    expect(dialogs.eventDraft()).toBeUndefined();
    expect(dialogs.dialogError()).toBe(false);
  });

  it.each([
    ['15 min', '10:15'],
    ['45 min', '10:45'],
    ['1 hora', '11:00'],
  ])('SPEC 73 R6: con duración %s, el fin del borrador es %s', (duration, end) => {
    TestBed.inject(UserSettingsStore).set({
      ...SETTINGS_DEFAULTS,
      calendar: { ...SETTINGS_DEFAULTS.calendar, defaultDuration: duration },
    });
    dialogs.openNewEvent({ date: '2026-10-22', start: '10:00', end: '11:00' });
    expect(dialogs.eventDraft()).toEqual({ date: '2026-10-22', start: '10:00', end });
    dialogs.openNewEvent({ date: '2026-10-22', start: '23:50' });
    expect(dialogs.eventDraft()?.end).toBe('23:59');
  });

  describe('SPEC 71', () => {
    const event: CalendarEvent = { ...saved, id: 'e1', start: '09:00', end: '10:00' };
    beforeEach(() => store.addEvent(event));

    it('R12: openEditEvent expone la cita; guardar llama a updateEvent y cierra', async () => {
      dialogs.openEditEvent('e1');
      expect(dialogs.editingEvent()).toEqual(event);
      await dialogs.updateEvent({ ...eventToForm(event), title: 'Cambiada' });
      expect(repository.updateEvent).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'e1', title: 'Cambiada' }),
      );
      expect(store.events()[0].title).toBe('Cambiada');
      expect(dialogs.editingEvent()).toBeUndefined();
    });

    it('R12: si updateEvent falla sigue abierta con dialogError', async () => {
      repository.updateEvent.mockRejectedValue(new Error('x'));
      dialogs.openEditEvent('e1');
      await dialogs.updateEvent(eventToForm(event));
      expect(dialogs.editingEvent()).toEqual(event);
      expect(dialogs.dialogError()).toBe(true);
    });

    it('R3, R4: cancelar no borra; confirmar borra y cierra el Dialog de ese elemento', async () => {
      dialogs.openTask('t1');
      dialogs.askDeleteTask('t1');
      expect(dialogs.pendingDelete()).toEqual({ kind: 'task', id: 't1', title: 'Informe' });
      dialogs.cancelDelete();
      expect(dialogs.pendingDelete()).toBeUndefined();
      expect(repository.deleteTask).not.toHaveBeenCalled();
      expect(dialogs.editingTask()).toEqual(task);

      dialogs.askDeleteTask('t1');
      await expect(dialogs.confirmDelete()).resolves.toBe(true);
      expect(store.tasks()).toEqual([]);
      expect(dialogs.pendingDelete()).toBeUndefined();
      expect(dialogs.editingTask()).toBeUndefined();
    });

    it('R13: eliminar cita; R2: si falla la confirmación sigue abierta con deleteError', async () => {
      repository.deleteEvent.mockRejectedValueOnce(new Error('x'));
      dialogs.openEditEvent('e1');
      dialogs.askDeleteEvent('e1');
      expect(dialogs.pendingDelete()).toEqual({ kind: 'event', id: 'e1', title: 'Kickoff' });
      await expect(dialogs.confirmDelete()).resolves.toBe(false);
      expect(dialogs.deleteError()).toBe(true);
      expect(store.events()).toEqual([event]);
      await expect(dialogs.confirmDelete()).resolves.toBe(true);
      expect(store.events()).toEqual([]);
      expect(dialogs.editingEvent()).toBeUndefined();
      expect(dialogs.deleteError()).toBe(false);
    });

    it('askDelete de un id inexistente no abre nada', () => {
      dialogs.askDeleteEvent('nope');
      expect(dialogs.pendingDelete()).toBeUndefined();
    });
  });
});
