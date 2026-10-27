import { TestBed } from '@angular/core/testing';
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
    vi.useFakeTimers({ toFake: ['Date'] });
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
    };
    TestBed.configureTestingModule({
      providers: [AgendaStore, HomeFacade, { provide: AgendaRepository, useValue: repository }],
    });
    facade = TestBed.inject(HomeFacade);
    await facade.load();
  });

  afterEach(() => vi.useRealTimers());

  const groupIds = () => facade.agendaGroups().map((group) => group.events.map((e) => e.id));

  it('today y selectedDay empiezan en la fecha local; range en day', () => {
    expect(facade.today).toBe('2026-10-22');
    expect(facade.selectedDay()).toBe('2026-10-22');
    expect(facade.range()).toBe('day');
    expect(facade.status()).toBe('ready');
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
});
