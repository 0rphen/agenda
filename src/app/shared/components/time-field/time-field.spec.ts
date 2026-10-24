import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { disabled, form, FormField } from '@angular/forms/signals';
import { DateField } from '@shared/components/date-field/date-field';
import { TimeField } from './time-field';

function render(inputs: Record<string, unknown>): ComponentFixture<TimeField> {
  const fixture = TestBed.createComponent(TimeField);
  fixture.componentRef.setInput('label', 'Hora de inicio');
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture;
}

function q<T extends Element>(fixture: ComponentFixture<unknown>, selector: string): T {
  return (fixture.nativeElement as HTMLElement).querySelector<T>(selector)!;
}

@Component({
  imports: [TimeField],
  template: `<app-time-field label="Inicio" /><app-time-field label="Fin" />`,
})
class TwoFields {}

@Component({
  imports: [DateField, TimeField],
  template: `<app-date-field label="Fecha" /><app-time-field label="Hora de inicio" />`,
})
class MixedFields {}

@Component({
  imports: [TimeField, FormField],
  template: `<app-time-field label="Hora de inicio" [formField]="eventForm.start" />`,
})
class SignalFormHost {
  readonly model = signal({ start: '08:30' });
  readonly locked = signal(false);
  readonly eventForm = form(this.model, (path) => {
    disabled(path.start, () => this.locked());
  });
}

describe('TimeField', () => {
  it('R1: host es .field con label asociado al control por for/id', () => {
    const fixture = render({ id: 'inicio' });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList).toContain('field');
    expect(host.hasAttribute('id')).toBe(false);
    const label = q<HTMLLabelElement>(fixture, 'label.field__label');
    expect(label.textContent?.trim()).toBe('Hora de inicio');
    expect(label.htmlFor).toBe('inicio');
    expect(q(fixture, 'input.input__control').id).toBe('inicio');
  });

  it('R2: sin id genera app-time-field-N distinto por instancia', () => {
    const fixture = TestBed.createComponent(TwoFields);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const [a, b] = Array.from(el.querySelectorAll('input'));
    expect(a.id).toMatch(/^app-time-field-\d+$/);
    expect(b.id).toMatch(/^app-time-field-\d+$/);
    expect(a.id).not.toBe(b.id);
    for (const label of Array.from(el.querySelectorAll('label'))) {
      expect(el.querySelector(`#${label.htmlFor}`)?.tagName).toBe('INPUT');
    }
  });

  it('R1, R2: campos de distinto tipo sin id tienen ids distintos y su label apunta a su control', () => {
    const fixture = TestBed.createComponent(MixedFields);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const [date, time] = Array.from(el.querySelectorAll('input'));
    expect(date.id).toMatch(/^app-date-field-\d+$/);
    expect(time.id).toMatch(/^app-time-field-\d+$/);
    const [dateLabel, timeLabel] = Array.from(el.querySelectorAll('label'));
    expect(dateLabel.htmlFor).toBe(date.id);
    expect(timeLabel.htmlFor).toBe(time.id);
  });

  it('R3: hint en .field__hint con id <id>-hint referenciado por aria-describedby', () => {
    const fixture = render({ id: 'inicio', hint: 'Formato 24 h' });
    const hint = q(fixture, '.field__hint');
    expect(hint.id).toBe('inicio-hint');
    expect(hint.textContent?.trim()).toBe('Formato 24 h');
    expect(q(fixture, 'input').getAttribute('aria-describedby')).toBe('inicio-hint');

    const bare = render({});
    expect(q(bare, '.field__hint')).toBeNull();
    expect(q(bare, 'input').hasAttribute('aria-describedby')).toBe(false);

    const error = render({ id: 'inicio', error: 'Empieza antes de 08:00' });
    expect(q(error, '.field__hint').id).toBe('inicio-hint');
    expect(q(error, 'input').getAttribute('aria-describedby')).toBe('inicio-hint');
  });

  it('R4: error marca data-invalid, aria-invalid, error_outline y sustituye al hint', () => {
    const fixture = render({ hint: 'Ayuda', error: 'Empieza antes de 08:00' });
    expect((fixture.nativeElement as HTMLElement).hasAttribute('data-invalid')).toBe(true);
    expect(q(fixture, '.input').hasAttribute('data-invalid')).toBe(true);
    expect(q(fixture, 'input').getAttribute('aria-invalid')).toBe('true');
    const icon = q(fixture, '.field__hint app-icon');
    expect(icon.textContent?.trim()).toBe('error_outline');
    expect(icon.getAttribute('data-size')).toBe('s');
    expect(q(fixture, '.field__hint').textContent).toContain('Empieza antes de 08:00');
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

  it('R6: elegir una hora actualiza value', () => {
    const fixture = render({});
    const control = q<HTMLInputElement>(fixture, 'input');
    control.value = '14:15';
    control.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.value()).toBe('14:15');
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
    expect(q(render({ name: 'inicio' }), 'input').getAttribute('name')).toBe('inicio');
    expect(q(render({}), 'input').hasAttribute('name')).toBe(false);
  });

  it('R23: renderiza input type=time con valor HH:mm en 24 h', () => {
    const control = q<HTMLInputElement>(render({ value: '17:45' }), 'input.input__control');
    expect(control.type).toBe('time');
    expect(control.value).toBe('17:45');
  });

  it('R24: minTime, maxTime y step se exponen solo si se pasan', () => {
    const control = q(render({ minTime: '08:00', maxTime: '20:00', step: 900 }), 'input');
    expect(control.getAttribute('min')).toBe('08:00');
    expect(control.getAttribute('max')).toBe('20:00');
    expect(control.getAttribute('step')).toBe('900');
    const bare = q(render({}), 'input');
    expect(bare.hasAttribute('min')).toBe(false);
    expect(bare.hasAttribute('max')).toBe(false);
    expect(bare.hasAttribute('step')).toBe(false);
  });

  it('R25 (SPEC 16 R3, R4): icon como data-icon en .input, sin app-icon', () => {
    const fixture = render({ icon: 'schedule' });
    expect(q(fixture, '.input').getAttribute('data-icon')).toBe('schedule');
    expect(q(fixture, '.input app-icon')).toBeNull();
    expect(q(render({}), '.input').hasAttribute('data-icon')).toBe(false);
  });
});

describe('TimeField con Signal Forms', () => {
  it('R8: refleja value y disabled del campo en ambos sentidos', () => {
    const fixture = TestBed.createComponent(SignalFormHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const control = q<HTMLInputElement>(fixture, 'input');
    expect(control.value).toBe('08:30');

    control.value = '09:00';
    control.dispatchEvent(new Event('input'));
    expect(host.model().start).toBe('09:00');

    host.model.set({ start: '13:00' });
    fixture.detectChanges();
    expect(control.value).toBe('13:00');

    control.dispatchEvent(new Event('blur'));
    expect(host.eventForm.start().touched()).toBe(true);

    host.locked.set(true);
    fixture.detectChanges();
    expect(control.disabled).toBe(true);
    expect(q(fixture, '.input').hasAttribute('data-disabled')).toBe(true);
  });
});
