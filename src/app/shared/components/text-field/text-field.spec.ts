import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { disabled, form, FormField } from '@angular/forms/signals';
import { TextField } from './text-field';

function render(inputs: Record<string, unknown>): ComponentFixture<TextField> {
  const fixture = TestBed.createComponent(TextField);
  fixture.componentRef.setInput('label', 'Título');
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture;
}

function q<T extends Element>(fixture: ComponentFixture<unknown>, selector: string): T {
  return (fixture.nativeElement as HTMLElement).querySelector<T>(selector)!;
}

@Component({
  imports: [TextField],
  template: `<app-text-field label="Título" /><app-text-field label="Título" />`,
})
class TwoFields {}

@Component({
  imports: [TextField, FormField],
  template: `<app-text-field label="Título" [formField]="eventForm.title" />`,
})
class SignalFormHost {
  readonly model = signal({ title: 'Revisión de sprint' });
  readonly locked = signal(false);
  readonly eventForm = form(this.model, (path) => {
    disabled(path.title, () => this.locked());
  });
}

describe('TextField', () => {
  it('R1: host es .field con label asociado al control por for/id', () => {
    const fixture = render({ id: 'titulo' });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList).toContain('field');
    expect(host.hasAttribute('id')).toBe(false);
    const label = q<HTMLLabelElement>(fixture, 'label.field__label');
    expect(label.textContent?.trim()).toBe('Título');
    expect(label.htmlFor).toBe('titulo');
    expect(q(fixture, 'input.input__control').id).toBe('titulo');
  });

  it('R2: sin id genera app-text-field-N distinto por instancia', () => {
    const fixture = TestBed.createComponent(TwoFields);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const [a, b] = Array.from(el.querySelectorAll('input'));
    expect(a.id).toMatch(/^app-text-field-\d+$/);
    expect(b.id).toMatch(/^app-text-field-\d+$/);
    expect(a.id).not.toBe(b.id);
    for (const label of Array.from(el.querySelectorAll('label'))) {
      expect(el.querySelector(`#${label.htmlFor}`)?.tagName).toBe('INPUT');
    }
  });

  it('R3: hint en .field__hint con id <id>-hint referenciado por aria-describedby', () => {
    const fixture = render({ id: 'titulo', hint: 'Máximo 500 caracteres' });
    const hint = q(fixture, '.field__hint');
    expect(hint.id).toBe('titulo-hint');
    expect(hint.textContent?.trim()).toBe('Máximo 500 caracteres');
    expect(q(fixture, 'input').getAttribute('aria-describedby')).toBe('titulo-hint');

    const bare = render({});
    expect(q(bare, '.field__hint')).toBeNull();
    expect(q(bare, 'input').hasAttribute('aria-describedby')).toBe(false);

    const error = render({ id: 'lugar', error: 'Esa sala está ocupada a esa hora' });
    expect(q(error, '.field__hint').id).toBe('lugar-hint');
    expect(q(error, 'input').getAttribute('aria-describedby')).toBe('lugar-hint');
  });

  it('R4: error marca data-invalid, aria-invalid, error_outline y sustituye al hint', () => {
    const fixture = render({ hint: 'Ayuda', error: 'Esa sala está ocupada a esa hora' });
    expect((fixture.nativeElement as HTMLElement).hasAttribute('data-invalid')).toBe(true);
    expect(q(fixture, '.input').hasAttribute('data-invalid')).toBe(true);
    expect(q(fixture, 'input').getAttribute('aria-invalid')).toBe('true');
    const icon = q(fixture, '.field__hint app-icon');
    expect(icon.textContent?.trim()).toBe('error_outline');
    expect(icon.getAttribute('data-size')).toBe('s');
    expect(q(fixture, '.field__hint').textContent).toContain('Esa sala está ocupada a esa hora');
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

  it('R6: escribir actualiza value', () => {
    const fixture = render({});
    const control = q<HTMLInputElement>(fixture, 'input');
    control.value = 'Revisión de sprint';
    control.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.value()).toBe('Revisión de sprint');
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
    expect(q(render({ name: 'titulo' }), 'input').getAttribute('name')).toBe('titulo');
    expect(q(render({}), 'input').hasAttribute('name')).toBe(false);
  });

  it('R11: renderiza input.input__control con el type indicado (text por defecto)', () => {
    expect(q<HTMLInputElement>(render({}), 'input.input__control').type).toBe('text');
    for (const type of ['search', 'email', 'tel']) {
      expect(q<HTMLInputElement>(render({ type }), 'input.input__control').type).toBe(type);
    }
  });

  it('R12: placeholder se expone en el control solo si se pasa', () => {
    expect(q(render({ placeholder: 'Añade un título' }), 'input').getAttribute('placeholder')).toBe(
      'Añade un título',
    );
    expect(q(render({}), 'input').hasAttribute('placeholder')).toBe(false);
  });

  it('R13 (SPEC 16 R3, R4): icon como data-icon en .input, sin app-icon', () => {
    const fixture = render({ icon: 'search' });
    expect(q(fixture, '.input').getAttribute('data-icon')).toBe('search');
    expect(q(fixture, '.input app-icon')).toBeNull();
    expect(q(render({}), '.input').hasAttribute('data-icon')).toBe(false);
  });
});

describe('TextField con Signal Forms', () => {
  it('R8: refleja value y disabled del campo en ambos sentidos', () => {
    const fixture = TestBed.createComponent(SignalFormHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const control = q<HTMLInputElement>(fixture, 'input');
    expect(control.value).toBe('Revisión de sprint');

    control.value = 'Planificación';
    control.dispatchEvent(new Event('input'));
    expect(host.model().title).toBe('Planificación');

    host.model.set({ title: 'Retro' });
    fixture.detectChanges();
    expect(control.value).toBe('Retro');

    control.dispatchEvent(new Event('blur'));
    expect(host.eventForm.title().touched()).toBe(true);

    host.locked.set(true);
    fixture.detectChanges();
    expect(control.disabled).toBe(true);
    expect(q(fixture, '.input').hasAttribute('data-disabled')).toBe(true);
  });

  it('SPEC 54 R13: hideLabel oculta el label con u-visually-hidden y sigue asociado', () => {
    const fixture = render({ id: 'sub', hideLabel: true });
    const label = q<HTMLLabelElement>(fixture, 'label');
    expect(label.classList).toContain('u-visually-hidden');
    expect(label.htmlFor).toBe('sub');
    expect(q<HTMLLabelElement>(render({}), 'label').classList).not.toContain('u-visually-hidden');
  });

  it('SPEC 54 R14: grow pone data-grow en el host', () => {
    expect((render({ grow: true }).nativeElement as HTMLElement).hasAttribute('data-grow')).toBe(
      true,
    );
    expect((render({}).nativeElement as HTMLElement).hasAttribute('data-grow')).toBe(false);
  });
});
