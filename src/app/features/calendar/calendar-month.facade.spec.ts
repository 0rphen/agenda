import { SETTINGS_DEFAULTS } from '../settings/domain/settings-options';
import { UserSettingsStore } from '../settings/store/user-settings.store';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AgendaCommands } from '../agenda/agenda-commands';
import { AgendaDialogs } from '../agenda/agenda-dialogs';
import { AgendaRepository } from '../agenda/domain/agenda-repository';
import { CalendarEvent } from '../agenda/domain/calendar-event.model';
import { Task } from '../agenda/domain/task.model';
import { AgendaStore } from '../agenda/store/agenda.store';
import { CalendarMonthFacade } from './calendar-month.facade';

const event = (id: string, date: string, start?: string): CalendarEvent => ({
  id,
  title: id,
  date,
  start,
  category: 'violet',
  categoryLabel: 'Estrategia',
  tint: 'lilac',
  people: [],
  confirmed: false,
});
const task = (id: string, due?: string, done = false): Task => ({ id, title: id, due, done });

describe('CalendarMonthFacade', () => {
  let facade: CalendarMonthFacade;
  let query: BehaviorSubject<ParamMap>;
  let dialogs: AgendaDialogs;

  async function setup(params: Record<string, string> = {}) {
    query = new BehaviorSubject(convertToParamMap(params));
    const repository: { [K in keyof AgendaRepository]: ReturnType<typeof vi.fn> } = {
      listEvents: vi
        .fn()
        .mockResolvedValue([
          event('tarde', '2026-10-22', '16:00'),
          event('mañana', '2026-10-22', '09:00'),
          event('viaje', '2026-10-22'),
          event('primera-celda', '2026-09-28', '10:00'),
          event('última-celda', '2026-11-08', '10:00'),
          event('antes', '2026-09-27', '10:00'),
          event('después', '2026-11-09', '10:00'),
        ]),
      listTasks: vi
        .fn()
        .mockResolvedValue([
          task('hecha', '2026-10-22', true),
          task('pendiente', '2026-10-22'),
          task('otro-día', '2026-10-23'),
          task('sin-fecha'),
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
        CalendarMonthFacade,
        { provide: AgendaRepository, useValue: repository },
        { provide: ActivatedRoute, useValue: { queryParamMap: query } },
      ],
    });
    facade = TestBed.inject(CalendarMonthFacade);
    dialogs = TestBed.inject(AgendaDialogs);
    await facade.load();
  }

  const navigate = (fecha: string) => query.next(convertToParamMap({ fecha }));

  beforeEach(() => {
    // Jueves 22 octubre 2026, 10:30 local
    vi.useFakeTimers({
      toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
    });
    vi.setSystemTime(new Date(2026, 9, 22, 10, 30));
  });
  afterEach(() => vi.useRealTimers());

  it('R6: sin fecha muestra hoy; fecha válida en la URL; inválida vuelve a hoy', async () => {
    await setup();
    expect(facade.today()).toBe('2026-10-22');
    expect(facade.day()).toBe('2026-10-22');
    navigate('2027-01-31');
    expect(facade.day()).toBe('2027-01-31');
    navigate('2026-02-30');
    expect(facade.day()).toBe('2026-10-22');
  });

  it('SPEC 72 R4: a medianoche today pasa al día siguiente', async () => {
    vi.setSystemTime(new Date(2026, 9, 22, 23, 59));
    await setup();
    vi.advanceTimersByTime(60_000);
    expect(facade.today()).toBe('2026-10-23');
  });

  it('R6, R11: year y month (0–11) del día', async () => {
    await setup({ fecha: '2026-12-05' });
    expect(facade.year()).toBe(2026);
    expect(facade.month()).toBe(11);
    navigate('2027-01-31');
    expect(facade.year()).toBe(2027);
    expect(facade.month()).toBe(0);
  });

  it('R12, SPEC 79 R10: monthEvents con id de las 42 celdas, todo el día primero y luego por hora', async () => {
    await setup();
    expect(facade.monthEvents()).toEqual([
      {
        id: 'primera-celda',
        day: '2026-09-28',
        title: 'primera-celda',
        start: '10:00',
        category: 'violet',
      },
      { id: 'viaje', day: '2026-10-22', title: 'viaje', start: undefined, category: 'violet' },
      { id: 'mañana', day: '2026-10-22', title: 'mañana', start: '09:00', category: 'violet' },
      { id: 'tarde', day: '2026-10-22', title: 'tarde', start: '16:00', category: 'violet' },
      {
        id: 'última-celda',
        day: '2026-11-08',
        title: 'última-celda',
        start: '10:00',
        category: 'violet',
      },
    ]);
    expect(facade.eventDays()).toContain('2026-11-09');
  });

  it('R12: cambiar de mes cambia el rango', async () => {
    await setup();
    navigate('2026-11-15');
    // Noviembre 2026: lunes 26 oct – domingo 6 dic
    expect(facade.monthEvents().map((e) => e.title)).toEqual(['última-celda', 'después']);
  });

  it('SPEC 75 R13: dayEvents del día, todo el día primero y luego por hora', async () => {
    await setup({ fecha: '2026-10-22' });
    expect(facade.dayEvents().map((e) => e.id)).toEqual(['viaje', 'mañana', 'tarde']);
  });

  it('SPEC 75 R9: weekDays de la semana del día con hasEvents', async () => {
    await setup({ fecha: '2026-10-22' });
    expect(facade.weekDays().map((d) => d.hasEvents)).toEqual([
      false,
      false,
      false,
      true,
      false,
      false,
      false,
    ]);
  });

  it('R13: dayTasks del día, pendientes primero; pendingCount', async () => {
    await setup();
    expect(facade.dayTasks().map((t) => t.id)).toEqual(['pendiente', 'hecha']);
    expect(facade.pendingCount()).toBe(1);
    await facade.toggleTask('pendiente', true);
    expect(facade.pendingCount()).toBe(0);
  });

  it('R14: openNewEvent propone day', async () => {
    await setup({ fecha: '2026-10-23' });
    facade.openNewEvent();
    expect(dialogs.eventDraft()).toEqual({ date: '2026-10-23', start: '09:00', end: '09:30' });
  });

  it('R11: openTask expone editingTask', async () => {
    await setup();
    facade.openTask('pendiente');
    expect(facade.editingTask()?.id).toBe('pendiente');
  });

  const calendar = (changes: Partial<typeof SETTINGS_DEFAULTS.calendar>) =>
    TestBed.inject(UserSettingsStore).set({
      ...SETTINGS_DEFAULTS,
      calendar: { ...SETTINGS_DEFAULTS.calendar, ...changes },
    });

  it('SPEC 78 R5: con Domingo las 42 celdas empiezan el domingo', async () => {
    await setup();
    calendar({ weekStart: 'Domingo' });
    // Octubre 2026 con domingo: 27 sep – 7 nov
    expect(facade.monthEvents().map((e) => e.title)).toEqual([
      'antes',
      'primera-celda',
      'viaje',
      'mañana',
      'tarde',
    ]);
    expect(facade.firstDay()).toBe(0);
  });
});
