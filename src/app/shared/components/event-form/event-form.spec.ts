import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventFormValue } from '@shared/interfaces';
import { EventForm } from './event-form';

function render(inputs: Record<string, unknown> = {}): ComponentFixture<EventForm> {
  const fixture = TestBed.createComponent(EventForm);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture;
}

const root = (fixture: ComponentFixture<unknown>) => fixture.nativeElement as HTMLElement;
const text = (el: Element | null) => el?.textContent?.replace(/\s+/g, ' ').trim();

function field(fixture: ComponentFixture<unknown>, label: string): HTMLElement {
  const host = [...root(fixture).querySelectorAll<HTMLElement>('.field')].find(
    (f) => text(f.querySelector('.field__label, .switch')) === label,
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

const hint = (fixture: ComponentFixture<unknown>, label: string) =>
  text(field(fixture, label).querySelector('.field__hint'))?.replace('error_outline ', '');

const options = (fixture: ComponentFixture<unknown>, label: string) =>
  [...control<HTMLSelectElement>(fixture, label).options].map((o) => o.textContent?.trim());

const VALID = { title: 'Revisión', date: '2026-10-23' };

describe('EventForm', () => {
  it('R1: form.form.l-stack novalidate con los campos en el orden del DS', () => {
    const fixture = render();
    const form = root(fixture).querySelector('form')!;
    expect(form.classList).toContain('form');
    expect(form.classList).toContain('l-stack');
    expect(form.hasAttribute('novalidate')).toBe(true);
    const labels = [...form.querySelectorAll('.field__label, .switch')].map((l) => text(l));
    expect(labels).toEqual([
      'Título',
      'Categoría',
      'Fecha',
      'Todo el día',
      'Inicio',
      'Fin',
      'Lugar o enlace',
      'Invitados',
      'Recordatorio',
      'Repetición',
      'Notas',
    ]);
    expect(form.querySelectorAll(':scope > .l-form-grid').length).toBe(3);
    expect(control(fixture, 'Título').getAttribute('placeholder')).toBe(
      'Ej. Reunión con contratistas',
    );
    expect(
      field(fixture, 'Lugar o enlace').querySelector('.input')!.getAttribute('data-icon'),
    ).toBe('videocam');
    expect(hint(fixture, 'Invitados')).toBe('Recibirán una invitación por correo');
    expect(control(fixture, 'Notas').tagName).toBe('TEXTAREA');
    expect(form.lastElementChild!.matches('.l-cluster[data-justify="end"]')).toBe(true);
  });

  it('R2: opciones de categoría, recordatorio y repetición', () => {
    const fixture = render();
    expect(options(fixture, 'Categoría')).toEqual([
      'Marketing',
      'Estrategia',
      'Descubrimiento',
      'Desarrollo',
      'Personal',
      'Finanzas',
      'Clientes',
    ]);
    expect(options(fixture, 'Recordatorio')).toEqual([
      'Sin recordatorio',
      '5 min antes',
      '15 min antes',
      '1 hora antes',
      '1 día antes',
    ]);
    expect(options(fixture, 'Repetición')).toEqual([
      'No se repite',
      'Todos los días',
      'Cada semana',
      'Cada mes',
    ]);
  });

  it('R3: valores por defecto del DS sobrescritos por defaultValues', () => {
    const fixture = render({ defaultValues: { date: '2026-10-23', end: '11:00' } });
    expect(control<HTMLSelectElement>(fixture, 'Categoría').value).toBe('Marketing');
    expect(control<HTMLInputElement>(fixture, 'Fecha').value).toBe('2026-10-23');
    expect(control<HTMLInputElement>(fixture, 'Inicio').value).toBe('09:00');
    expect(control<HTMLInputElement>(fixture, 'Fin').value).toBe('11:00');
    expect(control<HTMLSelectElement>(fixture, 'Recordatorio').value).toBe('15 min antes');
    expect(control<HTMLSelectElement>(fixture, 'Repetición').value).toBe('No se repite');
    expect(control<HTMLInputElement>(fixture, 'Título').value).toBe('');
  });

  it('R4: cambiar defaultValues reinicia valores y oculta errores', () => {
    const fixture = render();
    type(fixture, 'Título', 'Borrador');
    submit(fixture);
    expect(hint(fixture, 'Fecha')).toBe('Elige una fecha');
    fixture.componentRef.setInput('defaultValues', { title: 'Nueva' });
    fixture.detectChanges();
    expect(control<HTMLInputElement>(fixture, 'Título').value).toBe('Nueva');
    expect(hint(fixture, 'Fecha')).toBeUndefined();
  });

  it('R5: «Todo el día» oculta Inicio y Fin', () => {
    const fixture = render();
    const sw = control<HTMLInputElement>(fixture, 'Todo el día');
    sw.checked = true;
    sw.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const labels = [...root(fixture).querySelectorAll('.field__label')].map((l) => text(l));
    expect(labels).not.toContain('Inicio');
    expect(labels).not.toContain('Fin');
  });

  it('R6: título vacío o con espacios da error', () => {
    const fixture = render({ showErrors: true, defaultValues: { date: '2026-10-23' } });
    expect(hint(fixture, 'Título')).toBe('Escribe un título para la cita');
    type(fixture, 'Título', '   ');
    expect(hint(fixture, 'Título')).toBe('Escribe un título para la cita');
  });

  it('R7: fecha vacía da error', () => {
    const fixture = render({ showErrors: true });
    expect(hint(fixture, 'Fecha')).toBe('Elige una fecha');
  });

  it('R8: fin no posterior al inicio da error salvo todo el día', () => {
    const fixture = render({ showErrors: true, defaultValues: { start: '15:00', end: '15:00' } });
    expect(hint(fixture, 'Fin')).toBe('La hora de fin debe ser posterior al inicio');
    type(fixture, 'Fin', '16:00');
    expect(hint(fixture, 'Fin')).toBeUndefined();

    const allDay = render({
      defaultValues: { ...VALID, start: '15:00', end: '14:00', allDay: true },
    });
    const saved: EventFormValue[] = [];
    allDay.componentInstance.saved.subscribe((v) => saved.push(v));
    submit(allDay);
    expect(saved.length).toBe(1);
  });

  it('R9: errores ocultos hasta guardar y en vivo después', () => {
    const fixture = render();
    expect(hint(fixture, 'Título')).toBeUndefined();
    control(fixture, 'Título').dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(hint(fixture, 'Título')).toBeUndefined();
    submit(fixture);
    expect(hint(fixture, 'Título')).toBe('Escribe un título para la cita');
    expect(field(fixture, 'Título').hasAttribute('data-invalid')).toBe(true);
    type(fixture, 'Título', 'Revisión');
    expect(hint(fixture, 'Título')).toBeUndefined();
  });

  it('R10: submit impide el envío nativo y emite saved solo sin errores', () => {
    const fixture = render();
    const saved: EventFormValue[] = [];
    fixture.componentInstance.saved.subscribe((v) => saved.push(v));
    expect(submit(fixture).defaultPrevented).toBe(true);
    expect(saved).toEqual([]);
    type(fixture, 'Título', 'Revisión');
    type(fixture, 'Fecha', '2026-10-23');
    type(fixture, 'Categoría', 'Desarrollo');
    submit(fixture);
    expect(saved).toEqual([
      {
        title: 'Revisión',
        category: 'Desarrollo',
        date: '2026-10-23',
        start: '09:00',
        end: '10:00',
        allDay: false,
        location: '',
        people: '',
        notes: '',
        reminder: '15 min antes',
        repeat: 'No se repite',
      },
    ]);
  });

  it('R11: botón submit con icono check y saveLabel', () => {
    const fixture = render();
    const button = root(fixture).querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(text(button)).toContain('Guardar cita');
    expect(button.querySelector('app-icon')).not.toBeNull();
    fixture.componentRef.setInput('saveLabel', 'Guardar cambios');
    fixture.detectChanges();
    expect(text(button)).toContain('Guardar cambios');
  });

  it('R12: «Cancelar» solo con cancelable y emite cancelled', () => {
    const fixture = render();
    expect(root(fixture).querySelectorAll('button').length).toBe(1);
    fixture.componentRef.setInput('cancelable', true);
    fixture.detectChanges();
    const [cancel] = root(fixture).querySelectorAll<HTMLButtonElement>('.l-cluster button');
    expect(text(cancel)).toBe('Cancelar');
    expect(cancel.getAttribute('data-variant')).toBe('ghost');
    let count = 0;
    fixture.componentInstance.cancelled.subscribe(() => count++);
    cancel.click();
    expect(count).toBe(1);
  });
});
