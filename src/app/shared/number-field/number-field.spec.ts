import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { disabled, form, FormField, max, min } from '@angular/forms/signals';
import { NumberField } from './number-field';

function render(inputs: Record<string, unknown>): ComponentFixture<NumberField> {
  const fixture = TestBed.createComponent(NumberField);
  fixture.componentRef.setInput('label', 'Asistentes');
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture;
}

function q<T extends Element>(fixture: ComponentFixture<unknown>, selector: string): T {
  return (fixture.nativeElement as HTMLElement).querySelector<T>(selector)!;
}

function type(fixture: ComponentFixture<NumberField>, text: string): void {
  const control = q<HTMLInputElement>(fixture, 'input');
  control.value = text;
  control.dispatchEvent(new Event('input'));
}

@Component({
  imports: [NumberField],
  template: `<app-number-field label="Asistentes" /><app-number-field label="Asistentes" />`,
})
class TwoFields {}

@Component({
  imports: [NumberField, FormField],
  template: `<app-number-field label="Asistentes" [formField]="eventForm.guests" />`,
})
class SignalFormHost {
  readonly model = signal<{ guests: number | null }>({ guests: 4 });
  readonly locked = signal(false);
  readonly eventForm = form(this.model, (path) => {
    disabled(path.guests, () => this.locked());
    min(path.guests, 1);
    max(path.guests, 20);
  });
}

describe('NumberField', () => {
  it('R12 (SPEC 04 R1): host es .field con label asociado al control por for/id', () => {
    const fixture = render({ id: 'asistentes' });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList).toContain('field');
    expect(host.hasAttribute('id')).toBe(false);
    const label = q<HTMLLabelElement>(fixture, 'label.field__label');
    expect(label.textContent?.trim()).toBe('Asistentes');
    expect(label.htmlFor).toBe('asistentes');
    expect(q(fixture, 'input.input__control').id).toBe('asistentes');
  });

  it('R12 (SPEC 04 R2): sin id genera app-number-field-N distinto por instancia', () => {
    const fixture = TestBed.createComponent(TwoFields);
    fixture.detectChanges();
    const [a, b] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('input'));
    expect(a.id).toMatch(/^app-number-field-\d+$/);
    expect(b.id).toMatch(/^app-number-field-\d+$/);
    expect(a.id).not.toBe(b.id);
  });

  it('R12 (SPEC 04 R3): hint con id <id>-hint referenciado por aria-describedby', () => {
    const fixture = render({ id: 'asistentes', hint: 'Incluido tú' });
    const hint = q(fixture, '.field__hint');
    expect(hint.id).toBe('asistentes-hint');
    expect(hint.textContent?.trim()).toBe('Incluido tú');
    expect(q(fixture, 'input').getAttribute('aria-describedby')).toBe('asistentes-hint');
    expect(q(render({}), '.field__hint')).toBeNull();
  });

  it('R12 (SPEC 04 R4): error marca data-invalid, aria-invalid, error_outline y sustituye al hint', () => {
    const fixture = render({ hint: 'Ayuda', error: 'Escribe un número igual o mayor que 1' });
    expect((fixture.nativeElement as HTMLElement).hasAttribute('data-invalid')).toBe(true);
    expect(q(fixture, '.input').hasAttribute('data-invalid')).toBe(true);
    expect(q(fixture, 'input').getAttribute('aria-invalid')).toBe('true');
    expect(q(fixture, '.field__hint app-icon').textContent?.trim()).toBe('error_outline');
    expect(q(fixture, '.field__hint').textContent).not.toContain('Ayuda');

    const valid = render({ error: '' });
    expect(q(valid, 'input').hasAttribute('aria-invalid')).toBe(false);
  });

  it('R12 (SPEC 04 R5): disabled deshabilita el control y marca data-disabled', () => {
    const fixture = render({ disabled: true });
    expect(q<HTMLInputElement>(fixture, 'input').disabled).toBe(true);
    expect(q(fixture, '.input').hasAttribute('data-disabled')).toBe(true);
  });

  it('R12 (SPEC 04 R7): perder el foco pone touched en true', () => {
    const fixture = render({});
    q(fixture, 'input').dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.touched()).toBe(true);
  });

  it('R12 (SPEC 04 R9): no declara estilos de componente', () => {
    const host = render({}).nativeElement as HTMLElement;
    expect(Array.from(host.attributes).some((a) => a.name.startsWith('_nghost'))).toBe(false);
  });

  it('R12 (SPEC 04 R10): name se expone en el control solo si se pasa', () => {
    expect(q(render({ name: 'asistentes' }), 'input').getAttribute('name')).toBe('asistentes');
    expect(q(render({}), 'input').hasAttribute('name')).toBe(false);
  });

  it('R13: renderiza input type=number inputmode=decimal .input__control', () => {
    const control = q<HTMLInputElement>(render({}), 'input.input__control');
    expect(control.type).toBe('number');
    expect(control.getAttribute('inputmode')).toBe('decimal');
  });

  it('R14: min, max y step como atributos solo si se pasan', () => {
    const control = q(render({ min: 1, max: 20, step: 0.5 }), 'input');
    expect(control.getAttribute('min')).toBe('1');
    expect(control.getAttribute('max')).toBe('20');
    expect(control.getAttribute('step')).toBe('0.5');
    const bare = q(render({}), 'input');
    for (const attr of ['min', 'max', 'step']) expect(bare.hasAttribute(attr)).toBe(false);
  });

  it('R15 (SPEC 04 R6): escribir un número actualiza value con number', () => {
    const fixture = render({});
    type(fixture, '12.5');
    expect(fixture.componentInstance.value()).toBe(12.5);
  });

  it('R16: vacío o no numérico pone value en null', () => {
    const fixture = render({ value: 3 });
    type(fixture, '');
    expect(fixture.componentInstance.value()).toBeNull();
    fixture.componentInstance.value.set(3);
    type(fixture, 'abc');
    expect(fixture.componentInstance.value()).toBeNull();
  });

  it('R17: value null muestra el control vacío', () => {
    const fixture = render({ value: 7 });
    expect(q<HTMLInputElement>(fixture, 'input').value).toBe('7');
    fixture.componentRef.setInput('value', null);
    fixture.detectChanges();
    expect(q<HTMLInputElement>(fixture, 'input').value).toBe('');
  });

  it('R18: placeholder e icon como en app-text-field', () => {
    const fixture = render({ placeholder: 'Número de personas', icon: 'group' });
    expect(q(fixture, 'input').getAttribute('placeholder')).toBe('Número de personas');
    const first = q(fixture, '.input > :first-child');
    expect(first.tagName).toBe('APP-ICON');
    expect(first.textContent?.trim()).toBe('group');
    const bare = render({});
    expect(q(bare, 'input').hasAttribute('placeholder')).toBe(false);
    expect(q(bare, 'app-icon')).toBeNull();
  });
});

describe('NumberField sin pisar el texto del control (SPEC 09)', () => {
  it('R1: texto no numérico pone value en null sin escribir en el control', async () => {
    const fixture = render({});
    type(fixture, '1');
    fixture.detectChanges();
    await fixture.whenStable();

    // jsdom sanea "1e" a "", así que se simula lo que da el navegador
    const control = q<HTMLInputElement>(fixture, 'input');
    const setValue = vi.fn();
    Object.defineProperty(control, 'valueAsNumber', { get: () => NaN, configurable: true });
    Object.defineProperty(control, 'value', { get: () => '1e', set: setValue, configurable: true });
    control.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBeNull();
    expect(setValue).not.toHaveBeenCalled();
  });

  it('R2: value desde fuera a otro número lo escribe en el control', async () => {
    const fixture = render({ value: 3 });
    await fixture.whenStable();
    fixture.componentRef.setInput('value', 8);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(q<HTMLInputElement>(fixture, 'input').value).toBe('8');
  });

  it('R3: value desde fuera a null vacía un control con número válido', async () => {
    const fixture = render({});
    type(fixture, '6');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentRef.setInput('value', null);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(q<HTMLInputElement>(fixture, 'input').value).toBe('');
  });

  it('R4: si valueAsNumber coincide con value no escribe en el control', async () => {
    const fixture = render({ value: 3 });
    await fixture.whenStable();

    const control = q<HTMLInputElement>(fixture, 'input');
    const setValue = vi.fn();
    Object.defineProperty(control, 'valueAsNumber', { get: () => 5, configurable: true });
    Object.defineProperty(control, 'value', { get: () => '5', set: setValue, configurable: true });
    control.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe(5);
    expect(setValue).not.toHaveBeenCalled();
  });

  it('R5: value se expone como atributo value solo si no es null', async () => {
    const fixture = render({ value: 5 });
    const control = q(fixture, 'input');
    expect(control.getAttribute('value')).toBe('5');
    fixture.componentRef.setInput('value', null);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(control.hasAttribute('value')).toBe(false);
  });
});

describe('NumberField con Signal Forms', () => {
  it('R12 (SPEC 04 R8): refleja value, disabled, min y max del campo', () => {
    const fixture = TestBed.createComponent(SignalFormHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const control = q<HTMLInputElement>(fixture, 'input');
    expect(control.value).toBe('4');
    expect(control.getAttribute('min')).toBe('1');
    expect(control.getAttribute('max')).toBe('20');

    control.value = '9';
    control.dispatchEvent(new Event('input'));
    expect(host.model().guests).toBe(9);

    control.value = '';
    control.dispatchEvent(new Event('input'));
    expect(host.model().guests).toBeNull();

    host.model.set({ guests: 12 });
    fixture.detectChanges();
    expect(control.value).toBe('12');

    control.dispatchEvent(new Event('blur'));
    expect(host.eventForm.guests().touched()).toBe(true);

    host.locked.set(true);
    fixture.detectChanges();
    expect(control.disabled).toBe(true);
  });
});
