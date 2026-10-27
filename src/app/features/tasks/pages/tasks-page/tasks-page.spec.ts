import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AgendaCommands } from '../../../agenda/agenda-commands';
import { AgendaRepository } from '../../../agenda/domain/agenda-repository';
import { Task } from '../../../agenda/domain/task.model';
import { AgendaStore } from '../../../agenda/store/agenda.store';
import { TASKS_ROUTES } from '../../tasks.routes';
import { TasksFacade } from '../../tasks.facade';
import { TasksPage } from './tasks-page';

const tasks: Task[] = [
  { id: 'hoy', title: 'Informe', due: '2026-10-22', done: false },
  { id: 'hecha', title: 'Fruta', due: '2026-10-21', done: true },
];

describe('TasksPage', () => {
  let repository: { [K in keyof AgendaRepository]: ReturnType<typeof vi.fn> };

  function setup() {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 22, 10));
    repository = {
      listEvents: vi.fn().mockResolvedValue([]),
      listTasks: vi.fn().mockResolvedValue(tasks),
      setTaskDone: vi.fn().mockResolvedValue(undefined),
      createEvent: vi.fn(),
      updateTask: vi.fn().mockResolvedValue(undefined),
      createTask: vi
        .fn()
        .mockResolvedValue({ id: 'nueva', title: 'Pan', due: '2026-10-22', done: false }),
    };
    TestBed.configureTestingModule({
      providers: [
        AgendaStore,
        AgendaCommands,
        TasksFacade,
        provideRouter([]),
        { provide: AgendaRepository, useValue: repository },
      ],
    });
    const fixture = TestBed.createComponent(TasksPage);
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  async function settle(fixture: ReturnType<typeof setup>['fixture']) {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  const headings = (el: HTMLElement) =>
    [...el.querySelectorAll('app-tasks-main app-card.u-desktop-only .card__title')].map((t) =>
      t.textContent?.trim(),
    );

  afterEach(() => vi.useRealTimers());

  it('R1: ruta con título, layout week y facade', () => {
    const [route] = TASKS_ROUTES;
    expect(route.component).toBe(TasksPage);
    expect(route.title).toBe('Tareas · Agenda');
    expect(route.data).toEqual({ layout: 'week' });
    expect(route.providers).toContain(TasksFacade);
  });

  it('R22, SPEC 75 R15: hijos directos con host tasks-page screen l-screen, sin Fab', () => {
    const { el } = setup();
    expect(el.className).toBe('tasks-page screen l-screen');
    expect([...el.children].map((child) => child.localName + '.' + child.className)).toEqual([
      'div.l-screen__top u-mobile-only',
      'app-tasks-main.l-shell__main l-screen__main panel l-stack',
      'app-tasks-side.l-shell__panel panel l-stack u-desktop-only',
    ]);
    expect(el.querySelector('app-fab')).toBeNull();
  });

  it('SPEC 75 R15: AppBar «Tareas» con «N pendientes» solo con datos', async () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(el.querySelector('.app-bar__title')?.textContent?.trim()).toBe('Tareas');
    expect(el.querySelector('.app-bar__subtitle')).toBeNull();
    await settle(fixture);
    await settle(fixture);
    expect(el.querySelector('.app-bar__subtitle')?.textContent?.trim()).toBe('1 pendiente');
  });

  describe('SPEC 75 R19: detalle en Dialog full en móvil', () => {
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
    afterEach(() => vi.unstubAllGlobals());

    const open = async (ctx: ReturnType<typeof setup>, matches: boolean) => {
      vi.stubGlobal('matchMedia', () => ({ matches }));
      await settle(ctx.fixture);
      ctx.el
        .querySelector<HTMLButtonElement>('app-tasks-main .u-mobile-only .task-item__open')!
        .click();
      await settle(ctx.fixture);
    };

    it('móvil: abre «Detalle de la tarea» full; guardar lo cierra', async () => {
      const ctx = setup();
      await open(ctx, true);
      const dialog = ctx.el.querySelector(':scope > app-dialog dialog.scrim')!;
      expect(dialog.getAttribute('data-variant')).toBe('full');
      expect(dialog.querySelector('.dialog__title')?.textContent?.trim()).toBe(
        'Detalle de la tarea',
      );
      expect(dialog.querySelector<HTMLInputElement>('app-task-form input')!.value).toBe('Informe');
      dialog.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
      await settle(ctx.fixture);
      expect(repository.updateTask).toHaveBeenCalled();
      expect(ctx.el.querySelector(':scope > app-dialog')).toBeNull();
    });

    it('móvil: cerrar el Dialog lo quita', async () => {
      const ctx = setup();
      await open(ctx, true);
      ctx.el.querySelector<HTMLButtonElement>(':scope > app-dialog .dialog__head button')!.click();
      await settle(ctx.fixture);
      expect(ctx.el.querySelector(':scope > app-dialog')).toBeNull();
    });

    it('escritorio: no abre Dialog, el detalle va al panel', async () => {
      const ctx = setup();
      await open(ctx, false);
      expect(ctx.el.querySelector(':scope > app-dialog')).toBeNull();
      expect(ctx.el.querySelector('app-tasks-side app-task-form')).not.toBeNull();
    });
  });

  it('R2: no lee datos antes del primer render, que pinta esqueletos', () => {
    const { fixture, el } = setup();
    expect(repository.listTasks).not.toHaveBeenCalled();
    fixture.detectChanges();
    expect(el.querySelectorAll('app-skeleton-list')).toHaveLength(2);
  });

  it('R2: tras renderizar carga y pinta grupos; filtro, añadir y seleccionar', async () => {
    const { fixture, el } = setup();
    await settle(fixture);
    expect(repository.listTasks).toHaveBeenCalledTimes(1);
    expect(headings(el)).toEqual(['Hoy', 'Completadas']);

    el.querySelectorAll<HTMLButtonElement>('app-segmented-control button')[3].click();
    await settle(fixture);
    expect(headings(el)).toEqual(['Completadas']);

    const input = el.querySelector<HTMLInputElement>('form input')!;
    input.value = 'Pan';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await settle(fixture);
    expect(repository.createTask).toHaveBeenCalled();
    const detail = el.querySelectorAll('app-tasks-side app-card')[1];
    expect(detail.querySelector('.card__title')?.textContent?.trim()).toBe('Detalle de la tarea');
    expect(detail.querySelector<HTMLInputElement>('app-task-form input')!.value).toBe('Pan');
    expect(el.querySelector('app-tasks-side app-progress')?.textContent).toContain(
      '1 de 3 completadas',
    );
  });
});
