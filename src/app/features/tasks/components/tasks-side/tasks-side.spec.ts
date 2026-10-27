import { TestBed } from '@angular/core/testing';
import { AgendaStatus } from '../../../agenda/domain/agenda-view.model';
import { Task } from '../../../agenda/domain/task.model';
import { TasksSide } from './tasks-side';

const task: Task = {
  id: 't1',
  title: 'Licencia',
  done: false,
  due: '2026-10-22',
  list: 'Personal',
};

function render(inputs: Partial<{ status: AgendaStatus; task: Task; detailError: boolean }> = {}) {
  const fixture = TestBed.createComponent(TasksSide);
  const values = { status: 'ready', progress: { done: 2, total: 8, value: 25 } };
  for (const [key, value] of Object.entries({ ...values, ...inputs })) {
    fixture.componentRef.setInput(key, value);
  }
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

const text = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim();

describe('TasksSide', () => {
  it('R18: host de panel y Card «Progreso»', () => {
    const { el } = render();
    expect(el.className).toBe('l-shell__panel panel l-stack');
    expect(el.getAttribute('data-variant')).toBe('side');
    expect(el.getAttribute('data-gap')).toBe('m');
    const card = el.querySelector('app-card')!;
    expect(text(card.querySelector('.card__title'))).toBe('Progreso');
    const progress = card.querySelector('app-progress')!;
    expect(progress.getAttribute('data-tone')).toBe('success');
    expect(text(progress)).toContain('2 de 8 completadas');
    expect(text(progress)).toContain('25');
  });

  it('R19: con tarea, Card «Detalle de la tarea» con TaskForm que emite saved', () => {
    const { el, fixture } = render({ task });
    const spy = vi.fn();
    fixture.componentInstance.saved.subscribe(spy);
    const card = el.querySelectorAll('app-card')[1];
    expect(text(card.querySelector('.card__title'))).toBe('Detalle de la tarea');
    const title = card.querySelector<HTMLInputElement>('app-task-form input')!;
    expect(title.value).toBe('Licencia');
    expect(card.querySelector('app-alert')).toBeNull();
    card.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Licencia', list: 'Personal' }),
    );
  });

  it('R19: detailError muestra Alert en el detalle', () => {
    const { el } = render({ task, detailError: true });
    expect(text(el.querySelectorAll('app-card')[1].querySelector('app-alert'))).toContain(
      'No se pudo guardar la tarea. Inténtalo de nuevo.',
    );
  });

  it('R20: sin tarea, EmptyState «Selecciona una tarea»', () => {
    const { el } = render();
    const empty = el.querySelectorAll('app-card')[1].querySelector('app-empty-state')!;
    expect(text(empty.querySelector('.empty-state__title'))).toBe('Selecciona una tarea');
    expect(text(empty.querySelector('.empty-state__description'))).toBe('Verás aquí sus detalles.');
    expect(text(empty.querySelector('.empty-state__icon'))).toBe('touch_app');
  });

  it('R21: cargando muestra esqueleto; con error, nada', () => {
    expect(render({ status: 'loading' }).el.querySelector('app-skeleton-list')).not.toBeNull();
    const { el } = render({ status: 'error' });
    expect(el.children).toHaveLength(0);
  });
});
