import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { localIso } from '@shared/utils';
import { AgendaCommands } from '../../../agenda/agenda-commands';
import { AgendaDialogs } from '../../../agenda/agenda-dialogs';
import { AgendaUnavailableError } from '../../../agenda/domain/agenda-errors';
import { AgendaRepository } from '../../../agenda/domain/agenda-repository';
import { CalendarEvent } from '../../../agenda/domain/calendar-event.model';
import { AgendaStore } from '../../../agenda/store/agenda.store';
import { CalendarDayFacade } from '../../calendar-day.facade';
import { CalendarDayPage } from './calendar-day-page';

const kickoff: CalendarEvent = {
  id: 'kickoff',
  title: 'Kickoff',
  date: '2026-10-22',
  start: '10:00',
  end: '11:00',
  people: [],
  confirmed: false,
};

describe('CalendarDayPage', () => {
  let repository: { [K in keyof AgendaRepository]: ReturnType<typeof vi.fn> };

  async function setup(url = '/calendario/dia?fecha=2026-10-22') {
    repository = {
      listEvents: vi.fn().mockResolvedValue([kickoff]),
      listTasks: vi.fn().mockResolvedValue([]),
      setTaskDone: vi.fn(),
      createEvent: vi.fn(),
      updateTask: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        // No outlet: the page is created by hand, the router only holds the URL.
        provideRouter([{ path: 'calendario/:view', children: [] }]),
        AgendaStore,
        AgendaCommands,
        AgendaDialogs,
        CalendarDayFacade,
        { provide: AgendaRepository, useValue: repository },
      ],
    });
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    const fixture = TestBed.createComponent(CalendarDayPage);
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
  const click = async (
    { fixture, el }: Awaited<ReturnType<typeof setup>>,
    selector: string,
    index = 0,
  ) => {
    el.querySelectorAll<HTMLButtonElement>(selector)[index].click();
    await settle(fixture);
  };

  it('R29: main, side y Dialogs como hijos directos con host calendar-day-page', async () => {
    const { fixture, el } = await setup();
    await settle(fixture);
    expect(el.classList).toContain('calendar-day-page');
    expect([...el.children].map((child) => child.localName)).toEqual([
      'app-day-main',
      'app-day-side',
      'app-agenda-dialogs',
    ]);
  });

  it('R7, R11, R21: no lee datos antes del primer render, que pinta el día y esqueletos', async () => {
    const { fixture, el } = await setup();
    expect(repository.listEvents).not.toHaveBeenCalled();
    fixture.detectChanges();
    expect(title(el)).toBe('Jueves 22 de octubre');
    expect(el.querySelector('app-day-main app-skeleton-list')).not.toBeNull();
    expect(el.querySelector('app-day-view')).toBeNull();
  });

  it('R11: tras renderizar en navegador carga datos y pinta el DayView', async () => {
    const { fixture, el } = await setup();
    await settle(fixture);
    expect(repository.listEvents).toHaveBeenCalledTimes(1);
    expect(el.querySelectorAll('app-day-view .day-view__event')).toHaveLength(1);
  });

  it('R7: fecha inválida muestra hoy', async () => {
    const { fixture, el } = await setup('/calendario/dia?fecha=2026-02-30');
    fixture.detectChanges();
    const today = localIso(new Date());
    expect(el.querySelector('.calendar__day[aria-pressed="true"]')?.textContent?.trim()).toBe(
      String(+today.slice(8)),
    );
  });

  it('R9: flechas, «Hoy» y MiniCalendar navegan a ?fecha= sin recargar datos', async () => {
    const ctx = await setup();
    await settle(ctx.fixture);
    await click(ctx, 'app-day-main app-icon-button button', 1);
    expect(ctx.router.url).toBe('/calendario/dia?fecha=2026-10-23');
    expect(title(ctx.el)).toBe('Viernes 23 de octubre');
    await click(ctx, 'app-day-main app-icon-button button', 0);
    await click(ctx, 'app-day-main app-icon-button button', 0);
    expect(ctx.router.url).toBe('/calendario/dia?fecha=2026-10-21');
    const day = [...ctx.el.querySelectorAll<HTMLButtonElement>('.calendar__day')].find(
      (d) => d.textContent?.trim() === '25',
    )!;
    day.click();
    await settle(ctx.fixture);
    expect(ctx.router.url).toBe('/calendario/dia?fecha=2026-10-25');
    await click(ctx, 'app-day-main .l-cluster app-button button');
    expect(ctx.router.url).toBe(`/calendario/dia?fecha=${localIso(new Date())}`);
    expect(repository.listEvents).toHaveBeenCalledTimes(1);
  });

  it('R10: «Semana» y «Mes» navegan con el mismo ?fecha=', async () => {
    const ctx = await setup();
    await settle(ctx.fixture);
    const navigate = vi.spyOn(ctx.router, 'navigate').mockResolvedValue(true);
    await click(ctx, '.segmented__option', 1);
    await click(ctx, '.segmented__option', 2);
    expect(navigate.mock.calls).toEqual([
      [['/calendario', 'semana'], { queryParams: { fecha: '2026-10-22' } }],
      [['/calendario', 'mes'], { queryParams: { fecha: '2026-10-22' } }],
    ]);
  });

  it('R20: clic en cita la marca; clic en hueco abre «Nueva cita» con hora', async () => {
    const ctx = await setup();
    await settle(ctx.fixture);
    await click(ctx, '.day-view__event');
    expect(ctx.el.querySelector('.day-view__event')!.hasAttribute('data-selected')).toBe(true);
    await click(ctx, '.day-view__slot', 10);
    expect(TestBed.inject(AgendaDialogs).eventDraft()).toEqual({
      date: '2026-10-22',
      start: '10:00',
      end: '11:00',
    });
    expect(ctx.el.querySelector('app-dialog .dialog__title')?.textContent?.trim()).toBe(
      'Nueva cita',
    );
  });

  it('R22: si falla muestra Alert y Reintentar vuelve a cargar', async () => {
    const { fixture, el } = await setup();
    repository.listEvents.mockRejectedValueOnce(new AgendaUnavailableError());
    await settle(fixture);
    const alert = el.querySelector('app-day-main app-alert')!;
    expect(alert.textContent).toContain('No se pudo cargar tu agenda');
    alert.querySelector<HTMLButtonElement>('app-button button')!.click();
    await settle(fixture);
    expect(repository.listEvents).toHaveBeenCalledTimes(2);
    expect(el.querySelector('app-day-main app-alert')).toBeNull();
  });
});
