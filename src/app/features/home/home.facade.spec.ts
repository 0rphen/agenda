import { TestBed } from '@angular/core/testing';
import { EVENT_FORM_DEFAULTS } from '@shared/utils';
import { taskToForm } from '../agenda/agenda-forms';
import { AgendaCommands } from '../agenda/agenda-commands';
import { AgendaDialogs } from '../agenda/agenda-dialogs';
import { AgendaRepository } from '../agenda/domain/agenda-repository';
import { AgendaUnavailableError } from '../agenda/domain/agenda-errors';
import { CalendarEvent } from '../agenda/domain/calendar-event.model';
import { Task } from '../agenda/domain/task.model';
import { HomeFacade } from './home.facade';
import { AgendaStore } from '../agenda/store/agenda.store';

const event = (id: string, date: string, start?: string): CalendarEvent => ({
  id,
  title: id,
  date,
  start,
  end: start,
  people: [],
  confirmed: false,
});
const task = (id: string, due: string, list: string, done = false): Task => ({
  id,
  title: id,
  due,
  list,
  done,
});

describe('HomeFacade', () => {
  let facade: HomeFacade;
  let repository: { [K in keyof AgendaRepository]: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    // Jueves 22 octubre 2026, 10:00 local
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    vi.setSystemTime(new Date(2026, 9, 22, 10));
    repository = {
      listEvents: vi
        .fn()
        .mockResolvedValue([
          event('tarde', '2026-10-22', '16:00'),
          event('todo-el-dia', '2026-10-22'),
          event('manana', '2026-10-22', '08:00'),
          event('lunes', '2026-10-19', '09:00'),
          event('domingo', '2026-10-25', '09:00'),
          event('siguiente', '2026-10-27', '09:00'),
          event('lejos', '2026-11-05', '09:00'),
        ]),
      listTasks: vi
        .fn()
        .mockResolvedValue([
          task('hecha', '2026-10-22', 'Casa', true),
          task('pendiente', '2026-10-22', 'Trabajo'),
          task('otra', '2026-10-22', 'Casa'),
          task('semana', '2026-10-24', 'Casa', true),
          task('fuera', '2026-10-27', 'Trabajo', true),
        ]),
      setTaskDone: vi.fn().mockResolvedValue(undefined),
      createEvent: vi.fn(),
      updateTask: vi.fn(),
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
        HomeFacade,
        { provide: AgendaRepository, useValue: repository },
      ],
    });
    facade = TestBed.inject(HomeFacade);
    await facade.load();
  });

  afterEach(() => vi.useRealTimers());

  const groupIds = () => facade.agendaGroups().map((group) => group.events.map((e) => e.id));

  it('today y selectedDay empiezan en la fecha local; range en day', () => {
    expect(facade.today()).toBe('2026-10-22');
    expect(facade.selectedDay()).toBe('2026-10-22');
    expect(facade.range()).toBe('day');
    expect(facade.status()).toBe('ready');
  });

  it('SPEC 72 R4: a medianoche today avanza; selectedDay se queda', () => {
    vi.setSystemTime(new Date(2026, 9, 22, 23, 59));
    vi.advanceTimersByTime(60_000);
    expect(facade.today()).toBe('2026-10-23');
    expect(facade.selectedDay()).toBe('2026-10-22');
  });

  it('day: todo el día primero y luego por hora, con título largo', () => {
    expect(groupIds()).toEqual([['todo-el-dia', 'manana', 'tarde']]);
    expect(facade.agendaGroups()[0].title).toBe('Jueves 22 octubre');
  });

  it('week: lunes a domingo de la semana elegida, días ascendentes', () => {
    facade.setRange('week');
    expect(facade.agendaGroups().map((group) => group.day)).toEqual([
      '2026-10-19',
      '2026-10-22',
      '2026-10-25',
    ]);
  });

  it('next: la semana siguiente', () => {
    facade.setRange('next');
    expect(groupIds()).toEqual([['siguiente']]);
  });

  it('selectDay mueve el rango y las tareas', () => {
    facade.selectDay('2026-11-05');
    expect(groupIds()).toEqual([['lejos']]);
    expect(facade.dayTasks()).toEqual([]);
    expect(facade.pendingCount()).toBe(0);
  });

  it('eventDays lista días con eventos sin repetir', () => {
    expect(facade.eventDays()).toHaveLength(5);
  });

  it('dayTasks: solo el día elegido, pendientes primero; pendingCount', () => {
    expect(facade.dayTasks().map((t) => t.id)).toEqual(['pendiente', 'otra', 'hecha']);
    expect(facade.pendingCount()).toBe(2);
  });

  it('weekProgress: por lista alfabética en la semana del día elegido', () => {
    expect(facade.weekProgress()).toEqual([
      { list: 'Casa', value: 67 },
      { list: 'Trabajo', value: 0 },
    ]);
    facade.selectDay('2026-11-10');
    expect(facade.weekProgress()).toEqual([]);
  });

  it('toggleTask actualiza al momento y llama al repositorio', async () => {
    const pending = facade.toggleTask('pendiente', true);
    expect(facade.pendingCount()).toBe(1);
    await pending;
    expect(repository.setTaskDone).toHaveBeenCalledWith('pendiente', true);
    expect(facade.saveError()).toBe(false);
  });

  it('si setTaskDone rechaza, revierte y fija saveError', async () => {
    repository.setTaskDone.mockRejectedValue(new AgendaUnavailableError());
    await facade.toggleTask('pendiente', true);
    expect(facade.dayTasks().find((t) => t.id === 'pendiente')?.done).toBe(false);
    expect(facade.saveError()).toBe(true);
    facade.dismissSaveError();
    expect(facade.saveError()).toBe(false);
  });

  it('si load rechaza, status es error', async () => {
    repository.listEvents.mockRejectedValue(new AgendaUnavailableError());
    await facade.load();
    expect(facade.status()).toBe('error');
  });

  describe('SPEC 60: Dialog de tarea', () => {
    const value = (title: string) => ({
      ...taskToForm(task('pendiente', '2026-10-22', 'Trabajo')),
      title,
    });

    it('R12, R13: openTask expone la tarea abierta', () => {
      facade.openTask('pendiente');
      expect(facade.editingTask()?.id).toBe('pendiente');
      expect(facade.dialogError()).toBe(false);
    });

    it('R14: guardar ok actualiza la lista y cierra', async () => {
      repository.updateTask.mockResolvedValue(undefined);
      facade.openTask('pendiente');
      await facade.saveTask(value('Cambiada'));
      expect(repository.updateTask).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'pendiente', title: 'Cambiada' }),
      );
      expect(facade.editingTask()).toBeUndefined();
      expect(facade.dayTasks().map((t) => t.title)).toContain('Cambiada');
    });

    it('R15: si guardar falla sigue abierta con error y sin cambios', async () => {
      repository.updateTask.mockRejectedValue(new AgendaUnavailableError('x'));
      facade.openTask('pendiente');
      await facade.saveTask(value('Cambiada'));
      expect(facade.editingTask()?.title).toBe('pendiente');
      expect(facade.dialogError()).toBe(true);
    });

    it('R16: cerrar olvida tarea y error sin guardar', async () => {
      repository.updateTask.mockRejectedValue(new AgendaUnavailableError('x'));
      facade.openTask('pendiente');
      await facade.saveTask(value('Cambiada'));
      facade.closeTask();
      expect(facade.editingTask()).toBeUndefined();
      expect(facade.dialogError()).toBe(false);
      expect(repository.updateTask).toHaveBeenCalledTimes(1);
    });
  });

  describe('SPEC 60: Dialog de cita', () => {
    const value = { ...EVENT_FORM_DEFAULTS, title: 'Nueva', date: '2026-10-24' };

    it('R17: openNewEvent propone el día seleccionado', () => {
      facade.selectDay('2026-10-24');
      facade.openNewEvent();
      expect(facade.eventDraft()).toEqual({ date: '2026-10-24', start: '09:00', end: '09:30' });
    });

    it('R18: guardar ok añade la cita a la agenda y cierra', async () => {
      repository.createEvent.mockResolvedValue(event('nueva', '2026-10-24', '09:00'));
      facade.selectDay('2026-10-24');
      facade.openNewEvent();
      await facade.saveEvent(value);
      expect(facade.eventDraft()).toBeUndefined();
      expect(facade.eventDays()).toContain('2026-10-24');
      expect(facade.agendaGroups()[0].events.map((e) => e.id)).toEqual(['nueva']);
    });

    it('R19: si guardar falla sigue abierta con error', async () => {
      repository.createEvent.mockRejectedValue(new AgendaUnavailableError('x'));
      facade.openNewEvent();
      await facade.saveEvent(value);
      expect(facade.eventDraft()).toEqual({ date: '2026-10-22', start: '09:00', end: '09:30' });
      expect(facade.dialogError()).toBe(true);
    });

    it('R20: cerrar olvida borrador y error', async () => {
      repository.createEvent.mockRejectedValue(new AgendaUnavailableError('x'));
      facade.openNewEvent();
      await facade.saveEvent(value);
      facade.closeNewEvent();
      expect(facade.eventDraft()).toBeUndefined();
      expect(facade.dialogError()).toBe(false);
    });
  });

  it('SPEC 71 R9, R10: addTask crea en el día seleccionado; vacío o fallo devuelve false', async () => {
    facade.selectDay('2026-10-24');
    expect(await facade.addTask('  ')).toBe(false);
    expect(repository.createTask).not.toHaveBeenCalled();
    repository.createTask.mockResolvedValueOnce(task('nueva', '2026-10-24', 'Personal'));
    expect(await facade.addTask('Nueva')).toBe(true);
    expect(repository.createTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Nueva', due: '2026-10-24' }),
    );
    repository.createTask.mockRejectedValueOnce(new Error('x'));
    expect(await facade.addTask('Otra')).toBe(false);
    expect(facade.saveError()).toBe(true);
  });

  it('SPEC 71 R12, R13: editEvent abre «Editar cita»; askDeleteEvent pide confirmación', () => {
    const dialogs = TestBed.inject(AgendaDialogs);
    facade.editEvent('tarde');
    expect(dialogs.editingEvent()?.id).toBe('tarde');
    facade.askDeleteEvent('tarde');
    expect(dialogs.pendingDelete()).toEqual({ kind: 'event', id: 'tarde', title: 'tarde' });
  });
});
