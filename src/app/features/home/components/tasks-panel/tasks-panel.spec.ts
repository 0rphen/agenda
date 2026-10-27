import { TestBed } from '@angular/core/testing';
import { AgendaStatus, ListProgress } from '../../../agenda/domain/agenda-view.model';
import { Task } from '../../../agenda/domain/task.model';
import { TasksPanel } from './tasks-panel';

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
      { title: 'Gráficos', done: false },
    ],
  },
  { id: 't2', title: 'Fruta', done: true, list: 'Casa', listColor: 'green' },
];
const progress: ListProgress[] = [
  { list: 'Casa', value: 100 },
  { list: 'Trabajo', value: 50 },
];

function render(
  inputs: Partial<{
    status: AgendaStatus;
    selectedDay: string;
    tasks: Task[];
    progress: ListProgress[];
    saveError: boolean;
    selectedTaskId: string;
  }> = {},
) {
  const fixture = TestBed.createComponent(TasksPanel);
  const values = { status: 'ready', selectedDay: '2026-10-22', tasks, progress, ...inputs };
  fixture.componentRef.setInput('today', '2026-10-22');
  fixture.componentRef.setInput('pendingCount', 1);
  for (const [key, value] of Object.entries(values)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('TasksPanel', () => {
  it('R28: cabecera «Hoy» con badge count', () => {
    const { el } = render();
    expect(el.querySelector('h2.section-title')?.textContent?.trim()).toBe('Hoy');
    const badge = el.querySelector('app-badge')!;
    expect(badge.getAttribute('data-tone')).toBe('count');
    expect(badge.textContent?.trim()).toBe('1');
  });

  it('R28: otro día muestra el día corto', () => {
    expect(render({ selectedDay: '2026-10-23' }).el.querySelector('h2')?.textContent?.trim()).toBe(
      '23 oct',
    );
  });

  it('R29: campo con label oculto, placeholder e icono', () => {
    const field = render().el.querySelector('app-text-field')!;
    const label = field.querySelector('label')!;
    expect(label.textContent?.trim()).toBe('Agregar nueva tarea');
    expect(label.classList).toContain('u-visually-hidden');
    expect(field.querySelector('input')?.placeholder).toBe('Agregar nueva tarea');
    expect(field.querySelector('.input')?.getAttribute('data-icon')).toBe('add');
  });

  it('R30: lista las tareas recibidas con meta', () => {
    const items = render().el.querySelectorAll('app-task-item');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toContain('Trabajo');
    expect(items[0].textContent).toContain('3 subtareas');
  });

  it('SPEC 60 R5: sin subtareas no muestra recuento', () => {
    const items = render({ tasks: [{ ...tasks[0], subtasks: [] }] }).el.querySelectorAll(
      'app-task-item',
    );
    expect(items[0].textContent).not.toContain('subtarea');
  });

  it('R31: sin tareas muestra empty state', () => {
    const empty = render({ tasks: [] }).el.querySelector('app-empty-state')!;
    expect(empty.querySelector('.empty-state__title')?.textContent?.trim()).toBe('Sin tareas');
    expect(empty.textContent).toContain('No hay tareas para este día.');
    expect(empty.textContent).toContain('task_alt');
  });

  it('R32: marcar tarea emite toggled', () => {
    const { fixture, el } = render();
    const emitted: { id: string; done: boolean }[] = [];
    fixture.componentInstance.toggled.subscribe((value) => emitted.push(value));
    el.querySelector<HTMLInputElement>('app-task-item input[type="checkbox"]')!.click();
    expect(emitted).toEqual([{ id: 't1', done: true }]);
  });

  it('R33: saveError muestra alert dismissible que emite al cerrar', () => {
    const { fixture, el } = render({ saveError: true });
    const alert = el.querySelector('app-alert')!;
    expect(alert.getAttribute('data-tone')).toBe('danger');
    expect(alert.textContent).toContain('No se pudo guardar la tarea.');
    let dismissed = 0;
    fixture.componentInstance.saveErrorDismissed.subscribe(() => dismissed++);
    alert.querySelector<HTMLButtonElement>('button[aria-label="Cerrar aviso"]')!.click();
    expect(dismissed).toBe(1);
  });

  it('R34: card de avance con un progress por lista; success a 100', () => {
    const card = render().el.querySelector('app-card')!;
    expect(card.textContent).toContain('Avance de la semana');
    const bars = card.querySelectorAll('app-progress');
    expect([...bars].map((bar) => bar.querySelector('.progress__title')?.textContent)).toEqual([
      'Casa',
      'Trabajo',
    ]);
    expect(bars[0].getAttribute('data-tone')).toBe('success');
    expect(bars[1].getAttribute('data-tone')).not.toBe('success');
  });

  it('R34: sin tareas en la semana no hay card', () => {
    expect(render({ progress: [] }).el.querySelector('app-card')).toBeNull();
  });

  it('R16: mientras carga muestra skeleton task', () => {
    const { el } = render({ status: 'loading' });
    expect(el.querySelector('app-skeleton-list')?.getAttribute('data-variant')).toBe('task');
    expect(el.querySelector('app-task-item')).toBeNull();
  });

  it('R17: en error no muestra contenido', () => {
    const { el } = render({ status: 'error' });
    expect(
      el.querySelector('app-skeleton-list, app-task-item, app-text-field, app-card'),
    ).toBeNull();
  });

  it('SPEC 58 R13: pendiente con due anterior a hoy pasa overdue y fecha corta', () => {
    const late: Task[] = [{ id: 't3', title: 'Factura', done: false, due: '2026-10-20' }];
    const item = render({ selectedDay: '2026-10-20', tasks: late }).el.querySelector(
      'app-task-item',
    )!;
    expect(item.hasAttribute('data-overdue')).toBe(true);
    expect(item.querySelector('.task-item__due')?.textContent).toContain('20 oct');
  });

  it('SPEC 58 R14: hecha o con due hoy o posterior no pasa overdue ni due', () => {
    const items: Task[] = [
      { id: 't4', title: 'Hecha', done: true, due: '2026-10-20' },
      { id: 't5', title: 'Hoy', done: false, due: '2026-10-22' },
      { id: 't6', title: 'Mañana', done: false, due: '2026-10-23' },
    ];
    for (const item of render({ tasks: items }).el.querySelectorAll('app-task-item')) {
      expect(item.hasAttribute('data-overdue')).toBe(false);
      expect(item.querySelector('.task-item__due')).toBeNull();
    }
  });

  it('R35: clases de host', () => {
    expect([...render().el.classList]).toEqual(['l-shell__tasks', 'panel', 'l-stack']);
  });

  it('SPEC 60 R21: abrir una tarea emite taskOpened con su id', () => {
    const { fixture, el } = render();
    const spy = vi.fn();
    fixture.componentInstance.taskOpened.subscribe(spy);
    el.querySelectorAll<HTMLButtonElement>('app-task-item .task-item__open')[1].click();
    expect(spy).toHaveBeenCalledWith('t2');
  });

  it('SPEC 60 R13: selectedTaskId marca solo esa tarea', () => {
    const items = render({ selectedTaskId: 't1' }).el.querySelectorAll('app-task-item');
    expect([...items].map((item) => item.hasAttribute('data-selected'))).toEqual([true, false]);
  });
});
