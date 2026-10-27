import { TestBed } from '@angular/core/testing';
import { AgendaStatus } from '../../../agenda/domain/agenda-view.model';
import { Task } from '../../../agenda/domain/task.model';
import { DaySide } from './day-side';

const tasks: Task[] = [
  {
    id: 't1',
    title: 'Informe',
    done: false,
    list: 'Trabajo',
    listColor: 'blue',
    subtasks: [
      { title: 'Datos', done: true },
      { title: 'Texto', done: false },
    ],
  },
  { id: 't2', title: 'Fruta', done: true, list: 'Casa', listColor: 'green' },
];

function render(
  inputs: Partial<{
    status: AgendaStatus;
    tasks: Task[];
    saveError: boolean;
    selectedTaskId: string;
    heading: string;
    emptyHeading: string;
    emptyDescription: string;
  }> = {},
) {
  const fixture = TestBed.createComponent(DaySide);
  const values = {
    status: 'ready',
    today: '2026-10-22',
    day: '2026-10-23',
    eventDays: ['2026-10-23'],
    tasks,
    pendingCount: 1,
  };
  for (const [key, value] of Object.entries({ ...values, ...inputs })) {
    fixture.componentRef.setInput(key, value);
  }
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

const text = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim();

describe('DaySide', () => {
  it('R29: host de panel lateral', () => {
    const { el } = render();
    expect(el.className).toBe('l-shell__panel panel l-stack');
    expect(el.getAttribute('data-variant')).toBe('side');
    expect(el.getAttribute('data-gap')).toBe('m');
  });

  it('R23: MiniCalendar con el día seleccionado y puntos de citas', () => {
    const { el } = render();
    expect(text(el.querySelector('.calendar__day[aria-pressed="true"]'))).toBe('23');
    expect(el.querySelectorAll('.calendar__dot')).toHaveLength(1);
  });

  it('R23: sin puntos hasta ready', () => {
    expect(render({ status: 'loading' }).el.querySelectorAll('.calendar__dot')).toHaveLength(0);
  });

  it('R9: elegir un día del MiniCalendar emite daySelected', () => {
    const { fixture, el } = render();
    const days: string[] = [];
    fixture.componentInstance.daySelected.subscribe((day) => days.push(day));
    [...el.querySelectorAll<HTMLButtonElement>('.calendar__day')]
      .find((d) => text(d) === '25')!
      .click();
    expect(days).toEqual(['2026-10-25']);
  });

  it('R24: «Sin hora» con Badge count y una fila por tarea', () => {
    const { el } = render({ selectedTaskId: 't1' });
    const head = el.querySelector(':scope > .l-cluster')!;
    expect(text(head.querySelector('h2.section-title'))).toBe('Sin hora');
    expect(head.querySelector('app-badge')?.getAttribute('data-tone')).toBe('count');
    expect(text(head.querySelector('app-badge'))).toBe('1');
    const items = el.querySelectorAll('app-task-item');
    expect([...items].map((i) => text(i.querySelector('.task-item__title')))).toEqual([
      'Informe',
      'Fruta',
    ]);
    expect(items[0].textContent).toContain('2');
    expect(items[0].hasAttribute('data-selected')).toBe(true);
    expect(items[1].hasAttribute('data-selected')).toBe(false);
  });

  it('R25: marcar tarea emite toggled; saveError muestra Alert que emite al cerrar', () => {
    const { fixture, el } = render({ saveError: true });
    const toggled: { id: string; done: boolean }[] = [];
    let dismissed = 0;
    fixture.componentInstance.toggled.subscribe((value) => toggled.push(value));
    fixture.componentInstance.saveErrorDismissed.subscribe(() => dismissed++);
    el.querySelector<HTMLInputElement>('app-task-item input[type="checkbox"]')!.click();
    expect(toggled).toEqual([{ id: 't1', done: true }]);
    const alert = el.querySelector('app-alert')!;
    expect(alert.getAttribute('data-tone')).toBe('danger');
    expect(alert.textContent).toContain('No se pudo guardar la tarea.');
    alert.querySelector<HTMLButtonElement>('button[aria-label="Cerrar aviso"]')!.click();
    expect(dismissed).toBe(1);
  });

  it('R26: abrir tarea emite taskOpened', () => {
    const { fixture, el } = render();
    const opened: string[] = [];
    fixture.componentInstance.taskOpened.subscribe((id) => opened.push(id));
    el.querySelector<HTMLButtonElement>('app-task-item .task-item__open')!.click();
    expect(opened).toEqual(['t1']);
  });

  it('R27: sin tareas en ready muestra EmptyState', () => {
    const empty = render({ tasks: [] }).el.querySelector('app-empty-state')!;
    expect(text(empty.querySelector('.empty-state__title'))).toBe('Sin tareas para este día');
    expect(empty.textContent).toContain('No tienes tareas con esta fecha.');
    expect(empty.textContent).toContain('task_alt');
  });

  it('R24, R27: mientras carga, skeleton en lugar de la lista y sin Badge', () => {
    const { el } = render({ status: 'loading' });
    expect(el.querySelector('app-skeleton-list')).not.toBeNull();
    expect(el.querySelector('app-task-item')).toBeNull();
    expect(el.querySelector('app-badge')).toBeNull();
  });

  it('R28: termina con «Nueva cita» accent block que emite newEvent', () => {
    const { fixture, el } = render();
    const last = el.lastElementChild!;
    expect(last.localName).toBe('app-button');
    expect(text(last)).toContain('Nueva cita');
    const button = last.querySelector('button')!;
    expect(button.getAttribute('data-variant')).toBe('accent');
    expect(button.hasAttribute('data-block')).toBe(true);
    let created = 0;
    fixture.componentInstance.newEvent.subscribe(() => created++);
    button.click();
    expect(created).toBe(1);
  });

  it('SPEC 63 R27: copy propio para cabecera y estado vacío', () => {
    const copy = {
      heading: 'Esta semana',
      emptyHeading: 'Sin tareas esta semana',
      emptyDescription: 'No tienes tareas con fecha en esta semana.',
    };
    expect(text(render(copy).el.querySelector('h2.section-title'))).toBe('Esta semana');
    const empty = render({ ...copy, tasks: [] }).el.querySelector('app-empty-state')!;
    expect(text(empty.querySelector('.empty-state__title'))).toBe('Sin tareas esta semana');
    expect(empty.textContent).toContain('No tienes tareas con fecha en esta semana.');
  });
});
