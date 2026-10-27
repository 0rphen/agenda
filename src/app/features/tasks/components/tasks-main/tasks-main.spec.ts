import { TestBed } from '@angular/core/testing';
import { AgendaStatus } from '../../../agenda/domain/agenda-view.model';
import { Task } from '../../../agenda/domain/task.model';
import { TaskFilter, TaskGroup } from '../../domain/tasks-view.model';
import { TasksMain } from './tasks-main';

const late: Task = { id: 'l1', title: 'Propuesta', done: false, due: '2026-10-20' };
const today: Task = {
  id: 't1',
  title: 'Licencia',
  done: false,
  due: '2026-10-22',
  list: 'Personal',
  listColor: 'orange',
  subtasks: [{ title: 'Pagar', done: false }],
};
const next: Task = { id: 'n1', title: 'Sin fecha', done: false };
const groups: TaskGroup[] = [
  { key: 'late', heading: 'Vencidas', tasks: [late] },
  { key: 'today', heading: 'Hoy', tasks: [today] },
  { key: 'next', heading: 'Próximas', tasks: [next] },
];

function render(
  inputs: Partial<{
    status: AgendaStatus;
    filter: TaskFilter;
    groups: TaskGroup[];
    saveError: boolean;
    selectedTaskId: string;
  }> = {},
) {
  const fixture = TestBed.createComponent(TasksMain);
  const values = { status: 'ready', groups, pendingCount: 3, dueTodayCount: 1 };
  for (const [key, value] of Object.entries({ ...values, ...inputs })) {
    fixture.componentRef.setInput(key, value);
  }
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

const text = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim();

describe('TasksMain', () => {
  it('R11: host, breadcrumb, título, resumen y filtro', () => {
    const { el } = render();
    expect(el.className).toBe('l-shell__main panel l-stack');
    expect(el.getAttribute('data-gap')).toBe('m');
    expect(text(el.querySelector('app-breadcrumb'))).toContain('Tareas');
    const head = el.querySelector('.l-cluster[data-justify="between"][data-align="end"]')!;
    expect(text(head.querySelector('h1.page-title'))).toBe('Tareas');
    expect(text(head.querySelector('.page-lead'))).toBe('3 pendientes · 1 vence hoy');
    const filter = head.querySelector('app-segmented-control')!;
    expect(filter.getAttribute('aria-label')).toBe('Filtro');
    expect(Array.from(filter.querySelectorAll('button')).map(text)).toEqual([
      'Todas',
      'Hoy',
      'Pendientes',
      'Hechas',
    ]);
  });

  it('R11: elegir un filtro emite filterChanged', () => {
    const { el, fixture } = render();
    const spy = vi.fn();
    fixture.componentInstance.filterChanged.subscribe(spy);
    el.querySelectorAll<HTMLButtonElement>('app-segmented-control button')[2].click();
    expect(spy).toHaveBeenCalledWith('pendientes');
  });

  it('R12: enviar el campo emite added y lo vacía; vacío no emite', () => {
    const { el, fixture } = render();
    const spy = vi.fn();
    fixture.componentInstance.added.subscribe(spy);
    const input = el.querySelector<HTMLInputElement>('form app-text-field input')!;
    expect(input.placeholder).toBe('Agregar nueva tarea y pulsar Enter');
    expect(text(el.querySelector('form label'))).toBe('Agregar nueva tarea');
    const form = el.querySelector('form')!;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(spy).not.toHaveBeenCalled();
    input.value = 'Comprar pan';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const submit = new Event('submit', { cancelable: true });
    form.dispatchEvent(submit);
    fixture.detectChanges();
    expect(submit.defaultPrevented).toBe(true);
    expect(spy).toHaveBeenCalledWith('Comprar pan');
    expect(input.value).toBe('');
  });

  it('R13: una Card por grupo con badge y TaskItems', () => {
    const { el } = render({ selectedTaskId: 't1' });
    const cards = Array.from(el.querySelectorAll('app-card'));
    expect(cards.map((card) => text(card.querySelector('.card__title')))).toEqual([
      'Vencidas',
      'Hoy',
      'Próximas',
    ]);
    expect(cards.map((card) => card.querySelector('app-badge')!.getAttribute('data-tone'))).toEqual(
      ['danger', 'count', 'count'],
    );
    expect(text(cards[0].querySelector('app-badge'))).toBe('1');
    const [lateItem, todayItem, nextItem] = Array.from(el.querySelectorAll('app-task-item'));
    expect(
      lateItem.hasAttribute('data-overdue') || !!lateItem.querySelector('[data-overdue]'),
    ).toBe(true);
    expect(text(lateItem.querySelector('.task-item__due'))).toBe('error_outline 20 oct');
    expect(text(todayItem.querySelector('.task-item__due'))).toBe('event 22 oct');
    expect(text(todayItem)).toContain('Personal');
    expect(todayItem.hasAttribute('data-selected')).toBe(true);
    expect(nextItem.querySelector('.task-item__due')).toBeNull();
  });

  it('R14: marcar y abrir emiten toggled y taskOpened', () => {
    const { el, fixture } = render();
    const toggled = vi.fn();
    const opened = vi.fn();
    fixture.componentInstance.toggled.subscribe(toggled);
    fixture.componentInstance.taskOpened.subscribe(opened);
    el.querySelectorAll<HTMLInputElement>('app-task-item input[type="checkbox"]')[1].click();
    el.querySelectorAll<HTMLButtonElement>('app-task-item .task-item__open')[2].click();
    expect(toggled).toHaveBeenCalledWith({ id: 't1', done: true });
    expect(opened).toHaveBeenCalledWith('n1');
  });

  it('R15: sin grupos muestra «Todo al día» y «Ver todas» emite todas', () => {
    const { el, fixture } = render({ groups: [], filter: 'hechas' });
    const spy = vi.fn();
    fixture.componentInstance.filterChanged.subscribe(spy);
    const empty = el.querySelector('app-card app-empty-state')!;
    expect(text(empty.querySelector('.empty-state__title'))).toBe('Todo al día');
    expect(text(empty.querySelector('.empty-state__description'))).toBe(
      'No hay tareas con este filtro.',
    );
    expect(text(empty.querySelector('.empty-state__icon'))).toBe('task_alt');
    empty.querySelector<HTMLButtonElement>('app-button button')!.click();
    expect(spy).toHaveBeenCalledWith('todas');
  });

  it('R16: saveError muestra Alert descartable', () => {
    const { el, fixture } = render({ saveError: true });
    const spy = vi.fn();
    fixture.componentInstance.saveErrorDismissed.subscribe(spy);
    const alert = el.querySelector('app-alert')!;
    expect(text(alert)).toContain('No se pudo guardar la tarea.');
    alert.querySelector<HTMLButtonElement>('button[aria-label="Cerrar aviso"]')!.click();
    expect(spy).toHaveBeenCalled();
  });

  it('R17: cargando muestra esqueleto sin formulario ni grupos ni resumen', () => {
    const { el } = render({ status: 'loading' });
    expect(el.querySelector('app-skeleton-list')).not.toBeNull();
    expect(el.querySelector('form')).toBeNull();
    expect(el.querySelector('app-card')).toBeNull();
    expect(el.querySelector('.page-lead')).toBeNull();
  });

  it('R17: error muestra Alert con Reintentar', () => {
    const { el, fixture } = render({ status: 'error' });
    const spy = vi.fn();
    fixture.componentInstance.retry.subscribe(spy);
    const alert = el.querySelector('app-alert')!;
    expect(text(alert)).toContain('No se pudo cargar tu agenda');
    expect(text(alert)).toContain('Revisa el almacenamiento del navegador e inténtalo de nuevo.');
    alert.querySelector<HTMLButtonElement>('app-button button')!.click();
    expect(spy).toHaveBeenCalled();
    expect(el.querySelector('app-skeleton-list')).toBeNull();
  });
});
