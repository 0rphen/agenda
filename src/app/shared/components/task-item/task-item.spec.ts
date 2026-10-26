import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskItem } from './task-item';

function render(inputs: Record<string, unknown>): ComponentFixture<TaskItem> {
  const fixture = TestBed.createComponent(TaskItem);
  for (const [key, value] of Object.entries({ heading: 'Preparar presentación', ...inputs }))
    fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture;
}

function host(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

@Component({
  imports: [TaskItem],
  template: `<app-task-item
      heading="Enviar propuesta"
      title="Enviar propuesta"
      [(done)]="done"
    /><app-task-item heading="Tarea bloqueada" disabled />`,
})
class TwoWayHost {
  readonly done = signal(false);
}

describe('TaskItem', () => {
  it('R1: host .task-item con checkbox, main con título y botón chevron; sin title', () => {
    const fixture = render({});
    const el = host(fixture);
    expect(el.classList).toContain('task-item');
    const [check, main, chevron] = Array.from(el.children);
    expect(check.tagName).toBe('APP-CHECKBOX');
    expect(check.querySelector('label.check')?.children.length).toBe(2);
    expect(main.classList).toContain('task-item__main');
    expect(main.querySelector('.task-item__title')?.textContent?.trim()).toBe(
      'Preparar presentación',
    );
    expect(chevron.tagName).toBe('BUTTON');
    expect(chevron.classList).toContain('task-item__open');
    expect(chevron.textContent?.trim()).toBe('chevron_right');
    expect(el.hasAttribute('title')).toBe(false);
  });

  it('R2: aria-label «Completar: heading» en el checkbox', () => {
    expect(host(render({})).querySelector('input')?.getAttribute('aria-label')).toBe(
      'Completar: Preparar presentación',
    );
  });

  it('R3: done se refleja en el checkbox y data-done', () => {
    const done = render({ done: true });
    expect(host(done).querySelector('input')?.checked).toBe(true);
    expect(host(done).hasAttribute('data-done')).toBe(true);

    const pending = render({});
    expect(host(pending).querySelector('input')?.checked).toBe(false);
    expect(host(pending).hasAttribute('data-done')).toBe(false);
  });

  it('R4: marcar actualiza done enlazado con [(done)] y data-done', () => {
    const fixture = TestBed.createComponent(TwoWayHost);
    fixture.detectChanges();
    const item = host(fixture).querySelector<HTMLElement>('app-task-item')!;
    expect(item.hasAttribute('title')).toBe(false);
    item.querySelector('input')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.done()).toBe(true);
    expect(item.hasAttribute('data-done')).toBe(true);

    item.querySelector('input')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.done()).toBe(false);
    expect(item.hasAttribute('data-done')).toBe(false);
  });

  it('R5: .task-item__meta solo con due, subtasks o list', () => {
    expect(host(render({})).querySelector('.task-item__meta')).toBeNull();
    expect(host(render({ subtasks: 0 })).querySelector('.task-item__meta')).toBeNull();
    for (const inputs of [{ due: '22 oct' }, { subtasks: 3 }, { list: 'Trabajo' }])
      expect(
        host(render(inputs)).querySelector('.task-item__main > .task-item__meta'),
      ).not.toBeNull();
  });

  it('R6: due con ícono event s', () => {
    const span = host(render({ due: '22 oct' })).querySelector('.task-item__meta > span')!;
    const icon = span.querySelector('app-icon')!;
    expect(icon.textContent?.trim()).toBe('event');
    expect(icon.getAttribute('data-size')).toBe('s');
    expect(span.textContent?.replace('event', '').trim()).toBe('22 oct');
  });

  it('R7: subtasks con ícono checklist s, plural y singular', () => {
    const span = host(render({ subtasks: 3 })).querySelector('.task-item__meta > span')!;
    const icon = span.querySelector('app-icon')!;
    expect(icon.textContent?.trim()).toBe('checklist');
    expect(icon.getAttribute('data-size')).toBe('s');
    expect(span.textContent?.replace('checklist', '').trim()).toBe('3 subtareas');

    const one = host(render({ subtasks: 1 })).querySelector('.task-item__meta > span')!;
    expect(one.textContent?.replace('checklist', '').trim()).toBe('1 subtarea');
  });

  it('R8: list con u-category, data-category (blue por defecto) y punto', () => {
    const list = host(render({ list: 'Personal', listColor: 'red' })).querySelector(
      '.task-item__list',
    )!;
    expect(list.classList).toContain('u-category');
    expect(list.getAttribute('data-category')).toBe('red');
    const dot = list.querySelector('.badge__dot')!;
    expect(dot.hasAttribute('data-category-dot')).toBe(true);
    expect(list.textContent?.trim()).toBe('Personal');

    expect(
      host(render({ list: 'Trabajo' }))
        .querySelector('.task-item__list')
        ?.getAttribute('data-category'),
    ).toBe('blue');
  });

  it('R9: disabled da data-disabled, checkbox deshabilitado y sin chevron', () => {
    const fixture = TestBed.createComponent(TwoWayHost);
    fixture.detectChanges();
    const item = host(fixture).querySelectorAll<HTMLElement>('app-task-item')[1];
    expect(item.hasAttribute('data-disabled')).toBe(true);
    expect(item.querySelector('input')?.disabled).toBe(true);
    expect(item.querySelector('.task-item__open')).toBeNull();

    const enabled = host(render({}));
    expect(enabled.hasAttribute('data-disabled')).toBe(false);
    expect(enabled.querySelector('input')?.disabled).toBe(false);
  });

  it('R10: no declara estilos de componente', () => {
    const el = host(render({}));
    expect(Array.from(el.attributes).some((a) => a.name.startsWith('_nghost'))).toBe(false);
  });

  describe('SPEC 58', () => {
    function openedCount(fixture: ComponentFixture<TaskItem>): () => number {
      let count = 0;
      fixture.componentInstance.opened.subscribe(() => count++);
      return () => count;
    }

    it('R3: button.task-item__open type=button con aria-label y chevron_right', () => {
      const button = host(render({})).querySelector('button.task-item__open')!;
      expect(button.getAttribute('type')).toBe('button');
      expect(button.getAttribute('aria-label')).toBe('Abrir detalle: Preparar presentación');
      expect(button.querySelector('app-icon')?.textContent?.trim()).toBe('chevron_right');
    });

    it('R4: data-interactive salvo disabled', () => {
      expect(host(render({})).hasAttribute('data-interactive')).toBe(true);
      expect(host(render({ disabled: true })).hasAttribute('data-interactive')).toBe(false);
    });

    it('R5: clic en .task-item__open emite opened una sola vez', () => {
      const fixture = render({});
      const count = openedCount(fixture);
      host(fixture).querySelector<HTMLElement>('.task-item__open')!.click();
      expect(count()).toBe(1);
    });

    it('R6: clic en la fila emite opened', () => {
      const fixture = render({});
      const count = openedCount(fixture);
      host(fixture).querySelector<HTMLElement>('.task-item__title')!.click();
      host(fixture).click();
      expect(count()).toBe(2);
    });

    it('R7: clic en el checkbox no emite y alterna done', () => {
      const fixture = render({});
      const count = openedCount(fixture);
      host(fixture).querySelector<HTMLElement>('label.check')!.click();
      fixture.detectChanges();
      expect(count()).toBe(0);
      expect(fixture.componentInstance.done()).toBe(true);
    });

    it('R8: disabled no muestra .task-item__open ni emite al hacer clic en la fila', () => {
      const fixture = render({ disabled: true });
      const count = openedCount(fixture);
      expect(host(fixture).querySelector('.task-item__open')).toBeNull();
      host(fixture).querySelector<HTMLElement>('.task-item__title')!.click();
      expect(count()).toBe(0);
    });

    it('R9: selected da data-selected', () => {
      expect(host(render({ selected: true })).hasAttribute('data-selected')).toBe(true);
      expect(host(render({})).hasAttribute('data-selected')).toBe(false);
    });

    it('R10: overdue da data-overdue e ícono error_outline', () => {
      const overdue = host(render({ due: '20 oct', overdue: true }));
      expect(overdue.hasAttribute('data-overdue')).toBe(true);
      expect(overdue.querySelector('.task-item__due app-icon')?.textContent?.trim()).toBe(
        'error_outline',
      );

      const onTime = host(render({ due: '20 oct' }));
      expect(onTime.hasAttribute('data-overdue')).toBe(false);
      expect(onTime.querySelector('.task-item__due app-icon')?.textContent?.trim()).toBe('event');
    });

    it('R11: due en span.task-item__due dentro de .task-item__meta', () => {
      const due = host(render({ due: '22 oct' })).querySelector(
        '.task-item__meta > .task-item__due',
      );
      expect(due?.tagName).toBe('SPAN');
      expect(due?.textContent?.replace('event', '').trim()).toBe('22 oct');
    });

    it('R12: el checkbox va antes que el botón en el orden de tabulación', () => {
      const el = host(render({}));
      const focusables = Array.from(el.querySelectorAll('input, button'));
      expect(focusables.map((f) => f.tagName)).toEqual(['INPUT', 'BUTTON']);
    });
  });
});
