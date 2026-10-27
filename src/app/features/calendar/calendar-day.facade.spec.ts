import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AgendaCommands } from '../agenda/agenda-commands';
import { AgendaDialogs } from '../agenda/agenda-dialogs';
import { AgendaRepository } from '../agenda/domain/agenda-repository';
import { CalendarEvent } from '../agenda/domain/calendar-event.model';
import { Task } from '../agenda/domain/task.model';
import { AgendaStore } from '../agenda/store/agenda.store';
import { CalendarDayFacade } from './calendar-day.facade';

const event = (id: string, date: string, start?: string, end?: string): CalendarEvent => ({
  id,
  title: id,
  date,
  start,
  end,
  category: 'violet',
  categoryLabel: 'Estrategia',
  tint: 'lilac',
  location: 'Sala 2',
  people: ['Ana López'],
  confirmed: false,
});
const task = (id: string, due: string, done = false): Task => ({ id, title: id, due, done });

describe('CalendarDayFacade', () => {
  let facade: CalendarDayFacade;
  let query: BehaviorSubject<ParamMap>;
  let dialogs: AgendaDialogs;

  async function setup(params: Record<string, string> = {}) {
    query = new BehaviorSubject(convertToParamMap(params));
    const repository: { [K in keyof AgendaRepository]: ReturnType<typeof vi.fn> } = {
      listEvents: vi
        .fn()
        .mockResolvedValue([
          event('kickoff', '2026-10-22', '10:00', '11:00'),
          event('viaje', '2026-10-22'),
          event('otro', '2026-10-23', '09:00', '10:00'),
        ]),
      listTasks: vi
        .fn()
        .mockResolvedValue([
          task('hecha', '2026-10-22', true),
          task('pendiente', '2026-10-22'),
          task('mañana', '2026-10-23'),
        ]),
      setTaskDone: vi.fn().mockResolvedValue(undefined),
      createEvent: vi.fn(),
      updateTask: vi.fn(),
      createTask: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        AgendaStore,
        AgendaCommands,
        AgendaDialogs,
        CalendarDayFacade,
        { provide: AgendaRepository, useValue: repository },
        { provide: ActivatedRoute, useValue: { queryParamMap: query } },
      ],
    });
    facade = TestBed.inject(CalendarDayFacade);
    dialogs = TestBed.inject(AgendaDialogs);
    await facade.load();
  }

  const navigate = (fecha: string) => query.next(convertToParamMap({ fecha }));

  beforeEach(() => {
    // Jueves 22 octubre 2026, 10:30 local
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 22, 10, 30));
  });
  afterEach(() => vi.useRealTimers());

  it('R7: sin fecha muestra hoy', async () => {
    await setup();
    expect(facade.today).toBe('2026-10-22');
    expect(facade.day()).toBe('2026-10-22');
    expect(facade.isToday()).toBe(true);
  });

  it('R7: fecha válida en la URL; inválida vuelve a hoy', async () => {
    await setup({ fecha: '2026-10-23' });
    expect(facade.day()).toBe('2026-10-23');
    expect(facade.isToday()).toBe(false);
    navigate('2026-02-30');
    expect(facade.day()).toBe('2026-10-22');
  });

  it('R13: now «HH:MM» solo en hoy', async () => {
    await setup();
    expect(facade.now()).toBe('10:30');
    navigate('2026-10-23');
    expect(facade.now()).toBeUndefined();
  });

  it('R14: dayEvents con hora como DayViewEvent; allDayEvents sin hora', async () => {
    await setup();
    expect(facade.dayEvents()).toEqual([
      {
        id: 'kickoff',
        start: '10:00',
        end: '11:00',
        title: 'kickoff',
        tint: 'lilac',
        category: 'Estrategia',
        location: 'Sala 2',
        people: ['Ana López'],
        selected: false,
      },
    ]);
    expect(facade.allDayEvents()).toEqual([{ title: 'viaje', category: 'violet' }]);
    expect(facade.eventDays()).toEqual(['2026-10-22', '2026-10-23']);
  });

  it('R14, R17: selectEvent marca una cita; cambiar de día lo limpia', async () => {
    await setup();
    facade.selectEvent('kickoff');
    expect(facade.selectedEventId()).toBe('kickoff');
    expect(facade.dayEvents()[0].selected).toBe(true);
    navigate('2026-10-23');
    expect(facade.selectedEventId()).toBeUndefined();
    expect(facade.dayEvents()[0].selected).toBe(false);
  });

  it('R15: dayTasks del día, pendientes primero; pendingCount', async () => {
    await setup();
    expect(facade.dayTasks().map((t) => t.id)).toEqual(['pendiente', 'hecha']);
    expect(facade.pendingCount()).toBe(1);
    await facade.toggleTask('pendiente', true);
    expect(facade.pendingCount()).toBe(0);
  });

  it('R16: openNewEvent propone el día; openSlot día y hora con fin una hora después', async () => {
    await setup({ fecha: '2026-10-23' });
    facade.openNewEvent();
    expect(dialogs.eventDraft()).toEqual({ date: '2026-10-23' });
    facade.openSlot('10:00');
    expect(dialogs.eventDraft()).toEqual({ date: '2026-10-23', start: '10:00', end: '11:00' });
    facade.openSlot('23:00');
    expect(dialogs.eventDraft()).toEqual({ date: '2026-10-23', start: '23:00', end: '23:59' });
  });

  it('R12: openTask expone editingTask', async () => {
    await setup();
    facade.openTask('pendiente');
    expect(facade.editingTask()?.id).toBe('pendiente');
  });
});
