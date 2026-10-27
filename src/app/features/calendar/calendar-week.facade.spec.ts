import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AgendaCommands } from '../agenda/agenda-commands';
import { AgendaDialogs } from '../agenda/agenda-dialogs';
import { AgendaRepository } from '../agenda/domain/agenda-repository';
import { CalendarEvent } from '../agenda/domain/calendar-event.model';
import { Task } from '../agenda/domain/task.model';
import { AgendaStore } from '../agenda/store/agenda.store';
import { CalendarWeekFacade } from './calendar-week.facade';

const event = (id: string, date: string, start?: string, end?: string): CalendarEvent => ({
  id,
  title: id,
  date,
  start,
  end,
  category: 'violet',
  categoryLabel: 'Estrategia',
  tint: 'lilac',
  people: [],
  confirmed: false,
});
const task = (id: string, due?: string, done = false): Task => ({ id, title: id, due, done });

describe('CalendarWeekFacade', () => {
  let facade: CalendarWeekFacade;
  let query: BehaviorSubject<ParamMap>;
  let dialogs: AgendaDialogs;

  async function setup(params: Record<string, string> = {}) {
    query = new BehaviorSubject(convertToParamMap(params));
    const repository: { [K in keyof AgendaRepository]: ReturnType<typeof vi.fn> } = {
      listEvents: vi
        .fn()
        .mockResolvedValue([
          event('lunes', '2026-10-19', '09:00', '10:00'),
          event('sin-fin', '2026-10-22', '10:00'),
          event('viaje', '2026-10-25'),
          event('antes', '2026-10-18', '09:00', '10:00'),
          event('después', '2026-10-26', '09:00', '10:00'),
        ]),
      listTasks: vi
        .fn()
        .mockResolvedValue([
          task('hecha', '2026-10-19', true),
          task('domingo', '2026-10-25'),
          task('fuera', '2026-10-26'),
          task('sin-fecha'),
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
        CalendarWeekFacade,
        { provide: AgendaRepository, useValue: repository },
        { provide: ActivatedRoute, useValue: { queryParamMap: query } },
      ],
    });
    facade = TestBed.inject(CalendarWeekFacade);
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

  it('R11: sin fecha muestra hoy; fecha válida en la URL; inválida vuelve a hoy', async () => {
    await setup();
    expect(facade.today).toBe('2026-10-22');
    expect(facade.day()).toBe('2026-10-22');
    navigate('2026-10-28');
    expect(facade.day()).toBe('2026-10-28');
    navigate('2026-02-30');
    expect(facade.day()).toBe('2026-10-22');
  });

  it('R11, R16 (SPEC 75 R9): semana lunes–domingo de weekStart(day) con hoy y eventos marcados', async () => {
    await setup({ fecha: '2026-10-25' });
    expect(facade.weekStart()).toBe('2026-10-19');
    expect(facade.weekDays()).toEqual([
      { iso: '2026-10-19', dow: 'lun', num: 19, today: false, hasEvents: true },
      { iso: '2026-10-20', dow: 'mar', num: 20, today: false, hasEvents: false },
      { iso: '2026-10-21', dow: 'mié', num: 21, today: false, hasEvents: false },
      { iso: '2026-10-22', dow: 'jue', num: 22, today: true, hasEvents: true },
      { iso: '2026-10-23', dow: 'vie', num: 23, today: false, hasEvents: false },
      { iso: '2026-10-24', dow: 'sáb', num: 24, today: false, hasEvents: false },
      { iso: '2026-10-25', dow: 'dom', num: 25, today: false, hasEvents: true },
    ]);
  });

  it('R17: now «HH:MM» solo si la semana contiene hoy', async () => {
    await setup({ fecha: '2026-10-25' });
    expect(facade.now()).toBe('10:30');
    navigate('2026-10-26');
    expect(facade.now()).toBeUndefined();
  });

  it('R18: weekEvents y weekAllDay solo de la semana', async () => {
    await setup();
    expect(facade.weekEvents()).toEqual([
      {
        id: 'lunes',
        day: '2026-10-19',
        start: '09:00',
        end: '10:00',
        title: 'lunes',
        tint: 'lilac',
        selected: false,
      },
      {
        id: 'sin-fin',
        day: '2026-10-22',
        start: '10:00',
        end: '10:00',
        title: 'sin-fin',
        tint: 'lilac',
        selected: false,
      },
    ]);
    expect(facade.weekAllDay()).toEqual([
      { day: '2026-10-25', title: 'viaje', category: 'violet' },
    ]);
    expect(facade.eventDays()).toContain('2026-10-26');
  });

  it('R19: weekTasks de lunes a domingo, pendientes primero; pendingCount', async () => {
    await setup();
    expect(facade.weekTasks().map((t) => t.id)).toEqual(['domingo', 'hecha']);
    expect(facade.pendingCount()).toBe(1);
    await facade.toggleTask('domingo', true);
    expect(facade.pendingCount()).toBe(0);
  });

  it('R21: selectEvent marca una cita; cambiar de semana lo limpia, mismo día de la semana no', async () => {
    await setup();
    facade.selectEvent('lunes');
    expect(facade.weekEvents()[0].selected).toBe(true);
    navigate('2026-10-24');
    expect(facade.selectedEventId()).toBe('lunes');
    navigate('2026-10-26');
    expect(facade.selectedEventId()).toBeUndefined();
  });

  it('R20: openNewEvent propone day; openSlot el día y hora del hueco', async () => {
    await setup({ fecha: '2026-10-23' });
    facade.openNewEvent();
    expect(dialogs.eventDraft()).toEqual({ date: '2026-10-23' });
    facade.openSlot({ day: '2026-10-21', hour: '10:00' });
    expect(dialogs.eventDraft()).toEqual({ date: '2026-10-21', start: '10:00', end: '11:00' });
    facade.openSlot({ day: '2026-10-21', hour: '23:00' });
    expect(dialogs.eventDraft()).toEqual({ date: '2026-10-21', start: '23:00', end: '23:59' });
  });

  it('R15: openTask expone editingTask', async () => {
    await setup();
    facade.openTask('domingo');
    expect(facade.editingTask()?.id).toBe('domingo');
  });
});
