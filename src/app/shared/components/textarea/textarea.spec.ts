import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { disabled, form, FormField } from '@angular/forms/signals';
import { TextareaField } from './textarea';

function render(inputs: Record<string, unknown>): ComponentFixture<TextareaField> {
  const fixture = TestBed.createComponent(TextareaField);
  fixture.componentRef.setInput('label', 'Notas');
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture;
}

function q<T extends Element>(fixture: ComponentFixture<unknown>, selector: string): T {
  return (fixture.nativeElement as HTMLElement).querySelector<T>(selector)!;
}

@Component({
  imports: [TextareaField],
  template: `<app-textarea label="Notas" /><app-textarea label="Notas" />`,
})
class TwoFields {}

@Component({
  imports: [TextareaField, FormField],
  template: `<app-textarea label="Notas" [formField]="eventForm.notes" />`,
})
class SignalFormHost {
  readonly model = signal({ notes: 'Traer portátil' });
  readonly locked = signal(false);
  readonly eventForm = form(this.model, (path) => {
    disabled(path.notes, () => this.locked());
  });
}

describe('TextareaField', () => {
  it('R1: host es .field con label asociado al control por for/id', () => {
    const fixture = render({ id: 'notas' });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList).toContain('field');
    expect(host.hasAttribute('id')).toBe(false);
    const label = q<HTMLLabelElement>(fixture, 'label.field__label');
    expect(label.textContent?.trim()).toBe('Notas');
    expect(label.htmlFor).toBe('notas');
    expect(q(fixture, 'textarea.input__control').id).toBe('notas');
  });

  it('R2: sin id genera app-textarea-N distinto por instancia', () => {
    const fixture = TestBed.createComponent(TwoFields);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const [a, b] = Array.from(el.querySelectorAll('textarea'));
    expect(a.id).toMatch(/^app-textarea-\d+$/);
    expect(b.id).toMatch(/^app-textarea-\d+$/);
    expect(a.id).not.toBe(b.id);
    for (const label of Array.from(el.querySelectorAll('label'))) {
      expect(el.querySelector(`#${label.htmlFor}`)?.tagName).toBe('TEXTAREA');
    }
  });

  it('R3: hint en .field__hint con id <id>-hint referenciado por aria-describedby', () => {
    const fixture = render({ id: 'notas', hint: 'Máximo 500 caracteres' });
    const hint = q(fixture, '.field__hint');
    expect(hint.id).toBe('notas-hint');
    expect(hint.textContent?.trim()).toBe('Máximo 500 caracteres');
    expect(q(fixture, 'textarea').getAttribute('aria-describedby')).toBe('notas-hint');

    const bare = render({});
    expect(q(bare, '.field__hint')).toBeNull();
    expect(q(bare, 'textarea').hasAttribute('aria-describedby')).toBe(false);

    const error = render({ id: 'notas', error: 'Demasiado largo' });
    expect(q(error, '.field__hint').id).toBe('notas-hint');
    expect(q(error, 'textarea').getAttribute('aria-describedby')).toBe('notas-hint');
  });

  it('R4: error marca data-invalid, aria-invalid, error_outline y sustituye al hint', () => {
    const fixture = render({ hint: 'Ayuda', error: 'Demasiado largo' });
    expect((fixture.nativeElement as HTMLElement).hasAttribute('data-invalid')).toBe(true);
    expect(q(fixture, '.input').hasAttribute('data-invalid')).toBe(true);
    expect(q(fixture, 'textarea').getAttribute('aria-invalid')).toBe('true');
    const icon = q(fixture, '.field__hint app-icon');
    expect(icon.textContent?.trim()).toBe('error_outline');
    expect(icon.getAttribute('data-size')).toBe('s');
    expect(q(fixture, '.field__hint').textContent).toContain('Demasiado largo');
    expect(q(fixture, '.field__hint').textContent).not.toContain('Ayuda');

    const valid = render({ hint: 'Ayuda', error: '' });
    expect((valid.nativeElement as HTMLElement).hasAttribute('data-invalid')).toBe(false);
    expect(q(valid, '.input').hasAttribute('data-invalid')).toBe(false);
    expect(q(valid, 'textarea').hasAttribute('aria-invalid')).toBe(false);
    expect(q(valid, '.field__hint app-icon')).toBeNull();
  });

  it('R5: disabled deshabilita el control y marca data-disabled', () => {
    const fixture = render({ disabled: true });
    expect(q<HTMLTextAreaElement>(fixture, 'textarea').disabled).toBe(true);
    expect(q(fixture, '.input').hasAttribute('data-disabled')).toBe(true);

    const enabled = render({});
    expect(q<HTMLTextAreaElement>(enabled, 'textarea').disabled).toBe(false);
    expect(q(enabled, '.input').hasAttribute('data-disabled')).toBe(false);
  });

  it('R6: escribir actualiza value', () => {
    const fixture = render({});
    const control = q<HTMLTextAreaElement>(fixture, 'textarea');
    control.value = 'Traer portátil';
    control.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.value()).toBe('Traer portátil');
  });

  it('R7: perder el foco pone touched en true', () => {
    const fixture = render({});
    expect(fixture.componentInstance.touched()).toBe(false);
    q(fixture, 'textarea').dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.touched()).toBe(true);
  });

  it('R9: no declara estilos de componente', () => {
    const fixture = render({});
    const host = fixture.nativeElement as HTMLElement;
    expect(Array.from(host.attributes).some((a) => a.name.startsWith('_nghost'))).toBe(false);
  });

  it('R10: name se expone en el control solo si se pasa', () => {
    expect(q(render({ name: 'notas' }), 'textarea').getAttribute('name')).toBe('notas');
    expect(q(render({}), 'textarea').hasAttribute('name')).toBe(false);
  });

  it('R14: renderiza textarea.input__control con rows (3 por defecto) y data-multiline', () => {
    const fixture = render({});
    expect(q<HTMLTextAreaElement>(fixture, 'textarea.input__control').rows).toBe(3);
    expect(q(fixture, '.input').hasAttribute('data-multiline')).toBe(true);
    expect(q<HTMLTextAreaElement>(render({ rows: 5 }), 'textarea').rows).toBe(5);
  });

  it('R15: placeholder se expone en el control solo si se pasa', () => {
    expect(q(render({ placeholder: 'Añade notas' }), 'textarea').getAttribute('placeholder')).toBe(
      'Añade notas',
    );
    expect(q(render({}), 'textarea').hasAttribute('placeholder')).toBe(false);
  });

  it('R16: no muestra ícono en .input', () => {
    expect(q(render({}), '.input app-icon')).toBeNull();
  });
});

describe('TextareaField con Signal Forms', () => {
  it('R8: refleja value y disabled del campo en ambos sentidos', () => {
    const fixture = TestBed.createComponent(SignalFormHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const control = q<HTMLTextAreaElement>(fixture, 'textarea');
    expect(control.value).toBe('Traer portátil');

    control.value = 'Traer cargador';
    control.dispatchEvent(new Event('input'));
    expect(host.model().notes).toBe('Traer cargador');

    host.model.set({ notes: 'Nada' });
    fixture.detectChanges();
    expect(control.value).toBe('Nada');

    control.dispatchEvent(new Event('blur'));
    expect(host.eventForm.notes().touched()).toBe(true);

    host.locked.set(true);
    fixture.detectChanges();
    expect(control.disabled).toBe(true);
    expect(q(fixture, '.input').hasAttribute('data-disabled')).toBe(true);
  });
});
