import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { capitalize, localIso, MONTH_YEAR } from '@shared/utils';
import { AgendaCommands } from '../../../agenda/agenda-commands';
import { AgendaDialogs } from '../../../agenda/agenda-dialogs';
import { AgendaUnavailableError } from '../../../agenda/domain/agenda-errors';
import { AgendaRepository } from '../../../agenda/domain/agenda-repository';
import { CalendarEvent } from '../../../agenda/domain/calendar-event.model';
import { Task } from '../../../agenda/domain/task.model';
import { AgendaStore } from '../../../agenda/store/agenda.store';
import { CalendarMonthFacade } from '../../calendar-month.facade';
import { CalendarMonthPage } from './calendar-month-page';

const event = (id: string, date: string, start?: string): CalendarEvent => ({
  id,
  title: id,
  date,
  start,
  people: [],
  confirmed: false,
});
const tasks: Task[] = [
  { id: 'jueves', title: 'Informe', due: '2026-10-22', done: false },
  { id: 'otro', title: 'Otro día', due: '2026-10-23', done: false },
];

describe('CalendarMonthPage', () => {
  let repository: { [K in keyof AgendaRepository]: ReturnType<typeof vi.fn> };

  async function setup(url = '/calendario/mes?fecha=2026-10-22') {
    repository = {
      listEvents: vi
        .fn()
        .mockResolvedValue([
          event('viaje', '2026-10-22'),
          event('kickoff', '2026-10-22', '09:00'),
          event('comida', '2026-10-22', '13:00'),
          event('revisión', '2026-10-22', '17:00'),
          event('cine', '2026-10-15', '20:00'),
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
        CalendarMonthFacade,
        { provide: AgendaRepository, useValue: repository },
      ],
    });
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    const fixture = TestBed.createComponent(CalendarMonthPage);
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

  it('R20, SPEC 75 R11: hijos directos con host calendar-month-page screen l-screen', async () => {
    const { fixture, el } = await setup();
    await settle(fixture);
    expect(el.className).toBe('calendar-month-page screen l-screen');
    expect([...el.children].map((child) => child.localName + '.' + child.className)).toEqual([
      'div.l-screen__top u-mobile-only',
      'app-month-main.l-shell__main l-screen__main panel l-stack',
      'app-day-side.l-shell__panel panel l-stack u-desktop-only',
      'div.l-screen__fab u-mobile-only',
      'app-agenda-dialogs.',
    ]);
  });

  it('SPEC 75 R11: AppBar con el mes; flechas navegan ±1 mes', async () => {
    const ctx = await setup('/calendario/mes?fecha=2026-01-31');
    await settle(ctx.fixture);
    expect(ctx.el.querySelector('.app-bar__title')?.textContent?.trim()).toBe('Enero 2026');
    const labels = [...ctx.el.querySelectorAll('.app-bar__actions button')].map((b) =>
      b.getAttribute('aria-label'),
    );
    expect(labels).toEqual(['Mes anterior', 'Mes siguiente']);
    await click(ctx, '.app-bar__actions button', 1);
    expect(ctx.router.url).toBe('/calendario/mes?fecha=2026-02-28');
    expect(ctx.el.querySelector('.app-bar__title')?.textContent?.trim()).toBe('Febrero 2026');
    await click(ctx, '.app-bar__actions button', 0);
    expect(ctx.router.url).toBe('/calendario/mes?fecha=2026-01-28');
  });

  it('SPEC 75 R12–R13: bloque móvil con MiniCalendar y citas del día; pulsar abre el día', async () => {
    const ctx = await setup();
    await settle(ctx.fixture);
    const mobile = ctx.el.querySelector('app-month-main .u-mobile-only')!;
    expect(mobile.querySelector('app-card app-mini-calendar')).not.toBeNull();
    expect(mobile.querySelector('h2.section-title')?.textContent?.trim()).toBe(
      'Jueves 22 de octubre',
    );
    const items = [...mobile.querySelectorAll('app-agenda-item')];
    expect(items.map((i) => i.querySelector('.agenda-item__title')?.textContent?.trim())).toEqual([
      'viaje',
      'kickoff',
      'comida',
      'revisión',
    ]);
    expect(items[0].textContent).toContain('Todo el día');
    items[1].querySelector('button')!.click();
    await settle(ctx.fixture);
    expect(ctx.router.url).toBe('/calendario/dia?fecha=2026-10-22');
  });

  it('SPEC 75 R14: día sin citas muestra «Sin citas»', async () => {
    const ctx = await setup('/calendario/mes?fecha=2026-10-23');
    await settle(ctx.fixture);
    const mobile = ctx.el.querySelector('app-month-main .u-mobile-only')!;
    expect(mobile.querySelector('app-agenda-item')).toBeNull();
    expect(mobile.querySelector('app-empty-state')?.textContent).toContain('Sin citas');
    expect(mobile.querySelector('app-empty-state')?.textContent).toContain(
      'No tienes nada este día.',
    );
  });

  it('SPEC 75 R10: Fab «Nueva cita» abre el Dialog con el día', async () => {
    const ctx = await setup('/calendario/mes?fecha=2026-10-23');
    await settle(ctx.fixture);
    await click(ctx, '.l-screen__fab .fab');
    expect(TestBed.inject(AgendaDialogs).eventDraft()).toEqual({
      date: '2026-10-23',
      start: '09:00',
      end: '09:30',
    });
  });

  it('R6, R10, R17: no lee datos antes del primer render, que pinta el mes y esqueletos', async () => {
    const { fixture, el } = await setup();
    expect(repository.listEvents).not.toHaveBeenCalled();
    fixture.detectChanges();
    expect(title(el)).toBe('Octubre 2026');
    expect(crumb(el)).toBe('Octubre 2026');
    expect(el.querySelector('app-month-main app-skeleton-list')).not.toBeNull();
    expect(el.querySelector('app-month-view')).toBeNull();
  });

  it('R10, R12: tras renderizar en navegador carga datos y pinta el MonthView', async () => {
    const { fixture, el } = await setup();
    await settle(fixture);
    expect(repository.listEvents).toHaveBeenCalledTimes(1);
    const cell = el.querySelector('.month-view__cell[data-selected]')!;
    expect(
      [...cell.querySelectorAll('.month-view__chip')].map((c) => c.textContent?.trim()),
    ).toEqual(['viaje', '09:00 kickoff', '13:00 comida']);
    expect(cell.querySelector('.month-view__more')?.textContent?.trim()).toBe('+1 más');
  });

  it('R6: fecha inválida muestra el mes de hoy', async () => {
    const { fixture, el } = await setup('/calendario/mes?fecha=2026-02-30');
    fixture.detectChanges();
    const today = localIso(new Date());
    expect(title(el)).toBe(
      capitalize(MONTH_YEAR.format(new Date(`${today}T00:00:00Z`)).replace(' de ', ' ')),
    );
  });

  it('R7: flechas ±1 mes, «Hoy», MiniCalendar y número navegan a ?fecha= sin recargar datos', async () => {
    const ctx = await setup('/calendario/mes?fecha=2026-01-31');
    await settle(ctx.fixture);
    await click(ctx, 'app-month-main app-icon-button button', 1);
    expect(ctx.router.url).toBe('/calendario/mes?fecha=2026-02-28');
    expect(title(ctx.el)).toBe('Febrero 2026');
    expect(crumb(ctx.el)).toBe('Febrero 2026');
    await click(ctx, 'app-month-main app-icon-button button', 0);
    await click(ctx, 'app-month-main app-icon-button button', 0);
    expect(ctx.router.url).toBe('/calendario/mes?fecha=2025-12-28');
    const day = [...ctx.el.querySelectorAll<HTMLButtonElement>('.calendar__day')].find(
      (d) => d.textContent?.trim() === '15',
    )!;
    day.click();
    await settle(ctx.fixture);
    expect(ctx.router.url).toBe('/calendario/mes?fecha=2025-12-15');
    // Último número de la rejilla: domingo 11 enero, fuera de mes
    await click(ctx, '.month-view__num', 41);
    expect(ctx.router.url).toBe('/calendario/mes?fecha=2026-01-11');
    expect(title(ctx.el)).toBe('Enero 2026');
    await click(ctx, 'app-month-main .l-cluster app-button button');
    expect(ctx.router.url).toBe(`/calendario/mes?fecha=${localIso(new Date())}`);
    expect(repository.listEvents).toHaveBeenCalledTimes(1);
  });

  it('R8: «Día» y «Semana» navegan con el mismo ?fecha=', async () => {
    const ctx = await setup();
    await settle(ctx.fixture);
    const navigate = vi.spyOn(ctx.router, 'navigate').mockResolvedValue(true);
    await click(ctx, '.segmented__option', 0);
    await click(ctx, '.segmented__option', 1);
    expect(navigate.mock.calls).toEqual([
      [['/calendario', 'dia'], { queryParams: { fecha: '2026-10-22' } }],
      [['/calendario', 'semana'], { queryParams: { fecha: '2026-10-22' } }],
    ]);
  });

  it('R9: chip y «+N más» navegan a /calendario/dia?fecha=<día de la celda>', async () => {
    const ctx = await setup();
    await settle(ctx.fixture);
    const chip = [...ctx.el.querySelectorAll<HTMLButtonElement>('.month-view__chip')].find((c) =>
      c.textContent?.includes('cine'),
    )!;
    chip.click();
    await settle(ctx.fixture);
    expect(ctx.router.url).toBe('/calendario/dia?fecha=2026-10-15');
    await ctx.router.navigateByUrl('/calendario/mes?fecha=2026-10-22');
    await settle(ctx.fixture);
    await click(ctx, '.month-view__more');
    expect(ctx.router.url).toBe('/calendario/dia?fecha=2026-10-22');
  });

  it('R14, R19: «Nueva cita» del panel abre el Dialog con el día', async () => {
    const ctx = await setup('/calendario/mes?fecha=2026-10-23');
    await settle(ctx.fixture);
    const button = [...ctx.el.querySelectorAll<HTMLButtonElement>('app-day-side button')].find(
      (b) => b.textContent?.includes('Nueva cita'),
    )!;
    button.click();
    await settle(ctx.fixture);
    expect(TestBed.inject(AgendaDialogs).eventDraft()).toEqual({
      date: '2026-10-23',
      start: '09:00',
      end: '09:30',
    });
    expect(ctx.el.querySelector('app-dialog .dialog__title')?.textContent?.trim()).toBe(
      'Nueva cita',
    );
  });

  it('R13, R19: panel con copy por defecto y tareas del día; abrir marca la fila', async () => {
    const ctx = await setup();
    await settle(ctx.fixture);
    const side = ctx.el.querySelector('app-day-side')!;
    expect(side.querySelector('h2.section-title')?.textContent?.trim()).toBe('Sin hora');
    const items = side.querySelectorAll('app-task-item');
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toContain('Informe');
    ctx.el.querySelector<HTMLElement>('app-day-side .task-item__title')!.click();
    await settle(ctx.fixture);
    expect(side.querySelector('app-task-item')!.hasAttribute('data-selected')).toBe(true);
  });

  it('R19: sin tareas en el día muestra el estado vacío por defecto', async () => {
    const ctx = await setup('/calendario/mes?fecha=2026-10-24');
    await settle(ctx.fixture);
    expect(ctx.el.querySelector('app-day-side .empty-state__title')?.textContent?.trim()).toBe(
      'Sin tareas para este día',
    );
  });

  it('R18: si falla muestra Alert y Reintentar vuelve a cargar', async () => {
    const { fixture, el } = await setup();
    repository.listEvents.mockRejectedValueOnce(new AgendaUnavailableError());
    await settle(fixture);
    const alert = el.querySelector('app-month-main app-alert')!;
    expect(alert.textContent).toContain('No se pudo cargar tu agenda');
    alert.querySelector<HTMLButtonElement>('app-button button')!.click();
    await settle(fixture);
    expect(repository.listEvents).toHaveBeenCalledTimes(2);
    expect(el.querySelector('app-month-main app-alert')).toBeNull();
  });
});
