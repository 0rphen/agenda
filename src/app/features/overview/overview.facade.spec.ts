import { TestBed } from '@angular/core/testing';
import { AgendaUnavailableError } from '../agenda/domain/agenda-errors';
import { AgendaRepository } from '../agenda/domain/agenda-repository';
import { CalendarEvent } from '../agenda/domain/calendar-event.model';
import { Task } from '../agenda/domain/task.model';
import { AgendaStore } from '../agenda/store/agenda.store';
import { OverviewFacade } from './overview.facade';

const event = (id: string, date: string, start?: string, end?: string): CalendarEvent => ({
  id,
  title: id,
  date,
  start,
  end,
  people: [],
  confirmed: false,
});
const task = (id: string, due: string | undefined, done = false, list = 'Casa'): Task => ({
  id,
  title: id,
  due,
  list,
  done,
});

describe('OverviewFacade', () => {
  let facade: OverviewFacade;
  let repository: { [K in keyof AgendaRepository]: ReturnType<typeof vi.fn> };

  const setup = async (
    now: Date,
    events: CalendarEvent[] = [],
    tasks: Task[] = [],
  ): Promise<void> => {
    vi.setSystemTime(now);
    repository = {
      listEvents: vi.fn().mockResolvedValue(events),
      listTasks: vi.fn().mockResolvedValue(tasks),
      setTaskDone: vi.fn().mockResolvedValue(undefined),
    };
    TestBed.configureTestingModule({
      providers: [AgendaStore, OverviewFacade, { provide: AgendaRepository, useValue: repository }],
    });
    facade = TestBed.inject(OverviewFacade);
    await facade.load();
  };

  // Jueves 22 octubre 2026
  const at = (hour: number, minute = 0) => new Date(2026, 9, 22, hour, minute);

  beforeEach(() => vi.useFakeTimers({ toFake: ['Date'] }));
  afterEach(() => vi.useRealTimers());

  it.each([
    [8, 'Buenos días, César'],
    [12, 'Buenas tardes, César'],
    [19, 'Buenas tardes, César'],
    [20, 'Buenas noches, César'],
  ])('R11: a las %s h greeting es «%s»', async (hour, greeting) => {
    await setup(at(hour));
    expect(facade.greeting()).toBe(greeting);
  });

  it('R12: load() fija ahora; today sale de ese valor', async () => {
    await setup(at(23, 59));
    vi.setSystemTime(new Date(2026, 9, 23, 0, 1));
    expect(facade.today()).toBe('2026-10-22');
    await facade.load();
    expect(facade.today()).toBe('2026-10-23');
    expect(facade.greeting()).toBe('Buenos días, César');
  });

  describe('con datos', () => {
    beforeEach(() =>
      setup(
        at(10, 30),
        [
          event('tarde', '2026-10-22', '16:00', '18:15'),
          event('todo-el-dia', '2026-10-22'),
          event('reunion', '2026-10-22', '09:00', '10:00'),
          event('comida', '2026-10-22', '13:00', '14:00'),
          event('manana', '2026-10-23', '09:00', '10:00'),
        ],
        [
          task('vencida', '2026-10-20'),
          task('hoy', '2026-10-22'),
          task('hecha-hoy', '2026-10-22', true),
          task('sabado', '2026-10-24', true),
          task('futura', '2026-10-27'),
          task('sin-fecha', undefined),
        ],
      ),
    );

    it('R16: stats de hoy y de la semana', () => {
      expect(facade.stats()).toEqual({
        eventsToday: 4,
        nextStart: '13:00',
        pending: 4,
        dueToday: 1,
        reservedHours: '4,3 h',
        completed: 2,
        planned: 4,
      });
    });

    it('R16: horas reservadas sin «,0» y sin próxima cita', async () => {
      TestBed.resetTestingModule();
      await setup(at(11), [event('a', '2026-10-22', '09:00', '11:00')]);
      expect(facade.stats().reservedHours).toBe('2 h');
      expect(facade.stats().nextStart).toBeUndefined();
    });

    it('R19: nextEvent es el primero con hora desde ahora; badge relativo', () => {
      expect(facade.nextEvent()?.id).toBe('comida');
      expect(facade.nextEventBadge()).toBe('En 2 h 30 min');
    });

    it('R19: nextEvent de otro día; undefined si no hay', async () => {
      TestBed.resetTestingModule();
      await setup(at(19), [event('manana', '2026-10-23', '09:00', '10:00')]);
      expect(facade.nextEventBadge()).toBe('Mañana');
      TestBed.resetTestingModule();
      await setup(at(19));
      expect(facade.nextEvent()).toBeUndefined();
      expect(facade.nextEventBadge()).toBeUndefined();
    });

    it('R22: dueTasks pendientes con due ≤ hoy, por due', () => {
      expect(facade.dueTasks().map((t) => t.id)).toEqual(['vencida', 'hoy']);
    });

    it('R22: dueTasks máx. 5', async () => {
      TestBed.resetTestingModule();
      const tasks = Array.from({ length: 7 }, (_, i) => task(`t${i}`, `2026-10-1${i}`));
      await setup(at(10), [], tasks);
      expect(facade.dueTasks().map((t) => t.id)).toEqual(['t0', 't1', 't2', 't3', 't4']);
    });

    it('todayEvents: todo el día primero y luego por hora; eventDays sin repetir', () => {
      expect(facade.todayEvents().map((e) => e.id)).toEqual([
        'todo-el-dia',
        'reunion',
        'comida',
        'tarde',
      ]);
      expect(facade.eventDays()).toEqual(['2026-10-22', '2026-10-23']);
    });

    it('weekProgress de la semana de hoy', () => {
      expect(facade.weekProgress()).toEqual([{ list: 'Casa', value: 50 }]);
    });

    it('R31: sin solape, conflict undefined', () => {
      expect(facade.conflict()).toBeUndefined();
    });

    it('R13, R23: toggleTask actualiza al momento, llama al repo y la quita de dueTasks', async () => {
      const pending = facade.toggleTask('hoy', true);
      expect(facade.dueTasks().map((t) => t.id)).toEqual(['vencida']);
      expect(facade.stats().completed).toBe(3);
      await pending;
      expect(repository.setTaskDone).toHaveBeenCalledWith('hoy', true);
      expect(facade.saveError()).toBe(false);
    });

    it('R13: si setTaskDone rechaza, revierte y fija saveError', async () => {
      repository.setTaskDone.mockRejectedValue(new AgendaUnavailableError());
      await facade.toggleTask('hoy', true);
      expect(facade.dueTasks().map((t) => t.id)).toEqual(['vencida', 'hoy']);
      expect(facade.saveError()).toBe(true);
      facade.dismissSaveError();
      expect(facade.saveError()).toBe(false);
    });

    it('si load rechaza, status es error', async () => {
      repository.listEvents.mockRejectedValue(new AgendaUnavailableError());
      await facade.load();
      expect(facade.status()).toBe('error');
    });
  });

  it('R31: primer par solapado de hoy por start', async () => {
    await setup(at(8), [
      event('Revisión', '2026-10-22', '11:00', '12:00'),
      event('Reunión', '2026-10-22', '09:00', '10:00'),
      event('Llamada', '2026-10-22', '09:30', '09:45'),
      event('Café', '2026-10-22', '11:30', '12:30'),
      event('Mañana', '2026-10-23', '09:00', '10:00'),
    ]);
    expect(facade.conflict()).toEqual({ time: '09:30', first: 'Reunión', second: 'Llamada' });
  });
});
