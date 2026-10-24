import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { disabled, form, FormField } from '@angular/forms/signals';
import { DateField } from './date-field';

function render(inputs: Record<string, unknown>): ComponentFixture<DateField> {
  const fixture = TestBed.createComponent(DateField);
  fixture.componentRef.setInput('label', 'Fecha');
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture;
}

function q<T extends Element>(fixture: ComponentFixture<unknown>, selector: string): T {
  return (fixture.nativeElement as HTMLElement).querySelector<T>(selector)!;
}

@Component({
  imports: [DateField],
  template: `<app-date-field label="Fecha" /><app-date-field label="Fecha" />`,
})
class TwoFields {}

@Component({
  imports: [DateField, FormField],
  template: `<app-date-field label="Fecha" [formField]="eventForm.date" />`,
})
class SignalFormHost {
  readonly model = signal({ date: '2026-10-23' });
  readonly locked = signal(false);
  readonly eventForm = form(this.model, (path) => {
    disabled(path.date, () => this.locked());
  });
}

describe('DateField', () => {
  it('R1: host es .field con label asociado al control por for/id', () => {
    const fixture = render({ id: 'fecha' });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList).toContain('field');
    expect(host.hasAttribute('id')).toBe(false);
    const label = q<HTMLLabelElement>(fixture, 'label.field__label');
    expect(label.textContent?.trim()).toBe('Fecha');
    expect(label.htmlFor).toBe('fecha');
    expect(q(fixture, 'input.input__control').id).toBe('fecha');
  });

  it('R2: sin id genera app-date-field-N distinto por instancia', () => {
    const fixture = TestBed.createComponent(TwoFields);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const [a, b] = Array.from(el.querySelectorAll('input'));
    expect(a.id).toMatch(/^app-date-field-\d+$/);
    expect(b.id).toMatch(/^app-date-field-\d+$/);
    expect(a.id).not.toBe(b.id);
    for (const label of Array.from(el.querySelectorAll('label'))) {
      expect(el.querySelector(`#${label.htmlFor}`)?.tagName).toBe('INPUT');
    }
  });

  it('R3: hint en .field__hint con id <id>-hint referenciado por aria-describedby', () => {
    const fixture = render({ id: 'fecha', hint: 'Día del evento' });
    const hint = q(fixture, '.field__hint');
    expect(hint.id).toBe('fecha-hint');
    expect(hint.textContent?.trim()).toBe('Día del evento');
    expect(q(fixture, 'input').getAttribute('aria-describedby')).toBe('fecha-hint');

    const bare = render({});
    expect(q(bare, '.field__hint')).toBeNull();
    expect(q(bare, 'input').hasAttribute('aria-describedby')).toBe(false);

    const error = render({ id: 'fecha', error: 'La fecha ya pasó' });
    expect(q(error, '.field__hint').id).toBe('fecha-hint');
    expect(q(error, 'input').getAttribute('aria-describedby')).toBe('fecha-hint');
  });

  it('R4: error marca data-invalid, aria-invalid, error_outline y sustituye al hint', () => {
    const fixture = render({ hint: 'Ayuda', error: 'La fecha ya pasó' });
    expect((fixture.nativeElement as HTMLElement).hasAttribute('data-invalid')).toBe(true);
    expect(q(fixture, '.input').hasAttribute('data-invalid')).toBe(true);
    expect(q(fixture, 'input').getAttribute('aria-invalid')).toBe('true');
    const icon = q(fixture, '.field__hint app-icon');
    expect(icon.textContent?.trim()).toBe('error_outline');
    expect(icon.getAttribute('data-size')).toBe('s');
    expect(q(fixture, '.field__hint').textContent).toContain('La fecha ya pasó');
    expect(q(fixture, '.field__hint').textContent).not.toContain('Ayuda');

    const valid = render({ hint: 'Ayuda', error: '' });
    expect((valid.nativeElement as HTMLElement).hasAttribute('data-invalid')).toBe(false);
    expect(q(valid, '.input').hasAttribute('data-invalid')).toBe(false);
    expect(q(valid, 'input').hasAttribute('aria-invalid')).toBe(false);
    expect(q(valid, '.field__hint app-icon')).toBeNull();
  });

  it('R5: disabled deshabilita el control y marca data-disabled', () => {
    const fixture = render({ disabled: true });
    expect(q<HTMLInputElement>(fixture, 'input').disabled).toBe(true);
    expect(q(fixture, '.input').hasAttribute('data-disabled')).toBe(true);

    const enabled = render({});
    expect(q<HTMLInputElement>(enabled, 'input').disabled).toBe(false);
    expect(q(enabled, '.input').hasAttribute('data-disabled')).toBe(false);
  });

  it('R6: elegir una fecha actualiza value', () => {
    const fixture = render({});
    const control = q<HTMLInputElement>(fixture, 'input');
    control.value = '2026-11-02';
    control.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.value()).toBe('2026-11-02');
  });

  it('R7: perder el foco pone touched en true', () => {
    const fixture = render({});
    expect(fixture.componentInstance.touched()).toBe(false);
    q(fixture, 'input').dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.touched()).toBe(true);
  });

  it('R9: no declara estilos de componente', () => {
    const fixture = render({});
    const host = fixture.nativeElement as HTMLElement;
    expect(Array.from(host.attributes).some((a) => a.name.startsWith('_nghost'))).toBe(false);
  });

  it('R10: name se expone en el control solo si se pasa', () => {
    expect(q(render({ name: 'fecha' }), 'input').getAttribute('name')).toBe('fecha');
    expect(q(render({}), 'input').hasAttribute('name')).toBe(false);
  });

  it('R20: renderiza input type=date con valor YYYY-MM-DD', () => {
    const control = q<HTMLInputElement>(render({ value: '2026-10-23' }), 'input.input__control');
    expect(control.type).toBe('date');
    expect(control.value).toBe('2026-10-23');
  });

  it('R21: minDate y maxDate se exponen solo si se pasan', () => {
    const control = q(render({ minDate: '2026-01-01', maxDate: '2026-12-31' }), 'input');
    expect(control.getAttribute('min')).toBe('2026-01-01');
    expect(control.getAttribute('max')).toBe('2026-12-31');
    const bare = q(render({}), 'input');
    expect(bare.hasAttribute('min')).toBe(false);
    expect(bare.hasAttribute('max')).toBe(false);
  });

  it('R22 (SPEC 16 R3, R4): icon como data-icon en .input, sin app-icon', () => {
    const fixture = render({ icon: 'event' });
    expect(q(fixture, '.input').getAttribute('data-icon')).toBe('event');
    expect(q(fixture, '.input app-icon')).toBeNull();
    expect(q(render({}), '.input').hasAttribute('data-icon')).toBe(false);
  });
});

describe('DateField con Signal Forms', () => {
  it('R8: refleja value y disabled del campo en ambos sentidos', () => {
    const fixture = TestBed.createComponent(SignalFormHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const control = q<HTMLInputElement>(fixture, 'input');
    expect(control.value).toBe('2026-10-23');

    control.value = '2026-11-02';
    control.dispatchEvent(new Event('input'));
    expect(host.model().date).toBe('2026-11-02');

    host.model.set({ date: '2026-12-01' });
    fixture.detectChanges();
    expect(control.value).toBe('2026-12-01');

    control.dispatchEvent(new Event('blur'));
    expect(host.eventForm.date().touched()).toBe(true);

    host.locked.set(true);
    fixture.detectChanges();
    expect(control.disabled).toBe(true);
    expect(q(fixture, '.input').hasAttribute('data-disabled')).toBe(true);
  });
});
