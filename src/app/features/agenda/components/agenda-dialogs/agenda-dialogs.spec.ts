import { TestBed } from '@angular/core/testing';
import { AgendaCommands } from '../../agenda-commands';
import { AgendaDialogs as AgendaDialogsState } from '../../agenda-dialogs';
import { AgendaRepository } from '../../domain/agenda-repository';
import { CalendarEvent } from '../../domain/calendar-event.model';
import { Task } from '../../domain/task.model';
import { AgendaStore } from '../../store/agenda.store';
import { AgendaDialogs } from './agenda-dialogs';

const task: Task = { id: 't1', title: 'Informe', done: false, list: 'Trabajo' };

describe('AgendaDialogs (componente)', () => {
  let repository: { [K in keyof AgendaRepository]: ReturnType<typeof vi.fn> };

  async function setup(tasks: Task[] = [task], events: CalendarEvent[] = []) {
    repository = {
      listEvents: vi.fn().mockResolvedValue(events),
      listTasks: vi.fn().mockResolvedValue(tasks),
      setTaskDone: vi.fn(),
      createEvent: vi.fn().mockRejectedValue(new Error('x')),
      updateTask: vi.fn().mockRejectedValue(new Error('x')),
      deleteTask: vi.fn().mockResolvedValue(undefined),
      updateEvent: vi.fn().mockResolvedValue(undefined),
      deleteEvent: vi.fn().mockResolvedValue(undefined),
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

  describe('SPEC 71', () => {
    const event: CalendarEvent = {
      id: 'e1',
      title: 'Kickoff',
      date: '2026-10-22',
      start: '10:00',
      end: '11:00',
      categoryLabel: 'Estrategia',
      people: [],
      confirmed: false,
    };
    const button = (el: HTMLElement, label: string, scope = 'app-dialog') =>
      [...el.querySelectorAll<HTMLButtonElement>(`${scope} button`)].find(
        (b) => text(b) === label,
      )!;
    const settle = async (fixture: { whenStable(): Promise<unknown>; detectChanges(): void }) => {
      await fixture.whenStable();
      fixture.detectChanges();
    };

    it('R5, R3: «Detalle de tarea» con «Eliminar tarea» abre la confirmación encima', async () => {
      const { fixture, el, state } = await setup();
      state.openTask('t1');
      fixture.detectChanges();
      button(el, 'delete_outline Eliminar tarea').click();
      fixture.detectChanges();
      const dialogs = el.querySelectorAll('app-dialog');
      expect(dialogs).toHaveLength(2);
      const confirm = dialogs[1];
      expect(text(confirm.querySelector('.dialog__title'))).toBe('¿Eliminar “Informe”?');
      expect(text(confirm.querySelector('.dialog__body'))).toBe(
        'Esta acción no se puede deshacer.',
      );
      const foot = [...confirm.querySelectorAll('.dialog__foot button')];
      expect(foot.map((b) => [text(b), b.getAttribute('data-variant')])).toEqual([
        ['Cancelar', 'ghost'],
        ['delete_outline Eliminar', 'danger'],
      ]);
    });

    it('R4: confirmar borra, cierra ambos Dialogs y enfoca un elemento existente', async () => {
      const { fixture, el, state } = await setup();
      const heading = document.body.appendChild(document.createElement('h2'));
      state.openTask('t1');
      state.askDeleteTask('t1');
      fixture.detectChanges();
      button(el, 'delete_outline Eliminar', 'app-dialog .dialog__foot').click();
      await settle(fixture);
      expect(repository.deleteTask).toHaveBeenCalledWith('t1');
      expect(el.querySelector('app-dialog')).toBeNull();
      expect(document.activeElement).toBe(heading);
      heading.remove();
    });

    it('R2: si borrar falla, Alert en la confirmación y no se cierra', async () => {
      const { fixture, el, state } = await setup();
      repository.deleteTask.mockRejectedValue(new Error('x'));
      state.askDeleteTask('t1');
      fixture.detectChanges();
      button(el, 'delete_outline Eliminar', 'app-dialog .dialog__foot').click();
      await settle(fixture);
      expect(text(el.querySelector('app-dialog app-alert'))).toContain(
        'No se pudo eliminar. Inténtalo de nuevo.',
      );
    });

    it('R12: «Editar cita» con EventForm relleno; Alert si updateEvent falla', async () => {
      const { fixture, el, state } = await setup([task], [event]);
      repository.updateEvent.mockRejectedValue(new Error('x'));
      state.openEditEvent('e1');
      fixture.detectChanges();
      expect(text(el.querySelector('.dialog__title'))).toBe('Editar cita');
      expect(input(el, 'Título').value).toBe('Kickoff');
      expect(input(el, 'Fecha').value).toBe('2026-10-22');
      el.querySelector('app-dialog form')!.dispatchEvent(new Event('submit', { cancelable: true }));
      await settle(fixture);
      expect(repository.updateEvent).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1' }));
      expect(text(el.querySelector('app-dialog app-alert'))).toContain(
        'No se pudo guardar la cita. Inténtalo de nuevo.',
      );
      button(el, 'Cancelar').click();
      fixture.detectChanges();
      expect(el.querySelector('app-dialog')).toBeNull();
    });
  });

  describe('SPEC 79', () => {
    const event: CalendarEvent = {
      id: 'e1',
      title: 'Kickoff',
      date: '2026-10-22',
      start: '10:00',
      end: '11:00',
      categoryLabel: 'Estrategia',
      people: [],
      confirmed: false,
    };
    const button = (el: HTMLElement, label: string, scope = 'app-dialog') =>
      [...el.querySelectorAll<HTMLButtonElement>(`${scope} button`)].find(
        (b) => text(b) === label,
      )!;
    const titles = (el: HTMLElement) =>
      [...el.querySelectorAll('app-dialog .dialog__title')].map((t) => text(t));

    it('R4: «Eliminar cita» en «Editar cita» abre la confirmación; cancelar deja «Editar cita»', async () => {
      const { fixture, el, state } = await setup([task], [event]);
      state.openEditEvent('e1');
      fixture.detectChanges();
      button(el, 'delete_outline Eliminar cita').click();
      fixture.detectChanges();
      expect(titles(el)).toEqual(['Editar cita', '¿Eliminar “Kickoff”?']);
      button(el, 'Cancelar', 'app-dialog .dialog__foot').click();
      fixture.detectChanges();
      expect(titles(el)).toEqual(['Editar cita']);
      expect(repository.deleteEvent).not.toHaveBeenCalled();
    });

    it('R4: confirmar borra la cita y cierra ambos Dialogs', async () => {
      const { fixture, el, state } = await setup([task], [event]);
      state.openEditEvent('e1');
      fixture.detectChanges();
      button(el, 'delete_outline Eliminar cita').click();
      fixture.detectChanges();
      button(el, 'delete_outline Eliminar', 'app-dialog .dialog__foot').click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(repository.deleteEvent).toHaveBeenCalledWith('e1');
      expect(el.querySelector('app-dialog')).toBeNull();
    });

    it('R3: «Nueva cita» sin «Eliminar cita»', async () => {
      const { fixture, el, state } = await setup();
      state.openNewEvent({ date: '2026-10-22' });
      fixture.detectChanges();
      expect(text(el.querySelector('app-dialog'))).not.toContain('Eliminar cita');
    });
  });
});
