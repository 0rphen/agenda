import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { localIso } from '@shared/utils';
import { AgendaCommands } from '../../../agenda/agenda-commands';
import { AgendaDialogs } from '../../../agenda/agenda-dialogs';
import { AgendaUnavailableError } from '../../../agenda/domain/agenda-errors';
import { AgendaRepository } from '../../../agenda/domain/agenda-repository';
import { CalendarEvent } from '../../../agenda/domain/calendar-event.model';
import { Task } from '../../../agenda/domain/task.model';
import { AgendaStore } from '../../../agenda/store/agenda.store';
import { CalendarWeekFacade } from '../../calendar-week.facade';
import { CalendarWeekPage } from './calendar-week-page';

const event = (id: string, date: string, start: string, end: string): CalendarEvent => ({
  id,
  title: id,
  date,
  start,
  end,
  people: [],
  confirmed: false,
});
const tasks: Task[] = [
  { id: 'lunes', title: 'Informe', due: '2026-10-19', done: false },
  { id: 'fuera', title: 'Fuera', due: '2026-10-26', done: false },
];

describe('CalendarWeekPage', () => {
  let repository: { [K in keyof AgendaRepository]: ReturnType<typeof vi.fn> };

  async function setup(url = '/calendario/semana?fecha=2026-10-22') {
    repository = {
      listEvents: vi
        .fn()
        .mockResolvedValue([
          event('kickoff', '2026-10-19', '10:00', '11:00'),
          event('comida', '2026-10-22', '13:00', '14:00'),
        ]),
      listTasks: vi.fn().mockResolvedValue(tasks),
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
        // No outlet: the page is created by hand, the router only holds the URL.
        provideRouter([{ path: 'calendario/:view', children: [] }]),
        AgendaStore,
        AgendaCommands,
        AgendaDialogs,
        CalendarWeekFacade,
        { provide: AgendaRepository, useValue: repository },
      ],
    });
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    const fixture = TestBed.createComponent(CalendarWeekPage);
    return { fixture, router, el: fixture.nativeElement as HTMLElement };
  }

  async function settle(fixture: Awaited<ReturnType<typeof setup>>['fixture']) {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  // jsdom no implementa showModal/close de <dialog>.
  beforeEach(() => {
    const proto = HTMLDialogElement.prototype;
    proto.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    proto.close = function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  });

  const title = (el: HTMLElement) => el.querySelector('h1.page-title')?.textContent?.trim();
  const crumb = (el: HTMLElement) =>
    [...el.querySelectorAll('app-breadcrumb li')].at(-1)?.textContent?.trim();
  const click = async (
    { fixture, el }: Awaited<ReturnType<typeof setup>>,
    selector: string,
    index = 0,
  ) => {
    el.querySelectorAll<HTMLButtonElement>(selector)[index].click();
    await settle(fixture);
  };

  it('R29: main, side y Dialogs como hijos directos con host calendar-week-page', async () => {
    const { fixture, el } = await setup();
    await settle(fixture);
    expect(el.classList).toContain('calendar-week-page');
    expect([...el.children].map((child) => child.localName)).toEqual([
      'app-week-main',
      'app-day-side',
      'app-agenda-dialogs',
    ]);
  });

  it('R11, R14, R25: no lee datos antes del primer render, que pinta la semana y esqueletos', async () => {
    const { fixture, el } = await setup();
    expect(repository.listEvents).not.toHaveBeenCalled();
    fixture.detectChanges();
    expect(title(el)).toBe('19 – 25 de octubre, 2026');
    expect(crumb(el)).toBe('Semana 43');
    expect(el.querySelector('app-week-main app-skeleton-list')).not.toBeNull();
    expect(el.querySelector('app-week-view')).toBeNull();
  });

  it('R14: tras renderizar en navegador carga datos y pinta el WeekView', async () => {
    const { fixture, el } = await setup();
    await settle(fixture);
    expect(repository.listEvents).toHaveBeenCalledTimes(1);
    expect(el.querySelectorAll('app-week-view .week-view__event')).toHaveLength(2);
  });

  it('R11: fecha inválida muestra la semana de hoy', async () => {
    const { fixture, el } = await setup('/calendario/semana?fecha=2026-02-30');
    fixture.detectChanges();
    const today = localIso(new Date());
    expect(el.querySelector('.calendar__day[aria-pressed="true"]')?.textContent?.trim()).toBe(
      String(+today.slice(8)),
    );
  });

  it('R12: flechas ±7, «Hoy» y MiniCalendar navegan a ?fecha= sin recargar datos', async () => {
    const ctx = await setup();
    await settle(ctx.fixture);
    await click(ctx, 'app-week-main app-icon-button button', 1);
    expect(ctx.router.url).toBe('/calendario/semana?fecha=2026-10-29');
    expect(title(ctx.el)).toBe('26 de octubre – 1 de noviembre, 2026');
    expect(crumb(ctx.el)).toBe('Semana 44');
    await click(ctx, 'app-week-main app-icon-button button', 0);
    await click(ctx, 'app-week-main app-icon-button button', 0);
    expect(ctx.router.url).toBe('/calendario/semana?fecha=2026-10-15');
    const day = [...ctx.el.querySelectorAll<HTMLButtonElement>('.calendar__day')].find(
      (d) => d.textContent?.trim() === '25',
    )!;
    day.click();
    await settle(ctx.fixture);
    expect(ctx.router.url).toBe('/calendario/semana?fecha=2026-10-25');
    await click(ctx, 'app-week-main .l-cluster app-button button');
    expect(ctx.router.url).toBe(`/calendario/semana?fecha=${localIso(new Date())}`);
    expect(repository.listEvents).toHaveBeenCalledTimes(1);
  });

  it('R13: «Día» y «Mes» navegan con el mismo ?fecha=', async () => {
    const ctx = await setup();
    await settle(ctx.fixture);
    const navigate = vi.spyOn(ctx.router, 'navigate').mockResolvedValue(true);
    await click(ctx, '.segmented__option', 0);
    await click(ctx, '.segmented__option', 2);
    expect(navigate.mock.calls).toEqual([
      [['/calendario', 'dia'], { queryParams: { fecha: '2026-10-22' } }],
      [['/calendario', 'mes'], { queryParams: { fecha: '2026-10-22' } }],
    ]);
  });

  it('R24: clic en cita la marca; clic en hueco abre «Nueva cita» con día y hora', async () => {
    const ctx = await setup();
    await settle(ctx.fixture);
    await click(ctx, '.week-view__event', 1);
    const events = ctx.el.querySelectorAll('.week-view__event');
    expect(events[1].hasAttribute('data-selected')).toBe(true);
    await click(ctx, '.week-view__event', 0);
    expect(events[0].hasAttribute('data-selected')).toBe(true);
    expect(events[1].hasAttribute('data-selected')).toBe(false);
    ctx.el
      .querySelectorAll('.week-view__col')[3]
      .querySelectorAll<HTMLButtonElement>('.week-view__slot')[10]
      .click();
    await settle(ctx.fixture);
    expect(TestBed.inject(AgendaDialogs).eventDraft()).toEqual({
      date: '2026-10-22',
      start: '10:00',
      end: '11:00',
    });
    expect(ctx.el.querySelector('app-dialog .dialog__title')?.textContent?.trim()).toBe(
      'Nueva cita',
    );
  });

  it('R27: panel «Esta semana» con tareas de lunes a domingo; abrir marca la fila', async () => {
    const ctx = await setup();
    await settle(ctx.fixture);
    const side = ctx.el.querySelector('app-day-side')!;
    expect(side.querySelector('h2.section-title')?.textContent?.trim()).toBe('Esta semana');
    const items = side.querySelectorAll('app-task-item');
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toContain('Informe');
    ctx.el.querySelector<HTMLElement>('app-day-side .task-item__title')!.click();
    await settle(ctx.fixture);
    expect(side.querySelector('app-task-item')!.hasAttribute('data-selected')).toBe(true);
  });

  it('R27: sin tareas en la semana muestra el estado vacío propio', async () => {
    const ctx = await setup('/calendario/semana?fecha=2026-11-10');
    await settle(ctx.fixture);
    expect(ctx.el.querySelector('app-day-side .empty-state__title')?.textContent?.trim()).toBe(
      'Sin tareas esta semana',
    );
  });

  it('R26: si falla muestra Alert y Reintentar vuelve a cargar', async () => {
    const { fixture, el } = await setup();
    repository.listEvents.mockRejectedValueOnce(new AgendaUnavailableError());
    await settle(fixture);
    const alert = el.querySelector('app-week-main app-alert')!;
    expect(alert.textContent).toContain('No se pudo cargar tu agenda');
    alert.querySelector<HTMLButtonElement>('app-button button')!.click();
    await settle(fixture);
    expect(repository.listEvents).toHaveBeenCalledTimes(2);
    expect(el.querySelector('app-week-main app-alert')).toBeNull();
  });
});
