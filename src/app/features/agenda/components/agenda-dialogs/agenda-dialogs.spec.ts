import { TestBed } from '@angular/core/testing';
import { AgendaCommands } from '../../agenda-commands';
import { AgendaDialogs as AgendaDialogsState } from '../../agenda-dialogs';
import { AgendaRepository } from '../../domain/agenda-repository';
import { Task } from '../../domain/task.model';
import { AgendaStore } from '../../store/agenda.store';
import { AgendaDialogs } from './agenda-dialogs';

const task: Task = { id: 't1', title: 'Informe', done: false, list: 'Trabajo' };

describe('AgendaDialogs (componente)', () => {
  let repository: { [K in keyof AgendaRepository]: ReturnType<typeof vi.fn> };

  async function setup(tasks: Task[] = [task]) {
    repository = {
      listEvents: vi.fn().mockResolvedValue([]),
      listTasks: vi.fn().mockResolvedValue(tasks),
      setTaskDone: vi.fn(),
      createEvent: vi.fn().mockRejectedValue(new Error('x')),
      updateTask: vi.fn().mockRejectedValue(new Error('x')),
      createTask: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        AgendaStore,
        AgendaCommands,
        AgendaDialogsState,
        { provide: AgendaRepository, useValue: repository },
      ],
    });
    await TestBed.inject(AgendaCommands).load();
    const fixture = TestBed.createComponent(AgendaDialogs);
    fixture.detectChanges();
    return {
      fixture,
      el: fixture.nativeElement as HTMLElement,
      state: TestBed.inject(AgendaDialogsState),
    };
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
  const input = (el: HTMLElement, label: string) =>
    [...el.querySelectorAll('app-dialog .field')]
      .find((f) => text(f.querySelector('.field__label')) === label)!
      .querySelector<HTMLInputElement>('input, select, textarea')!;

  it('R3: sin estado no renderiza Dialogs', async () => {
    const { el } = await setup();
    expect(el.querySelector('app-dialog')).toBeNull();
  });

  it('R3: «Detalle de tarea» con los datos de la tarea y Alert si falla', async () => {
    const { fixture, el, state } = await setup();
    state.openTask('t1');
    fixture.detectChanges();
    expect(text(el.querySelector('.dialog__title'))).toBe('Detalle de tarea');
    expect(input(el, 'Tarea').value).toBe('Informe');
    el.querySelector('app-dialog form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();
    const alert = el.querySelector('app-dialog app-alert')!;
    expect(alert.getAttribute('data-tone')).toBe('danger');
    expect(text(alert)).toContain('No se pudo guardar la tarea. Inténtalo de nuevo.');
  });

  it('SPEC 69 R5: editar tarea con tags las muestra pulsadas con check; las demás no', async () => {
    const { fixture, el, state } = await setup([{ ...task, tags: ['Cliente', 'Urgente'] }]);
    state.openTask('t1');
    fixture.detectChanges();
    const buttons = [...el.querySelectorAll('app-dialog .tag-button')];
    const pressed = (on: string) =>
      buttons.filter((b) => b.getAttribute('aria-pressed') === on).map(text);
    expect(pressed('true')).toEqual(['check Urgente', 'check Cliente']);
    expect(pressed('false')).toEqual(['Revisión', 'Personal']);
  });

  it('R3: «Nueva cita» con descripción, borrador y Alert si falla', async () => {
    const { fixture, el, state } = await setup();
    state.openNewEvent({ date: '2026-10-22', start: '10:00', end: '11:00' });
    fixture.detectChanges();
    expect(text(el.querySelector('.dialog__title'))).toBe('Nueva cita');
    expect(text(el.querySelector('.dialog__description'))).toBe(
      'Agenda una reunión, evento o recordatorio.',
    );
    expect(input(el, 'Fecha').value).toBe('2026-10-22');
    input(el, 'Título').value = 'Kickoff';
    input(el, 'Título').dispatchEvent(new Event('input'));
    el.querySelector('app-dialog form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(text(el.querySelector('app-dialog app-alert'))).toContain(
      'No se pudo guardar la cita. Inténtalo de nuevo.',
    );
  });

  it('R3: Cancelar cierra «Nueva cita»', async () => {
    const { fixture, el, state } = await setup();
    state.openNewEvent({ date: '2026-10-22' });
    fixture.detectChanges();
    [...el.querySelectorAll<HTMLButtonElement>('app-dialog button')]
      .find((b) => text(b) === 'Cancelar')!
      .click();
    fixture.detectChanges();
    expect(el.querySelector('app-dialog')).toBeNull();
    expect(state.eventDraft()).toBeUndefined();
  });

  describe('SPEC 75 R20: variante según el ancho al abrir', () => {
    afterEach(() => vi.unstubAllGlobals());
    const narrow = (matches: boolean) => vi.stubGlobal('matchMedia', () => ({ matches }));
    const variant = (el: HTMLElement) =>
      el.querySelector('dialog.scrim')?.getAttribute('data-variant') ?? null;

    it('móvil: «Nueva cita» como hoja y «Detalle de tarea» a pantalla completa', async () => {
      narrow(true);
      const { fixture, el, state } = await setup();
      state.openNewEvent({ date: '2026-10-22' });
      fixture.detectChanges();
      expect(variant(el)).toBe('sheet');
      state.closeNewEvent();
      state.openTask('t1');
      fixture.detectChanges();
      expect(variant(el)).toBe('full');
    });

    it('escritorio: sin variante', async () => {
      narrow(false);
      const { fixture, el, state } = await setup();
      state.openNewEvent({ date: '2026-10-22' });
      fixture.detectChanges();
      expect(variant(el)).toBeNull();
    });
  });
});
