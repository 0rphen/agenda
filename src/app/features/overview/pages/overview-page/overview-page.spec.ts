import { SETTINGS_DEFAULTS } from '../../../settings/domain/settings-options';
import { UserSettingsStore } from '../../../settings/store/user-settings.store';
import { TestBed } from '@angular/core/testing';
import { dayTitle, localIso } from '@shared/utils';
import { Task } from '../../../agenda/domain/task.model';
import { AgendaCommands } from '../../../agenda/agenda-commands';
import { AgendaDialogs } from '../../../agenda/agenda-dialogs';
import { provideRouter, Router } from '@angular/router';
import { AgendaUnavailableError } from '../../../agenda/domain/agenda-errors';
import { AgendaRepository } from '../../../agenda/domain/agenda-repository';
import { AgendaStore } from '../../../agenda/store/agenda.store';
import { OverviewFacade } from '../../overview.facade';
import { OverviewPage } from './overview-page';

const today = localIso(new Date());
const task: Task = {
  id: 't1',
  title: 'Informe',
  done: false,
  due: today,
  list: 'Trabajo',
  listColor: 'blue',
};

describe('OverviewPage', () => {
  let repository: { [K in keyof AgendaRepository]: ReturnType<typeof vi.fn> };

  function setup() {
    repository = {
      listEvents: vi.fn().mockResolvedValue([]),
      listTasks: vi.fn().mockResolvedValue([]),
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
        provideRouter([]),
        AgendaStore,
        AgendaCommands,
        AgendaDialogs,
        OverviewFacade,
        { provide: AgendaRepository, useValue: repository },
      ],
    });
    const fixture = TestBed.createComponent(OverviewPage);
    return { fixture, el: fixture.nativeElement as HTMLElement };
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

  const text = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim();
  const dialog = (el: HTMLElement) => el.querySelector('app-dialog');
  const input = (el: HTMLElement, label: string) =>
    [...el.querySelectorAll('app-dialog .field')]
      .find((f) => text(f.querySelector('.field__label')) === label)!
      .querySelector<HTMLInputElement>('input, select, textarea')!;
  function type(el: HTMLElement, label: string, value: string) {
    const control = input(el, label);
    control.value = value;
    control.dispatchEvent(new Event('input'));
  }
  async function submit(
    fixture: { detectChanges(): void; whenStable(): Promise<unknown> },
    el: HTMLElement,
  ) {
    el.querySelector('app-dialog form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function settle(fixture: ReturnType<typeof setup>['fixture']) {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('R32, SPEC 76 R1, R3: hijos directos con host overview-page screen l-screen', async () => {
    const { fixture, el } = setup();
    await settle(fixture);
    expect(el.className).toBe('overview-page screen l-screen');
    expect([...el.children].map((child) => child.localName + '.' + child.className)).toEqual([
      'div.l-screen__top u-mobile-only',
      'app-overview-main.l-shell__main l-screen__main panel l-stack',
      'app-overview-side.l-shell__panel panel l-stack u-desktop-only',
      'app-agenda-dialogs.',
    ]);
  });

  it('SPEC 76 R1, R2: AppBar «Resumen» con el día y flecha «Volver a Hoy»', async () => {
    const { fixture, el } = setup();
    await settle(fixture);
    const bar = el.querySelector('.l-screen__top .app-bar')!;
    expect(bar.querySelector('.app-bar__title')?.textContent?.trim()).toBe('Resumen');
    expect(bar.querySelector('.app-bar__subtitle')?.textContent?.trim()).toBe(dayTitle(today));
    const back = bar.querySelector<HTMLButtonElement>('app-icon-button button')!;
    expect(back.getAttribute('aria-label')).toBe('Volver a Hoy');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    back.click();
    expect(navigate).toHaveBeenCalledWith('/calendario/dia');
  });

  it('SPEC 76 R9, R10: pasa el avance y el conflicto al main móvil', async () => {
    const { fixture, el } = setup();
    repository.listTasks.mockResolvedValue([task]);
    await settle(fixture);
    const avance = [...el.querySelectorAll('app-overview-main app-card')].find(
      (c) => c.querySelector('.card__title')?.textContent?.trim() === 'Avance de la semana',
    );
    expect(avance?.querySelector('app-progress')).not.toBeNull();
  });

  it('R9, R27: no lee datos antes del primer render, que pinta saludo y esqueleto', () => {
    const { fixture, el } = setup();
    expect(repository.listEvents).not.toHaveBeenCalled();
    fixture.detectChanges();
    expect(el.querySelector('h1.page-title')?.textContent).toMatch(
      /^(Buenos días|Buenas tardes|Buenas noches), César$/,
    );
    expect(el.querySelector('app-skeleton-list')).not.toBeNull();
    expect(el.querySelector('.stat-card')).toBeNull();
  });

  it('R9: tras renderizar en navegador carga datos', async () => {
    const { fixture, el } = setup();
    await settle(fixture);
    expect(repository.listEvents).toHaveBeenCalledTimes(1);
    expect(repository.listTasks).toHaveBeenCalledTimes(1);
    expect(el.querySelector('app-skeleton-list')).toBeNull();
    expect(el.querySelectorAll('.l-grid[data-min="s"] > .stat-card')).toHaveLength(4);
  });

  it('R17: «Citas hoy» y «Pendientes» navegan', async () => {
    const { fixture, el } = setup();
    await settle(fixture);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const [events, pending] = el.querySelectorAll<HTMLButtonElement>('button.stat-card');
    events.click();
    pending.click();
    expect(navigate.mock.calls.map(([url]) => url)).toEqual(['/calendario/dia', '/tareas']);
  });

  it('R28: si falla muestra Alert y Reintentar vuelve a cargar', async () => {
    const { fixture, el } = setup();
    repository.listEvents.mockRejectedValueOnce(new AgendaUnavailableError());
    await settle(fixture);
    const alert = el.querySelector('app-overview-main app-alert')!;
    expect(alert.textContent).toContain('No se pudo cargar tu agenda');
    alert.querySelector<HTMLButtonElement>('app-button button')!.click();
    await settle(fixture);
    expect(repository.listEvents).toHaveBeenCalledTimes(2);
    expect(el.querySelector('app-overview-main app-alert')).toBeNull();
  });

  describe('saludo con reloj fijo', () => {
    beforeEach(() => vi.useFakeTimers({ toFake: ['Date'] }));
    afterEach(() => vi.useRealTimers());

    it.each([
      [9, 'Buenos días, César'],
      [15, 'Buenas tardes, César'],
      [22, 'Buenas noches, César'],
    ])('R2–R4: a las %s h el título es «%s»', (hour, greeting) => {
      // Antes de setup(): OverviewFacade.nowState toma new Date() al construirse.
      vi.setSystemTime(new Date(2026, 9, 22, hour));
      const { fixture, el } = setup();
      fixture.detectChanges();
      expect(text(el.querySelector('h1.page-title'))).toBe(greeting);
    });
  });

  describe('SPEC 60: Dialog de tarea', () => {
    async function openTask() {
      const ctx = setup();
      repository.listTasks.mockResolvedValue([task]);
      await settle(ctx.fixture);
      ctx.el
        .querySelector<HTMLButtonElement>('app-card:has(a[href="/tareas"]) .task-item__open')!
        .click();
      ctx.fixture.detectChanges();
      return ctx;
    }

    it('R12, R13: abrir tarea muestra «Detalle de tarea» con sus datos y la fila selected', async () => {
      const { el } = await openTask();
      expect(text(dialog(el)?.querySelector('.dialog__title'))).toBe('Detalle de tarea');
      expect(input(el, 'Tarea').value).toBe('Informe');
      expect(input(el, 'Lista').value).toBe('Trabajo');
      expect(
        el
          .querySelector('app-card:has(a[href="/tareas"]) app-task-item')!
          .hasAttribute('data-selected'),
      ).toBe(true);
    });

    it('R14: guardar llama a updateTask, cierra y la lista muestra el cambio', async () => {
      const { fixture, el } = await openTask();
      repository.updateTask.mockResolvedValue(undefined);
      type(el, 'Tarea', 'Informe final');
      await submit(fixture, el);
      expect(repository.updateTask).toHaveBeenCalledWith(
        expect.objectContaining({ id: 't1', title: 'Informe final' }),
      );
      expect(dialog(el)).toBeNull();
      expect(
        text(el.querySelector('app-card:has(a[href="/tareas"]) app-task-item .task-item__title')),
      ).toBe('Informe final');
      expect(
        el
          .querySelector('app-card:has(a[href="/tareas"]) app-task-item')!
          .hasAttribute('data-selected'),
      ).toBe(false);
    });

    it('R15: si falla sigue abierto con Alert y lo escrito', async () => {
      const { fixture, el } = await openTask();
      repository.updateTask.mockRejectedValue(new AgendaUnavailableError());
      type(el, 'Tarea', 'Informe final');
      await submit(fixture, el);
      const alert = dialog(el)!.querySelector('app-alert')!;
      expect(alert.getAttribute('data-tone')).toBe('danger');
      expect(text(alert)).toContain('No se pudo guardar la tarea. Inténtalo de nuevo.');
      expect(alert.nextElementSibling?.localName).toBe('app-task-form');
      expect(input(el, 'Tarea').value).toBe('Informe final');
    });

    it('R16: cerrar con X no guarda', async () => {
      const { fixture, el } = await openTask();
      dialog(el)!.querySelector<HTMLButtonElement>('button[aria-label="Cerrar"]')!.click();
      fixture.detectChanges();
      expect(dialog(el)).toBeNull();
      expect(repository.updateTask).not.toHaveBeenCalled();
    });
  });

  describe('SPEC 60: Dialog de cita', () => {
    async function openEvent() {
      const ctx = setup();
      await settle(ctx.fixture);
      ctx.el
        .querySelector<HTMLButtonElement>('app-overview-main .l-cluster app-button button')!
        .click();
      ctx.fixture.detectChanges();
      return ctx;
    }

    it('R17: «Nueva cita» abre el Dialog con descripción y fecha propuesta', async () => {
      const { el } = await openEvent();
      expect(text(dialog(el)?.querySelector('.dialog__title'))).toBe('Nueva cita');
      expect(text(dialog(el)?.querySelector('.dialog__description'))).toBe(
        'Agenda una reunión, evento o recordatorio.',
      );
      expect(input(el, 'Fecha').value).toBe(today);
      expect(dialog(el)!.querySelector('app-event-form')?.textContent).toContain('Cancelar');
    });

    it('R18: guardar crea la cita y cierra', async () => {
      const { fixture, el } = await openEvent();
      repository.createEvent.mockResolvedValue({
        id: 'nueva',
        title: 'Kickoff',
        date: today,
        start: '23:58',
        end: '23:59',
        people: [],
        confirmed: false,
      });
      type(el, 'Título', 'Kickoff');
      await submit(fixture, el);
      expect(repository.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Kickoff', date: today }),
      );
      expect(dialog(el)).toBeNull();
      expect(text(el.querySelector('button.stat-card .stat-card__value'))).toBe('1');
    });

    it('R19: si falla sigue abierto con Alert', async () => {
      const { fixture, el } = await openEvent();
      repository.createEvent.mockRejectedValue(new AgendaUnavailableError());
      type(el, 'Título', 'Kickoff');
      await submit(fixture, el);
      expect(text(dialog(el)!.querySelector('app-alert'))).toContain(
        'No se pudo guardar la cita. Inténtalo de nuevo.',
      );
      expect(input(el, 'Título').value).toBe('Kickoff');
    });

    it('R20: Cancelar cierra sin guardar', async () => {
      const { fixture, el } = await openEvent();
      [...dialog(el)!.querySelectorAll<HTMLButtonElement>('button')]
        .find((b) => text(b) === 'Cancelar')!
        .click();
      fixture.detectChanges();
      expect(dialog(el)).toBeNull();
      expect(repository.createEvent).not.toHaveBeenCalled();
    });
  });

  it('SPEC 78 R6, R9: MiniCalendar desde domingo; agenda y conflicto en 12 h', async () => {
    const { fixture, el } = setup();
    const ev = (id: string, start: string, end: string) => ({
      id,
      title: id,
      date: today,
      start,
      end,
      people: [],
      confirmed: false,
    });
    repository.listEvents.mockResolvedValue([ev('A', '13:00', '14:00'), ev('B', '13:30', '14:30')]);
    TestBed.inject(UserSettingsStore).set({
      ...SETTINGS_DEFAULTS,
      calendar: { ...SETTINGS_DEFAULTS.calendar, weekStart: 'Domingo', timeFormat: '12 h' },
    });
    await settle(fixture);
    expect(el.querySelector('app-overview-side .calendar__dow')!.textContent!.trim()).toBe('D');
    expect(el.querySelector('.agenda-item__start')!.textContent!.trim()).toBe('1:00 PM');
    expect(text(el.querySelector('app-overview-side app-alert'))).toContain('Hoy a las 1:30 PM');
  });
});
