import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFormValue } from '@shared/interfaces';
import { TaskForm } from './task-form';

function render(inputs: Record<string, unknown> = {}): ComponentFixture<TaskForm> {
  const fixture = TestBed.createComponent(TaskForm);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture;
}

const root = (fixture: ComponentFixture<unknown>) => fixture.nativeElement as HTMLElement;
const text = (el: Element | null) => el?.textContent?.replace(/\s+/g, ' ').trim();

function field(fixture: ComponentFixture<unknown>, label: string): HTMLElement {
  const host = [...root(fixture).querySelectorAll<HTMLElement>('.field')].find(
    (f) => text(f.querySelector('.field__label')) === label,
  );
  if (!host) throw new Error(`no field ${label}`);
  return host;
}

const control = <T extends HTMLElement>(fixture: ComponentFixture<unknown>, label: string) =>
  field(fixture, label).querySelector<T>('input, select, textarea')!;

function type(fixture: ComponentFixture<unknown>, label: string, value: string): void {
  const el = control<HTMLInputElement>(fixture, label);
  el.value = value;
  el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input'));
  fixture.detectChanges();
}

function submit(fixture: ComponentFixture<unknown>): Event {
  const event = new Event('submit', { cancelable: true });
  root(fixture).querySelector('form')!.dispatchEvent(event);
  fixture.detectChanges();
  return event;
}

const tag = (fixture: ComponentFixture<unknown>, name: string) =>
  [...root(fixture).querySelectorAll<HTMLButtonElement>('.tag-button')].find(
    (b) => text(b) === name,
  )!;

const addInput = (fixture: ComponentFixture<unknown>) =>
  control<HTMLInputElement>(fixture, 'Agregar subtarea');

function addSubtask(fixture: ComponentFixture<unknown>, value: string): void {
  type(fixture, 'Agregar subtarea', value);
  root(fixture)
    .querySelector<HTMLButtonElement>('.icon-button[aria-label="Añadir subtarea"]')!
    .click();
  fixture.detectChanges();
}

function captureSaved(fixture: ComponentFixture<TaskForm>): TaskFormValue[] {
  const saved: TaskFormValue[] = [];
  fixture.componentInstance.saved.subscribe((v) => saved.push(v));
  return saved;
}

const EDIT: Partial<TaskFormValue> = {
  title: 'Renovar licencia de conducción',
  notes: 'Llevar cédula y comprobante de pago.',
  list: 'Personal',
  due: '2026-11-03',
  priority: 'alta',
  tags: ['Urgente'],
  subtasks: [
    { title: 'Pagar derechos', done: true },
    { title: 'Pedir cita en tránsito', done: false },
  ],
};

describe('TaskForm', () => {
  it('R1: form.form.l-stack novalidate con campos y orden del DS', () => {
    const fixture = render();
    const form = root(fixture).querySelector('form')!;
    expect(form.classList).toContain('form');
    expect(form.classList).toContain('l-stack');
    expect(form.hasAttribute('novalidate')).toBe(true);
    const children = [...form.children].map((c) =>
      c.classList.contains('l-form-grid') || c.classList.contains('l-cluster')
        ? `${c.className}`
        : text(c.querySelector('.field__label')),
    );
    expect(children).toEqual([
      'Tarea',
      'Descripción',
      'l-form-grid',
      'Prioridad',
      'Etiquetas',
      'Subtareas',
      'l-cluster',
    ]);
    expect(form.lastElementChild!.getAttribute('data-justify')).toBe('between');
    expect(control(fixture, 'Tarea').getAttribute('placeholder')).toBe(
      'Ej. Renovar licencia de conducción',
    );
    expect(control(fixture, 'Descripción').tagName).toBe('TEXTAREA');
    expect(control(fixture, 'Descripción').getAttribute('placeholder')).toBe(
      'Detalles de la tarea',
    );
    const grid = form.querySelector('.l-form-grid')!;
    expect([...grid.querySelectorAll('.field__label')].map(text)).toEqual([
      'Lista',
      'Fecha límite',
    ]);
    expect(control<HTMLInputElement>(fixture, 'Fecha límite').type).toBe('date');
  });

  it('R2: opciones de lista y prioridad', () => {
    const fixture = render();
    const options = [...control<HTMLSelectElement>(fixture, 'Lista').options];
    expect(options.map((o) => [o.value, o.text])).toEqual([
      ['Personal', 'Personal'],
      ['Trabajo', 'Trabajo'],
      ['Casa', 'Casa'],
    ]);
    const seg = field(fixture, 'Prioridad').querySelector('app-segmented-control')!;
    expect(seg.getAttribute('aria-label')).toBe('Prioridad');
    expect([...seg.querySelectorAll('button')].map(text)).toEqual(['Baja', 'Media', 'Alta']);
  });

  it('R3: valores por defecto del DS', () => {
    const fixture = render();
    const out = captureSaved(fixture);
    type(fixture, 'Tarea', 'X');
    submit(fixture);
    expect(out[0]).toEqual({
      title: 'X',
      notes: '',
      list: 'Personal',
      due: '',
      priority: 'media',
      tags: [],
      subtasks: [],
    });
  });

  it('R3: defaultValues sobrescribe y al cambiar reinicia valores, subtarea y errores', () => {
    const fixture = render({ defaultValues: EDIT });
    expect(control<HTMLInputElement>(fixture, 'Tarea').value).toBe(EDIT.title);
    expect(control<HTMLSelectElement>(fixture, 'Lista').value).toBe('Personal');
    type(fixture, 'Tarea', '');
    submit(fixture);
    type(fixture, 'Agregar subtarea', 'Algo');
    expect(field(fixture, 'Tarea').hasAttribute('data-invalid')).toBe(true);
    fixture.componentRef.setInput('defaultValues', { title: '' });
    fixture.detectChanges();
    expect(field(fixture, 'Tarea').hasAttribute('data-invalid')).toBe(false);
    expect(addInput(fixture).value).toBe('');
    expect(root(fixture).querySelectorAll('app-task-item').length).toBe(0);
  });

  it('R4: un tag-button por etiqueta con aria-pressed e icono check', () => {
    const fixture = render({ defaultValues: { tags: ['Urgente'] } });
    const buttons = [...root(fixture).querySelectorAll<HTMLButtonElement>('.tag-button')];
    expect(buttons.map(text)).toEqual(['check Urgente', 'Cliente', 'Revisión', 'Personal']);
    expect(buttons.every((b) => b.type === 'button')).toBe(true);
    expect(buttons.map((b) => b.getAttribute('aria-pressed'))).toEqual([
      'true',
      'false',
      'false',
      'false',
    ]);
    expect(buttons[0].querySelector('app-icon')!.getAttribute('data-size')).toBe('s');
    expect(buttons[1].querySelector('app-icon')).toBeNull();
  });

  it('R5: pulsar etiqueta alterna su presencia en tags', () => {
    const fixture = render({ defaultValues: { title: 'X', tags: ['Urgente'] } });
    const out = captureSaved(fixture);
    tag(fixture, 'check Urgente').click();
    tag(fixture, 'Cliente').click();
    fixture.detectChanges();
    expect(tag(fixture, 'check Cliente').getAttribute('aria-pressed')).toBe('true');
    expect(tag(fixture, 'Urgente').getAttribute('aria-pressed')).toBe('false');
    submit(fixture);
    expect(out[0].tags).toEqual(['Cliente']);
  });

  it('R6: app-task-item por subtarea y marcar actualiza done', () => {
    const fixture = render({ defaultValues: EDIT });
    const items = [...root(fixture).querySelectorAll('app-task-item')];
    expect(items.map((i) => text(i.querySelector('.task-item__title')))).toEqual([
      'Pagar derechos',
      'Pedir cita en tránsito',
    ]);
    expect(items[0].hasAttribute('data-done')).toBe(true);
    expect(items[1].hasAttribute('data-done')).toBe(false);
    const out = captureSaved(fixture);
    items[1].querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
    fixture.detectChanges();
    submit(fixture);
    // Signal Forms tags array items with symbol keys; compare plain fields
    expect(out[0].subtasks.map(({ title, done }) => ({ title, done }))).toEqual([
      { title: 'Pagar derechos', done: true },
      { title: 'Pedir cita en tránsito', done: true },
    ]);
  });

  it('R7: campo de subtarea con label oculto, grow e icon-button tonal', () => {
    const fixture = render();
    const host = field(fixture, 'Agregar subtarea');
    expect(host.parentElement!.classList).toContain('l-cluster');
    expect(host.parentElement!.hasAttribute('data-nowrap')).toBe(true);
    expect(host.hasAttribute('data-grow')).toBe(true);
    expect(host.querySelector('.field__label')!.classList).toContain('u-visually-hidden');
    expect(addInput(fixture).getAttribute('placeholder')).toBe('Agregar subtarea');
    expect(host.querySelector('.input')!.getAttribute('data-icon')).toBe('add');
    const btn = host.parentElement!.querySelector('.icon-button')!;
    expect(btn.getAttribute('aria-label')).toBe('Añadir subtarea');
    expect(btn.getAttribute('data-variant')).toBe('tonal');
  });

  it('R8: añadir subtarea recorta, la agrega al final y vacía el campo', () => {
    const fixture = render({ defaultValues: EDIT });
    addSubtask(fixture, '  Llevar foto  ');
    const titles = [...root(fixture).querySelectorAll('.task-item__title')].map(text);
    expect(titles.at(-1)).toBe('Llevar foto');
    expect(root(fixture).querySelectorAll('app-task-item')[2].hasAttribute('data-done')).toBe(
      false,
    );
    expect(addInput(fixture).value).toBe('');
  });

  it('R8: texto vacío o solo espacios no añade subtarea', () => {
    const fixture = render();
    addSubtask(fixture, '   ');
    expect(root(fixture).querySelectorAll('app-task-item').length).toBe(0);
  });

  it('R9: error de título solo tras guardar, en vivo después', () => {
    const fixture = render();
    type(fixture, 'Tarea', '   ');
    expect(field(fixture, 'Tarea').hasAttribute('data-invalid')).toBe(false);
    submit(fixture);
    expect(text(field(fixture, 'Tarea').querySelector('.field__hint'))).toBe(
      'error_outline La tarea necesita un título',
    );
    type(fixture, 'Tarea', 'Comprar pan');
    expect(field(fixture, 'Tarea').hasAttribute('data-invalid')).toBe(false);
  });

  it('R9: showErrors muestra el error sin guardar', () => {
    const fixture = render({ showErrors: true });
    expect(field(fixture, 'Tarea').hasAttribute('data-invalid')).toBe(true);
  });

  it('R10: submit impide el envío nativo y emite saved solo sin errores', () => {
    const fixture = render();
    const out = captureSaved(fixture);
    expect(submit(fixture).defaultPrevented).toBe(true);
    expect(out).toEqual([]);
    type(fixture, 'Tarea', 'Comprar pan');
    type(fixture, 'Lista', 'Trabajo');
    submit(fixture);
    expect(out.length).toBe(1);
    expect(out[0].title).toBe('Comprar pan');
    expect(out[0].list).toBe('Trabajo');
  });

  it('R11: botón submit accent «Guardar cambios» al final', () => {
    const fixture = render();
    const last = root(fixture).querySelector('form > .l-cluster')!.lastElementChild!;
    const button = last.querySelector('button')!;
    expect(button.type).toBe('submit');
    expect(button.getAttribute('data-variant')).toBe('accent');
    expect(text(button)).toBe('Guardar cambios');
  });

  it('R12: deletable muestra «Eliminar tarea» y emite deleted; si no, span vacío', () => {
    const plain = render();
    const first = root(plain).querySelector('form > .l-cluster')!.firstElementChild!;
    expect(first.tagName).toBe('SPAN');
    expect(text(first)).toBe('');

    const fixture = render({ deletable: true });
    let deleted = 0;
    fixture.componentInstance.deleted.subscribe(() => deleted++);
    const saved = captureSaved(fixture);
    const button = root(fixture)
      .querySelector('form > .l-cluster')!
      .firstElementChild!.querySelector('button')!;
    expect(button.getAttribute('data-variant')).toBe('ghost-danger');
    expect(text(button)).toBe('delete_outline Eliminar tarea');
    expect(button.type).toBe('button');
    button.click();
    expect(deleted).toBe(1);
    expect(saved).toEqual([]);
  });

  describe('SPEC 70 subtareas', () => {
    const titles = (fixture: ComponentFixture<TaskForm>) =>
      [...root(fixture).querySelectorAll('.task-item__title')].map((t) => text(t));
    const enter = (el: Element, key = 'Enter') => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      el.dispatchEvent(event);
      return event;
    };
    const iconButton = (fixture: ComponentFixture<unknown>, label: string) =>
      root(fixture).querySelector<HTMLButtonElement>(`.icon-button[aria-label="${label}"]`)!;
    const editInput = (fixture: ComponentFixture<unknown>) =>
      root(fixture).querySelector<HTMLInputElement>('[data-subtask-edit] input')!;

    it('R4: Enter en «Agregar subtarea» añade, vacía y no emite saved', () => {
      const fixture = render({ defaultValues: EDIT });
      const saved = captureSaved(fixture);
      type(fixture, 'Agregar subtarea', '  Llevar foto  ');
      const event = enter(addInput(fixture));
      fixture.detectChanges();
      expect(event.defaultPrevented).toBe(true);
      expect(titles(fixture)).toEqual(['Pagar derechos', 'Pedir cita en tránsito', 'Llevar foto']);
      expect(addInput(fixture).value).toBe('');
      expect(saved).toEqual([]);
    });

    it('R5: Enter con el campo vacío o con espacios no añade ni emite saved', () => {
      const fixture = render({ defaultValues: EDIT });
      const saved = captureSaved(fixture);
      type(fixture, 'Agregar subtarea', '   ');
      expect(enter(addInput(fixture)).defaultPrevented).toBe(true);
      fixture.detectChanges();
      expect(titles(fixture).length).toBe(2);
      expect(saved).toEqual([]);
    });

    it('R6: «Quitar subtarea: <título>» la elimina de subtasks', () => {
      const fixture = render({ defaultValues: EDIT });
      const saved = captureSaved(fixture);
      iconButton(fixture, 'Quitar subtarea: Pagar derechos').click();
      fixture.detectChanges();
      expect(titles(fixture)).toEqual(['Pedir cita en tránsito']);
      submit(fixture);
      expect(saved[0].subtasks.map((s) => s.title)).toEqual(['Pedir cita en tránsito']);
    });

    it('R7: editar cambia la fila a campo; Enter guarda, Escape cancela, vacío mantiene', () => {
      const fixture = render({ defaultValues: EDIT });
      iconButton(fixture, 'Editar subtarea: Pagar derechos').click();
      fixture.detectChanges();
      expect(editInput(fixture).value).toBe('Pagar derechos');
      editInput(fixture).value = 'Pagar tasa';
      editInput(fixture).dispatchEvent(new Event('input'));
      enter(editInput(fixture));
      fixture.detectChanges();
      expect(editInput(fixture)).toBeNull();
      expect(titles(fixture)[0]).toBe('Pagar tasa');

      iconButton(fixture, 'Editar subtarea: Pagar tasa').click();
      fixture.detectChanges();
      editInput(fixture).value = 'Otra cosa';
      editInput(fixture).dispatchEvent(new Event('input'));
      enter(editInput(fixture), 'Escape');
      fixture.detectChanges();
      expect(titles(fixture)[0]).toBe('Pagar tasa');

      iconButton(fixture, 'Editar subtarea: Pagar tasa').click();
      fixture.detectChanges();
      editInput(fixture).value = '  ';
      editInput(fixture).dispatchEvent(new Event('input'));
      editInput(fixture).dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      fixture.detectChanges();
      expect(editInput(fixture)).toBeNull();
      expect(titles(fixture)[0]).toBe('Pagar tasa');
    });

    it('R7: perder el foco con texto guarda el título', () => {
      const fixture = render({ defaultValues: EDIT });
      iconButton(fixture, 'Editar subtarea: Pedir cita en tránsito').click();
      fixture.detectChanges();
      editInput(fixture).value = 'Pedir cita';
      editInput(fixture).dispatchEvent(new Event('input'));
      editInput(fixture).dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      fixture.detectChanges();
      expect(titles(fixture)[1]).toBe('Pedir cita');
    });

    it('R8: Enter en una subtarea en edición no envía el formulario', () => {
      const fixture = render({ defaultValues: EDIT });
      const saved = captureSaved(fixture);
      iconButton(fixture, 'Editar subtarea: Pagar derechos').click();
      fixture.detectChanges();
      expect(enter(editInput(fixture)).defaultPrevented).toBe(true);
      expect(saved).toEqual([]);
    });
  });
});
